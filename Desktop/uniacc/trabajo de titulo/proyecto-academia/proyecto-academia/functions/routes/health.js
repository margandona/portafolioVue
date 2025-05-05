const express = require('express');
const router = express.Router();
const { checkFirebaseConnection } = require('../controllers/firebaseController');
const admin = require('../config/firebase');
const { validateCustomJwt, isCustomJwtToken } = require('../utils/tokenValidator');

/**
 * @route GET /api/health
 * @desc Verificar el estado de la API
 * @access Público
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route GET /api/health/firebase
 * @desc Verificar conexión con Firebase
 * @access Público
 */
router.get('/firebase', checkFirebaseConnection);

/**
 * @route POST /api/health/token-debug
 * @desc Verificar y mostrar información detallada del token
 * @access Público
 */
router.post('/token-debug', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(400).json({
        status: 'error',
        message: 'No se proporcionó token en el encabezado Authorization'
      });
    }
    
    // Extract token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(400).json({
        status: 'error',
        message: 'Formato incorrecto. Debe usar el formato: Bearer [token]'
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Basic token info
    const tokenInfo = {
      token: token.substring(0, 10) + '...' + token.substring(token.length - 10),
      length: token.length,
      isJWT: token.split('.').length === 3,
    };
    
    // If JWT, decode payload (without verification)
    if (tokenInfo.isJWT) {
      try {
        const base64Payload = token.split('.')[1];
        const payloadBuffer = Buffer.from(base64Payload, 'base64');
        const decodedPayload = JSON.parse(payloadBuffer.toString('utf8'));
        
        tokenInfo.payload = {
          exp: decodedPayload.exp ? new Date(decodedPayload.exp * 1000).toISOString() : 'No expiration',
          iat: decodedPayload.iat ? new Date(decodedPayload.iat * 1000).toISOString() : 'No issued at',
          auth_time: decodedPayload.auth_time ? new Date(decodedPayload.auth_time * 1000).toISOString() : 'No auth time',
          sub: decodedPayload.sub || 'No subject',
          uid: decodedPayload.uid || decodedPayload.id || 'No UID',
          email: decodedPayload.email || 'No email',
          role: decodedPayload.role || 'No role',
          hasKid: !!decodedPayload.kid,
          claimsKeys: Object.keys(decodedPayload),
        };
        
        // Check if this is a custom token
        tokenInfo.isCustomToken = isCustomJwtToken(token);
      } catch (err) {
        tokenInfo.payload = { error: 'Could not decode payload: ' + err.message };
      }
    }
    
    // Try to verify with appropriate method
    try {
      if (tokenInfo.isCustomToken) {
        const decodedToken = await validateCustomJwt(token);
        tokenInfo.customVerification = {
          success: true,
          id: decodedToken.id || decodedToken.uid,
          email: decodedToken.email,
          role: decodedToken.role || 'Not found in token'
        };
      } else {
        const decodedToken = await admin.auth().verifyIdToken(token);
        tokenInfo.firebaseVerification = {
          success: true,
          uid: decodedToken.uid,
          email: decodedToken.email
        };
      }
      
      // Check Firestore for user data
      try {
        const userId = tokenInfo.isCustomToken ? 
          (tokenInfo.customVerification.id || tokenInfo.customVerification.uid) : 
          tokenInfo.firebaseVerification.uid;
          
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          tokenInfo.userRecord = {
            exists: true,
            role: userData.role || 'Not set in Firestore',
            email: userData.email,
            displayName: userData.displayName || 'Not set'
          };
        } else {
          tokenInfo.userRecord = { exists: false, message: 'User document not found in Firestore' };
        }
      } catch (fsError) {
        tokenInfo.userRecord = { error: 'Error fetching Firestore user: ' + fsError.message };
      }
      
    } catch (verifyError) {
      tokenInfo.verification = { 
        success: false, 
        error: verifyError.message,
        code: verifyError.code || verifyError.name
      };
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Análisis de token completado',
      tokenInfo
    });
  } catch (error) {
    console.error('Error analyzing token:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al analizar el token',
      details: error.message
    });
  }
});

// Add a route to help test admin access
router.get('/admin-check', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Check Firestore for admin role
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    const isAdmin = userDoc.exists && userDoc.data().role === 'admin';
    
    return res.status(200).json({
      status: 'success',
      message: 'Token verification completed',
      isAdmin,
      uid: decodedToken.uid,
      tokenContainsRole: !!decodedToken.role,
      tokenRole: decodedToken.role || 'Not in token',
      firestoreRole: userDoc.exists ? (userDoc.data().role || 'Not set') : 'User not found'
    });
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token verification failed',
      details: error.message
    });
  }
});

module.exports = router;
