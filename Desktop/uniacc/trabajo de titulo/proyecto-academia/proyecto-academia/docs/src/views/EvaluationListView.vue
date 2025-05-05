<template>
  <div class="evaluation-list-view">
    <div class="container">
      <h1 class="title" aria-label="Lista de Evaluaciones">Lista de Evaluaciones</h1>

      <!-- Mensaje de error -->
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
      </div>

      <!-- Selector de curso -->
      <div class="course-selector" v-if="!error">
        <label for="course-select" aria-label="Selecciona un curso para ver sus evaluaciones">
          Selecciona un curso:
        </label>
        <select id="course-select" v-model="selectedCourseId" @change="loadEvaluations">
          <option value="" disabled>Selecciona un curso</option>
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.title }}
          </option>
        </select>
      </div>

      <!-- Indicador de carga -->
      <div v-if="isLoading" class="loading-message">
        <p>Cargando evaluaciones...</p>
      </div>

      <!-- Lista de evaluaciones -->
      <div v-else-if="evaluations.length" class="evaluation-list">
        <ul>
          <li v-for="evaluation in evaluations" :key="evaluation.id" class="evaluation-item">
            <div>
              <h3>{{ evaluation.title }}</h3>
              <p>{{ evaluation.description }}</p>
            </div>
            <div class="actions">
              <button
                class="btn btn-primary"
                @click="viewEvaluation(evaluation.id)"
                aria-label="Ver evaluación {{ evaluation.title }}"
              >
                Ver
              </button>
              <button
                v-if="isTeacherOrAdmin"
                class="btn btn-secondary"
                @click="editEvaluation(evaluation.id)"
                aria-label="Editar evaluación {{ evaluation.title }}"
              >
                Editar
              </button>
              <button
                v-if="isTeacherOrAdmin"
                class="btn btn-danger"
                @click="deleteEvaluation(evaluation.id)"
                aria-label="Eliminar evaluación {{ evaluation.title }}"
              >
                Eliminar
              </button>
            </div>
          </li>
        </ul>
      </div>

      <!-- Mensaje cuando no hay evaluaciones -->
      <div v-else class="no-evaluations">
        <p>No hay evaluaciones disponibles para este curso.</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "EvaluationListView",
  data() {
    return {
      courses: [], // Cursos disponibles
      evaluations: [], // Evaluaciones del curso seleccionado
      selectedCourseId: null, // ID del curso seleccionado
      userRole: "", // Rol del usuario
      isLoading: false, // Indicador de carga
      error: null, // Mensaje de error
    };
  },
  computed: {
    isTeacherOrAdmin() {
      return ["teacher", "admin"].includes(this.userRole);
    },
  },
  async created() {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        this.userRole = payload.role || "";
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }

    // Cargar cursos
    await this.loadCourses();
  },
  methods: {
    async loadCourses() {
      this.isLoading = true;
      this.error = null; // Reiniciar error
      try {
        const response = await axios.get("/api/courses", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.courses = response.data || [];
      } catch (error) {
        this.handleError("Error al cargar los cursos.", error);
      } finally {
        this.isLoading = false;
      }
    },
    async loadEvaluations() {
      if (!this.selectedCourseId) return;

      this.isLoading = true;
      this.error = null; // Reiniciar error
      try {
        const response = await axios.get(`/api/evaluations/course/${this.selectedCourseId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.evaluations = response.data.data || [];
      } catch (error) {
        this.handleError("Error al cargar las evaluaciones.", error);
      } finally {
        this.isLoading = false;
      }
    },
    viewEvaluation(evaluationId) {
      this.$router.push(`/evaluations/${evaluationId}`);
    },
    editEvaluation(evaluationId) {
      this.$router.push(`/evaluations/edit/${evaluationId}`);
    },
    async deleteEvaluation(evaluationId) {
      if (confirm("¿Deseas eliminar esta evaluación?")) {
        try {
          await axios.delete(`/api/evaluations/${evaluationId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          alert("Evaluación eliminada.");
          this.loadEvaluations();
        } catch (error) {
          this.handleError("Error al eliminar la evaluación.", error);
        }
      }
    },
    handleError(message, error) {
      console.error(message, error.response?.data || error.message);
      this.error = message;
    },
  },
};
</script>

<style scoped>
.evaluation-list-view {
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

.title {
  font-family: "Playfair Display", serif;
  font-size: 28px;
  color: #2A3B5F;
  text-align: center;
  margin-bottom: 15px;
}

.course-selector {
  margin-bottom: 20px;
}

.evaluation-list ul {
  list-style-type: none;
  padding: 0;
}

.evaluation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.actions {
  display: flex;
  gap: 10px;
}

.no-evaluations,
.loading-message,
.error-message {
  text-align: center;
  font-family: "Roboto", sans-serif;
  font-size: 16px;
  color: #999999;
  margin-top: 20px;
}

.loading-message {
  color: #666666;
}

.error-message {
  color: #dc3545;
}
</style>
