const ResponseModel = require('../models/responseModel');
const EvaluationModel = require('../models/evaluationModel');

// Enviar respuesta a una evaluación
const submitResponse = async (req, res) => {
  try {
    const { evaluationId, answers } = req.body;
    const userId = req.user.uid;

    if (!evaluationId || !answers || typeof answers !== 'object') {
      return res.status(400).json({ 
        message: 'Datos incompletos. Se requiere ID de la evaluación y respuestas.' 
      });
    }

    // Validar que la evaluación existe
    const evaluation = await EvaluationModel.findById(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ message: 'La evaluación no existe' });
    }

    // Validar que el número de respuestas coincide con el número de preguntas
    if (!Array.isArray(evaluation.questions) || 
        Object.keys(answers).length !== evaluation.questions.length) {
      return res.status(400).json({ 
        message: 'El número de respuestas no coincide con el número de preguntas' 
      });
    }

    try {
      // Enviar respuesta y calcular puntaje
      const result = await ResponseModel.submitResponse(userId, evaluationId, answers);
      
      res.status(201).json({
        message: 'Respuestas enviadas correctamente',
        result: {
          score: result.score,
          maxScore: result.maxScore,
          percentage: result.percentage
        }
      });
    } catch (error) {
      if (error.message === 'Ya has respondido esta evaluación') {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error al enviar respuesta:', error);
    res.status(500).json({ 
      message: 'Error al procesar las respuestas', 
      details: error.message 
    });
  }
};

// Obtener historial de evaluaciones completadas por el usuario
const getCompletedEvaluations = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const evaluationsHistory = await ResponseModel.getCompletedEvaluations(userId);
    
    res.status(200).json({
      completed: evaluationsHistory.length,
      evaluations: evaluationsHistory
    });
  } catch (error) {
    console.error('Error al obtener historial de evaluaciones:', error);
    res.status(500).json({ 
      message: 'Error al obtener historial de evaluaciones', 
      details: error.message 
    });
  }
};

module.exports = {
  submitResponse,
  getCompletedEvaluations
};
