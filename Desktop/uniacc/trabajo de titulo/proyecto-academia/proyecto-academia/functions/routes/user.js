const express = require('express');
const {
  getUserInfo,
  searchUser,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { isAuthenticated, verifyToken, checkRole } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @route GET /api/users/search
 * @desc Buscar usuarios por email, nombre o ID
 * @access Privado (solo administradores)
 */
router.get('/search', verifyToken, checkRole(['admin']), searchUser);

/**
 * @route GET /api/users
 * @desc Listar todos los usuarios
 * @access Privado (solo administradores)
 */
router.get('/', verifyToken, checkRole(['admin']), getAllUsers);

/**
 * @route POST /api/users
 * @desc Crear un nuevo usuario
 * @access Privado (solo administradores)
 */
router.post('/', verifyToken, checkRole(['admin']), createUser);

/**
 * @route GET /api/users/:id
 * @desc Obtener información de un usuario por ID
 * @access Privado (todos los usuarios autenticados pueden ver su propia información, los administradores pueden acceder a cualquier usuario)
 */
router.get('/:id', verifyToken, getUserInfo);

/**
 * @route PUT /api/users/:id
 * @desc Actualizar información de un usuario por ID
 * @access Privado (los usuarios pueden actualizar su propia información, los administradores pueden actualizar a cualquier usuario)
 */
router.put('/:id', verifyToken, updateUser);

/**
 * @route DELETE /api/users/:id
 * @desc Eliminar un usuario por ID
 * @access Privado (solo administradores)
 */
router.delete('/:id', verifyToken, checkRole(['admin']), deleteUser);

module.exports = router;
