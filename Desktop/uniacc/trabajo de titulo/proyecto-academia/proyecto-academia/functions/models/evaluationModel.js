const admin = require('../config/firebase');
const db = admin.firestore();
const evaluationsCollection = db.collection('evaluations');
const coursesCollection = db.collection('courses');
const usersCollection = db.collection('users');

/**
 * Modelo para manejar operaciones relacionadas con evaluaciones en Firestore
 */
class EvaluationModel {
  /**
   * Obtiene una evaluación por su ID
   * @param {string} evaluationId - ID de la evaluación
   * @returns {Promise<Object|null>} Datos de la evaluación o null si no existe
   */
  static async findById(evaluationId) {
    try {
      const evaluationDoc = await evaluationsCollection.doc(evaluationId).get();
      if (!evaluationDoc.exists) return null;
      
      return {
        id: evaluationDoc.id,
        ...evaluationDoc.data()
      };
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene todas las evaluaciones por ID de curso
   * @param {string} courseId - ID del curso
   * @returns {Promise<Array>} Lista de evaluaciones
   */
  static async findByCourseId(courseId) {
    try {
      const snapshot = await evaluationsCollection
        .where('courseId', '==', courseId)
        .get();
      
      if (snapshot.empty) return [];
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error en findByCourseId:', error);
      throw error;
    }
  }
  
  /**
   * Crea una nueva evaluación
   * @param {Object} evaluationData - Datos de la evaluación
   * @returns {Promise<Object>} La evaluación creada
   */
  static async create(evaluationData) {
    try {
      // Validar datos básicos
      if (!evaluationData.title || !evaluationData.courseId || !Array.isArray(evaluationData.questions)) {
        throw new Error('Faltan campos obligatorios: título, courseId o preguntas');
      }
      
      // Verificar que el curso existe
      const courseDoc = await coursesCollection.doc(evaluationData.courseId).get();
      if (!courseDoc.exists) {
        throw new Error('El curso asociado no existe');
      }
      
      // Añadir timestamps
      const dataWithTimestamps = {
        ...evaluationData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Crear evaluación
      const docRef = await evaluationsCollection.add(dataWithTimestamps);
      
      return {
        id: docRef.id,
        ...dataWithTimestamps
      };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza una evaluación existente
   * @param {string} evaluationId - ID de la evaluación a actualizar
   * @param {Object} evaluationData - Datos a actualizar
   * @returns {Promise<Object>} La evaluación actualizada
   */
  static async update(evaluationId, evaluationData) {
    try {
      // Verificar que la evaluación existe
      const evaluationDoc = await evaluationsCollection.doc(evaluationId).get();
      if (!evaluationDoc.exists) {
        throw new Error('Evaluación no encontrada');
      }
      
      // Preparar datos para actualización
      const updateData = {
        ...evaluationData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Actualizar la evaluación
      await evaluationsCollection.doc(evaluationId).update(updateData);
      
      // Obtener la evaluación actualizada
      const updatedDoc = await evaluationsCollection.doc(evaluationId).get();
      
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
   * Elimina una evaluación
   * @param {string} evaluationId - ID de la evaluación a eliminar
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  static async delete(evaluationId) {
    try {
      // Verificar que la evaluación existe
      const evaluationDoc = await evaluationsCollection.doc(evaluationId).get();
      if (!evaluationDoc.exists) {
        throw new Error('Evaluación no encontrada');
      }
      
      // Eliminar la evaluación
      await evaluationsCollection.doc(evaluationId).delete();
      return true;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }
  
  /**
   * Verifica si un usuario tiene permisos para modificar/eliminar una evaluación
   * @param {string} evaluationId - ID de la evaluación
   * @param {string} userId - ID del usuario
   * @param {string} userRole - Rol del usuario
   * @returns {Promise<boolean>} true si tiene permisos
   */
  static async hasPermission(evaluationId, userId, userRole) {
    try {
      if (userRole === 'admin') return true;
      
      const evaluationDoc = await evaluationsCollection.doc(evaluationId).get();
      if (!evaluationDoc.exists) return false;
      
      const evaluationData = evaluationDoc.data();
      const courseDoc = await coursesCollection.doc(evaluationData.courseId).get();
      
      if (!courseDoc.exists) return false;
      
      // Verificar si el usuario es el profesor del curso
      return courseDoc.data().teacherId === userId;
    } catch (error) {
      console.error('Error en hasPermission:', error);
      throw error;
    }
  }
}

module.exports = EvaluationModel;
