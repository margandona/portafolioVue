<template>
    <div class="available-courses-view" aria-labelledby="page-title">
      <div class="container">
        <h1 id="page-title">Cursos Disponibles</h1>
  
        <!-- Mensaje cuando no hay cursos -->
        <div v-if="!courses.length" class="no-courses" role="alert">
          No hay cursos disponibles para inscripción.
        </div>
  
        <!-- Lista de Cursos -->
        <div v-else class="course-list" role="list">
          <div
            v-for="course in courses"
            :key="course.id"
            class="course-card"
            tabindex="0"
            role="listitem"
          >
            <h2>{{ course.title }}</h2>
            <p>{{ course.description }}</p>
            <p><strong>Profesor:</strong> {{ course.teacher.name }}</p>
            <button
              class="btn btn-primary"
              @click="enroll(course.id)"
              aria-label="Inscribirse en el curso {{ course.title }}"
            >
              Inscribirse
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
    name: "AvailableCourseView",
    data() {
      return {
        courses: [],
      };
    },
    async created() {
      await this.loadAvailableCourses();
    },
    mounted() {
      const container = this.$el.querySelector(".container");
      focusFirstInteractiveElement(container);
    },
    methods: {
      /**
       * Cargar la lista de cursos disponibles.
       */
      async loadAvailableCourses() {
        try {
          const response = await axios.get("/api/courses/available", {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          });
          this.courses = response.data;
        } catch (error) {
          console.error(
            "Error al cargar cursos disponibles:",
            error.response?.data || error.message
          );
          alert("No se pudieron cargar los cursos disponibles.");
        }
      },
  
      /**
       * Inscribirse en un curso.
       * @param {number} courseId - ID del curso.
       */
      async enroll(courseId) {
        try {
          await axios.post(
            `/api/courses/enroll/${courseId}`,
            {},
            { headers: { Authorization: `Bearer ${getAuthToken()}` } }
          );
          alert("Te has inscrito exitosamente en el curso.");
          await this.loadAvailableCourses(); // Recargar cursos disponibles
        } catch (error) {
          console.error("Error al inscribirse en el curso:", error.message);
          alert("No se pudo completar la inscripción.");
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .available-courses-view {
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
  
  .course-card {
    background-color: #fff;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .course-card:focus {
    outline: 2px solid #2e8b57;
    outline-offset: 4px;
  }
  
  .course-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  h1 {
    font-family: "Playfair Display", serif;
    font-size: 2rem;
    color: #2e8b57;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  h2 {
    font-size: 1.5rem;
    color: #333;
  }
  
  p {
    font-size: 1rem;
    color: #555;
  }
  
  button {
    margin-top: 1rem;
  }
  </style>
  