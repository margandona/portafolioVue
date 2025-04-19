const admin = require('../config/firebase');

// Verificar conexión con Firebase
const checkFirebaseConnection = async (req, res) => {
  try {
    const message = await admin.app().name; // Nombre de la app (por defecto '[DEFAULT]')
    res.status(200).json({ message: `Firebase conectado: ${message}` });
  } catch (error) {
    res.status(500).json({ error: 'Error de conexión con Firebase', details: error.message });
  }
};

module.exports = { checkFirebaseConnection };
