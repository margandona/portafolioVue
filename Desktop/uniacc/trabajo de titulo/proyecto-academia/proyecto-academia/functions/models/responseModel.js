const admin = require('../config/firebase');
const db = admin.firestore();
const responsesCollection = db.collection('responses');
const evaluationsCollection = db.collection('evaluations');
const enrollmentsCollection = db.collection('enrollments');

/**
 * Modelo para manejar operaciones relacionadas con respuestas de evaluaciones en Firestore
 */
class ResponseModel {
  /**
   * Obtiene una respuesta por su ID
   * @param {string} responseId - ID de la respuesta
   * @returns {Promise<Object|null>} Datos de la respuesta o null si no existe
   */
  static async findById(responseId) {
    try {
      const responseDoc = await responsesCollection.doc(responseId).get();
      if (!responseDoc.exists) return null;
      
      return {
        id: responseDoc.id,
        ...responseDoc.data()
      };
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene respuestas por usuario y/o evaluación
   * @param {string} userId - ID del usuario (opcional)
   * @param {string} evaluationId - ID de la evaluación (opcional)
   * @returns {Promise<Array>} Lista de respuestas
   */
  static async findByUserAndEvaluation(userId = null, evaluationId = null) {
    try {
      let query = responsesCollection;
      
      if (userId) {
        query = query.where('userId', '==', userId);
      }
      
      if (evaluationId) {
        query = query.where('evaluationId', '==', evaluationId);
      }
      
      const snapshot = await query.get();
      
      if (snapshot.empty) return [];
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error en findByUserAndEvaluation:', error);
      throw error;
    }
  }
  
  /**
   * Envía una respuesta a una evaluación y calcula el puntaje
   * @param {string} userId - ID del usuario
   * @param {string} evaluationId - ID de la evaluación
   * @param {Object} answers - Respuestas del usuario
   * @returns {Promise<Object>} La respuesta creada con su puntaje
   */
  static async submitResponse(userId, evaluationId, answers) {
    try {
      // Verificar que la evaluación existe
      const evaluationDoc = await evaluationsCollection.doc(evaluationId).get();
      if (!evaluationDoc.exists) {
        throw new Error('La evaluación no existe');
      }
      
      const evaluationData = evaluationDoc.data();
      
      // Verificar si ya existe una respuesta para esta evaluación
      const existingResponseSnapshot = await responsesCollection
        .where('userId', '==', userId)
        .where('evaluationId', '==', evaluationId)
        .limit(1)
        .get();
        
      if (!existingResponseSnapshot.empty) {
        throw new Error('Ya has respondido esta evaluación');
      }
      
      // Calcular puntaje
      let totalScore = 0;
      let maxPossibleScore = 0;
      
      // Suponemos que evaluationData.questions es un array de preguntas con sus respuestas correctas
      evaluationData.questions.forEach((question, index) => {
        const userAnswer = answers[index];
        const pointsForQuestion = question.points || 1; // Valor por defecto: 1 punto
        
        maxPossibleScore += pointsForQuestion;
        
        // Si la respuesta del usuario es correcta, sumar puntos
        if (question.correctAnswer === userAnswer) {
          totalScore += pointsForQuestion;
        }
      });
      
      const percentage = (totalScore / maxPossibleScore) * 100;
      
      // Crear respuesta en Firestore
      const responseData = {
        userId,
        evaluationId,
        answers,
        score: totalScore,
        maxScore: maxPossibleScore,
        percentage,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const responseRef = await responsesCollection.add(responseData);
      
      // Actualizar inscripción para marcar esta evaluación como completada
      const enrollmentsSnapshot = await enrollmentsCollection
        .where('userId', '==', userId)
        .where('courseId', '==', evaluationData.courseId)
        .limit(1)
        .get();
      
      if (!enrollmentsSnapshot.empty) {
        const enrollmentDoc = enrollmentsSnapshot.docs[0];
        const enrollmentData = enrollmentDoc.data();
        
        // Añadir esta evaluación a completedEvaluations si no existe ya
        const completedEvaluations = enrollmentData.completedEvaluations || [];
        if (!completedEvaluations.includes(evaluationId)) {
          completedEvaluations.push(evaluationId);
          
          // Actualizar el progreso basado en evaluaciones completadas
          const courseEvaluationsSnapshot = await evaluationsCollection
            .where('courseId', '==', evaluationData.courseId)
            .get();
            
          const progress = (completedEvaluations.length / courseEvaluationsSnapshot.size) * 100;
          
          await enrollmentDoc.ref.update({
            completedEvaluations,
            progress: Math.min(progress, 100), // No exceder el 100%
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
      
      return {
        id: responseRef.id,
        ...responseData
      };
    } catch (error) {
      console.error('Error en submitResponse:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene el historial de evaluaciones completadas por un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Lista de evaluaciones con respuestas
   */
  static async getCompletedEvaluations(userId) {
    try {
      const snapshot = await responsesCollection
        .where('userId', '==', userId)
        .get();
        
      if (snapshot.empty) return [];
      
      const results = [];
      
      for (const doc of snapshot.docs) {
        const responseData = doc.data();
        const evaluationDoc = await evaluationsCollection.doc(responseData.evaluationId).get();
        
        if (evaluationDoc.exists) {
          results.push({
            response: {
              id: doc.id,
              ...responseData
            },
            evaluation: {
              id: evaluationDoc.id,
              ...evaluationDoc.data()
            }
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error en getCompletedEvaluations:', error);
      throw error;
    }
  }
}

module.exports = ResponseModel;
