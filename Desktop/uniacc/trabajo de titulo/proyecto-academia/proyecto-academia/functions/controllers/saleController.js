const SaleModel = require('../models/saleModel');
const CourseModel = require('../models/courseModel');
const EnrollmentModel = require('../models/enrollmentModel');
const admin = require('../config/firebase');
const db = admin.firestore();

/**
 * Controlador para manejar ventas de cursos
 */

/**
 * Crea una nueva venta cuando un estudiante quiere comprar un curso
 */
const createSale = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.uid;

    if (!courseId) {
      return res.status(400).json({ message: 'El ID del curso es requerido' });
    }

    // Verificar que el usuario sea un estudiante
    if (req.user.role !== 'student') {
      return res.status(403).json({ 
        message: 'Solo los estudiantes pueden comprar cursos' 
      });
    }

    // Verificar si el curso existe
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    // Verificar que el estudiante no sea el profesor del curso
    if (course.teacherId === userId || course.instructor_id === userId) {
      return res.status(400).json({ 
        message: 'No puedes comprar tu propio curso' 
      });
    }

    // Obtener detalles de pago desde la solicitud
    const paymentDetails = req.body.paymentDetails || {};

    // Crear la venta
    const sale = await SaleModel.create(userId, courseId, paymentDetails);

    res.status(201).json({
      message: 'Venta creada exitosamente. Pendiente de pago.',
      sale
    });
  } catch (error) {
    console.error('Error al crear venta:', error);
    
    // Manejo específico de errores conocidos
    if (error.message.includes('ya está inscrito')) {
      return res.status(400).json({ message: error.message });
    }
    
    if (error.message.includes('Ya existe una venta pendiente')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ 
      message: 'Error al crear la venta', 
      details: error.message 
    });
  }
};

/**
 * Obtener una venta por ID
 */
const getSale = async (req, res) => {
  try {
    const { saleId } = req.params;
    
    const sale = await SaleModel.findById(saleId);
    
    if (!sale) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    // Verificar permisos - Solo el comprador, el profesor del curso o un admin pueden ver
    const isOwner = sale.userId === req.user.uid;
    const isTeacher = await isTeacherForCourse(req.user.uid, sale.courseId);
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isTeacher && !isAdmin) {
      return res.status(403).json({ 
        message: 'No tienes permiso para ver esta venta' 
      });
    }
    
    res.status(200).json(sale);
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({ 
      message: 'Error al obtener la venta', 
      details: error.message 
    });
  }
};

/**
 * Listar ventas según el rol del usuario
 */
const listSales = async (req, res) => {
  try {
    const { status, courseId, limit } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (courseId) filters.courseId = courseId;
    if (limit) filters.limit = parseInt(limit);
    
    // Administradores pueden ver todas las ventas
    if (req.user.role === 'admin') {
      const sales = await SaleModel.findAll(filters);
      return res.status(200).json(sales);
    } 
    
    // Profesores pueden ver ventas de sus cursos
    if (req.user.role === 'teacher') {
      // Obtener los cursos del profesor
      const coursesSnapshot = await db.collection('courses')
        .where('teacherId', '==', req.user.uid)
        .get();
      
      if (coursesSnapshot.empty) {
        return res.status(200).json([]);
      }
      
      // Combinar resultados de todos los cursos del profesor
      const allSales = [];
      for (const courseDoc of coursesSnapshot.docs) {
        const courseId = courseDoc.id;
        const courseFilters = { ...filters, courseId };
        
        const courseSales = await SaleModel.findByCourse(courseId, courseFilters);
        allSales.push(...courseSales);
      }
      
      return res.status(200).json(allSales);
    } 
    
    // Estudiantes solo pueden ver sus propias ventas
    filters.userId = req.user.uid;
    const sales = await SaleModel.findByUser(req.user.uid, filters);
    return res.status(200).json(sales);
    
  } catch (error) {
    console.error('Error al listar ventas:', error);
    res.status(500).json({ 
      message: 'Error al listar las ventas', 
      details: error.message 
    });
  }
};

