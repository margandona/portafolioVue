const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const admin = require('../config/firebase'); // Firebase Admin SDK

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
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validar email y contraseña
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'El correo no es válido' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 6 caracteres, una letra mayúscula, un número y un carácter especial',
      });
    }

    // Verificar si el email ya está registrado en PostgreSQL
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Crear usuario en Firebase Authentication
    const firebaseUser = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Encriptar la contraseña para PostgreSQL
    const hashedPassword = await bcrypt.hash(password, 10);

    // Registrar usuario en PostgreSQL
    const user = await User.create({
      id: firebaseUser.uid, // Usar el UID de Firebase como ID
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    next(error); // Usar middleware global para manejo de errores
  }
};

// Iniciar sesión
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let firebaseUser;
    try {
      // Verificar credenciales en Firebase Authentication
      firebaseUser = await admin.auth().getUserByEmail(email);
    } catch (error) {
      if (error.errorInfo && error.errorInfo.code === 'auth/user-not-found') {
        return res.status(404).json({ message: 'Usuario no encontrado en Firebase' });
      }
      throw error; // Lanzar otros errores
    }

    // Buscar al usuario en PostgreSQL
    const user = await User.findOne({ where: { id: firebaseUser.uid } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado en la base de datos' });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generar un token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Duración del token
    );
    

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    next(error); // Usar middleware global para manejo de errores
  }
};

// Restablecimiento de contraseña
const sendPasswordResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    await admin.auth().generatePasswordResetLink(email);

    res.status(200).json({ message: 'Enlace de restablecimiento de contraseña enviado a tu correo electrónico' });
  } catch (error) {
    if (error.errorInfo && error.errorInfo.code === 'auth/user-not-found') {
      return res.status(404).json({ message: 'Usuario no encontrado en Firebase' });
    }
    console.error('Error al enviar enlace de restablecimiento:', error);
    next(error); // Usar middleware global para manejo de errores
  }
};

module.exports = { registerUser, loginUser, sendPasswordResetEmail };
