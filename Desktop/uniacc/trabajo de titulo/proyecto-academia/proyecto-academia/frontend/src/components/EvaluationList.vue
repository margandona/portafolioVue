<template>
  <div class="evaluation-list">
    <header class="evaluation-list-header">
      <h2>Evaluaciones de {{ courseTitle }}</h2>
      <button v-if="isTeacherOrAdmin" class="btn btn-primary" @click="createEvaluation">
        Crear Evaluación
      </button>
    </header>

    <!-- Mensaje de error -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- Indicador de carga -->
    <div v-if="isLoading" class="loading-indicator">
      <p>Cargando evaluaciones...</p>
    </div>

    <!-- Tabla de Evaluaciones -->
    <div v-else>
      <table v-if="evaluations.length > 0" class="evaluations-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="evaluation in evaluations" :key="evaluation.id">
            <td>{{ evaluation.title }}</td>
            <td>{{ evaluation.description || "Sin descripción" }}</td>
            <td class="actions">
              <button
                v-if="isStudent"
                class="btn btn-success"
                @click="startEvaluation(evaluation.id)"
              >
                Realizar
              </button>
              <span
                v-if="isStudent && completedEvaluations.includes(evaluation.id)"
                class="completed-label"
              >
                Completado
              </span>
              <button
                v-if="isTeacherOrAdmin"
                class="btn btn-warning"
                @click="editEvaluation(evaluation.id)"
              >
                Editar
              </button>
              <button
                v-if="isTeacherOrAdmin"
                class="btn btn-danger"
                @click="deleteEvaluation(evaluation.id)"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>No hay evaluaciones disponibles para este curso.</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "EvaluationList",
  props: {
    courseId: {
      type: Number,
      required: true,
    },
    courseTitle: {
      type: String,
      default: "Curso",
    },
  },
  data() {
    return {
      evaluations: [],
      completedEvaluations: [],
      userRole: "",
      isLoading: true,
      errorMessage: null,
    };
  },
  async created() {
    try {
      this.loadUserRole();
      await this.loadEvaluations();
    } catch (error) {
      console.error("Error al inicializar el componente:", error);
      this.errorMessage = "Error al cargar las evaluaciones.";
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    async loadEvaluations() {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token no encontrado. Por favor, inicia sesión.");

        const headers = { Authorization: `Bearer ${token}` };
        const evaluationPromise = axios.get(
          `/api/evaluations/course/${this.courseId}`,
          { headers }
        );

        if (this.isStudent) {
          const completedPromise = axios.get(
            `/api/evaluations/completed`,
            { headers }
          );

          const [evaluationResponse, completedResponse] = await Promise.all([evaluationPromise, completedPromise]);

          this.evaluations = evaluationResponse.data.data || [];
          this.completedEvaluations = completedResponse.data.data.map((e) => e.id) || [];
        } else {
          const evaluationResponse = await evaluationPromise;
          this.evaluations = evaluationResponse.data.data || [];
        }
      } catch (error) {
        console.error("Error al cargar evaluaciones:", error.response?.data || error.message);
        this.errorMessage = "No se pudieron cargar las evaluaciones.";
      } finally {
        this.isLoading = false;
      }
    },
    loadUserRole() {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No estás autenticado.");
        this.$router.push("/login");
        return;
      }
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        this.userRole = payload.role || "";
      } catch (error) {
        console.error("Error al obtener el rol del usuario:", error);
        alert("No se pudo determinar tu rol.");
      }
    },
    startEvaluation(evaluationId) {
      this.$emit("startEvaluation", evaluationId);
    },
    createEvaluation() {
      this.$emit("createEvaluation", this.courseId);
    },
    editEvaluation(evaluationId) {
      this.$emit("editEvaluation", evaluationId);
    },
    async deleteEvaluation(evaluationId) {
      if (confirm("¿Estás seguro de eliminar esta evaluación?")) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`/api/evaluations/${evaluationId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert("Evaluación eliminada con éxito.");
          await this.loadEvaluations();
        } catch (error) {
          console.error("Error al eliminar evaluación:", error.response?.data || error.message);
          alert("No se pudo eliminar la evaluación.");
        }
      }
    },
  },
  computed: {
    isStudent() {
      return this.userRole === "student";
    },
    isTeacherOrAdmin() {
      return ["teacher", "admin"].includes(this.userRole);
    },
  },
};
</script>

<style scoped>
/* Misma estructura de estilos que ya existía */
.evaluation-list {
    margin: 20px 0;
  }
  
  .evaluation-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .evaluations-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .evaluations-table th,
  .evaluations-table td {
    padding: 10px;
    border: 1px solid #ddd;
  }
  
  .evaluations-table th {
    background-color: #2e8b57;
    color: white;
    font-weight: bold;
    text-align: left;
  }
  
  .actions {
    display: flex;
    gap: 10px;
  }
  
  .completed-label {
    color: #28a745;
    font-weight: bold;
  }
  
  .loading-indicator {
    text-align: center;
    font-family: "Roboto", sans-serif;
    font-size: 16px;
    color: #666;
    margin-top: 20px;
  }
</style>
