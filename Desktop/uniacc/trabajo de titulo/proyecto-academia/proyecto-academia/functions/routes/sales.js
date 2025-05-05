const express = require('express');
const { 
  createSale,
  getSale,
  listSales,
  updateSaleStatus,
  processPayment,
  getSalesStats,
  handlePaymentWebhook
} = require('../controllers/saleController');
const { 
  verifyToken, 
  checkRole 
} = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @route POST /api/sales
 * @desc Crear una nueva venta de curso
 * @access Privado (solo usuarios autenticados)
 */
router.post('/', verifyToken, createSale);

/**
 * @route GET /api/sales
 * @desc Listar ventas según el rol del usuario
 * @access Privado (todos los roles con restricciones)
 */
router.get('/', verifyToken, listSales);

/**
 * @route GET /api/sales/stats
 * @desc Obtener estadísticas de ventas
 * @access Privado (solo administradores)
 */
router.get('/stats', verifyToken, checkRole(['admin']), getSalesStats);

/**
 * @route GET /api/sales/:saleId
 * @desc Obtener una venta por ID
 * @access Privado (con restricciones según rol)
 */
router.get('/:saleId', verifyToken, getSale);

/**
 * @route PATCH /api/sales/:saleId/status
 * @desc Actualizar el estado de una venta
 * @access Privado (con restricciones según rol)
 */
router.patch('/:saleId/status', verifyToken, updateSaleStatus);

/**
 * @route POST /api/sales/:saleId/process-payment
 * @desc Procesar un pago para una venta
 * @access Privado (solo el comprador o admin)
 */
router.post('/:saleId/process-payment', verifyToken, processPayment);

/**
 * @route POST /api/sales/webhook
 * @desc Endpoint para recibir notificaciones de proveedores de pago
 * @access Público (verificado por firma)
 */
router.post('/webhook', handlePaymentWebhook);

module.exports = router;
