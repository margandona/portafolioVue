const admin = require('../config/firebase');

/**
 * Verificar la conexión con Firebase
 * @param {Request} req - Objeto de solicitud HTTP
 * @param {Response} res - Objeto de respuesta HTTP
 */
const checkFirebaseConnection = async (req, res) => {
  try {
    const appName = admin.app().name; // Normalmente '[DEFAULT]'
    res.status(200).json({ 
      status: 'success',
      message: `Firebase conectado correctamente: ${appName}` 
    });
  } catch (error) {
    console.error('Error de conexión con Firebase:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Error de conexión con Firebase',
      details: error.message 
    });
  }
};

module.exports = { checkFirebaseConnection };
