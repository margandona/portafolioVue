<template>
  <div class="course-list-page">
    <div class="header">
      <h1 id="course-list-header">Mis Cursos</h1>
      <button
        class="btn btn-primary"
        @click="navigateToCreateCourse"
        aria-label="Crear un nuevo curso"
      >
        Crear Nuevo Curso
      </button>
    </div>

    <div v-if="courses.length > 0" class="course-list" aria-labelledby="course-list-header">
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
      <p>No tienes cursos registrados aún.</p>
    </div>

    <!-- Modal para mostrar detalles del curso -->
    <CourseDetailModal
      v-if="selectedCourse"
      :course="selectedCourse"
      @close="closeCourseDetails"
    />
  </div>
</template>

<script>
import axios from "axios";
import AdminTeacherCourseCard from "@/components/AdminTeacherCourseCard.vue";
import CourseDetailModal from "@/components/CourseDetailModal.vue";

export default {
  name: "CourseListView",
  components: {
    AdminTeacherCourseCard,
    CourseDetailModal,
  },
  data() {
    return {
      courses: [], // Lista de cursos
      selectedCourse: null, // Curso seleccionado para mostrar en el modal
    };
  },
  async created() {
    await this.loadCourses();
  },
  methods: {
    /**
     * Carga los cursos desde la API.
     */
    async loadCourses() {
      try {
        const response = await axios.get("/api/courses", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.courses = response.data || [];
      } catch (error) {
        console.error("Error al obtener los cursos:", error.response?.data || error.message);
        alert("Hubo un error al cargar los cursos.");
      }
    },

    /**
     * Navega a la página para crear un nuevo curso.
     */
    navigateToCreateCourse() {
      this.$router.push("/courses/create");
    },

    /**
     * Navega a la página de edición de un curso.
     * @param {Number} courseId - ID del curso a editar.
     */
    editCourse(courseId) {
      this.$router.push(`/courses/edit/${courseId}`);
    },

    /**
     * Elimina un curso.
     * @param {Number} courseId - ID del curso a eliminar.
     */
    async deleteCourse(courseId) {
      if (confirm("¿Estás seguro de que deseas eliminar este curso?")) {
        try {
          await axios.delete(`/api/courses/${courseId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          this.courses = this.courses.filter((course) => course.id !== courseId);
          alert("Curso eliminado exitosamente.");
        } catch (error) {
          console.error("Error al eliminar el curso:", error.response?.data || error.message);
          alert("Hubo un error al eliminar el curso.");
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
.course-list-page {
  padding: 20px;
  background-color: #f9f9f9;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  font-family: "Playfair Display", serif;
  font-size: 28px;
  color: #2a3b5f;
}

.course-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.no-courses {
  text-align: center;
  font-family: "Roboto", sans-serif;
  font-size: 16px;
  color: #999999;
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
