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
 * @route GET /users/search
 * @desc Buscar usuarios por email, nombre o ID
 * @access Privado (solo administradores)
 */
router.get('/search', isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const { email, name, id } = req.query;

    if (!email && !name && !id) {
      return res.status(400).json({
        message: 'Debe proporcionar al menos un criterio de búsqueda (email, nombre o ID).',
      });
    }

    await searchUser(req, res);
  } catch (error) {
    console.error('Error en /users/search:', error.message);
    next(error);
  }
});

/**
 * @route GET /users
 * @desc Listar todos los usuarios
 * @access Privado (solo administradores)
 */
router.get('/', isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    await getAllUsers(req, res);
  } catch (error) {
    console.error('Error en /users:', error.message);
    next(error);
  }
});

/**
 * @route POST /users
 * @desc Crear un nuevo usuario
 * @access Privado (solo administradores)
 */
router.post('/', isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    await createUser(req, res);
  } catch (error) {
    console.error('Error en /users (POST):', error.message);
    next(error);
  }
});

/**
 * @route GET /users/:id
 * @desc Obtener información de un usuario por ID
 * @access Privado (todos los usuarios autenticados pueden ver su propia información, los administradores pueden acceder a cualquier usuario)
 */
router.get('/:id', isAuthenticated, async (req, res, next) => {
  try {
    await getUserInfo(req, res);
  } catch (error) {
    console.error('Error en /users/:id (GET):', error.message);
    next(error);
  }
});

/**
 * @route PUT /users/:id
 * @desc Actualizar información de un usuario por ID
 * @access Privado (los usuarios pueden actualizar su propia información, los administradores pueden actualizar a cualquier usuario)
 */
router.put('/:id', isAuthenticated, async (req, res, next) => {
  try {
    await updateUser(req, res);
  } catch (error) {
    console.error('Error en /users/:id (PUT):', error.message);
    next(error);
  }
});

/**
 * @route DELETE /users/:id
 * @desc Eliminar un usuario por ID
 * @access Privado (solo administradores)
 */
router.delete('/:id', isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    await deleteUser(req, res);
  } catch (error) {
    console.error('Error en /users/:id (DELETE):', error.message);
    next(error);
  }
});

module.exports = router;
