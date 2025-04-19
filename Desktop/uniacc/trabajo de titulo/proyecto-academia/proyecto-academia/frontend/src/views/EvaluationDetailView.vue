<template>
  <div class="evaluation-detail-view">
    <h1 class="title">{{ evaluation.title }}</h1>
    <p class="description">{{ evaluation.description }}</p>

    <!-- Indicador de carga -->
    <div v-if="loading" class="loading-message">
      <p>Cargando evaluación...</p>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <!-- Preguntas -->
    <div v-else-if="evaluation.questions.length > 0" class="questions-list">
      <div
        v-for="(question, index) in evaluation.questions"
        :key="index"
        class="question-block"
      >
        <h3 class="question-title">
          Pregunta {{ index + 1 }}: {{ question.text }}
        </h3>
        <ul class="options-list">
          <li
            v-for="(option, optionIndex) in question.options"
            :key="optionIndex"
            class="option-item"
          >
            {{ option }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Mensaje cuando no hay preguntas -->
    <div v-else-if="!loading && !error" class="no-questions">
      <p>No hay preguntas disponibles en esta evaluación.</p>
    </div>

    <!-- Acciones -->
    <div v-if="!loading && !error">
      <div v-if="isTeacherOrAdmin" class="actions">
        <button class="btn btn-primary" @click="editEvaluation">Editar Evaluación</button>
        <button class="btn btn-danger" @click="deleteEvaluation">Eliminar Evaluación</button>
      </div>
      <div v-if="isStudent && canStartEvaluation" class="student-actions">
        <button class="btn btn-success" @click="startEvaluation">Iniciar Evaluación</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";

export default {
  name: "EvaluationDetailView",
  data() {
    return {
      evaluation: {
        title: "",
        description: "",
        questions: [],
      },
      loading: true,
      error: null,
      canStartEvaluation: false, // Control para habilitar iniciar evaluación
    };
  },
  computed: {
    ...mapGetters(["userRole"]),
    isTeacherOrAdmin() {
      return this.userRole === "teacher" || this.userRole === "admin";
    },
    isStudent() {
      return this.userRole === "student";
    },
  },
  async created() {
    await this.loadEvaluation();
    if (this.isStudent) {
      await this.checkIfCanStartEvaluation();
    }
  },
  methods: {
    async loadEvaluation() {
      this.loading = true;
      this.error = null;

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          this.error = "No estás autenticado.";
          return;
        }

        const response = await axios.get(
          `/api/evaluations/course/${this.$route.params.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.evaluation = response.data;
      } catch (error) {
        console.error("Error al cargar la evaluación:", error);
        if (error.response?.status === 404) {
          this.error = "Evaluación no encontrada.";
        } else {
          this.error = "No se pudo cargar la evaluación. Inténtalo nuevamente.";
        }
      } finally {
        this.loading = false;
      }
    },
    async checkIfCanStartEvaluation() {
      try {
        const response = await axios.get(
          `/api/evaluations/${this.$route.params.id}/can-start`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        this.canStartEvaluation = response.data.canStart || false;
      } catch (error) {
        console.error("Error al verificar si se puede iniciar la evaluación:", error);
        this.canStartEvaluation = false;
      }
    },
    editEvaluation() {
      this.$router.push(`/evaluations/edit/${this.$route.params.id}`);
    },
    async deleteEvaluation() {
      if (
        confirm(
          "¿Estás seguro de que deseas eliminar esta evaluación? Esta acción no se puede deshacer."
        )
      ) {
        try {
          await axios.delete(`/api/evaluations/${this.$route.params.id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          alert("Evaluación eliminada exitosamente.");
          this.$router.push("/evaluations");
        } catch (error) {
          console.error("Error al eliminar la evaluación:", error);
          alert("No se pudo eliminar la evaluación. Inténtalo nuevamente.");
        }
      }
    },
    startEvaluation() {
      this.$router.push(`/evaluations/start/${this.$route.params.id}`);
    },
  },
};
</script>

<style scoped>
.evaluation-detail-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.title {
  font-family: "Playfair Display", serif;
  font-size: 24px;
  color: #2e8b57;
  text-align: center;
  margin-bottom: 10px;
}

.description {
  font-family: "Roboto", sans-serif;
  font-size: 16px;
  color: #6c757d;
  text-align: center;
  margin-bottom: 20px;
}

.questions-list {
  margin-top: 20px;
}

.question-block {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.question-title {
  font-family: "Roboto", sans-serif;
  font-size: 18px;
  color: #2a3b5f;
  margin-bottom: 10px;
}

.options-list {
  list-style: none;
  padding: 0;
}

.option-item {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.no-questions {
  text-align: center;
  font-size: 16px;
  color: #999;
  margin-top: 20px;
}

.actions,
.student-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-primary {
  background-color: #2e8b57;
  color: white;
}

.btn-primary:hover {
  background-color: #3aa870;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-success {
  background-color: #007bff;
  color: white;
}

.btn-success:hover {
  background-color: #0056b3;
}

.loading-message,
.error-message {
  text-align: center;
  font-size: 16px;
  color: #666666;
}
</style>
