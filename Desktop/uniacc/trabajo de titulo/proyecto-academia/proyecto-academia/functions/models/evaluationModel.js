const admin = require('../config/firebase');
const db = admin.firestore();
const evaluationsCollection = db.collection('evaluations');
const coursesCollection = db.collection('courses');
const enrollmentsCollection = db.collection('enrollments');

/**
 * Modelo para manejar operaciones relacionadas con evaluaciones en Firestore
 */
class EvaluationModel {
  /**
   * Crear una nueva evaluación
   * @param {Object} data - Datos de la evaluación
   * @returns {Promise<Object>} Evaluación creada
   */
  static async create(data) {
    try {
      // Validar campos requeridos
      if (!data.title) throw new Error('El título de la evaluación es obligatorio');
      if (!data.courseId) throw new Error('El ID del curso es obligatorio');
      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('Se requiere al menos una pregunta en la evaluación');
      }
      
      // Verificar que el curso exista
      const courseDoc = await coursesCollection.doc(data.courseId).get();
      if (!courseDoc.exists) {
        throw new Error('El curso especificado no existe');
      }
      
      // Preparar datos
      const evaluationData = {
        title: data.title,
        description: data.description || '',
        questions: data.questions,
        courseId: data.courseId,
        maxScore: data.maxScore || data.questions.length * 10, // Puntaje por defecto
        passingScore: data.passingScore || Math.floor(data.questions.length * 6), // 60% aprobación
        timeLimit: data.timeLimit || null, // Tiempo límite en minutos (opcional)
        dueDate: data.dueDate ? this.ensureTimestamp(data.dueDate) : null,
        allowMultipleAttempts: data.allowMultipleAttempts || false,
        published: data.published || false,
        order: data.order || 1, // Orden dentro del curso
        createdBy: data.createdBy || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = await evaluationsCollection.add(evaluationData);
      
      return {
        id: docRef.id,
        ...evaluationData
      };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }
  
  /**
   * Convertir varios formatos de fecha a Timestamp de Firestore
   * @param {Date|string|number} date - Fecha a convertir
   * @returns {Timestamp} Timestamp de Firestore
   */
  static ensureTimestamp(date) {
    if (!date) return null;
    
    if (date instanceof admin.firestore.Timestamp) {
      return date;
    }
    
    if (typeof date === 'string') {
      return admin.firestore.Timestamp.fromDate(new Date(date));
    }
    
    if (date instanceof Date) {
      return admin.firestore.Timestamp.fromDate(date);
    }
    
    if (typeof date === 'number') {
      return admin.firestore.Timestamp.fromMillis(date);
    }
    
    return null;
  }
  
  /**
   * Buscar una evaluación por ID
   * @param {string} id - ID de la evaluación
   * @returns {Promise<Object|null>} Evaluación o null si no existe
   */
  static async findById(id) {
    try {
      const doc = await evaluationsCollection.doc(id).get();
      if (!doc.exists) return null;
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }
  
  /**
   * Buscar evaluaciones por curso
   * @param {string} courseId - ID del curso
   * @param {boolean} onlyPublished - Solo evaluaciones publicadas
   * @returns {Promise<Array>} Lista de evaluaciones
   */
  static async findByCourse(courseId, onlyPublished = false) {
    try {
      let query = evaluationsCollection.where('courseId', '==', courseId);
      
      if (onlyPublished) {
        query = query.where('published', '==', true);
      }
      
      // Ordenar por el campo 'order'
      query = query.orderBy('order', 'asc');
      
      const snapshot = await query.get();
      
      if (snapshot.empty) return [];
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error en findByCourse:', error);
      throw error;
    }
  }
  
  /**
   * Obtener evaluaciones completadas por un estudiante
   * @param {string} userId - ID del estudiante
   * @returns {Promise<Array>} Lista de evaluaciones completadas
   */
  static async findCompletedByUser(userId) {
    try {
      // Obtener todas las inscripciones del usuario
      const enrollmentsSnapshot = await enrollmentsCollection
        .where('userId', '==', userId)
        .get();
      
      if (enrollmentsSnapshot.empty) return [];
      
      // Recopilar todos los IDs de evaluaciones completadas
      let completedEvaluationIds = [];
      
      enrollmentsSnapshot.docs.forEach(doc => {
        const enrollmentData = doc.data();
        if (enrollmentData.completedEvaluations && enrollmentData.completedEvaluations.length > 0) {
          completedEvaluationIds = [...completedEvaluationIds, ...enrollmentData.completedEvaluations];
        }
      });
      
      // Si no hay evaluaciones completadas, retornar array vacío
      if (completedEvaluationIds.length === 0) return [];
      
      // Obtener detalles de las evaluaciones completadas
      const completedEvaluations = [];
      
      for (const evalId of completedEvaluationIds) {
        const evalDoc = await evaluationsCollection.doc(evalId).get();
        if (evalDoc.exists) {
          const evalData = evalDoc.data();
          
          // Obtener información del curso asociado
          const courseDoc = await coursesCollection.doc(evalData.courseId).get();
          let courseData = null;
          
          if (courseDoc.exists) {
            courseData = {
              id: courseDoc.id,
              title: courseDoc.data().title
            };
          }
          
          completedEvaluations.push({
            id: evalDoc.id,
            ...evalData,
            course: courseData
          });
        }
      }
      
      return completedEvaluations;
    } catch (error) {
      console.error('Error en findCompletedByUser:', error);
      throw error;
    }
  }
  
  /**
   * Actualizar una evaluación
   * @param {string} id - ID de la evaluación
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object>} Evaluación actualizada
   */
  static async update(id, data) {
    try {
      const evalDoc = await evaluationsCollection.doc(id).get();
      if (!evalDoc.exists) {
        throw new Error('Evaluación no encontrada');
      }
      
      // Validaciones básicas
      if (data.questions && (!Array.isArray(data.questions) || data.questions.length === 0)) {
        throw new Error('Se requiere al menos una pregunta en la evaluación');
      }
      
      // Si se cambia la fecha de vencimiento, convertirla a Timestamp
      if (data.dueDate) {
        data.dueDate = this.ensureTimestamp(data.dueDate);
      }
      
      // Preparar datos de actualización
      const updateData = {
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Actualizar la evaluación
      await evaluationsCollection.doc(id).update(updateData);
      
      // Obtener la evaluación actualizada
      const updatedDoc = await evaluationsCollection.doc(id).get();
      
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }
  
  /**
   * Eliminar una evaluación
   * @param {string} id - ID de la evaluación
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  static async delete(id) {
    try {
      const evalDoc = await evaluationsCollection.doc(id).get();
      if (!evalDoc.exists) {
        throw new Error('Evaluación no encontrada');
      }
      
      // Eliminar también las respuestas asociadas a esta evaluación
      const responsesSnapshot = await db.collection('responses')
        .where('evaluationId', '==', id)
        .get();
      
      // Usar batch para operaciones múltiples
      const batch = db.batch();
      
      responsesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Agregar eliminación de la evaluación al batch
      batch.delete(evaluationsCollection.doc(id));
      
      // Ejecutar el batch
      await batch.commit();
      
      return true;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }
}

module.exports = EvaluationModel;
