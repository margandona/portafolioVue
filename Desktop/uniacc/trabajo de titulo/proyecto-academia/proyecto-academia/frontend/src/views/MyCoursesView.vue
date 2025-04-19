<template>
    <div class="my-courses-view" aria-labelledby="page-title">
      <div class="container">
        <h1 id="page-title">Mis Cursos Inscritos</h1>
  
        <!-- Mensaje cuando no hay cursos inscritos -->
        <div v-if="!courses.length" class="no-courses" role="alert">
          No estás inscrito en ningún curso.
        </div>
  
        <!-- Lista de Cursos -->
        <div v-else class="course-list" role="list">
          <StudentCourseCard
            v-for="course in courses"
            :key="course.id"
            :course="course"
            @select="viewCourse"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  import { getAuthToken } from "@/utils/auth";
  import StudentCourseCard from "@/components/StudentCourseCard.vue";
  
  export default {
    name: "MyCourseView",
    components: {
      StudentCourseCard,
    },
    data() {
      return {
        courses: [], // Lista de cursos inscritos
      };
    },
    async created() {
      await this.loadEnrolledCourses();
    },
    methods: {
      /**
       * Cargar la lista de cursos inscritos.
       */
      async loadEnrolledCourses() {
        try {
          const response = await axios.get("/api/courses/enrolled", {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          });
          this.courses = response.data || [];
        } catch (error) {
          console.error(
            "Error al cargar cursos inscritos:",
            error.response?.data || error.message
          );
          alert("No se pudieron cargar tus cursos inscritos.");
        }
      },
  
      /**
       * Ver detalles de un curso.
       * @param {Object} course - Curso seleccionado.
       */
      viewCourse(course) {
        this.$router.push(`/courses/${course.id}`);
      },
    },
  };
  </script>
  
  <style scoped>
  .my-courses-view {
    background-color: #f9f9f9;
    min-height: 100vh;
    padding: 2rem;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .no-courses {
    text-align: center;
    font-size: 18px;
    color: #999;
    margin-top: 2rem;
  }
  
  .course-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }
  
  h1 {
    font-family: "Playfair Display", serif;
    font-size: 2rem;
    color: #2e8b57;
    text-align: center;
    margin-bottom: 2rem;
  }
  </style>
  