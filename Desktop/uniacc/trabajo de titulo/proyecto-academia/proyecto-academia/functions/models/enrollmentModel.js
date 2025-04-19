const admin = require('../config/firebase');
const db = admin.firestore();
const enrollmentsCollection = db.collection('enrollments');
const coursesCollection = db.collection('courses');
const usersCollection = db.collection('users');

/**
 * Modelo para manejar operaciones relacionadas con inscripciones en Firestore
 */
class EnrollmentModel {
  /**
   * Crea una nueva inscripción
   * @param {string} userId - ID del usuario
   * @param {string} courseId - ID del curso
   * @returns {Promise<Object>} Datos de la inscripción creada
   */
  static async create(userId, courseId) {
    try {
      // Verificar si el usuario existe
      const userDoc = await usersCollection.doc(userId).get();
      if (!userDoc.exists) throw new Error('Usuario no encontrado');
      
      // Verificar si el curso existe
      const courseDoc = await coursesCollection.doc(courseId).get();
      if (!courseDoc.exists) throw new Error('Curso no encontrado');
      
      // Verificar si ya existe la inscripción
      const existingEnrollment = await enrollmentsCollection
        .where('userId', '==', userId)
        .where('courseId', '==', courseId)
        .limit(1)
        .get();
      
      if (!existingEnrollment.empty) {
        throw new Error('El usuario ya está inscrito en este curso');
      }
      
      // Crear la inscripción
      const enrollmentData = {
        userId,
        courseId,
        progress: 0,
        completedEvaluations: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
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
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      if (progress !== undefined && progress !== null) {
        updateData.progress = progress;
      }
      
      if (completedEvaluations !== null) {
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
}

module.exports = EnrollmentModel;