/**
 * Actualizar el estado de una venta
 */
const updateSaleStatus = async (req, res) => {
  try {
    const { saleId } = req.params;
    const { status, message, paymentDetails } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'El estado es requerido' });
    }
    
    // Verificar que la venta existe
    const sale = await SaleModel.findById(saleId);
    
    if (!sale) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    // Verificar permisos según el rol y el nuevo estado
    const currentUserRole = req.user.role;
    const isOwner = sale.userId === req.user.uid;
    const isTeacher = await isTeacherForCourse(req.user.uid, sale.courseId);
    const isAdmin = currentUserRole === 'admin';
    
    // Solo el admin puede realizar ciertos cambios de estado
    const adminOnlyTransitions = [
      SaleModel.STATUS.PAID,
      SaleModel.STATUS.COMPLETED,
      SaleModel.STATUS.REFUNDED
    ];
    
    if (adminOnlyTransitions.includes(status) && !isAdmin) {
      return res.status(403).json({ 
        message: 'Solo administradores pueden cambiar a este estado' 
      });
    }
    
    // Un estudiante solo puede cancelar su propia compra pendiente
    if (currentUserRole === 'student' && 
        !isOwner && 
        status === SaleModel.STATUS.CANCELLED) {
      return res.status(403).json({ 
        message: 'Solo puedes cancelar tus propias ventas' 
      });
    }
    
    // Profesores solo pueden gestionar ventas de sus cursos
    if (currentUserRole === 'teacher' && !isTeacher && !isAdmin) {
      return res.status(403).json({ 
        message: 'Solo puedes gestionar ventas de tus propios cursos' 
      });
    }
    
    // Realizar la actualización
    const updatedSale = await SaleModel.updateStatus(
      saleId, 
      status, 
      message || `Estado actualizado a ${status} por ${req.user.displayName || req.user.email}`,
      paymentDetails
    );
    
    res.status(200).json({
      message: 'Estado de venta actualizado exitosamente',
      sale: updatedSale
    });
  } catch (error) {
    console.error('Error al actualizar estado de venta:', error);
    res.status(500).json({ 
      message: 'Error al actualizar estado de venta', 
      details: error.message 
    });
  }
};

/**
 * Procesar un pago externo y actualizar el estado de la venta
 */
const processPayment = async (req, res) => {
  try {
    const { saleId } = req.params;
    const { 
      paymentId, 
      paymentMethod, 
      transactionDetails 
    } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({ message: 'ID de pago requerido' });
    }
    
    // Verificar que la venta existe
    const sale = await SaleModel.findById(saleId);
    
    if (!sale) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    // Solo el comprador o un admin pueden procesar el pago
    const isOwner = sale.userId === req.user.uid;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        message: 'No tienes permiso para procesar este pago' 
      });
    }
    
    // Solo se puede procesar si está pendiente o falló anteriormente
    if (sale.status !== SaleModel.STATUS.PENDING && 
        sale.status !== SaleModel.STATUS.FAILED) {
      return res.status(400).json({ 
        message: `No se puede procesar el pago para una venta en estado ${sale.status}` 
      });
    }
    
    // Preparar detalles del pago
    const paymentDetails = {
      paymentId,
      paymentMethod: paymentMethod || 'external',
      processedAt: new Date().toISOString(),
      ...transactionDetails
    };
    
    // Cambiar a estado "processing"
    const processing = await SaleModel.updateStatus(
      saleId,
      SaleModel.STATUS.PROCESSING,
      'Procesando pago externo',
      paymentDetails
    );
    
    // Aquí se podría integrar con un servicio de pagos real
    // Por ahora, simulamos un pago exitoso
    
    // Marcar como pagado
    const paid = await SaleModel.updateStatus(
      saleId,
      SaleModel.STATUS.PAID,
      'Pago recibido correctamente'
    );
    
    // Completar la venta (esto activará la matrícula automática)
    const completed = await SaleModel.updateStatus(
      saleId,
      SaleModel.STATUS.COMPLETED,
      'Venta completada y curso habilitado'
    );
    
    res.status(200).json({
      message: 'Pago procesado exitosamente',
      sale: completed
    });
  } catch (error) {
    console.error('Error al procesar pago:', error);
    res.status(500).json({ 
      message: 'Error al procesar el pago', 
      details: error.message 
    });
  }
};

