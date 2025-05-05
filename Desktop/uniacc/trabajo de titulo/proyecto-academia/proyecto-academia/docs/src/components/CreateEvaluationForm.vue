<template>
    <div class="create-evaluation-form">
      <h1>Crear Nueva Evaluación</h1>
      <form @submit.prevent="submitEvaluation">
        <div class="form-group">
          <label for="course">Curso</label>
          <select
            id="course"
            v-model="form.course_id"
            required
          >
            <option v-for="course in courses" :key="course.id" :value="course.id">
              {{ course.title }}
            </option>
          </select>
        </div>
  
        <div class="form-group">
          <label for="title">Título</label>
          <input
            id="title"
            type="text"
            v-model="form.title"
            placeholder="Título de la evaluación"
            required
          />
        </div>
  
        <div class="form-group">
          <label for="description">Descripción</label>
          <textarea
            id="description"
            v-model="form.description"
            placeholder="Descripción de la evaluación"
          ></textarea>
        </div>
  
        <div class="form-group">
          <label>Preguntas</label>
          <div
            v-for="(question, index) in form.questions"
            :key="index"
            class="question-group"
          >
            <input
              type="text"
              v-model="form.questions[index]"
              placeholder="Escribe la pregunta"
              required
            />
            <button
              type="button"
              @click="removeQuestion(index)"
              class="btn btn-danger btn-sm"
            >
              Eliminar
            </button>
          </div>
          <button
            type="button"
            @click="addQuestion"
            class="btn btn-secondary"
          >
            Añadir Pregunta
          </button>
        </div>
  
        <button type="submit" class="btn btn-primary">Crear Evaluación</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "CreateEvaluationForm",
    data() {
      return {
        courses: [], // Lista de cursos disponibles para asignar evaluaciones
        form: {
          course_id: null,
          title: "",
          description: "",
          questions: [""], // Una pregunta inicial por defecto
        },
      };
    },
    async created() {
      try {
        const { data } = await axios.get("https://us-central1-casiangelesydemonios.cloudfunctions.net/api/courses", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.courses = data.filter(
          (course) =>
            course.teacher_id === localStorage.getItem("user_id") ||
            localStorage.getItem("role") === "admin"
        );
      } catch (error) {
        console.error("Error al cargar cursos:", error);
        alert("No se pudieron cargar los cursos. Intenta más tarde.");
      }
    },
    methods: {
      addQuestion() {
        this.form.questions.push("");
      },
      removeQuestion(index) {
        this.form.questions.splice(index, 1);
      },
      async submitEvaluation() {
        try {
          await axios.post(
            "https://us-central1-casiangelesydemonios.cloudfunctions.net/api/evaluations",
            this.form,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          alert("Evaluación creada exitosamente.");
          this.$router.push("/evaluations/manage");
        } catch (error) {
          console.error("Error al crear evaluación:", error);
          alert("No se pudo crear la evaluación. Verifica los datos e intenta nuevamente.");
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .create-evaluation-form {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    text-align: center;
    font-family: "Roboto", sans-serif;
    font-size: 24px;
    color: #2e8b57;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  input,
  textarea,
  select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
  }
  
  button {
    margin-top: 10px;
  }
  
  .question-group {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .btn {
    padding: 8px 12px;
    font-size: 14px;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .btn-primary {
    background-color: #2e8b57;
    color: #fff;
    border: none;
  }
  
  .btn-primary:hover {
    background-color: #3aa870;
  }
  
  .btn-secondary {
    background-color: #6c757d;
    color: #fff;
    border: none;
  }
  
  .btn-secondary:hover {
    background-color: #5a6268;
  }
  
  .btn-danger {
    background-color: #dc3545;
    color: #fff;
    border: none;
  }
  
  .btn-danger:hover {
    background-color: #b21f2d;
  }
  </style>
