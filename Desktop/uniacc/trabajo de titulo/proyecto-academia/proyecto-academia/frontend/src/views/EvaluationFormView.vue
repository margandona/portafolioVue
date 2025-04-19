<template>
  <div class="evaluation-form">
    <h2 class="form-title">{{ isEditing ? "Editar Evaluación" : "Crear Evaluación" }}</h2>
    <p class="form-description">
      {{ isEditing ? "Modifica los detalles de la evaluación seleccionada." : "Completa los campos para crear una nueva evaluación." }}
    </p>

    <!-- Indicador de carga -->
    <div v-if="isLoading" class="loading-message">
      Cargando...
    </div>

    <!-- Mensaje de error -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- Selección de Curso -->
    <div v-if="showCourseSelector && !isLoading" class="course-selector">
      <label for="course-select">Selecciona un curso:</label>
      <select id="course-select" v-model="selectedCourseId" @change="loadEvaluations">
        <option value="" disabled>Selecciona un curso</option>
        <option v-for="course in courses" :key="course.id" :value="course.id">
          {{ course.title }}
        </option>
      </select>
    </div>

    <!-- Lista de Evaluaciones -->
    <div v-if="evaluations.length && !isLoading" class="evaluation-list">
      <h3>Evaluaciones:</h3>
      <ul>
        <li v-for="evaluation in evaluations" :key="evaluation.id">
          <span>{{ evaluation.title }}</span>
          <button class="btn btn-secondary" @click="editEvaluation(evaluation.id)">Editar</button>
          <button class="btn btn-danger" @click="deleteEvaluation(evaluation.id)">Eliminar</button>
        </li>
      </ul>
    </div>

    <!-- Mensaje cuando no hay evaluaciones -->
    <div v-else-if="!isLoading && !evaluations.length">
      <p>No hay evaluaciones disponibles para este curso.</p>
    </div>

    <!-- Formulario para crear o editar -->
    <form @submit.prevent="submitEvaluation" v-if="!isLoading">
      <div>
        <label for="evaluation-title">Título de la evaluación</label>
        <input id="evaluation-title" v-model="form.title" type="text" placeholder="Título" required />
      </div>

      <div>
        <label for="evaluation-description">Descripción</label>
        <textarea id="evaluation-description" v-model="form.description" placeholder="Descripción"></textarea>
      </div>

      <div v-for="(question, index) in form.questions" :key="index" class="question-block">
        <label :for="'question-text-' + index">Pregunta {{ index + 1 }}</label>
        <input :id="'question-text-' + index" v-model="question.text" type="text" placeholder="Texto de la pregunta" required />

        <div>
          <label>Opciones:</label>
          <div v-for="(option, optionIndex) in question.options" :key="optionIndex">
            <input v-model="question.options[optionIndex]" type="text" placeholder="Opción" required />
            <button @click.prevent="removeOption(index, optionIndex)">Eliminar</button>
          </div>
          <button @click.prevent="addOption(index)">Añadir opción</button>
        </div>
      </div>

      <button @click.prevent="addQuestion">Añadir Pregunta</button>
      <button type="submit" class="btn btn-primary">{{ isEditing ? "Guardar Cambios" : "Crear Evaluación" }}</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "EvaluationFormView",
  props: {
    courseId: {
      type: Number,
      required: false,
    },
  },
  data() {
    return {
      courses: [], // Cursos disponibles
      evaluations: [], // Evaluaciones existentes
      selectedCourseId: null, // ID del curso seleccionado
      form: {
        title: "",
        description: "",
        questions: [],
      },
      isEditing: false, // Estado del formulario
      editingEvaluationId: null, // ID de evaluación a editar
      isLoading: false, // Indicador de carga
      errorMessage: null, // Mensaje de error
    };
  },
  computed: {
    showCourseSelector() {
      return !this.courseId;
    },
    token() {
      return localStorage.getItem("token");
    },
  },
  async created() {
    this.isLoading = true;
    try {
      if (this.showCourseSelector) {
        await this.loadCourses();
      } else {
        this.selectedCourseId = this.courseId;
        await this.loadEvaluations();
      }
    } catch (error) {
      this.handleError("Error al inicializar los datos.", error);
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    async loadCourses() {
      try {
        const response = await axios.get("/api/courses", {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.courses = response.data || [];
      } catch (error) {
        this.handleError("Error al cargar los cursos.", error);
      }
    },
    async loadEvaluations() {
      if (!this.selectedCourseId) return;
      try {
        const response = await axios.get(`/api/evaluations/course/${this.selectedCourseId}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.evaluations = response.data.data || [];
      } catch (error) {
        this.handleError("Error al cargar las evaluaciones.", error);
      }
    },
    addQuestion() {
      this.form.questions.push({ text: "", options: [] });
    },
    removeOption(questionIndex, optionIndex) {
      this.form.questions[questionIndex].options.splice(optionIndex, 1);
    },
    addOption(questionIndex) {
      this.form.questions[questionIndex].options.push("");
    },
    async submitEvaluation() {
      try {
        const url = this.isEditing
          ? `/api/evaluations/${this.editingEvaluationId}`
          : "/api/evaluations";
        const method = this.isEditing ? "put" : "post";

        await axios[method](
          url,
          { ...this.form, course_id: this.selectedCourseId },
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        );
        alert(this.isEditing ? "Evaluación actualizada" : "Evaluación creada");
        this.resetForm();
        await this.loadEvaluations();
      } catch (error) {
        this.handleError("Error al enviar la evaluación.", error);
      }
    },
    async deleteEvaluation(evaluationId) {
      if (confirm("¿Deseas eliminar esta evaluación?")) {
        try {
          await axios.delete(`/api/evaluations/${evaluationId}`, {
            headers: { Authorization: `Bearer ${this.token}` },
          });
          alert("Evaluación eliminada");
          await this.loadEvaluations();
        } catch (error) {
          this.handleError("Error al eliminar la evaluación.", error);
        }
      }
    },
    editEvaluation(evaluationId) {
      const evaluation = this.evaluations.find((e) => e.id === evaluationId);
      if (!evaluation) return;

      this.form = {
        title: evaluation.title,
        description: evaluation.description,
        questions: evaluation.questions.map((q) => ({ ...q })),
      };
      this.isEditing = true;
      this.editingEvaluationId = evaluationId;
    },
    resetForm() {
      this.form = { title: "", description: "", questions: [] };
      this.isEditing = false;
      this.editingEvaluationId = null;
    },
    handleError(message, error) {
      console.error(message, error.response?.data || error.message);
      this.errorMessage = message;
    },
  },
};
</script>

<style scoped>
.evaluation-form {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.loading-message {
  text-align: center;
  font-size: 16px;
  color: #666666;
}

.error-message {
  color: red;
  text-align: center;
}
</style>
