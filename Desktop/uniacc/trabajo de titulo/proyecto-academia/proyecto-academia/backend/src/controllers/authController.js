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

// Validar teléfono (opcional)
const validatePhone = (phone) => {
  if (!phone) return true; // Si no se proporciona, se considera válido
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,10}$/;
  return phoneRegex.test(phone);
};

// Registrar usuario
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        message: 'Todos los campos obligatorios deben ser completados (nombre, email, contraseña y confirmación)' 
      });
    }

    // Validar que la contraseña y la confirmación coincidan
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        message: 'La contraseña y la confirmación no coinciden' 
      });
    }
    
    // Validar email y contraseña
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'El correo no es válido' });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 6 caracteres, una letra mayúscula, un número y un carácter especial',
      });
    }
    
    // Validar número de teléfono si se proporciona
    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ 
        message: 'El formato del número de teléfono no es válido' 
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
      phoneNumber: phone || null,
    });

    // Encriptar la contraseña para PostgreSQL
    const hashedPassword = await bcrypt.hash(password, 10);

    // Registrar usuario en PostgreSQL
    const user = await User.create({
      id: firebaseUser.uid, // Usar el UID de Firebase como ID
      name,
      email,
      phone,
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    next(error); // Usar middleware global para manejo de errores
  }
};

// Iniciar sesión - Método mejorado con manejo de errores detallado
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Correo y contraseña son obligatorios' 
      });
    }

    // 1. Primero buscar el usuario por email en nuestra base de datos PostgreSQL
    // Esto evita tener que usar el método getUserByEmail de Firebase que podría estar causando el error
    const user = await User.findOne({ 
      where: { email },
      attributes: ['id', 'name', 'email', 'password', 'role']
    });

    if (!user) {
      console.log(`Usuario no encontrado para email: ${email}`);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 2. Verificar contraseña usando bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`Contraseña incorrecta para usuario: ${email}`);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Si llegamos aquí, el usuario existe y la contraseña es correcta
    // Generar JWT desde nuestro backend sin depender de Firebase para esto
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET || 'tu_clave_secreta_temporal',
      { expiresIn: '24h' }
    );

    // Registro de actividad de login exitoso
    console.log(`Login exitoso: ${user.email} (${user.role})`);

    // 4. Respuesta exitosa
    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error detallado durante el login:', error);
    
    // Manejar específicamente errores de Firebase Auth
    if (error.code && error.code.startsWith('auth/')) {
      return res.status(400).json({
        message: 'Error de autenticación',
        details: error.message,
        code: error.code
      });
    }
    
    // Error general
    return res.status(500).json({
      message: 'Error al iniciar sesión',
      details: error.message 
    });
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
