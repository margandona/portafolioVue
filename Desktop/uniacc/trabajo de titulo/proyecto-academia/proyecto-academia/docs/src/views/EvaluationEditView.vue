<template>
    <div class="evaluation-edit-view">
      <h1 class="title">Editar Evaluación</h1>
  
      <!-- Indicador de carga -->
      <div v-if="loading" class="loading-message">
        Cargando evaluación...
      </div>
  
      <!-- Mensaje de error -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
  
      <!-- Formulario -->
      <form v-else @submit.prevent="submitEvaluation">
        <!-- Título -->
        <div class="form-group">
          <label for="evaluation-title">Título de la evaluación</label>
          <input
            id="evaluation-title"
            v-model="form.title"
            type="text"
            placeholder="Título"
            required
          />
        </div>
  
        <!-- Descripción -->
        <div class="form-group">
          <label for="evaluation-description">Descripción</label>
          <textarea
            id="evaluation-description"
            v-model="form.description"
            placeholder="Descripción"
          ></textarea>
        </div>
  
        <!-- Preguntas -->
        <div class="questions-section">
          <h3>Preguntas</h3>
          <div
            v-for="(question, index) in form.questions"
            :key="index"
            class="question-block"
          >
            <!-- Texto de la pregunta -->
            <label :for="'question-text-' + index">Pregunta {{ index + 1 }}</label>
            <input
              :id="'question-text-' + index"
              v-model="question.text"
              type="text"
              placeholder="Texto de la pregunta"
              required
            />
  
            <!-- Opciones -->
            <div class="options-section">
              <label>Opciones:</label>
              <div
                v-for="(option, optionIndex) in question.options"
                :key="optionIndex"
                class="option-block"
              >
                <input
                  v-model="question.options[optionIndex]"
                  type="text"
                  placeholder="Opción"
                  required
                />
                <button @click.prevent="removeOption(index, optionIndex)">Eliminar</button>
              </div>
              <button @click.prevent="addOption(index)">Añadir opción</button>
            </div>
          </div>
          <button @click.prevent="addQuestion">Añadir Pregunta</button>
        </div>
  
        <!-- Botones -->
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Guardar Cambios</button>
          <button class="btn btn-secondary" @click.prevent="cancelEdit">Cancelar</button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "EvaluationEditView",
    data() {
      return {
        form: {
          title: "",
          description: "",
          questions: [],
        },
        evaluationId: null,
        loading: true,
        error: null,
      };
    },
    async created() {
      this.evaluationId = this.$route.params.id;
      if (!this.evaluationId) {
        this.error = "ID de evaluación no proporcionado.";
        this.$router.push("/404");
        return;
      }
      await this.loadEvaluation();
    },
    methods: {
      async loadEvaluation() {
        try {
          this.loading = true;
          const response = await axios.get(`/api/evaluations/${this.evaluationId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          const { title, description, questions } = response.data;
          this.form.title = title;
          this.form.description = description;
          this.form.questions = questions.map((q) => ({
            ...q,
            options: q.options || [],
          }));
        } catch (error) {
          console.error("Error al cargar la evaluación:", error);
          this.error = "No se pudo cargar la evaluación.";
          this.$router.push("/404");
        } finally {
          this.loading = false;
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
          // Validar que todas las preguntas tengan al menos una opción
          const invalidQuestions = this.form.questions.filter(
            (q) => q.options.length === 0
          );
          if (invalidQuestions.length > 0) {
            alert("Todas las preguntas deben tener al menos una opción.");
            return;
          }
  
          await axios.put(
            `/api/evaluations/${this.evaluationId}`,
            this.form,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          alert("Evaluación actualizada correctamente.");
          this.$router.push("/evaluations");
        } catch (error) {
          console.error("Error al actualizar la evaluación:", error.response?.data || error.message);
          alert("No se pudo actualizar la evaluación. Inténtalo nuevamente.");
        }
      },
      cancelEdit() {
        if (confirm("¿Estás seguro de que deseas cancelar la edición? Se perderán los cambios no guardados.")) {
          this.$router.push("/evaluations");
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .evaluation-edit-view {
    max-width: 800px;
    margin: 0 auto;
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
    text-align: center;
    color: red;
  }
  
  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
  }
  
  .btn-primary {
    background-color: #2e8b57;
    color: #fff;
  }
  
  .btn-secondary {
    background-color: #6c757d;
    color: #fff;
  }
  </style>
  