<template>
  <div class="course-view">
    <div class="container">
      <h1 class="course-title" aria-labelledby="course-title">Gestión de Evaluaciones</h1>

      <!-- Indicador de carga -->
      <div v-if="isLoading" class="loading-message">
        <p>Cargando datos...</p>
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
      </div>

      <!-- Selección de curso -->
      <div v-if="!isLoading && !error" class="course-selector">
        <label for="course-select" aria-label="Selecciona un curso para ver evaluaciones">
          Selecciona un curso:
        </label>
        <select id="course-select" v-model="selectedCourseId" @change="loadEvaluations">
          <option value="" disabled>Selecciona un curso</option>
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.title }}
          </option>
        </select>
      </div>

      <!-- Lista de Evaluaciones -->
      <div v-if="evaluations.length && !isLoading && !error" class="evaluation-list">
        <h2>Evaluaciones del Curso</h2>
        <ul>
          <li v-for="evaluation in evaluations" :key="evaluation.id">
            <span>{{ evaluation.title }}</span>
            <div class="evaluation-actions">
              <button
                class="btn btn-primary"
                @click="viewEvaluation(evaluation.id)"
                aria-label="Ver evaluación {{ evaluation.title }}"
              >
                Ver Evaluación
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

      <!-- Mensajes cuando no hay evaluaciones -->
      <div v-else-if="!isLoading && !evaluations.length && !error" class="no-evaluations">
        <p>No hay evaluaciones disponibles para este curso.</p>
      </div>
    </div>
  </div>
</template>

---

### Script Mejorado

```javascript
<script>
import axios from "axios";

export default {
  name: "EvaluationView",
  data() {
    return {
      courses: [], // Lista de cursos disponibles
      evaluations: [], // Lista de evaluaciones del curso seleccionado
      selectedCourseId: null, // ID del curso seleccionado
      userRole: "", // Rol del usuario actual
      isLoading: true, // Estado de carga
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
    if (!token) {
      this.handleError("No estás autenticado.");
      this.$router.push("/login");
      return;
    }

    try {
      this.userRole = this.getUserRoleFromToken(token);
      await this.loadCourses();
    } catch (error) {
      this.handleError("Ocurrió un error al cargar los datos iniciales.", error);
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    getUserRoleFromToken(token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.role || "";
      } catch (error) {
        throw new Error("Token inválido. No se pudo determinar el rol del usuario.");
      }
    },
    async loadCourses() {
      try {
        const response = await axios.get("/api/courses", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.courses = response.data || [];
      } catch (error) {
        this.handleError("No se pudieron cargar los cursos.", error);
      }
    },
    async loadEvaluations() {
      if (!this.selectedCourseId) return;

      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get(`/api/evaluations/course/${this.selectedCourseId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.evaluations = response.data.data || [];
      } catch (error) {
        this.handleError("No se pudieron cargar las evaluaciones.", error);
      } finally {
        this.isLoading = false;
      }
    },
    viewEvaluation(evaluationId) {
      this.$router.push(`/evaluation/${evaluationId}`);
    },
    editEvaluation(evaluationId) {
      this.$router.push(`/evaluation/edit/${evaluationId}`);
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
          this.handleError("No se pudo eliminar la evaluación.", error);
        }
      }
    },
    handleError(message, error = null) {
      console.error(message, error?.response?.data || error?.message || error);
      this.error = message;
    },
  },
};
</script>

<style scoped>
.course-view {
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

.course-title {
  font-family: "Playfair Display", serif;
  font-size: 28px;
  color: #2A3B5F;
  text-align: center;
  margin-bottom: 15px;
}

.loading-message,
.error-message {
  text-align: center;
  font-family: "Roboto", sans-serif;
  font-size: 16px;
  color: #999999;
  margin-top: 20px;
}

.no-evaluations {
  text-align: center;
  font-family: "Roboto", sans-serif;
  font-size: 16px;
  color: #999999;
  margin-top: 20px;
}
</style>
