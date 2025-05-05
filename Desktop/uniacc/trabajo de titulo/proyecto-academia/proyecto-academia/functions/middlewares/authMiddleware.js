const admin = require('../config/firebase');
const User = require('../models/user');
const Course = require('../models/Course');
const Enrollment = require('../models/enrollment');
const Evaluation = require('../models/evaluation');
const { validateCustomJwt, isCustomJwtToken } = require('../utils/tokenValidator');

// Improved verifyToken middleware that handles both Firebase and custom tokens
const verifyToken = async (req, res, next) => {
  try {
    // Check if Authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'No se proporcionó token de autorización',
        details: 'El encabezado Authorization debe comenzar con Bearer'
      });
    }

    // Extract token from header
    const token = authHeader.split('Bearer ')[1];
    
    if (!token || token === 'undefined' || token === 'null') {
      return res.status(401).json({ 
        message: 'Token de autorización inválido',
        details: 'El token no puede estar vacío, undefined o null'
      });
    }

    // Determine if this is a custom JWT token or Firebase token
    const isCustomToken = isCustomJwtToken(token);

    try {
      let decodedToken;
      let userData = {};
      let role = 'student';
      
      if (isCustomToken) {
        // Validate custom JWT
        console.log('Processing custom JWT token');
        decodedToken = await validateCustomJwt(token);
        
        // For custom tokens, we trust the role claim in the token
        role = decodedToken.role || 'student';
        
        // Try to fetch additional user info from Firestore if we have an ID
        if (decodedToken.id) {
          try {
            const userDoc = await admin.firestore().collection('users').doc(decodedToken.id).get();
            if (userDoc.exists) {
              userData = userDoc.data();
            }
          } catch (fsError) {
            console.warn('Could not fetch user data from Firestore:', fsError);
          }
        }
      } else {
        // Validate Firebase token
        console.log('Processing Firebase token');
        decodedToken = await admin.auth().verifyIdToken(token);
        
        // Get user info from Firestore with better error handling
        try {
          const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
          if (userDoc.exists) {
            userData = userDoc.data();
            // Use role from Firestore as the source of truth
            role = userData.role || 'student';
          }
        } catch (fsError) {
          console.warn('Could not fetch user data from Firestore:', fsError);
        }
      }
      
      // Determine uid field based on token type
      const uid = isCustomToken ? (decodedToken.id || decodedToken.uid) : decodedToken.uid;
      
      // Add user information to the request
      req.user = {
        uid,
        email: decodedToken.email,
        role,
        displayName: userData.displayName || decodedToken.name || '',
        photoURL: userData.photoURL || decodedToken.picture || '',
        tokenType: isCustomToken ? 'custom' : 'firebase'
      };
      
      console.log(`User authenticated: ${req.user.uid} with role: ${req.user.role}, token type: ${req.user.tokenType}`);
      next();
    } catch (tokenError) {
      console.error('Error verificando token:', tokenError);
      
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Token expirado',
          details: 'La sesión ha expirado, por favor inicie sesión nuevamente'
        });
      } else if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: 'Token inválido',
          details: tokenError.message
        });
      } else if (tokenError.code === 'auth/id-token-expired') {
        return res.status(401).json({
          message: 'Token expirado',
          details: 'La sesión ha expirado, por favor inicie sesión nuevamente'
        });
      } else {
        return res.status(401).json({
          message: 'Token inválido',
          details: tokenError.message,
          tip: 'Intenta usar /api/health/token-debug para analizar tu token'
        });
      }
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      message: 'Error en el servidor durante la autenticación',
      details: error.message
    });
  }
};

// Middleware to check if user is authenticated
const isAuthenticated = async (req, res, next) => {
  try {
    await verifyToken(req, res, next);
  } catch (error) {
    return res.status(401).json({
      message: 'No autenticado',
      details: error.message
    });
  }
};

// Middleware to check user roles
const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Make sure req.user exists (should be set by verifyToken)
      if (!req.user) {
        return res.status(401).json({ message: 'No autenticado' });
      }

      // Check if the user's role is in the allowed roles array
      if (allowedRoles.includes(req.user.role)) {
        return next();
      } else {
        return res.status(403).json({
          message: 'Acceso denegado',
          details: 'No tienes los permisos necesarios para esta acción'
        });
      }
    } catch (error) {
      console.error('Error en checkRole middleware:', error);
      return res.status(500).json({
        message: 'Error en la verificación de rol',
        details: error.message
      });
    }
  };
};

// Middleware to check if user is a teacher
const isTeacher = async (req, res, next) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        message: 'Acceso denegado',
        details: 'Solo los profesores pueden realizar esta acción'
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      message: 'Error al verificar rol de profesor',
      details: error.message
    });
  }
};

// Middleware to check if user is a student
const isStudent = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Acceso denegado',
        details: 'Solo los estudiantes pueden realizar esta acción'
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      message: 'Error al verificar rol de estudiante',
      details: error.message
    });
  }
};

// Middleware to check if user has access to a course
const hasCourseAccess = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.uid;
    const userRole = req.user.role;
    
    // Admins have access to all courses
    if (userRole === 'admin') {
      return next();
    }
    
    // For teachers, check if they are the instructor
    if (userRole === 'teacher') {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Curso no encontrado' });
      }
      
      if (course.instructor_id === userId) {
        return next();
      }
    }
    
    // For students, check if they are enrolled
    if (userRole === 'student') {
      const enrollment = await Enrollment.findOne({
        user_id: userId,
        course_id: courseId
      });
      
      if (enrollment) {
        return next();
      }
    }
    
    // If none of the above conditions are met, deny access
    return res.status(403).json({
      message: 'Acceso denegado',
      details: 'No tienes acceso a este curso'
    });
    
  } catch (error) {
    console.error('Error al verificar acceso al curso:', error);
    return res.status(500).json({
      message: 'Error al verificar acceso al curso',
      details: error.message
    });
  }
};

module.exports = {
  verifyToken,
  isAuthenticated,
  isTeacher,
  isStudent,
  hasCourseAccess,
  checkRole
};
