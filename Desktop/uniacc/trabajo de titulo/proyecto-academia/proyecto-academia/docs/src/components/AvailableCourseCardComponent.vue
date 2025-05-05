<template>
    <div
      class="available-course-card"
      @click="$emit('select', course)"
      role="button"
      tabindex="0"
      aria-label="Detalles del curso {{ course.title }}"
    >
      <h2 class="course-title">{{ course.title }}</h2>
      <p class="course-description">{{ course.description }}</p>
      <small class="course-meta">
        Categoría: {{ course.category }} | Profesor: {{ course.teacher?.name || "Desconocido" }}
      </small>
      <button
        class="btn btn-primary"
        @click.stop="enrollInCourse"
        :disabled="isEnrolling"
        aria-label="Inscribirse en el curso {{ course.title }}"
      >
        {{ isEnrolling ? "Inscribiéndose..." : "Inscribirse" }}
      </button>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "AvailableCourseCardComponent",
    props: {
      course: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        isEnrolling: false, // Estado para gestionar el proceso de inscripción
      };
    },
    methods: {
      async enrollInCourse() {
        if (!confirm(`¿Deseas inscribirte en el curso "${this.course.title}"?`)) {
          return;
        }
        this.isEnrolling = true;
        try {
          await axios.post(
            `https://us-central1-casiangelesydemonios.cloudfunctions.net/api/enrollments`,
            { course_id: this.course.id },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }
          );
          alert("Te has inscrito correctamente en el curso.");
          this.$emit("enrolled", this.course.id); // Emitir evento para informar la inscripción
        } catch (error) {
          console.error("Error al inscribirse en el curso:", error.response?.data || error.message);
          alert("Hubo un error al intentar inscribirte. Intenta nuevamente.");
        } finally {
          this.isEnrolling = false;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .available-course-card {
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #ffffff;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    cursor: pointer;
  }
  
  .available-course-card:hover {
    transform: translateY(-5px);
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
  }
  
  .available-course-card:focus {
    outline: 2px solid #2e8b57;
    box-shadow: 0px 0px 8px rgba(46, 139, 87, 0.8);
  }
  
  .course-title {
    font-size: 20px;
    color: #2a3b5f; /* Azul profundo */
    margin-bottom: 10px;
    font-family: "Playfair Display", serif;
  }
  
  .course-description {
    font-size: 14px;
    color: #6c757d; /* Gris */
    margin-bottom: 15px;
    font-family: "Roboto", sans-serif;
  }
  
  .course-meta {
    font-size: 12px;
    color: #9a9a9a;
    margin-bottom: 15px;
    display: block;
    font-family: "Roboto", sans-serif;
  }
  
  .btn {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-family: "Roboto", sans-serif;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
  }
  
  .btn-primary {
    background-color: #2e8b57; /* Verde esmeralda */
    color: #ffffff;
    border: none;
  }
  
  .btn-primary:hover {
    background-color: #3aa870; /* Verde esmeralda más oscuro */
  }
  
  .btn-primary:disabled {
    background-color: #c3e6cb; /* Verde claro */
    cursor: not-allowed;
  }
  </style>
