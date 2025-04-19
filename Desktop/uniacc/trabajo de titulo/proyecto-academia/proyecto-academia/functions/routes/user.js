const express = require('express');
const {
  getUserInfo,
  searchUser,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @route GET /api/users/search
 * @desc Buscar usuarios por email, nombre o ID
 * @access Privado (solo administradores)
 */
router.get('/search', isAuthenticated, isAdmin, searchUser);

/**
 * @route GET /api/users
 * @desc Listar todos los usuarios
 * @access Privado (solo administradores)
 */
router.get('/', isAuthenticated, isAdmin, getAllUsers);

/**
 * @route POST /api/users
 * @desc Crear un nuevo usuario
 * @access Privado (solo administradores)
 */
router.post('/', isAuthenticated, isAdmin, createUser);

/**
 * @route GET /api/users/:id
 * @desc Obtener información de un usuario por ID
 * @access Privado (todos los usuarios autenticados pueden ver su propia información, los administradores pueden acceder a cualquier usuario)
 */
router.get('/:id', isAuthenticated, getUserInfo);

/**
 * @route PUT /api/users/:id
 * @desc Actualizar información de un usuario por ID
 * @access Privado (los usuarios pueden actualizar su propia información, los administradores pueden actualizar a cualquier usuario)
 */
router.put('/:id', isAuthenticated, updateUser);

/**
 * @route DELETE /api/users/:id
 * @desc Eliminar un usuario por ID
 * @access Privado (solo administradores)
 */
router.delete('/:id', isAuthenticated, isAdmin, deleteUser);

module.exports = router;
