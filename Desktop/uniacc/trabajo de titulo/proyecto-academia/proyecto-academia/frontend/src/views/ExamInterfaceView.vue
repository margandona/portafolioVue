<template>
  <div class="exam-interface">
    <!-- Header del examen -->
    <div class="exam-header">
      <div class="exam-info">
        <h1 class="exam-title">{{ evaluation.title }}</h1>
        <p class="exam-description">{{ evaluation.description }}</p>
        <div class="exam-meta">
          <span class="question-counter">
            Pregunta {{ currentQuestionIndex + 1 }} de {{ evaluation.questions.length }}
          </span>
          <span class="timer" v-if="timeRemaining > 0" :class="{ 'warning': timeRemaining < 300 }">
            ⏱️ {{ formatTime(timeRemaining) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Progreso del examen -->
    <div class="progress-container">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${(currentQuestionIndex / evaluation.questions.length) * 100}%` }"
        ></div>
      </div>
      <div class="progress-dots">
        <span
          v-for="(question, index) in evaluation.questions"
          :key="index"
          class="progress-dot"
          :class="{
            'current': index === currentQuestionIndex,
            'answered': userAnswers[index] !== undefined,
            'flagged': flaggedQuestions[index]
          }"
          @click="goToQuestion(index)"
        >
          {{ index + 1 }}
        </span>
      </div>
    </div>

    <!-- Pregunta actual -->
    <div class="question-container" v-if="currentQuestion">
      <div class="question-header">
        <h2 class="question-title">{{ currentQuestion.question }}</h2>
        <button 
          class="flag-button"
          @click="toggleFlag(currentQuestionIndex)"
          :class="{ 'flagged': flaggedQuestions[currentQuestionIndex] }"
        >
          🚩 {{ flaggedQuestions[currentQuestionIndex] ? 'Marcada' : 'Marcar' }}
        </button>
      </div>

      <!-- Imagen de la pregunta (si existe) -->
      <div v-if="currentQuestion.image" class="question-image">
        <img :src="currentQuestion.image" :alt="currentQuestion.question" />
      </div>

      <!-- Opciones de respuesta -->
      <div class="answers-container">
        <!-- Opción múltiple -->
        <div v-if="currentQuestion.type === 'multiple-choice'" class="multiple-choice">
          <div
            v-for="(option, optionIndex) in currentQuestion.options"
            :key="optionIndex"
            class="option"
            :class="{ 'selected': userAnswers[currentQuestionIndex] === optionIndex }"
            @click="selectAnswer(optionIndex)"
          >
            <input
              type="radio"
              :name="`question-${currentQuestionIndex}`"
              :value="optionIndex"
              v-model="userAnswers[currentQuestionIndex]"
            />
            <label>{{ option }}</label>
          </div>
        </div>

        <!-- Múltiple selección -->
        <div v-else-if="currentQuestion.type === 'multiple-select'" class="multiple-select">
          <div
            v-for="(option, optionIndex) in currentQuestion.options"
            :key="optionIndex"
            class="option"
          >
            <input
              type="checkbox"
              :value="optionIndex"
              v-model="userAnswers[currentQuestionIndex]"
            />
            <label>{{ option }}</label>
          </div>
        </div>

        <!-- Verdadero/Falso -->
        <div v-else-if="currentQuestion.type === 'true-false'" class="true-false">
          <div class="option" :class="{ 'selected': userAnswers[currentQuestionIndex] === true }">
            <input
              type="radio"
              :name="`question-${currentQuestionIndex}`"
              :value="true"
              v-model="userAnswers[currentQuestionIndex]"
            />
            <label>✅ Verdadero</label>
          </div>
          <div class="option" :class="{ 'selected': userAnswers[currentQuestionIndex] === false }">
            <input
              type="radio"
              :name="`question-${currentQuestionIndex}`"
              :value="false"
              v-model="userAnswers[currentQuestionIndex]"
            />
            <label>❌ Falso</label>
          </div>
        </div>

        <!-- Respuesta abierta -->
        <div v-else-if="currentQuestion.type === 'open-text'" class="open-text">
          <textarea
            v-model="userAnswers[currentQuestionIndex]"
            :placeholder="currentQuestion.placeholder || 'Escribe tu respuesta aquí...'"
            rows="5"
            class="text-answer"
          ></textarea>
          <div class="character-count">
            {{ (userAnswers[currentQuestionIndex] || '').length }} caracteres
          </div>
        </div>
      </div>

      <!-- Explicación/Pista (si está disponible) -->
      <div v-if="currentQuestion.hint && showHint" class="question-hint">
        <p><strong>💡 Pista:</strong> {{ currentQuestion.hint }}</p>
      </div>
      <button v-if="currentQuestion.hint && !showHint" @click="showHint = true" class="hint-button">
        💡 Ver pista
      </button>
    </div>

    <!-- Navegación -->
    <div class="navigation-container">
      <div class="nav-buttons">
        <button
          @click="previousQuestion"
          :disabled="currentQuestionIndex === 0"
          class="nav-button prev-button"
        >
          ← Anterior
        </button>

        <button
          @click="nextQuestion"
          :disabled="currentQuestionIndex === evaluation.questions.length - 1"
          class="nav-button next-button"
        >
          Siguiente →
        </button>
      </div>

      <!-- Resumen y finalización -->
      <div class="exam-summary" v-if="currentQuestionIndex === evaluation.questions.length - 1">
        <div class="summary-stats">
          <p><strong>Preguntas respondidas:</strong> {{ answeredCount }} / {{ evaluation.questions.length }}</p>
          <p><strong>Preguntas marcadas:</strong> {{ flaggedCount }}</p>
        </div>
        
        <button
          @click="showSubmitModal = true"
          class="submit-button"
          :class="{ 'incomplete': answeredCount < evaluation.questions.length }"
        >
          {{ answeredCount === evaluation.questions.length ? '✅ Finalizar Examen' : '⚠️ Finalizar (Incompleto)' }}
        </button>
      </div>
    </div>

    <!-- Modal de confirmación de envío -->
    <div v-if="showSubmitModal" class="modal-overlay" @click="showSubmitModal = false">
      <div class="submit-modal" @click.stop>
        <h3>Confirmar envío del examen</h3>
        <div class="submit-summary">
          <p><strong>{{ evaluation.title }}</strong></p>
          <p>Preguntas respondidas: {{ answeredCount }} / {{ evaluation.questions.length }}</p>
          <p v-if="flaggedCount > 0">Preguntas marcadas para revisar: {{ flaggedCount }}</p>
          <p v-if="answeredCount < evaluation.questions.length" class="warning">
            ⚠️ Tienes {{ evaluation.questions.length - answeredCount }} preguntas sin responder
          </p>
        </div>
        <div class="modal-buttons">
          <button @click="showSubmitModal = false" class="cancel-button">
            Cancelar
          </button>
          <button @click="submitExam" class="confirm-submit-button" :disabled="submitting">
            {{ submitting ? 'Enviando...' : 'Confirmar envío' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Cargando examen...</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'ExamInterface',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    // Estado reactivo
    const evaluation = ref({})
    const currentQuestionIndex = ref(0)
    const userAnswers = ref({})
    const flaggedQuestions = ref({})
    const showSubmitModal = ref(false)
    const showHint = ref(false)
    const loading = ref(true)
    const submitting = ref(false)
    const timeRemaining = ref(0)
    const timer = ref(null)

    // Computed properties
    const currentQuestion = computed(() => {
      return evaluation.value.questions?.[currentQuestionIndex.value]
    })

    const answeredCount = computed(() => {
      return Object.keys(userAnswers.value).length
    })

    const flaggedCount = computed(() => {
      return Object.values(flaggedQuestions.value).filter(Boolean).length
    })

    // Métodos
    const loadEvaluation = async () => {
      try {
        const evaluationId = route.params.id
        const response = await fetch(`/api/evaluations/${evaluationId}`, {
          headers: {
            'Authorization': `Bearer ${store.getters.authToken}`
          }
        })

        if (!response.ok) throw new Error('Error cargando evaluación')

        const data = await response.json()
        evaluation.value = data

        // Configurar timer si hay límite de tiempo
        if (data.timeLimit) {
          timeRemaining.value = data.timeLimit * 60 // Convertir minutos a segundos
          startTimer()
        }
      } catch (error) {
        console.error('Error:', error)
        // Mostrar mensaje de error
      } finally {
        loading.value = false
      }
    }

    const startTimer = () => {
      timer.value = setInterval(() => {
        timeRemaining.value--
        if (timeRemaining.value <= 0) {
          // Auto-enviar el examen cuando se acabe el tiempo
          submitExam()
        }
      }, 1000)
    }

    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    const selectAnswer = (optionIndex) => {
      userAnswers.value[currentQuestionIndex.value] = optionIndex
    }

    const toggleFlag = (questionIndex) => {
      flaggedQuestions.value[questionIndex] = !flaggedQuestions.value[questionIndex]
    }

    const goToQuestion = (index) => {
      currentQuestionIndex.value = index
      showHint.value = false
    }

    const nextQuestion = () => {
      if (currentQuestionIndex.value < evaluation.value.questions.length - 1) {
        currentQuestionIndex.value++
        showHint.value = false
      }
    }

    const previousQuestion = () => {
      if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--
        showHint.value = false
      }
    }

    const submitExam = async () => {
      submitting.value = true
      
      try {
        const response = await fetch(`/api/responses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${store.getters.authToken}`
          },
          body: JSON.stringify({
            evaluationId: evaluation.value.id,
            answers: userAnswers.value,
            timeSpent: evaluation.value.timeLimit ? (evaluation.value.timeLimit * 60 - timeRemaining.value) : null,
            flaggedQuestions: flaggedQuestions.value
          })
        })

        if (!response.ok) throw new Error('Error enviando respuestas')

        const result = await response.json()
        
        // Redirigir a página de resultados
        router.push({
          name: 'ExamResults',
          params: { responseId: result.id }
        })

      } catch (error) {
        console.error('Error enviando examen:', error)
        // Mostrar mensaje de error
      } finally {
        submitting.value = false
        showSubmitModal.value = false
      }
    }

    // Lifecycle
    onMounted(() => {
      loadEvaluation()
    })

    onUnmounted(() => {
      if (timer.value) {
        clearInterval(timer.value)
      }
    })

    return {
      evaluation,
      currentQuestionIndex,
      currentQuestion,
      userAnswers,
      flaggedQuestions,
      showSubmitModal,
      showHint,
      loading,
      submitting,
      timeRemaining,
      answeredCount,
      flaggedCount,
      loadEvaluation,
      formatTime,
      selectAnswer,
      toggleFlag,
      goToQuestion,
      nextQuestion,
      previousQuestion,
      submitExam
    }
  }
}
</script>

<style scoped>
.exam-interface {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

.exam-header {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.exam-title {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 28px;
}

.exam-description {
  color: #7f8c8d;
  margin-bottom: 15px;
  line-height: 1.6;
}

.exam-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.timer {
  color: #27ae60;
  font-size: 18px;
}

.timer.warning {
  color: #e74c3c;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.progress-container {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.progress-bar {
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  margin-bottom: 15px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-dots {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.progress-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ecf0f1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.progress-dot.current {
  background: #3498db;
  color: white;
  transform: scale(1.1);
}

.progress-dot.answered {
  background: #2ecc71;
  color: white;
}

.progress-dot.flagged {
  background: #f39c12;
  color: white;
}

.question-container {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.question-title {
  color: #2c3e50;
  font-size: 22px;
  line-height: 1.4;
  flex: 1;
  margin-right: 20px;
}

.flag-button {
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.flag-button.flagged {
  background: #f39c12;
  color: white;
  border-color: #f39c12;
}

.question-image {
  margin-bottom: 20px;
  text-align: center;
}

.question-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.answers-container {
  margin-bottom: 20px;
}

.option {
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.option:hover {
  border-color: #3498db;
  background: #e3f2fd;
}

.option.selected {
  border-color: #2ecc71;
  background: #e8f5e8;
}

.option label {
  cursor: pointer;
  flex: 1;
  line-height: 1.4;
}

.text-answer {
  width: 100%;
  padding: 15px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-family: inherit;
  font-size: 16px;
  line-height: 1.5;
  resize: vertical;
}

.character-count {
  text-align: right;
  color: #6c757d;
  font-size: 14px;
  margin-top: 5px;
}

.question-hint {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
}

.hint-button {
  background: #f39c12;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
}

.navigation-container {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.nav-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s ease;
}

.nav-button:hover:not(:disabled) {
  background: #2980b9;
}

.nav-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.exam-summary {
  border-top: 1px solid #dee2e6;
  padding-top: 20px;
}

.summary-stats {
  margin-bottom: 15px;
}

.submit-button {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 500;
  width: 100%;
}

.submit-button.incomplete {
  background: #f39c12;
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

.submit-modal {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
}

.submit-modal h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.submit-summary {
  margin-bottom: 20px;
}

.warning {
  color: #e74c3c;
  font-weight: 500;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.cancel-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.confirm-submit-button {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
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
  .exam-interface {
    padding: 10px;
  }
  
  .exam-header, .question-container, .navigation-container {
    padding: 20px;
  }
  
  .question-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .nav-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .progress-dots {
    justify-content: center;
  }
}
</style>
