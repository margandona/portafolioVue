const admin = require('../config/firebase');
const db = admin.firestore();
const enrollmentsCollection = db.collection('enrollments');
const coursesCollection = db.collection('courses');
const usersCollection = db.collection('users');
const evaluationsCollection = db.collection('evaluations');
const salesCollection = db.collection('sales');

/**
 * Modelo para manejar operaciones relacionadas con inscripciones en Firestore
 */
class EnrollmentModel {
  /**
   * Crea una nueva inscripción
   * @param {string} userId - ID del usuario
   * @param {string} courseId - ID del curso
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Datos de la inscripción creada
   */
  static async create(userId, courseId, options = {}) {
    try {
      // Verificar si el usuario existe
      const userDoc = await usersCollection.doc(userId).get();
      if (!userDoc.exists) throw new Error('Usuario no encontrado');
      
      // Verificar si el curso existe
      const courseDoc = await coursesCollection.doc(courseId).get();
      if (!courseDoc.exists) throw new Error('Curso no encontrado');
      
      const courseData = courseDoc.data();
      
      // Verificar si ya existe la inscripción
      const existingEnrollment = await enrollmentsCollection
        .where('userId', '==', userId)
        .where('courseId', '==', courseId)
        .limit(1)
        .get();
      
      if (!existingEnrollment.empty) {
        throw new Error('El usuario ya está inscrito en este curso');
      }
      
      // Verificar si el curso es de pago y el usuario tiene acceso
      if (!courseData.isFree && !options.bypassPaymentCheck) {
        // Buscar una venta completada para este usuario y curso
        const saleSnapshot = await salesCollection
          .where('userId', '==', userId)
          .where('courseId', '==', courseId)
          .where('status', '==', 'completed')
          .limit(1)
          .get();
          
        // Si no es una asignación especial y no hay venta completada, no permitir inscripción
        if (saleSnapshot.empty && !options.specialAssignment) {
          throw new Error('Este curso requiere pago previo o asignación especial para inscribirse');
        }
      }
      
      // Crear la inscripción con atributos completos
      const enrollmentData = {
        userId,
        courseId,
        progress: 0,
        completedEvaluations: [],
        startDate: admin.firestore.FieldValue.serverTimestamp(),
        lastAccessDate: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active', // active, completed, dropped
        grade: null,
        certificateIssued: false,
        completionDate: null,
        notes: options.notes || '',
        enrollmentType: courseData.isFree ? 'free' : 
                         options.specialAssignment ? 'assigned' : 'paid',
        assignedBy: options.assignedBy || null,
        assignmentReason: options.assignmentReason || null,
        saleId: options.saleId || null
      };
      
      const docRef = await enrollmentsCollection.add(enrollmentData);
      
      return {
        id: docRef.id,
        ...enrollmentData
      };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario puede inscribirse en un curso
   * @param {string} userId - ID del usuario
   * @param {string} courseId - ID del curso
   * @returns {Promise<Object>} Resultado de la verificación
   */
  static async canEnroll(userId, courseId) {
    try {
      // Verificar si el curso existe
      const courseDoc = await coursesCollection.doc(courseId).get();
      if (!courseDoc.exists) {
        return {
          canEnroll: false,
          reason: 'COURSE_NOT_FOUND',
          message: 'Curso no encontrado'
        };
      }

      const courseData = courseDoc.data();
      
      // Verificar si ya está inscrito
      const existingEnrollment = await enrollmentsCollection
        .where('userId', '==', userId)
        .where('courseId', '==', courseId)
        .limit(1)
        .get();
      
      if (!existingEnrollment.empty) {
        return {
          canEnroll: false,
          reason: 'ALREADY_ENROLLED',
          message: 'Ya estás inscrito en este curso'
        };
      }
      
      // Si el curso es gratuito, puede inscribirse directamente
      if (courseData.isFree) {
        return {
          canEnroll: true,
          enrollmentType: 'free'
        };
      }
      
      // Verificar si tiene una asignación especial
      const completedSale = await salesCollection
        .where('userId', '==', userId)
        .where('courseId', '==', courseId)
        .where('status', '==', 'completed')
        .limit(1)
        .get();
        
      if (!completedSale.empty) {
        const saleData = completedSale.docs[0].data();
        
        if (saleData.specialAssignment) {
          return {
            canEnroll: true,
            enrollmentType: 'assigned',
            saleId: completedSale.docs[0].id
          };
        } else {
          return {
            canEnroll: true,
            enrollmentType: 'paid',
            saleId: completedSale.docs[0].id
          };
        }
      }
      
      // No cumple ninguna condición para inscribirse
      return {
        canEnroll: false,
        reason: 'PAYMENT_REQUIRED',
        message: 'Este curso requiere pago para inscribirse',
        coursePrice: courseData.hasActiveDiscount ? 
          courseData.discountedTotalPrice : courseData.totalPrice
      };
    } catch (error) {
      console.error('Error en canEnroll:', error);
      throw error;
    }
  }
  
  /**
   * Encuentra una inscripción por usuario y curso
   * @param {Object} where - Condiciones de búsqueda
   * @returns {Promise<Object|null>} Datos de la inscripción o null
   */
  static async findOne(where = {}) {
    try {
      let query = enrollmentsCollection;
      
      if (where.user_id && where.course_id) {
        query = query
          .where('userId', '==', where.user_id)
          .where('courseId', '==', where.course_id);
      } else if (where.id) {
        const doc = await enrollmentsCollection.doc(where.id).get();
        if (!doc.exists) return null;
        
        return {
          id: doc.id,
          ...doc.data()
        };
      }
      
      const snapshot = await query.limit(1).get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error en findOne:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene inscripciones por usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Lista de inscripciones
   */
  static async findByUser(userId) {
    try {
      const snapshot = await enrollmentsCollection
        .where('userId', '==', userId)
        .get();
      
      if (snapshot.empty) return [];
      
      const enrollments = [];
      
      for (const doc of snapshot.docs) {
        const enrollmentData = doc.data();
        
        // Obtener datos del curso asociado
        const courseDoc = await coursesCollection.doc(enrollmentData.courseId).get();
        let courseData = null;
        
        if (courseDoc.exists) {
          courseData = {
            id: courseDoc.id,
            ...courseDoc.data()
          };
        }
        
        enrollments.push({
          id: doc.id,
          ...enrollmentData,
          course: courseData
        });
      }
      
      return enrollments;
    } catch (error) {
      console.error('Error en findByUser:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene inscripciones por curso
   * @param {string} courseId - ID del curso
   * @returns {Promise<Array>} Lista de inscripciones
   */
  static async findByCourse(courseId) {
    try {
      const snapshot = await enrollmentsCollection
        .where('courseId', '==', courseId)
        .get();
      
      if (snapshot.empty) return [];
      
      const enrollments = [];
      
      for (const doc of snapshot.docs) {
        const enrollmentData = doc.data();
        
        // Obtener datos del usuario inscrito
        const userDoc = await usersCollection.doc(enrollmentData.userId).get();
        let userData = null;
        
        if (userDoc.exists) {
          const userFullData = userDoc.data();
          // Solo incluir información no sensible del usuario
          userData = {
            id: userDoc.id,
            displayName: userFullData.displayName || '',
            email: userFullData.email || '',
            role: userFullData.role || 'student',
            photoURL: userFullData.photoURL || ''
          };
        }
        
        enrollments.push({
          id: doc.id,
          ...enrollmentData,
          user: userData
        });
      }
      
      return enrollments;
    } catch (error) {
      console.error('Error en findByCourse:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza el progreso de una inscripción
   * @param {string} enrollmentId - ID de la inscripción
   * @param {number} progress - Nuevo porcentaje de progreso
   * @param {Array} completedEvaluations - Lista de evaluaciones completadas
   * @returns {Promise<Object>} Datos actualizados
   */
  static async updateProgress(enrollmentId, progress, completedEvaluations = null) {
    try {
      const enrollmentDoc = await enrollmentsCollection.doc(enrollmentId).get();
      if (!enrollmentDoc.exists) throw new Error('Inscripción no encontrada');
      
      const updateData = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastAccessDate: admin.firestore.FieldValue.serverTimestamp()
      };
      
      if (progress !== undefined && progress !== null) {
        // Validar el rango del progreso
        if (progress < 0 || progress > 100) {
          throw new Error('El progreso debe estar entre 0 y 100');
        }
        updateData.progress = progress;
        
        // Si el progreso es 100%, actualizar el estado y la fecha de finalización
        if (progress === 100) {
          updateData.status = 'completed';
          updateData.completionDate = admin.firestore.FieldValue.serverTimestamp();
        }
      }
      
      if (completedEvaluations !== null) {
        // Verificar que todas las evaluaciones existan
        if (completedEvaluations.length > 0) {
          const courseId = enrollmentDoc.data().courseId;
          
          // Obtener todas las evaluaciones del curso
          const evaluationsSnapshot = await evaluationsCollection
            .where('courseId', '==', courseId)
            .get();
          
          const validEvaluationIds = evaluationsSnapshot.docs.map(doc => doc.id);
          
          // Verificar que todas las evaluaciones completadas pertenezcan al curso
          const invalidEvaluations = completedEvaluations.filter(
            evalId => !validEvaluationIds.includes(evalId)
          );
          
          if (invalidEvaluations.length > 0) {
            throw new Error(`Las siguientes evaluaciones no pertenecen al curso: ${invalidEvaluations.join(', ')}`);
          }
        }
        
        updateData.completedEvaluations = completedEvaluations;
      }
      
      await enrollmentsCollection.doc(enrollmentId).update(updateData);
      
      const updatedDoc = await enrollmentsCollection.doc(enrollmentId).get();
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      console.error('Error en updateProgress:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza la calificación de una inscripción
   * @param {string} enrollmentId - ID de la inscripción
   * @param {number} grade - Nueva calificación
   * @param {boolean} certificateIssued - Si se ha emitido el certificado
   * @returns {Promise<Object>} Datos actualizados
   */
  static async updateGrade(enrollmentId, grade, certificateIssued = false) {
    try {
      const enrollmentDoc = await enrollmentsCollection.doc(enrollmentId).get();
      if (!enrollmentDoc.exists) throw new Error('Inscripción no encontrada');
      
      const updateData = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      if (grade !== undefined && grade !== null) {
        // Validar el rango de la calificación (0-10 o 0-100 según escala)
        if (grade < 0 || grade > 100) {
          throw new Error('La calificación debe estar entre 0 y 100');
        }
        updateData.grade = grade;
      }
      
      if (certificateIssued !== undefined) {
        updateData.certificateIssued = certificateIssued;
      }
      
      await enrollmentsCollection.doc(enrollmentId).update(updateData);
      
      const updatedDoc = await enrollmentsCollection.doc(enrollmentId).get();
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      console.error('Error en updateGrade:', error);
      throw error;
    }
  }
  
  /**
   * Cambia el estado de una inscripción
   * @param {string} enrollmentId - ID de la inscripción
   * @param {string} status - Nuevo estado (active, completed, dropped)
   * @param {string} notes - Notas adicionales
   * @returns {Promise<Object>} Datos actualizados
   */
  static async updateStatus(enrollmentId, status, notes = null) {
    try {
      const enrollmentDoc = await enrollmentsCollection.doc(enrollmentId).get();
      if (!enrollmentDoc.exists) throw new Error('Inscripción no encontrada');
      
      // Validar estado
      const validStatuses = ['active', 'completed', 'dropped'];
      if (!validStatuses.includes(status)) {
        throw new Error('Estado no válido. Debe ser: active, completed o dropped');
      }
      
      const updateData = {
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      if (status === 'completed' && !enrollmentDoc.data().completionDate) {
        updateData.completionDate = admin.firestore.FieldValue.serverTimestamp();
      }
      
      if (notes !== null) {
        updateData.notes = notes;
      }
      
      await enrollmentsCollection.doc(enrollmentId).update(updateData);
      
      const updatedDoc = await enrollmentsCollection.doc(enrollmentId).get();
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      console.error('Error en updateStatus:', error);
      throw error;
    }
  }
  
  /**
   * Elimina una inscripción
   * @param {string} enrollmentId - ID de la inscripción
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  static async delete(enrollmentId) {
    try {
      const enrollmentDoc = await enrollmentsCollection.doc(enrollmentId).get();
      if (!enrollmentDoc.exists) throw new Error('Inscripción no encontrada');
      
      await enrollmentsCollection.doc(enrollmentId).delete();
      return true;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }
  
  /**
   * Encuentra todas las inscripciones (con filtros opcionales)
   * @param {Object} filters - Filtros opcionales
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Lista de inscripciones
   */
  static async findAll(filters = {}, limit = 100) {
    try {
      let query = enrollmentsCollection;
      
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      
      if (filters.courseId) {
        query = query.where('courseId', '==', filters.courseId);
      }
      
      if (filters.userId) {
        query = query.where('userId', '==', filters.userId);
      }
      
      if (filters.minProgress) {
        query = query.where('progress', '>=', filters.minProgress);
      }
      
      const snapshot = await query.limit(limit).get();
      
      if (snapshot.empty) return [];
      
      const enrollments = [];
      
      for (const doc of snapshot.docs) {
        const enrollmentData = doc.data();
        
        // Si se solicita incluir datos de curso y usuario
        if (filters.includeRelations) {
          // Obtener datos del curso
          const courseDoc = await coursesCollection.doc(enrollmentData.courseId).get();
          if (courseDoc.exists) {
            enrollmentData.course = {
              id: courseDoc.id,
              ...courseDoc.data()
            };
          }
          
          // Obtener datos del usuario (no sensibles)
          const userDoc = await usersCollection.doc(enrollmentData.userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            enrollmentData.user = {
              id: userDoc.id,
              displayName: userData.displayName || '',
              email: userData.email || '',
              role: userData.role || 'student',
              photoURL: userData.photoURL || ''
            };
          }
        }
        
        enrollments.push({
          id: doc.id,
          ...enrollmentData
        });
      }
      
      return enrollments;
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de inscripciones para un curso
   * @param {string} courseId - ID del curso
   * @returns {Promise<Object>} Estadísticas de inscripciones
   */
  static async getCourseEnrollmentStats(courseId) {
    try {
      const snapshot = await enrollmentsCollection
        .where('courseId', '==', courseId)
        .get();
      
      if (snapshot.empty) {
        return {
          totalEnrollments: 0,
          activeEnrollments: 0,
          completedEnrollments: 0,
          droppedEnrollments: 0,
          byEnrollmentType: {
            free: 0,
            paid: 0,
            assigned: 0
          }
        };
      }
      
      let totalEnrollments = 0;
      let activeEnrollments = 0;
      let completedEnrollments = 0;
      let droppedEnrollments = 0;
      let freeEnrollments = 0;
      let paidEnrollments = 0;
      let assignedEnrollments = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        totalEnrollments++;
        
        // Contar por estado
        if (data.status === 'active') activeEnrollments++;
        else if (data.status === 'completed') completedEnrollments++;
        else if (data.status === 'dropped') droppedEnrollments++;
        
        // Contar por tipo de inscripción
        if (data.enrollmentType === 'free') freeEnrollments++;
        else if (data.enrollmentType === 'paid') paidEnrollments++;
        else if (data.enrollmentType === 'assigned') assignedEnrollments++;
      });
      
      return {
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        droppedEnrollments,
        byEnrollmentType: {
          free: freeEnrollments,
          paid: paidEnrollments,
          assigned: assignedEnrollments
        }
      };
    } catch (error) {
      console.error('Error en getCourseEnrollmentStats:', error);
      throw error;
    }
  }
}

module.exports = EnrollmentModel;
