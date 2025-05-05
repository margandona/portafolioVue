const express = require('express');
const { 
  createCampaign, 
  getAllCampaigns, 
  getCampaignById, 
  updateCampaign, 
  deleteCampaign,
  addCoursesToCampaign,
  removeCoursesFromCampaign,
  toggleCampaignStatus
} = require('../controllers/campaignController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @route POST /api/campaigns
 * @desc Crear una nueva campaña de descuento
 * @access Privado (solo administradores)
 */
router.post('/', verifyToken, checkRole(['admin']), createCampaign);

/**
 * @route GET /api/campaigns
 * @desc Obtener todas las campañas
 * @access Privado (solo administradores)
 */
router.get('/', verifyToken, checkRole(['admin']), getAllCampaigns);

/**
 * @route GET /api/campaigns/:id
 * @desc Obtener una campaña por ID
 * @access Privado (solo administradores)
 */
router.get('/:id', verifyToken, checkRole(['admin']), getCampaignById);

/**
 * @route PUT /api/campaigns/:id
 * @desc Actualizar una campaña
 * @access Privado (solo administradores)
 */
router.put('/:id', verifyToken, checkRole(['admin']), updateCampaign);

/**
 * @route DELETE /api/campaigns/:id
 * @desc Eliminar una campaña
 * @access Privado (solo administradores)
 */
router.delete('/:id', verifyToken, checkRole(['admin']), deleteCampaign);

/**
 * @route POST /api/campaigns/:id/courses
 * @desc Añadir cursos a una campaña
 * @access Privado (solo administradores)
 */
router.post('/:id/courses', verifyToken, checkRole(['admin']), addCoursesToCampaign);

/**
 * @route DELETE /api/campaigns/:id/courses
 * @desc Eliminar cursos de una campaña
 * @access Privado (solo administradores)
 */
router.delete('/:id/courses', verifyToken, checkRole(['admin']), removeCoursesFromCampaign);

/**
 * @route PATCH /api/campaigns/:id/status
 * @desc Activar o desactivar una campaña
 * @access Privado (solo administradores)
 */
router.patch('/:id/status', verifyToken, checkRole(['admin']), toggleCampaignStatus);

module.exports = router;
