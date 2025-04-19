const admin = require('../config/firebase');

// Middleware para verificar autenticación
const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No se proporcionó un token válido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    
    // Obtener información adicional del usuario desde Firestore
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    
    if (userDoc.exists) {
      req.user.role = userDoc.data().role || 'student'; // Rol por defecto: estudiante
      req.user.name = userDoc.data().name;
    } else {
      req.user.role = 'student';
    }
    
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Middleware para verificar roles
const checkRole = (roles) => (req, res, next) => {
  if (roles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: `Acceso denegado. Rol requerido: ${roles.join(', ')}.` });
};

// Middlewares específicos para cada rol
const isStudent = checkRole(['student', 'teacher', 'admin']);
const isTeacher = checkRole(['teacher', 'admin']);
const isAdmin = checkRole(['admin']);

// Middleware para verificar acceso a un curso
const hasCourseAccess = async (req, res, next) => {
  const courseId = req.params.courseId || req.params.id;
  
  try {
    const courseRef = admin.firestore().collection('courses').doc(courseId);
    const courseDoc = await courseRef.get();
    
    if (!courseDoc.exists) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }
    
    const courseData = courseDoc.data();
    
    // Acceso completo para administradores
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Acceso para el profesor creador del curso
    if (req.user.role === 'teacher' && courseData.teacherId === req.user.uid) {
      return next();
    }
    
    // Acceso para estudiantes inscritos
    if (req.user.role === 'student') {
      const enrollmentSnapshot = await admin.firestore()
        .collection('enrollments')
        .where('userId', '==', req.user.uid)
        .where('courseId', '==', courseId)
        .limit(1)
        .get();
      
      if (!enrollmentSnapshot.empty) {
        return next();
      }
    }
    
    return res.status(403).json({
      message: 'No tienes acceso a este curso.'
    });
  } catch (error) {
    console.error('Error en hasCourseAccess:', error);
    return res.status(500).json({ 
      message: 'Error al verificar acceso al curso.',
      details: error.message 
    });
  }
};

// Middleware para verificar acceso a evaluaciones
const hasEvaluationAccess = async (req, res, next) => {
  const evaluationId = req.params.evaluationId || req.params.id;
  
  try {
    const evaluationRef = admin.firestore().collection('evaluations').doc(evaluationId);
    const evaluationDoc = await evaluationRef.get();
    
    if (!evaluationDoc.exists) {
      return res.status(404).json({ message: 'Evaluación no encontrada.' });
    }
    
    const evaluationData = evaluationDoc.data();
    
    // Pasar el ID del curso para verificar acceso
    req.params.courseId = evaluationData.courseId;
    return hasCourseAccess(req, res, next);
  } catch (error) {
    console.error('Error en hasEvaluationAccess:', error);
    return res.status(500).json({
      message: 'Error al verificar acceso a la evaluación.',
      details: error.message
    });
  }
};

module.exports = { 
  isAuthenticated, 
  isStudent, 
  isTeacher, 
  isAdmin, 
  hasCourseAccess, 
  hasEvaluationAccess 
};
