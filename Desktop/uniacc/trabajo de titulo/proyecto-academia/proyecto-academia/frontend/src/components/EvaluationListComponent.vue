<template>
  <div class="evaluation-list-component" aria-labelledby="page-title">
    <div class="container">
      <h1 id="page-title">Lista de Evaluaciones</h1>

      <!-- Mensaje de error -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Mensaje cuando no hay evaluaciones -->
      <div v-if="!isLoading && !evaluations.length && !error" class="no-evaluations" role="alert">
        No hay evaluaciones disponibles para este curso.
      </div>

      <!-- Indicador de carga -->
      <div v-if="isLoading" class="loading-message">
        Cargando evaluaciones...
      </div>

      <!-- Lista de Evaluaciones -->
      <div v-else class="evaluation-list" role="list">
        <div
          v-for="evaluation in evaluations"
          :key="evaluation.id"
          class="evaluation-card"
          tabindex="0"
          role="listitem"
        >
          <h2>{{ evaluation.title }}</h2>
          <p>{{ evaluation.description }}</p>
          <p><strong>Preguntas:</strong> {{ evaluation.questions.length }}</p>
          <button
            class="btn btn-primary"
            @click="viewEvaluation(evaluation.id)"
            aria-label="Ver detalles de la evaluación {{ evaluation.title }}"
          >
            Ver Detalles
          </button>
          <button
            v-if="isTeacherOrAdmin"
            class="btn btn-secondary"
            @click="editEvaluation(evaluation.id)"
            aria-label="Editar la evaluación {{ evaluation.title }}"
          >
            Editar
          </button>
          <button
            v-if="isTeacherOrAdmin"
            class="btn btn-danger"
            @click="deleteEvaluation(evaluation.id)"
            aria-label="Eliminar la evaluación {{ evaluation.title }}"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { getAuthToken } from "@/utils/auth";
import { focusFirstInteractiveElement } from "@/utils/accessibility";

export default {
  name: "EvaluationListComponent",
  props: {
    courseId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      evaluations: [], // Lista de evaluaciones
      isLoading: true, // Indicador de carga
      error: null, // Mensaje de error
    };
  },
  computed: {
    isTeacherOrAdmin() {
      return (
        this.$store.getters.userRole === "teacher" ||
        this.$store.getters.userRole === "admin"
      );
    },
  },
  async created() {
    try {
      await this.loadEvaluations();
    } catch (error) {
      console.error("Error al cargar evaluaciones:", error);
      this.error = "No se pudieron cargar las evaluaciones del curso.";
    } finally {
      this.isLoading = false;
    }
  },
  mounted() {
    const container = this.$el.querySelector(".container");
    focusFirstInteractiveElement(container);
  },
  methods: {
    async loadEvaluations() {
      this.error = null; // Reiniciar errores
      try {
        const response = await axios.get(
          `/api/evaluations/course/${this.courseId}`,
          {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          }
        );
        this.evaluations = response.data.data || [];
      } catch (error) {
        console.error("Error al cargar evaluaciones:", error.response?.data || error.message);
        this.error = "No se pudieron cargar las evaluaciones del curso.";
      }
    },

    viewEvaluation(evaluationId) {
      this.$router.push(`/evaluations/${evaluationId}`);
    },

    editEvaluation(evaluationId) {
      this.$router.push(`/evaluations/edit/${evaluationId}`);
    },

    async deleteEvaluation(evaluationId) {
      if (confirm("¿Estás seguro de que deseas eliminar esta evaluación?")) {
        try {
          await axios.delete(`/api/evaluations/${evaluationId}`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          });
          this.evaluations = this.evaluations.filter(
            (evaluation) => evaluation.id !== evaluationId
          );
          alert("Evaluación eliminada exitosamente.");
        } catch (error) {
          console.error("Error al eliminar la evaluación:", error.response?.data || error.message);
          this.error = "No se pudo eliminar la evaluación.";
        }
      }
    },
  },
};
</script>

<style scoped>
.evaluation-list-component {
  background-color: #f9f9f9;
  min-height: 100vh;
  padding: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.no-evaluations {
  text-align: center;
  font-size: 18px;
  color: #999;
  margin-top: 2rem;
}

.evaluation-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.evaluation-card {
  background-color: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.evaluation-card:focus {
  outline: 2px solid #2e8b57;
  outline-offset: 4px;
}

.evaluation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.loading-message,
.error-message {
  text-align: center;
  font-size: 16px;
  color: #666;
  margin-top: 20px;
}

.error-message {
  color: #dc3545;
}
</style>