/**
 * Obtener estadísticas de ventas (solo admin)
 */
const getSalesStats = async (req, res) => {
  try {
    // Solo administradores pueden ver estadísticas
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Acceso denegado. Solo administradores pueden ver estadísticas.' 
      });
    }
    
    const { startDate, endDate, status, includeData } = req.query;
    const filters = {};
    
    if (startDate) {
      filters.startDate = admin.firestore.Timestamp.fromDate(new Date(startDate));
    }
    
    if (endDate) {
      filters.endDate = admin.firestore.Timestamp.fromDate(new Date(endDate));
    }
    
    if (status) {
      filters.status = status;
    }
    
    if (includeData === 'true') {
      filters.includeData = true;
    }
    
    const summary = await SaleModel.getSalesSummary(filters);
    
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas de ventas', 
      details: error.message 
    });
  }
};

/**
 * Integración con webhook de proveedor de pagos 
 * (para futuras integraciones con sistemas externos)
 */
const handlePaymentWebhook = async (req, res) => {
  try {
    const { 
      event_type, 
      transaction_id, 
      payment_id, 
      reference_id,  // Este sería el ID de la venta
      status, 
      amount,
      metadata 
    } = req.body;
    
    console.log('Webhook de pago recibido:', event_type, reference_id);

    // Verificar firma del webhook (implementación específica para cada proveedor)
    // const isValid = verifyWebhookSignature(req);
    // if (!isValid) {
    //   return res.status(401).json({ message: 'Firma inválida' });
    // }

    // Validar que la venta existe
    const saleId = reference_id;
    const sale = await SaleModel.findById(saleId);
    
    if (!sale) {
      console.error('Webhook: Venta no encontrada', saleId);
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    // Manejar diferentes tipos de eventos
    switch (event_type) {
      case 'payment.created':
        await SaleModel.updateStatus(
          saleId,
          SaleModel.STATUS.PROCESSING,
          `Pago iniciado vía webhook: ${payment_id}`,
          { paymentId: payment_id, transactionId: transaction_id }
        );
        break;
        
      case 'payment.succeeded':
      case 'payment.completed':
        await SaleModel.updateStatus(
          saleId,
          SaleModel.STATUS.PAID,
          `Pago confirmado vía webhook: ${payment_id}`
        );
        
        // Completar la venta y crear inscripción automáticamente
        await SaleModel.updateStatus(
          saleId,
          SaleModel.STATUS.COMPLETED,
          `Inscripción habilitada automáticamente`
        );
        break;
        
      case 'payment.failed':
        await SaleModel.updateStatus(
          saleId,
          SaleModel.STATUS.FAILED,
          `Pago fallido vía webhook: ${payment_id}`
        );
        break;
        
      case 'payment.refunded':
        await SaleModel.updateStatus(
          saleId,
          SaleModel.STATUS.REFUNDED,
          `Reembolso procesado vía webhook: ${payment_id}`
        );
        break;
        
      default:
        console.log(`Tipo de evento no manejado: ${event_type}`);
    }

    // Responder al proveedor de pagos
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error en webhook de pagos:', error);
    res.status(500).json({ 
      message: 'Error procesando webhook', 
      details: error.message 
    });
  }
};

/**
 * Función auxiliar para verificar si un usuario es profesor de un curso
 */
async function isTeacherForCourse(userId, courseId) {
  try {
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) return false;
    
    const courseData = courseDoc.data();
    return courseData.teacherId === userId || courseData.instructor_id === userId;
  } catch (error) {
    console.error('Error al verificar profesor de curso:', error);
    return false;
  }
}

module.exports = {
  createSale,
  getSale,
  listSales,
  updateSaleStatus,
  processPayment,
  getSalesStats,
  handlePaymentWebhook
};
