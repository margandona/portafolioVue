const admin = require('../config/firebase');
const db = admin.firestore();
const salesCollection = db.collection('sales');
const usersCollection = db.collection('users');
const coursesCollection = db.collection('courses');
const enrollmentsCollection = db.collection('enrollments');
const CourseModel = require('./courseModel');

/**
 * Modelo para gestionar ventas de cursos en Firestore
 */
class SaleModel {
  // Estados posibles para una venta
  static STATUS = {
    PENDING: 'pending',     // Pendiente de pago
    PROCESSING: 'processing', // Pago en procesamiento
    PAID: 'paid',          // Pagado pero curso no habilitado
    COMPLETED: 'completed', // Pagado y curso habilitado
    FAILED: 'failed',      // Pago fallido
    CANCELLED: 'cancelled', // Cancelado por el usuario o admin
    REFUNDED: 'refunded'    // Reembolsado
  };

  /**
   * Crear una nueva venta
   * @param {String} userId - ID del usuario comprador
   * @param {String} courseId - ID del curso a comprar
   * @param {Object} paymentDetails - Detalles del pago
   * @returns {Promise<Object>} - Objeto con la venta creada
   */
  static async create(userId, courseId, paymentDetails = {}) {
    try {
      // Verificar si el usuario existe
      const userDoc = await usersCollection.doc(userId).get();
      if (!userDoc.exists) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar si el curso existe
      const courseDoc = await coursesCollection.doc(courseId).get();
      if (!courseDoc.exists) {
        throw new Error('Curso no encontrado');
      }
      const courseData = courseDoc.data();

      // Verificar si ya tiene una inscripción activa
      const existingEnrollment = await enrollmentsCollection
        .where('userId', '==', userId)
        .where('courseId', '==', courseId)
        .limit(1)
        .get();

      if (!existingEnrollment.empty) {
        throw new Error('El usuario ya está inscrito en este curso');
      }

      // Verificar si ya hay una venta pendiente para este usuario y curso
      const existingSale = await salesCollection
        .where('userId', '==', userId)
        .where('courseId', '==', courseId)
        .where('status', '==', this.STATUS.PENDING)
        .limit(1)
        .get();

      if (!existingSale.empty) {
        throw new Error('Ya existe una venta pendiente para este curso');
      }

      // Calcular precios
      const netPrice = courseData.netPrice || 0;
      const totalPrice = CourseModel.calculateTotalPrice(netPrice);
      const ivaAmount = totalPrice - netPrice;

      // Crear el objeto de venta
      const saleData = {
        userId,
        courseId,
        courseSku: courseData.sku,
        courseTitle: courseData.title,
        netPrice,
        ivaAmount,
        totalPrice,
        status: this.STATUS.PENDING,
        paymentDetails: {
          ...paymentDetails,
          paymentMethod: paymentDetails.paymentMethod || null,
          paymentId: paymentDetails.paymentId || null,
        },
        transactionLog: [{
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          status: this.STATUS.PENDING,
          message: 'Venta creada, pendiente de pago'
        }],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        paidAt: null,
        completedAt: null,
      };

      // Guardar en Firestore
      const docRef = await salesCollection.add(saleData);
      return {
        id: docRef.id,
        ...saleData
      };
    } catch (error) {
      console.error('Error al crear venta:', error);
      throw error;
    }
  }

  /**
   * Buscar una venta por ID
   * @param {String} saleId - ID de la venta
   * @returns {Promise<Object|null>} - Venta encontrada o null
   */
  static async findById(saleId) {
    try {
      const saleDoc = await salesCollection.doc(saleId).get();
      if (!saleDoc.exists) return null;

      return {
        id: saleDoc.id,
        ...saleDoc.data()
      };
    } catch (error) {
      console.error('Error al buscar venta:', error);
      throw error;
    }
  }

  /**
   * Buscar ventas por usuario
   * @param {String} userId - ID del usuario
   * @param {Object} filters - Filtros adicionales
   * @returns {Promise<Array>} - Lista de ventas
   */
  static async findByUser(userId, filters = {}) {
    try {
      let query = salesCollection.where('userId', '==', userId);

      // Aplicar filtros adicionales
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          // Para múltiples estados, necesitamos combinar resultados
          const promises = filters.status.map(status =>
            salesCollection
              .where('userId', '==', userId)
              .where('status', '==', status)
              .get()
          );
          
          const snapshots = await Promise.all(promises);
          
          // Combinar resultados
          const salesMap = new Map();
          snapshots.forEach(snapshot => {
            snapshot.docs.forEach(doc => {
              salesMap.set(doc.id, {
                id: doc.id,
                ...doc.data()
              });
            });
          });
          
          return Array.from(salesMap.values());
        } else {
          query = query.where('status', '==', filters.status);
        }
      }

