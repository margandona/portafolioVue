<template>
  <div class="evaluation-reports">
    <div class="reports-header">
      <h1>Reportes de Evaluaciones</h1>
      <p>Dashboard de análisis y estadísticas de evaluaciones</p>
    </div>

    <!-- Filtros y controles -->
    <div class="controls-section">
      <div class="filters">
        <div class="filter-group">
          <label>Curso:</label>
          <select v-model="selectedCourse" @change="loadEvaluations">
            <option value="">Todos los cursos</option>
            <option v-for="course in courses" :key="course.id" :value="course.id">
              {{ course.title }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Evaluación:</label>
          <select v-model="selectedEvaluation" @change="loadEvaluationData">
            <option value="">Seleccionar evaluación</option>
            <option v-for="evaluation in evaluations" :key="evaluation.id" :value="evaluation.id">
              {{ evaluation.title }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Período:</label>
          <select v-model="selectedPeriod" @change="applyFilters">
            <option value="all">Todo el tiempo</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="quarter">Último trimestre</option>
          </select>
        </div>
      </div>

      <div class="actions">
        <button @click="exportReport" class="export-btn" :disabled="!selectedEvaluation">
          📊 Exportar Reporte
        </button>
        <button @click="refreshData" class="refresh-btn">
          🔄 Actualizar
        </button>
      </div>
    </div>

    <!-- Resumen estadístico -->
    <div v-if="statistics" class="statistics-overview">
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{ statistics.totalResponses }}</h3>
            <p>Respuestas totales</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>{{ statistics.averageScore }}%</h3>
            <p>Promedio general</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <h3>{{ statistics.highestScore }}%</h3>
            <p>Puntuación más alta</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>{{ statistics.passRate }}%</h3>
            <p>Tasa de aprobación</p>
          </div>
        </div>
      </div>

      <!-- Distribución de puntuaciones -->
      <div class="score-distribution">
        <h3>Distribución de Puntuaciones</h3>
        <div class="distribution-chart">
          <div class="distribution-bar">
            <div 
              class="bar excellent" 
              :style="{ width: `${getPercentage(statistics.scoreDistribution.excellent)}%` }"
            >
              <span>Excelente (90-100%): {{ statistics.scoreDistribution.excellent }}</span>
            </div>
          </div>
          <div class="distribution-bar">
            <div 
              class="bar good" 
              :style="{ width: `${getPercentage(statistics.scoreDistribution.good)}%` }"
            >
              <span>Bueno (70-89%): {{ statistics.scoreDistribution.good }}</span>
            </div>
          </div>
          <div class="distribution-bar">
            <div 
              class="bar average" 
              :style="{ width: `${getPercentage(statistics.scoreDistribution.average)}%` }"
            >
              <span>Regular (60-69%): {{ statistics.scoreDistribution.average }}</span>
            </div>
          </div>
          <div class="distribution-bar">
            <div 
              class="bar poor" 
              :style="{ width: `${getPercentage(statistics.scoreDistribution.poor)}%` }"
            >
              <span>Deficiente (&lt;60%): {{ statistics.scoreDistribution.poor }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Análisis detallado de respuestas -->
    <div v-if="selectedEvaluation && responses.length > 0" class="detailed-analysis">
      <h2>Análisis Detallado de Respuestas</h2>
      
      <!-- Análisis por pregunta -->
      <div class="question-analysis">
        <h3>Análisis por Pregunta</h3>
        <div 
          v-for="(question, index) in evaluationData.questions" 
          :key="index"
          class="question-stats"
        >
          <div class="question-header">
            <h4>Pregunta {{ index + 1 }}: {{ question.question }}</h4>
            <div class="question-meta">
              <span class="difficulty" :class="getQuestionDifficulty(index)">
                {{ getQuestionDifficultyText(index) }}
              </span>
              <span class="correct-rate">
                {{ getCorrectRate(index) }}% correctas
              </span>
            </div>
          </div>
          
          <!-- Opciones de respuesta con estadísticas -->
          <div v-if="question.type === 'multiple-choice'" class="options-stats">
            <div 
              v-for="(option, optionIndex) in question.options" 
              :key="optionIndex"
              class="option-stat"
              :class="{ 'correct-option': optionIndex === question.correctAnswer }"
            >
              <div class="option-text">{{ option }}</div>
              <div class="option-bar">
                <div 
                  class="bar-fill" 
                  :style="{ width: `${getOptionPercentage(index, optionIndex)}%` }"
                ></div>
                <span class="percentage">{{ getOptionPercentage(index, optionIndex) }}%</span>
              </div>
            </div>
          </div>

          <!-- Análisis de preguntas abiertas -->
          <div v-else-if="question.type === 'open-text'" class="open-text-analysis">
            <p><strong>Tipo:</strong> Pregunta abierta (requiere calificación manual)</p>
            <div class="pending-grades">
              <span>Respuestas pendientes de calificar: {{ getPendingGrades(index) }}</span>
              <button @click="viewOpenResponses(index)" class="view-responses-btn">
                Ver respuestas
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de estudiantes y sus puntuaciones -->
      <div class="students-performance">
        <h3>Rendimiento por Estudiante</h3>
        <div class="performance-table">
          <table>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Puntuación</th>
                <th>Porcentaje</th>
                <th>Tiempo utilizado</th>
                <th>Fecha de envío</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="response in sortedResponses" :key="response.id" class="student-row">
                <td class="student-name">
                  <div class="student-info">
                    <span class="name">{{ getUserName(response.userId) }}</span>
                    <span class="email">{{ getUserEmail(response.userId) }}</span>
                  </div>
                </td>
                <td class="score">
                  <span class="score-value">{{ response.score || 0 }}</span>
                  <span class="max-score">/ {{ response.maxScore || 0 }}</span>
                </td>
                <td class="percentage">
                  <div class="percentage-bar" :class="getScoreClass(response.percentage)">
                    <span>{{ response.percentage || 0 }}%</span>
                  </div>
                </td>
                <td class="time-spent">{{ formatTime(response.timeSpent) }}</td>
                <td class="submission-date">{{ formatDate(response.submittedAt) }}</td>
                <td class="status">
                  <span class="status-badge" :class="response.status || 'completed'">
                    {{ getStatusText(response.status) }}
                  </span>
                </td>
                <td class="actions">
                  <button @click="viewResponse(response)" class="action-btn view-btn">
                    👁️ Ver
                  </button>
                  <button 
                    v-if="hasOpenQuestions" 
                    @click="gradeResponse(response)" 
                    class="action-btn grade-btn"
                  >
                    📝 Calificar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else-if="selectedEvaluation && responses.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>No hay respuestas aún</h3>
      <p>Esta evaluación no ha sido respondida por ningún estudiante.</p>
    </div>

    <!-- Modal para ver respuesta individual -->
    <div v-if="selectedResponse" class="modal-overlay" @click="closeModal">
      <div class="response-modal" @click.stop>
        <div class="modal-header">
          <h3>Respuesta de {{ getUserName(selectedResponse.userId) }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        <div class="modal-content">
          <!-- Contenido de la respuesta -->
          <div class="response-details">
            <div class="response-meta">
              <p><strong>Puntuación:</strong> {{ selectedResponse.score }} / {{ selectedResponse.maxScore }} ({{ selectedResponse.percentage }}%)</p>
              <p><strong>Tiempo utilizado:</strong> {{ formatTime(selectedResponse.timeSpent) }}</p>
              <p><strong>Fecha de envío:</strong> {{ formatDate(selectedResponse.submittedAt) }}</p>
            </div>
            
            <!-- Respuestas por pregunta -->
            <div class="question-responses">
              <div 
                v-for="(question, index) in evaluationData.questions" 
                :key="index"
                class="question-response"
              >
                <h4>Pregunta {{ index + 1 }}</h4>
                <p class="question-text">{{ question.question }}</p>
                <div class="user-answer">
                  <strong>Respuesta del estudiante:</strong>
                  <p>{{ formatUserAnswer(question, selectedResponse.answers[index]) }}</p>
                </div>
                <div v-if="question.correctAnswer !== undefined" class="correct-answer">
                  <strong>Respuesta correcta:</strong>
                  <p>{{ formatCorrectAnswer(question) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Cargando datos...</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'EvaluationReports',
  setup() {
    const store = useStore()

    // Estado reactivo
    const courses = ref([])
    const evaluations = ref([])
    const responses = ref([])
    const statistics = ref(null)
    const evaluationData = ref({})
    const selectedCourse = ref('')
    const selectedEvaluation = ref('')
    const selectedPeriod = ref('all')
    const selectedResponse = ref(null)
    const loading = ref(false)
    const users = ref({}) // Cache de usuarios

    // Computed properties
    const sortedResponses = computed(() => {
      return [...responses.value].sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
    })

    const hasOpenQuestions = computed(() => {
      return evaluationData.value.questions?.some(q => q.type === 'open-text') || false
    })

    // Métodos
    const loadCourses = async () => {
      try {
        const response = await fetch('/api/courses', {
          headers: {
            'Authorization': `Bearer ${store.getters.authToken}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          courses.value = data.courses || []
        }
      } catch (error) {
        console.error('Error cargando cursos:', error)
      }
    }

    const loadEvaluations = async () => {
      if (!selectedCourse.value) {
        evaluations.value = []
        return
      }

      try {
        const response = await fetch(`/api/evaluations/course/${selectedCourse.value}`, {
          headers: {
            'Authorization': `Bearer ${store.getters.authToken}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          evaluations.value = data || []
        }
      } catch (error) {
        console.error('Error cargando evaluaciones:', error)
      }
    }

    const loadEvaluationData = async () => {
      if (!selectedEvaluation.value) {
        responses.value = []
        statistics.value = null
        return
      }

      loading.value = true

      try {
        // Cargar datos de la evaluación
        const evalResponse = await fetch(`/api/evaluations/${selectedEvaluation.value}`, {
          headers: {
            'Authorization': `Bearer ${store.getters.authToken}`
          }
        })
        
        if (evalResponse.ok) {
          evaluationData.value = await evalResponse.json()
        }

        // Cargar respuestas y estadísticas
        const responsesResponse = await fetch(`/api/responses/evaluation/${selectedEvaluation.value}`, {
          headers: {
            'Authorization': `Bearer ${store.getters.authToken}`
          }
        })
        
        if (responsesResponse.ok) {
          const data = await responsesResponse.json()
          responses.value = data.responses || []
          statistics.value = data.statistics || null
          
          // Cargar información de usuarios
          await loadUsersInfo()
        }
      } catch (error) {
        console.error('Error cargando datos de evaluación:', error)
      } finally {
        loading.value = false
      }
    }

    const loadUsersInfo = async () => {
      const userIds = [...new Set(responses.value.map(r => r.userId))]
      
      for (const userId of userIds) {
        if (!users.value[userId]) {
          try {
            const response = await fetch(`/api/users/${userId}`, {
              headers: {
                'Authorization': `Bearer ${store.getters.authToken}`
              }
            })
            
            if (response.ok) {
              const userData = await response.json()
              users.value[userId] = userData
            }
          } catch (error) {
            console.error(`Error cargando usuario ${userId}:`, error)
          }
        }
      }
    }

    const getPercentage = (value) => {
      if (!statistics.value || statistics.value.totalResponses === 0) return 0
      return Math.round((value / statistics.value.totalResponses) * 100)
    }

    const getCorrectRate = (questionIndex) => {
      if (!responses.value.length) return 0
      
      let correctCount = 0
      responses.value.forEach(response => {
        if (response.detailedResults && response.detailedResults[questionIndex]?.correct) {
          correctCount++
        }
      })
      
      return Math.round((correctCount / responses.value.length) * 100)
    }

    const getQuestionDifficulty = (questionIndex) => {
      const correctRate = getCorrectRate(questionIndex)
      if (correctRate >= 80) return 'easy'
      if (correctRate >= 60) return 'medium'
      return 'hard'
    }

    const getQuestionDifficultyText = (questionIndex) => {
      const difficulty = getQuestionDifficulty(questionIndex)
      const texts = {
        easy: 'Fácil',
        medium: 'Medio',
        hard: 'Difícil'
      }
      return texts[difficulty]
    }

    const getOptionPercentage = (questionIndex, optionIndex) => {
      if (!responses.value.length) return 0
      
      let optionCount = 0
      responses.value.forEach(response => {
        if (response.answers[questionIndex] === optionIndex) {
          optionCount++
        }
      })
      
      return Math.round((optionCount / responses.value.length) * 100)
    }

    const getPendingGrades = (questionIndex) => {
      return responses.value.filter(response => 
        !response.manualGrades || response.manualGrades[questionIndex] === undefined
      ).length
    }

    const getUserName = (userId) => {
      return users.value[userId]?.displayName || users.value[userId]?.email || 'Usuario desconocido'
    }

    const getUserEmail = (userId) => {
      return users.value[userId]?.email || ''
    }

    const getScoreClass = (percentage) => {
      if (percentage >= 80) return 'excellent'
      if (percentage >= 60) return 'good'
      if (percentage >= 40) return 'average'
      return 'poor'
    }

    const getStatusText = (status) => {
      const statusTexts = {
        completed: 'Completado',
        graded: 'Calificado',
        pending: 'Pendiente'
      }
      return statusTexts[status] || 'Completado'
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
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatUserAnswer = (question, answer) => {
      if (answer === undefined || answer === null) return 'Sin responder'
      
      if (question.type === 'multiple-choice') {
        return question.options[answer] || 'Respuesta inválida'
      } else if (question.type === 'true-false') {
        return answer ? 'Verdadero' : 'Falso'
      } else if (question.type === 'multiple-select') {
        return Array.isArray(answer) 
          ? answer.map(idx => question.options[idx]).join(', ')
          : 'Respuesta inválida'
      }
      
      return answer
    }

    const formatCorrectAnswer = (question) => {
      if (question.type === 'multiple-choice') {
        return question.options[question.correctAnswer]
      } else if (question.type === 'true-false') {
        return question.correctAnswer ? 'Verdadero' : 'Falso'
      } else if (question.type === 'multiple-select') {
        return question.correctAnswer.map(idx => question.options[idx]).join(', ')
      }
      
      return question.correctAnswer
    }

    const viewResponse = (response) => {
      selectedResponse.value = response
    }

    const closeModal = () => {
      selectedResponse.value = null
    }

    const gradeResponse = (response) => {
      // Implementar navegación a página de calificación
      console.log('Calificar respuesta:', response.id)
    }

    const viewOpenResponses = (questionIndex) => {
      // Implementar vista de respuestas abiertas
      console.log('Ver respuestas abiertas para pregunta:', questionIndex)
    }

    const exportReport = () => {
      // Implementar exportación de reporte
      const reportData = {
        evaluation: evaluationData.value,
        statistics: statistics.value,
        responses: responses.value,
        exportDate: new Date().toISOString()
      }
      
      const dataStr = JSON.stringify(reportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reporte-${evaluationData.value.title}-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      URL.revokeObjectURL(url)
    }

    const refreshData = () => {
      loadEvaluationData()
    }

    const applyFilters = () => {
      // Implementar filtros por período
      loadEvaluationData()
    }

    // Lifecycle
    onMounted(() => {
      loadCourses()
    })

    return {
      courses,
      evaluations,
      responses,
      statistics,
      evaluationData,
      selectedCourse,
      selectedEvaluation,
      selectedPeriod,
      selectedResponse,
      loading,
      sortedResponses,
      hasOpenQuestions,
      loadEvaluations,
      loadEvaluationData,
      getPercentage,
      getCorrectRate,
      getQuestionDifficulty,
      getQuestionDifficultyText,
      getOptionPercentage,
      getPendingGrades,
      getUserName,
      getUserEmail,
      getScoreClass,
      getStatusText,
      formatTime,
      formatDate,
      formatUserAnswer,
      formatCorrectAnswer,
      viewResponse,
      closeModal,
      gradeResponse,
      viewOpenResponses,
      exportReport,
      refreshData,
      applyFilters
    }
  }
}
</script>

<style scoped>
.evaluation-reports {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.reports-header {
  margin-bottom: 30px;
}

.reports-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.reports-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.controls-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.filters {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-weight: 500;
  color: #34495e;
  font-size: 14px;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-width: 150px;
}

.actions {
  display: flex;
  gap: 10px;
}

.export-btn, .refresh-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.export-btn {
  background: #27ae60;
  color: white;
}

.export-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.refresh-btn {
  background: #3498db;
  color: white;
}

.statistics-overview {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 32px;
  background: white;
  padding: 10px;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content h3 {
  margin: 0;
  font-size: 24px;
  color: #2c3e50;
}

.stat-content p {
  margin: 5px 0 0 0;
  color: #7f8c8d;
  font-size: 14px;
}

.score-distribution h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.distribution-chart {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.distribution-bar {
  background: #ecf0f1;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  height: 40px;
}

.bar {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 15px;
  color: white;
  font-weight: 500;
  transition: width 0.3s ease;
}

.bar.excellent { background: #27ae60; }
.bar.good { background: #3498db; }
.bar.average { background: #f39c12; }
.bar.poor { background: #e74c3c; }

.detailed-analysis {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.detailed-analysis h2 {
  color: #2c3e50;
  margin-bottom: 30px;
}

.question-analysis h3 {
  color: #34495e;
  margin-bottom: 20px;
}

.question-stats {
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

.question-header h4 {
  margin: 0;
  color: #2c3e50;
}

.question-meta {
  display: flex;
  gap: 15px;
  align-items: center;
}

.difficulty {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.difficulty.easy { background: #d5f4e6; color: #27ae60; }
.difficulty.medium { background: #fff3cd; color: #f39c12; }
.difficulty.hard { background: #fadbd8; color: #e74c3c; }

.correct-rate {
  color: #7f8c8d;
  font-size: 14px;
}

.options-stats {
  padding: 20px;
}

.option-stat {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 6px;
}

.option-stat.correct-option {
  background: #d5f4e6;
}

.option-text {
  flex: 1;
  color: #2c3e50;
}

.option-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 150px;
}

.bar-fill {
  height: 20px;
  background: #3498db;
  border-radius: 3px;
  min-width: 2px;
}

.percentage {
  font-size: 14px;
  color: #7f8c8d;
  min-width: 40px;
}

.open-text-analysis {
  padding: 20px;
}

.pending-grades {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding: 10px;
  background: #fff3cd;
  border-radius: 6px;
}

.view-responses-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.students-performance h3 {
  color: #34495e;
  margin-bottom: 20px;
}

.performance-table {
  overflow-x: auto;
}

.performance-table table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.performance-table th,
.performance-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.performance-table th {
  background: #f8f9fa;
  font-weight: 500;
  color: #2c3e50;
}

.student-row:hover {
  background: #f8f9fa;
}

.student-info .name {
  display: block;
  font-weight: 500;
  color: #2c3e50;
}

.student-info .email {
  display: block;
  font-size: 12px;
  color: #7f8c8d;
}

.score {
  font-weight: 500;
}

.max-score {
  color: #7f8c8d;
}

.percentage-bar {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  text-align: center;
}

.percentage-bar.excellent { background: #d5f4e6; color: #27ae60; }
.percentage-bar.good { background: #e3f2fd; color: #3498db; }
.percentage-bar.average { background: #fff3cd; color: #f39c12; }
.percentage-bar.poor { background: #fadbd8; color: #e74c3c; }

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.completed { background: #d5f4e6; color: #27ae60; }
.status-badge.graded { background: #e3f2fd; color: #3498db; }
.status-badge.pending { background: #fff3cd; color: #f39c12; }

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;
}

.view-btn {
  background: #3498db;
  color: white;
}

.grade-btn {
  background: #f39c12;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.response-modal {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #ecf0f1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
}

.modal-content {
  padding: 20px;
}

.response-meta {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.question-response {
  border-bottom: 1px solid #ecf0f1;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.question-response h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.question-text {
  color: #7f8c8d;
  margin-bottom: 15px;
  font-style: italic;
}

.user-answer,
.correct-answer {
  margin-bottom: 10px;
}

.user-answer p,
.correct-answer p {
  margin: 5px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
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
  .evaluation-reports {
    padding: 10px;
  }
  
  .controls-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .stat-cards {
    grid-template-columns: 1fr;
  }
  
  .question-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .option-stat {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .pending-grades {
    flex-direction: column;
    gap: 10px;
  }
  
  .performance-table {
    font-size: 14px;
  }
  
  .response-modal {
    width: 95%;
    margin: 10px;
  }
}
</style>
