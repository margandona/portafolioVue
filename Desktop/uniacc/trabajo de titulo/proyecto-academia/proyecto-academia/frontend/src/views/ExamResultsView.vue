<template>
  <div class="exam-results">
    <div class="results-container">
      <!-- Header de resultados -->
      <div class="results-header">
        <div class="results-status" :class="statusClass">
          <div class="status-icon">{{ statusIcon }}</div>
          <h1 class="results-title">{{ statusTitle }}</h1>
          <p class="results-subtitle">{{ evaluation.title }}</p>
        </div>
      </div>

      <!-- Resumen de puntuación -->
      <div class="score-summary">
        <div class="score-main">
          <div class="score-circle" :class="scoreClass">
            <div class="score-value">{{ Math.round(response.score) }}%</div>
            <div class="score-label">Puntuación</div>
          </div>
          <div class="score-details">
            <div class="score-item">
              <span class="score-number">{{ response.correctAnswers }}</span>
              <span class="score-text">Correctas</span>
            </div>
            <div class="score-item">
              <span class="score-number">{{ response.incorrectAnswers }}</span>
              <span class="score-text">Incorrectas</span>
            </div>
            <div class="score-item">
              <span class="score-number">{{ response.unanswered }}</span>
              <span class="score-text">Sin responder</span>
            </div>
          </div>
        </div>

        <!-- Estadísticas adicionales -->
        <div class="additional-stats">
          <div class="stat-item">
            <span class="stat-label">Tiempo utilizado:</span>
            <span class="stat-value">{{ formatTime(response.timeSpent) }}</span>
          </div>
          <div class="stat-item" v-if="evaluation.timeLimit">
            <span class="stat-label">Tiempo límite:</span>
            <span class="stat-value">{{ evaluation.timeLimit }} minutos</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Fecha de envío:</span>
            <span class="stat-value">{{ formatDate(response.submittedAt) }}</span>
          </div>
          <div class="stat-item" v-if="response.grade">
            <span class="stat-label">Calificación:</span>
            <span class="stat-value grade">{{ response.grade }}</span>
          </div>
        </div>
      </div>

      <!-- Análisis detallado -->
      <div class="detailed-analysis" v-if="showDetails">
        <h2>Análisis detallado</h2>
        
        <div class="question-review" v-for="(question, index) in evaluation.questions" :key="index">
          <div class="question-header">
            <h3 class="question-number">Pregunta {{ index + 1 }}</h3>
            <div class="question-status" :class="getQuestionStatus(index)">
              {{ getQuestionStatusText(index) }}
            </div>
          </div>
          
          <div class="question-content">
            <p class="question-text">{{ question.question }}</p>
            
            <!-- Imagen de la pregunta -->
            <div v-if="question.image" class="question-image">
              <img :src="question.image" :alt="question.question" />
            </div>

            <!-- Respuesta del usuario -->
            <div class="user-answer">
              <h4>Tu respuesta:</h4>
              <div class="answer-content" :class="getQuestionStatus(index)">
                {{ formatUserAnswer(question, index) }}
              </div>
            </div>

            <!-- Respuesta correcta (si está disponible) -->
            <div v-if="question.showCorrectAnswer && question.correctAnswer !== undefined" class="correct-answer">
              <h4>Respuesta correcta:</h4>
              <div class="answer-content correct">
                {{ formatCorrectAnswer(question) }}
              </div>
            </div>

            <!-- Explicación -->
            <div v-if="question.explanation" class="question-explanation">
              <h4>Explicación:</h4>
              <p>{{ question.explanation }}</p>
            </div>

            <!-- Puntos obtenidos -->
            <div class="question-points">
              <span class="points-earned">{{ getQuestionPoints(index) }}</span> / 
              <span class="points-total">{{ question.points || 1 }}</span> puntos
            </div>
          </div>
        </div>
      </div>

      <!-- Comentarios del instructor -->
      <div v-if="response.instructorFeedback" class="instructor-feedback">
        <h2>Comentarios del instructor</h2>
        <div class="feedback-content">
          <p>{{ response.instructorFeedback }}</p>
          <div class="feedback-meta">
            <span>Por: {{ response.instructorName }}</span>
            <span>{{ formatDate(response.feedbackDate) }}</span>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="results-actions">
        <button @click="toggleDetails" class="action-button secondary">
          {{ showDetails ? 'Ocultar detalles' : 'Ver detalles' }}
        </button>
        
        <button v-if="canRetake" @click="retakeExam" class="action-button primary">
          Volver a intentar
        </button>
        
        <button @click="downloadResults" class="action-button secondary">
          Descargar resultados
        </button>
        
        <button @click="goToCourse" class="action-button primary">
          Volver al curso
        </button>
      </div>

      <!-- Recomendaciones -->
      <div v-if="recommendations.length > 0" class="recommendations">
        <h2>Recomendaciones</h2>
        <div class="recommendation-list">
          <div v-for="rec in recommendations" :key="rec.id" class="recommendation-item">
            <div class="rec-icon">{{ rec.icon }}</div>
            <div class="rec-content">
              <h4>{{ rec.title }}</h4>
              <p>{{ rec.description }}</p>
              <a v-if="rec.link" :href="rec.link" class="rec-link">{{ rec.linkText }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Cargando resultados...</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'ExamResults',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    // Estado reactivo
    const response = ref({})
    const evaluation = ref({})
    const showDetails = ref(false)
    const loading = ref(true)

    // Computed properties
    const statusClass = computed(() => {
      const score = response.value.score
      if (score >= 80) return 'excellent'
      if (score >= 60) return 'good'
      if (score >= 40) return 'average'
      return 'poor'
    })

    const scoreClass = computed(() => {
      const score = response.value.score
      if (score >= 80) return 'excellent'
      if (score >= 60) return 'good'
      if (score >= 40) return 'average'
      return 'poor'
    })

    const statusIcon = computed(() => {
      const score = response.value.score
      if (score >= 80) return '🎉'
      if (score >= 60) return '👍'
      if (score >= 40) return '📚'
      return '💪'
    })

    const statusTitle = computed(() => {
      const score = response.value.score
      if (score >= 80) return '¡Excelente trabajo!'
      if (score >= 60) return '¡Buen trabajo!'
      if (score >= 40) return 'Puedes mejorar'
      return 'Sigue practicando'
    })

    const canRetake = computed(() => {
      return evaluation.value.allowRetakes && 
             (evaluation.value.maxAttempts === -1 || 
              response.value.attemptNumber < evaluation.value.maxAttempts)
    })

    const recommendations = computed(() => {
      const recs = []
      const score = response.value.score

      if (score < 60) {
        recs.push({
          id: 'review',
          icon: '📖',
          title: 'Revisar el material',
          description: 'Te recomendamos revisar los contenidos del curso antes del siguiente intento.',
          link: `/courses/${evaluation.value.courseId}/materials`,
          linkText: 'Ver materiales'
        })
      }

      if (response.value.timeSpent < (evaluation.value.timeLimit * 60 * 0.5)) {
        recs.push({
          id: 'time',
          icon: '⏰',
          title: 'Tómate más tiempo',
          description: 'Parece que completaste el examen muy rápido. Lee las preguntas con más cuidado.',
        })
      }

      if (response.value.unanswered > 0) {
        recs.push({
          id: 'complete',
          icon: '✅',
          title: 'Responde todas las preguntas',
          description: 'Asegúrate de responder todas las preguntas en tu próximo intento.',
        })
      }

      return recs
    })

    // Métodos
    const loadResults = async () => {
      try {
        const responseId = route.params.responseId
        const responseData = await fetch(`/api/responses/${responseId}`, {
          headers: {
            'Authorization': `Bearer ${store.getters.authToken}`
          }
        })

        if (!responseData.ok) throw new Error('Error cargando resultados')

        const result = await responseData.json()
        response.value = result

        // Cargar datos de la evaluación
        const evaluationData = await fetch(`/api/evaluations/${result.evaluationId}`, {
          headers: {
            'Authorization': `Bearer ${store.getters.authToken}`
          }
        })

        if (!evaluationData.ok) throw new Error('Error cargando evaluación')

        evaluation.value = await evaluationData.json()

      } catch (error) {
        console.error('Error:', error)
        // Mostrar mensaje de error
      } finally {
        loading.value = false
      }
    }

    const formatTime = (seconds) => {
      if (!seconds) return 'No disponible'
      
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const remainingSeconds = seconds % 60

      if (hours > 0) {
        return `${hours}h ${minutes}m ${remainingSeconds}s`
      } else if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`
      } else {
        return `${remainingSeconds}s`
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'No disponible'
      
      const date = new Date(dateString)
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getQuestionStatus = (questionIndex) => {
      const userAnswer = response.value.answers[questionIndex]
      const question = evaluation.value.questions[questionIndex]
      
      if (userAnswer === undefined) return 'unanswered'
      
      // Verificar si la respuesta es correcta
      if (isAnswerCorrect(question, userAnswer)) {
        return 'correct'
      } else {
        return 'incorrect'
      }
    }

    const getQuestionStatusText = (questionIndex) => {
      const status = getQuestionStatus(questionIndex)
      const statusTexts = {
        correct: '✅ Correcta',
        incorrect: '❌ Incorrecta',
        unanswered: '⚪ Sin responder'
      }
      return statusTexts[status]
    }

    const isAnswerCorrect = (question, userAnswer) => {
      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        return userAnswer === question.correctAnswer
      } else if (question.type === 'multiple-select') {
        const correct = question.correctAnswer.sort()
        const user = (userAnswer || []).sort()
        return JSON.stringify(correct) === JSON.stringify(user)
      } else if (question.type === 'open-text') {
        // Para preguntas abiertas, se asume que se califican manualmente
        return response.value.manualGrades?.[question.id] || false
      }
      return false
    }

    const formatUserAnswer = (question, questionIndex) => {
      const userAnswer = response.value.answers[questionIndex]
      
      if (userAnswer === undefined) {
        return 'Sin responder'
      }

      if (question.type === 'multiple-choice') {
        return question.options[userAnswer] || 'Respuesta inválida'
      } else if (question.type === 'multiple-select') {
        return userAnswer.map(index => question.options[index]).join(', ')
      } else if (question.type === 'true-false') {
        return userAnswer ? 'Verdadero' : 'Falso'
      } else if (question.type === 'open-text') {
        return userAnswer
      }

      return userAnswer
    }

    const formatCorrectAnswer = (question) => {
      if (question.type === 'multiple-choice') {
        return question.options[question.correctAnswer]
      } else if (question.type === 'multiple-select') {
        return question.correctAnswer.map(index => question.options[index]).join(', ')
      } else if (question.type === 'true-false') {
        return question.correctAnswer ? 'Verdadero' : 'Falso'
      } else if (question.type === 'open-text') {
        return question.sampleAnswer || 'Respuesta libre'
      }

      return question.correctAnswer
    }

    const getQuestionPoints = (questionIndex) => {
      const question = evaluation.value.questions[questionIndex]
      const isCorrect = getQuestionStatus(questionIndex) === 'correct'
      
      if (question.type === 'open-text') {
        return response.value.manualGrades?.[questionIndex] || 0
      }
      
      return isCorrect ? (question.points || 1) : 0
    }

    const toggleDetails = () => {
      showDetails.value = !showDetails.value
    }

    const retakeExam = () => {
      router.push({
        name: 'ExamInterface',
        params: { id: evaluation.value.id }
      })
    }

    const downloadResults = () => {
      // Implementar descarga de resultados en PDF
      const resultData = {
        evaluation: evaluation.value,
        response: response.value,
        timestamp: new Date().toISOString()
      }
      
      const dataStr = JSON.stringify(resultData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `resultados-${evaluation.value.title}-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      URL.revokeObjectURL(url)
    }

    const goToCourse = () => {
      router.push({
        name: 'CourseDetail',
        params: { id: evaluation.value.courseId }
      })
    }

    // Lifecycle
    onMounted(() => {
      loadResults()
    })

    return {
      response,
      evaluation,
      showDetails,
      loading,
      statusClass,
      scoreClass,
      statusIcon,
      statusTitle,
      canRetake,
      recommendations,
      formatTime,
      formatDate,
      getQuestionStatus,
      getQuestionStatusText,
      formatUserAnswer,
      formatCorrectAnswer,
      getQuestionPoints,
      toggleDetails,
      retakeExam,
      downloadResults,
      goToCourse
    }
  }
}
</script>

