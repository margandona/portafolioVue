const express = require('express');
const { verifyToken, checkRole, isTeacher, isStudent } = require('../middlewares/authMiddleware');
const router = express.Router();

/**
 * @route GET /api/protected
 * @desc Ruta protegida para probar autenticación
 * @access Privado (requiere autenticación)
 */
router.get('/', verifyToken, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Acceso autorizado a ruta protegida',
    user: {
      id: req.user.uid,
      email: req.user.email,
      role: req.user.role
    }
  });
});

/**
 * @route GET /api/protected/admin
 * @desc Ruta protegida para administradores
 * @access Privado (solo administradores)
 */
router.get('/admin', verifyToken, checkRole(['admin']), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Acceso autorizado para administradores'
  });
});

/**
 * @route GET /api/protected/teacher
 * @desc Ruta protegida para profesores
 * @access Privado (solo profesores y administradores)
 */
router.get('/teacher', verifyToken, isTeacher, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Acceso autorizado para profesores'
  });
});

/**
 * @route GET /api/protected/student
 * @desc Ruta protegida para estudiantes
 * @access Privado (todos los usuarios autenticados pueden acceder)
 */
router.get('/student', verifyToken, isStudent, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Acceso autorizado para estudiantes'
  });
});

module.exports = router;
