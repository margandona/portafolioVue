const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const admin = require('../config/firebase'); 

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
  if (!phone) return true;
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,10}$/;
  return phoneRegex.test(phone);
};

// Registrar usuario
const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    // Validaciones
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        message: 'Todos los campos obligatorios deben ser completados' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        message: 'La contraseña y la confirmación no coinciden' 
      });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'El correo no es válido' });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'La contraseña debe cumplir los requisitos de seguridad'
      });
    }
    
    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ 
        message: 'El formato del número de teléfono no es válido' 
      });
    }

    // Verificar si el email ya está registrado
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

    // Encriptar la contraseña para almacenar
    const hashedPassword = await bcrypt.hash(password, 10);

    // Registrar usuario en Firestore
    const user = await User.create({
      id: firebaseUser.uid,
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'student'
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ 
      message: 'Error al registrar usuario', 
      details: error.message 
    });
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
    // Use a consistent JWT_SECRET
    const JWT_SECRET = process.env.JWT_SECRET || 'mi_super_secreto';
    console.log('Generando token con clave secreta:', JWT_SECRET);
    
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
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
    
    // Error general
    return res.status(500).json({
      message: 'Error al iniciar sesión',
      details: error.message 
    });
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

module.exports = { 
  registerUser, 
  loginUser, 
  sendPasswordResetEmail 
};
