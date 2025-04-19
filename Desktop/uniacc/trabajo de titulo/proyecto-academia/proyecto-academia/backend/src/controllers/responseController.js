const Response = require('../models/Response');
const Evaluation = require('../models/evaluation');

// Registrar una respuesta y calcular el puntaje
const submitResponse = async (req, res) => {
  try {
    const { evaluation_id, answers } = req.body;

    // Validar datos básicos
    if (!evaluation_id || !answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Evaluación y respuestas son obligatorias.' });
    }

    // Verificar existencia de la evaluación
    const evaluation = await Evaluation.findByPk(evaluation_id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluación no encontrada.' });
    }

    // Validar respuestas con las preguntas de la evaluación
    const questions = evaluation.questions; // Supone que `questions` contiene las preguntas y respuestas correctas
    let score = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score += question.points || 1; // Usar puntos definidos o por defecto 1
      }
    });

    // Registrar la respuesta en la base de datos
    const response = await Response.create({
      user_id: req.user.id,
      evaluation_id,
      answers,
      score,
    });

    res.status(201).json({ message: 'Respuesta enviada exitosamente.', response });
  } catch (error) {
    console.error('Error al registrar la respuesta:', error);
    res.status(500).json({ message: 'Error al registrar la respuesta.', details: error.message });
  }
};

// Obtener el historial de evaluaciones completadas por el usuario
const getCompletedEvaluations = async (req, res) => {
  try {
    const responses = await Response.findAll({
      where: { user_id: req.user.id },
      include: {
        model: Evaluation,
        attributes: ['id', 'title', 'description'],
      },
    });

    if (responses.length === 0) {
      return res.status(404).json({ message: 'No se encontraron evaluaciones completadas.' });
    }

    res.status(200).json(responses);
  } catch (error) {
    console.error('Error al obtener el historial de evaluaciones:', error);
    res.status(500).json({ message: 'Error al obtener el historial de evaluaciones.', details: error.message });
  }
};

module.exports = { submitResponse, getCompletedEvaluations };
