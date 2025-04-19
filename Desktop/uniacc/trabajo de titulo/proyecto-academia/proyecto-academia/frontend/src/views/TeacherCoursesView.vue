<template>
    <div class="teacher-course-view">
      <div class="container">
        <h1 class="view-title">Mis Cursos</h1>
        <button class="btn btn-primary mb-3" @click="createNewCourse" aria-label="Crear un nuevo curso">
          Crear Nuevo Curso
        </button>
  
        <div v-if="courses.length > 0" class="course-list">
          <AdminTeacherCourseCard
            v-for="course in courses"
            :key="course.id"
            :course="course"
            @edit="editCourse"
            @delete="deleteCourse"
            @showDetails="viewCourseDetails"
          />
        </div>
  
        <div v-else class="no-courses">
          <p>No tienes cursos creados aún.</p>
        </div>
  
        <!-- Modal para ver detalles del curso -->
        <CourseDetailModal
          v-if="selectedCourse"
          :course="selectedCourse"
          @close="closeCourseDetails"
        />
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  import AdminTeacherCourseCard from "@/components/AdminTeacherCourseCard.vue";
  import CourseDetailModal from "@/components/CourseDetailModal.vue";
  
  export default {
    name: "TeacherCourseView",
    components: {
      AdminTeacherCourseCard,
      CourseDetailModal,
    },
    data() {
      return {
        courses: [], // Lista de cursos creados por el profesor
        selectedCourse: null, // Curso seleccionado para ver detalles
      };
    },
    async created() {
      await this.loadCourses();
    },
    methods: {
      /**
       * Carga los cursos creados por el profesor.
       */
      async loadCourses() {
        try {
          const response = await axios.get("/api/courses", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          this.courses = response.data || [];
        } catch (error) {
          console.error("Error al cargar los cursos:", error.response?.data || error.message);
          alert("Hubo un error al cargar tus cursos.");
        }
      },
  
      /**
       * Abre el modal para crear un nuevo curso.
       */
      createNewCourse() {
        this.$router.push("/courses/create");
      },
  
      /**
       * Abre la vista de edición de un curso.
       * @param {Number} courseId - ID del curso a editar.
       */
      editCourse(courseId) {
        this.$router.push(`/courses/edit/${courseId}`);
      },
  
      /**
       * Elimina un curso creado por el profesor.
       * @param {Number} courseId - ID del curso a eliminar.
       */
      async deleteCourse(courseId) {
        if (confirm("¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.")) {
          try {
            await axios.delete(`/api/courses/${courseId}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            alert("Curso eliminado correctamente.");
            this.loadCourses(); // Recargar los cursos después de eliminar
          } catch (error) {
            console.error("Error al eliminar el curso:", error.response?.data || error.message);
            alert("No se pudo eliminar el curso. Intenta nuevamente.");
          }
        }
      },
  
      /**
       * Muestra los detalles del curso en un modal.
       * @param {Object} course - Curso seleccionado.
       */
      viewCourseDetails(course) {
        this.selectedCourse = course;
      },
  
      /**
       * Cierra el modal de detalles del curso.
       */
      closeCourseDetails() {
        this.selectedCourse = null;
      },
    },
  };
  </script>
  
  <style scoped>
  .teacher-course-view {
    padding: 20px;
    background-color: #f9f9f9;
    min-height: 100vh;
  }
  
  .container {
    max-width: 1200px;
    margin: auto;
    background-color: #ffffff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .view-title {
    font-family: "Playfair Display", serif;
    font-size: 28px;
    color: #2a3b5f;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .course-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .no-courses {
    text-align: center;
    font-family: "Roboto", sans-serif;
    font-size: 16px;
    color: #999999;
    margin-top: 20px;
  }
  
  .btn {
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  .btn-primary {
    background-color: #2e8b57;
    color: #ffffff;
  }
  
  .btn-primary:hover {
    background-color: #3aa870;
  }
  </style>
  