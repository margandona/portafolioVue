<template>
    <div class="enroll-student-form">
      <h1>Inscribir Estudiante en Curso</h1>
      <form @submit.prevent="enrollStudent">
        <div class="form-group">
          <label for="student">Estudiante</label>
          <select
            id="student"
            v-model="form.user_id"
            required
          >
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.name }} ({{ student.email }})
            </option>
          </select>
        </div>
  
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
  
        <button type="submit" class="btn btn-primary">Inscribir Estudiante</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "EnrollStudentForm",
    data() {
      return {
        students: [], // Lista de estudiantes disponibles
        courses: [], // Lista de cursos disponibles
        form: {
          user_id: null,
          course_id: null,
        },
      };
    },
    async created() {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
  
        // Cargar estudiantes
        const studentsResponse = await axios.get("http://localhost:3000/api/users/students", { headers });
        this.students = studentsResponse.data;
  
        // Cargar cursos
        const coursesResponse = await axios.get("http://localhost:3000/api/courses", { headers });
        this.courses = coursesResponse.data.filter(
          (course) =>
            course.teacher_id === localStorage.getItem("user_id") ||
            localStorage.getItem("role") === "admin"
        );
      } catch (error) {
        console.error("Error al cargar estudiantes o cursos:", error);
        alert("No se pudieron cargar los datos. Intenta más tarde.");
      }
    },
    methods: {
      async enrollStudent() {
        try {
          const token = localStorage.getItem("token");
          await axios.post(
            "http://localhost:3000/api/enrollments",
            this.form,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          alert("Estudiante inscrito exitosamente.");
          this.$router.push("/courses");
        } catch (error) {
          console.error("Error al inscribir estudiante:", error);
          alert(
            error.response?.data?.message || "No se pudo inscribir al estudiante."
          );
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .enroll-student-form {
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
  
  select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
  }
  
  button {
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 5px;
    border: none;
    background-color: #2e8b57;
    color: #fff;
    cursor: pointer;
    width: 100%;
  }
  
  button:hover {
    background-color: #3aa870;
  }
  </style>
  