      if (filters.courseId) {
        query = query.where('courseId', '==', filters.courseId);
      }

      // Ordenar por fecha de creación descendente
      query = query.orderBy('createdAt', 'desc');

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al buscar ventas por usuario:', error);
      throw error;
    }
  }

  /**
   * Buscar ventas por curso
   * @param {String} courseId - ID del curso
   * @param {Object} filters - Filtros adicionales
   * @returns {Promise<Array>} - Lista de ventas
   */
  static async findByCourse(courseId, filters = {}) {
    try {
      let query = salesCollection.where('courseId', '==', courseId);

      // Aplicar filtros adicionales
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          // Similar a findByUser para múltiples estados
          const promises = filters.status.map(status =>
            salesCollection
              .where('courseId', '==', courseId)
              .where('status', '==', status)
              .get()
          );
          
          const snapshots = await Promise.all(promises);
          
          const salesMap = new Map();
          snapshots.forEach(snapshot => {
            snapshot.docs.forEach(doc => {
              salesMap.set(doc.id, {
                id: doc.id,
                ...doc.data()
              });
            });
          });
          
          return Array.from(salesMap.values());
        } else {
          query = query.where('status', '==', filters.status);
        }
      }

      // Ordenar por fecha de creación descendente
      query = query.orderBy('createdAt', 'desc');

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al buscar ventas por curso:', error);
      throw error;
    }
  }

  /**
   * Actualizar el estado de una venta
   * @param {String} saleId - ID de la venta
   * @param {String} status - Nuevo estado
   * @param {String} message - Mensaje para el log
   * @param {Object} paymentDetails - Detalles adicionales del pago
   * @returns {Promise<Object>} - Venta actualizada
   */
  static async updateStatus(saleId, status, message, paymentDetails = null) {
    try {
      // Verificar que el estado sea válido
      const validStatuses = Object.values(this.STATUS);
      if (!validStatuses.includes(status)) {
        throw new Error(`Estado no válido. Debe ser uno de: ${validStatuses.join(', ')}`);
      }

      // Obtener la venta actual
      const saleDoc = await salesCollection.doc(saleId).get();
      if (!saleDoc.exists) {
        throw new Error('Venta no encontrada');
      }

      const saleData = saleDoc.data();
      const currentStatus = saleData.status;

      // Verificar que la transición de estado sea válida
      if (!this.isValidStatusTransition(currentStatus, status)) {
        throw new Error(`Transición de estado no válida: ${currentStatus} -> ${status}`);
      }

      // Preparar datos para actualización
      const updateData = {
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Agregar registro en el log de transacciones
      const logEntry = {
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status,
        message: message || `Estado actualizado a: ${status}`
      };

      // Si hay detalles de pago, actualizar
      if (paymentDetails) {
        updateData['paymentDetails'] = {
          ...saleData.paymentDetails,
          ...paymentDetails
        };
        logEntry.paymentDetails = paymentDetails;
      }

      // Actualizar timestamps especiales según el estado
      if (status === this.STATUS.PAID && !saleData.paidAt) {
        updateData.paidAt = admin.firestore.FieldValue.serverTimestamp();
      }

      if (status === this.STATUS.COMPLETED && !saleData.completedAt) {
        updateData.completedAt = admin.firestore.FieldValue.serverTimestamp();
      }

      // Actualizar la venta en Firestore usando una transacción
      await db.runTransaction(async (transaction) => {
        const saleRef = salesCollection.doc(saleId);
        const doc = await transaction.get(saleRef);
        
        if (!doc.exists) {
          throw new Error('Venta no encontrada durante la transacción');
        }
        
        const currentData = doc.data();
        const transactionLog = currentData.transactionLog || [];
        transactionLog.push(logEntry);
        
        transaction.update(saleRef, {
          ...updateData,
          transactionLog
        });
      });

      // Si el estado es COMPLETED, crear la inscripción automáticamente
      if (status === this.STATUS.COMPLETED) {
        try {
          const EnrollmentModel = require('./enrollmentModel');
          await EnrollmentModel.create(saleData.userId, saleData.courseId);

          // Agregar un log adicional sobre la inscripción
          await salesCollection.doc(saleId).update({
            'transactionLog': admin.firestore.FieldValue.arrayUnion({
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              status,
              message: 'Inscripción creada automáticamente'
            })
          });
        } catch (enrollError) {
          console.error('Error al crear inscripción automática:', enrollError);
          
          // Agregar un log del error (no detiene el flujo)
          await salesCollection.doc(saleId).update({
            'transactionLog': admin.firestore.FieldValue.arrayUnion({
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              status,
              message: `Error al crear inscripción: ${enrollError.message}`
            })
          });
        }
      }

      // Retornar la venta actualizada
      const updatedDoc = await salesCollection.doc(saleId).get();
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      console.error('Error al actualizar estado de venta:', error);
      throw error;
    }
  }

  /**
   * Verifica si una transición de estado es válida
   * @param {String} currentStatus - Estado actual
   * @param {String} newStatus - Estado nuevo
   * @returns {Boolean} - True si la transición es válida
   */
  static isValidStatusTransition(currentStatus, newStatus) {
    // Definir transiciones válidas
    const validTransitions = {
      [this.STATUS.PENDING]: [
        this.STATUS.PROCESSING, 
        this.STATUS.PAID, 
        this.STATUS.FAILED, 
        this.STATUS.CANCELLED
      ],
      [this.STATUS.PROCESSING]: [
        this.STATUS.PAID, 
        this.STATUS.FAILED, 
        this.STATUS.CANCELLED
      ],
      [this.STATUS.PAID]: [
        this.STATUS.COMPLETED, 
        this.STATUS.REFUNDED
      ],
      [this.STATUS.COMPLETED]: [
        this.STATUS.REFUNDED
      ],
      [this.STATUS.FAILED]: [
        this.STATUS.PENDING, 
        this.STATUS.CANCELLED
      ],
      [this.STATUS.CANCELLED]: [
        this.STATUS.PENDING
      ],
      [this.STATUS.REFUNDED]: [] // Estado final
    };

    // Si estamos intentando establecer el mismo estado, es válido
    if (currentStatus === newStatus) return true;

    // Verificar si la transición es válida
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Obtener resumen de ventas
   * @param {Object} filters - Filtros para aplicar
   * @returns {Promise<Object>} - Resumen de ventas
   */
  static async getSalesSummary(filters = {}) {
    try {
      let query = salesCollection;
      
      // Aplicar filtros
      if (filters.startDate) {
        query = query.where('createdAt', '>=', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.where('createdAt', '<=', filters.endDate);
      }
      
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        return {
          totalSales: 0,
          totalRevenue: 0,
          totalIVA: 0,
          countByStatus: Object.values(this.STATUS).reduce((acc, status) => {
            acc[status] = 0;
            return acc;
          }, {}),
          data: []
        };
      }
      
      let totalNetRevenue = 0;
      let totalIVA = 0;
      let countByStatus = Object.values(this.STATUS).reduce((acc, status) => {
        acc[status] = 0;
        return acc;
      }, {});
      
      const sales = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Acumular totales
        if (data.status === this.STATUS.COMPLETED || data.status === this.STATUS.PAID) {
          totalNetRevenue += data.netPrice || 0;
          totalIVA += data.ivaAmount || 0;
        }
        
        // Contar por estado
        countByStatus[data.status] = (countByStatus[data.status] || 0) + 1;
        
        return {
          id: doc.id,
          ...data
        };
      });
      
      return {
        totalSales: sales.length,
        totalNetRevenue,
        totalIVA,
        totalRevenue: totalNetRevenue + totalIVA,
        countByStatus,
        data: filters.includeData ? sales : undefined
      };
    } catch (error) {
      console.error('Error al obtener resumen de ventas:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las ventas con filtros
   * @param {Object} filters - Filtros para aplicar
   * @param {Number} limit - Límite de resultados
   * @returns {Promise<Array>} - Lista de ventas
   */
  static async findAll(filters = {}, limit = 100) {
    try {
      let query = salesCollection;
      
      // Aplicar filtros
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      
      if (filters.userId) {
        query = query.where('userId', '==', filters.userId);
      }
      
      if (filters.courseId) {
        query = query.where('courseId', '==', filters.courseId);
      }
      
      // Ordenar por fecha de creación descendente
      query = query.orderBy('createdAt', 'desc');
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al buscar ventas:', error);
      throw error;
    }
  }
}

module.exports = SaleModel;
