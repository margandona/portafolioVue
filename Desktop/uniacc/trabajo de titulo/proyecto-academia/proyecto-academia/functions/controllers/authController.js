const admin = require('../config/firebase');
const bcrypt = require('bcrypt');

// Validar email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar contraseña
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
  return passwordRegex.test(password);
};

// Registrar usuario
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validaciones
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'El correo electrónico no es válido' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 6 caracteres, una letra mayúscula, un número y un carácter especial',
      });
    }

    // Verificar si el usuario ya existe
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      if (userRecord) {
        return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
      }
    } catch (error) {
      // Si no encuentra el usuario, continuamos con el registro
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Crear usuario en Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Guardar información adicional en Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      name,
      email,
      role: 'student', // Rol por defecto
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: userRecord.uid,
        name,
        email,
        role: 'student',
      },
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error al registrar usuario', details: error.message });
  }
};

// Iniciar sesión
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'El correo y la contraseña son obligatorios' });
    }

    // Firebase Authentication no proporciona un método directo para iniciar sesión
    // En una aplicación real, el cliente usaría Firebase Auth directamente
    // Aquí simulamos la validación de credenciales para la API
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      
      // Obtener información adicional desde Firestore
      const userDoc = await admin.firestore().collection('users').doc(userRecord.uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ message: 'Usuario no encontrado en la base de datos' });
      }
      
      const userData = userDoc.data();
      
      // Crear un token personalizado
      const token = await admin.auth().createCustomToken(userRecord.uid);
      
      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        token,
        user: {
          id: userRecord.uid,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'student',
        },
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', details: error.message });
  }
};

// Restablecimiento de contraseña
const sendPasswordResetEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'El correo electrónico es obligatorio' });
    }

    await admin.auth().generatePasswordResetLink(email);
    
    res.status(200).json({ 
      message: 'Se ha enviado un enlace para restablecer la contraseña' 
    });
  } catch (error) {
    console.error('Error al enviar correo de restablecimiento:', error);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ message: 'No se encontró ninguna cuenta con ese correo' });
    }
    
    res.status(500).json({ 
      message: 'Error al enviar el correo de restablecimiento', 
      details: error.message 
    });
  }
};

module.exports = { registerUser, loginUser, sendPasswordResetEmail };
