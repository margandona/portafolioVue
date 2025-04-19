<template>
  <div class="results-view">
    <div class="container">
      <h1 class="results-title">Resultados de la Evaluación</h1>

      <!-- Mostrar resultados si están disponibles -->
      <div v-if="result">
        <p class="results-summary">
          <strong>Evaluación:</strong> {{ result.evaluation_title }}
        </p>
        <p class="results-summary">
          <strong>Puntaje Obtenido:</strong> {{ result.score }}/{{ result.total }}
        </p>

        <!-- Barra de progreso -->
        <div class="progress-bar">
          <div
            class="progress-bar-fill"
            :style="{ width: `${result.percentage}%` }"
          ></div>
        </div>

        <!-- Lista de preguntas y respuestas -->
        <h2>Preguntas y Respuestas:</h2>
        <ul class="results-list">
          <li v-for="(question, index) in result.questions" :key="index">
            <p class="question">
              <strong>Pregunta {{ index + 1 }}:</strong> {{ question.text }}
            </p>
            <p
              :class="{
                correct: question.isCorrect,
                incorrect: !question.isCorrect,
              }"
            >
              <strong>Tu Respuesta:</strong> {{ question.userAnswer }}
            </p>
            <p>
              <strong>Respuesta Correcta:</strong> {{ question.correctAnswer }}
            </p>
          </li>
        </ul>
      </div>

      <!-- Mensaje cuando no hay resultados -->
      <div v-else>
        <p>No se encontraron resultados para esta evaluación.</p>
      </div>

      <!-- Botón para volver al dashboard -->
      <button class="btn btn-secondary" @click="goToDashboard">
        Volver al Dashboard
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ResultsView",
  data() {
    return {
      result: null, // Detalles del resultado de la evaluación
      userRole: "", // Rol del usuario
    };
  },
  async created() {
    const evaluationId = this.$route.query.evaluation_id;

    // Obtener rol desde el token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        this.userRole = payload.role || "";
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }

    // Validar acceso basado en rol
    if (this.userRole !== "student") {
      alert("Solo los estudiantes pueden acceder a los resultados.");
      this.$router.push("/dashboard");
      return;
    }

    // Cargar resultados de la evaluación
    try {
      const response = await axios.get(
        `http://localhost:3000/api/responses/results/${evaluationId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      this.result = response.data;
    } catch (error) {
      console.error(
        "Error al cargar los resultados:",
        error.response?.data || error.message
      );
      alert("No se pudo cargar los resultados de la evaluación.");
      this.$router.push("/dashboard");
    }
  },
  methods: {
    goToDashboard() {
      this.$router.push("/dashboard");
    },
  },
};
</script>

<style scoped>
.results-view {
  padding: 20px;
  background-color: #f9f9f9;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: auto;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.results-title {
  font-family: "Playfair Display", serif;
  font-size: 28px;
  color: #2A3B5F;
  text-align: center;
  margin-bottom: 15px;
}

.results-summary {
  font-family: "Roboto", sans-serif;
  font-size: 18px;
  color: #333333;
  margin-bottom: 10px;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #e9ecef;
  border-radius: 10px;
  margin: 20px 0;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #2E8B57;
  transition: width 0.3s ease-in-out;
}

.results-list {
  list-style: none;
  padding: 0;
  font-family: "Roboto", sans-serif;
  font-size: 16px;
  color: #6c757d;
}

.question {
  font-weight: bold;
  margin-top: 10px;
}

.correct {
  color: #2E8B57;
}

.incorrect {
  color: #dc3545;
}

.btn {
  font-family: "Roboto", sans-serif;
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.btn-secondary {
  background-color: #2A3B5F;
  color: #fff;
  border: none;
}

.btn-secondary:hover {
  background-color: #3C4E72;
}
</style>