<style scoped>
.exam-results {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 20px;
}

.results-container {
  max-width: 900px;
  margin: 0 auto;
}

.results-header {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  text-align: center;
}

.results-status.excellent {
  color: #27ae60;
}

.results-status.good {
  color: #3498db;
}

.results-status.average {
  color: #f39c12;
}

.results-status.poor {
  color: #e74c3c;
}

.status-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.results-title {
  font-size: 32px;
  margin-bottom: 10px;
}

.results-subtitle {
  font-size: 18px;
  color: #7f8c8d;
}

.score-summary {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.score-main {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 30px;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 8px solid;
  position: relative;
}

.score-circle.excellent {
  border-color: #27ae60;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
}

.score-circle.good {
  border-color: #3498db;
  background: linear-gradient(135deg, #3498db, #5dade2);
  color: white;
}

.score-circle.average {
  border-color: #f39c12;
  background: linear-gradient(135deg, #f39c12, #f8c471);
  color: white;
}

.score-circle.poor {
  border-color: #e74c3c;
  background: linear-gradient(135deg, #e74c3c, #ec7063);
  color: white;
}

.score-value {
  font-size: 28px;
  font-weight: bold;
}

.score-label {
  font-size: 14px;
  opacity: 0.9;
}

.score-details {
  display: flex;
  gap: 30px;
}

.score-item {
  text-align: center;
}

.score-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.score-text {
  color: #7f8c8d;
  font-size: 14px;
}

.additional-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #7f8c8d;
}

.stat-value {
  font-weight: 500;
  color: #2c3e50;
}

.stat-value.grade {
  color: #27ae60;
  font-weight: bold;
}

.detailed-analysis {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.detailed-analysis h2 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 24px;
}

.question-review {
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
}

.question-header {
  background: #f8f9fa;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ecf0f1;
}

.question-number {
  color: #2c3e50;
  margin: 0;
  font-size: 18px;
}

.question-status {
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.question-status.correct {
  background: #d5f4e6;
  color: #27ae60;
}

.question-status.incorrect {
  background: #fadbd8;
  color: #e74c3c;
}

.question-status.unanswered {
  background: #f8f9fa;
  color: #7f8c8d;
}

.question-content {
  padding: 20px;
}

.question-text {
  font-size: 16px;
  line-height: 1.6;
  color: #2c3e50;
  margin-bottom: 15px;
}

.question-image {
  margin-bottom: 15px;
  text-align: center;
}

.question-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.user-answer, .correct-answer, .question-explanation {
  margin-bottom: 15px;
}

.user-answer h4, .correct-answer h4, .question-explanation h4 {
  margin-bottom: 8px;
  color: #34495e;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.answer-content {
  padding: 12px;
  border-radius: 6px;
  background: #f8f9fa;
  border-left: 4px solid #bdc3c7;
}

.answer-content.correct {
  background: #d5f4e6;
  border-left-color: #27ae60;
  color: #1e8449;
}

.answer-content.incorrect {
  background: #fadbd8;
  border-left-color: #e74c3c;
  color: #c0392b;
}

.question-explanation p {
  color: #5d6d7e;
  line-height: 1.5;
  font-style: italic;
}

.question-points {
  text-align: right;
  font-weight: 500;
  color: #7f8c8d;
}

.instructor-feedback {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.instructor-feedback h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.feedback-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.feedback-meta {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #7f8c8d;
}

.results-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 30px;
}

.action-button {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-button.primary {
  background: #3498db;
  color: white;
}

.action-button.primary:hover {
  background: #2980b9;
}

.action-button.secondary {
  background: white;
  color: #3498db;
  border: 2px solid #3498db;
}

.action-button.secondary:hover {
  background: #3498db;
  color: white;
}

.recommendations {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.recommendations h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.recommendation-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #f39c12;
}

.rec-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.rec-content h4 {
  color: #2c3e50;
  margin-bottom: 5px;
}

.rec-content p {
  color: #7f8c8d;
  margin-bottom: 10px;
  line-height: 1.5;
}

.rec-link {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

.rec-link:hover {
  text-decoration: underline;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .exam-results {
    padding: 10px;
  }
  
  .results-header, .score-summary, .detailed-analysis {
    padding: 20px;
  }
  
  .score-main {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .score-details {
    justify-content: space-around;
  }
  
  .additional-stats {
    grid-template-columns: 1fr;
  }
  
  .results-actions {
    flex-direction: column;
  }
  
  .action-button {
    width: 100%;
  }
}
</style>
