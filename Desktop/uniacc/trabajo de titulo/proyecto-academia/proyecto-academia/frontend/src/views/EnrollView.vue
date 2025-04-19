<template>
  <div class="enroll-view">
    <h1 class="title">Inscribirse en Cursos</h1>
    <p class="description">
      Explora los cursos disponibles y comienza a aprender hoy.
    </p>

    <!-- Indicador de carga -->
    <div v-if="isLoading" class="loading-spinner">Cargando cursos...</div>

    <!-- Lista de cursos -->
    <div v-else-if="filteredCourses.length > 0" class="course-list">
      <StudentCourseCard
        v-for="course in filteredCourses"
        :key="course.id"
        :course="course"
        @enroll="enrollInCourse"
      />
    </div>

    <!-- No hay cursos -->
    <div v-else class="no-courses">
      <p>No hay cursos disponibles para inscripción.</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import StudentCourseCard from "@/components/StudentCourseCard.vue";

export default {
  name: "EnrollView",
  components: {
    StudentCourseCard,
  },
  data() {
    return {
      courses: [], // Todos los cursos disponibles
      userRole: "", // Rol del usuario
      userId: null, // ID del usuario autenticado
      isLoading: false, // Indicador de carga
    };
  },
  computed: {
    filteredCourses() {
      // Filtrar cursos disponibles para inscripción según el rol del usuario
      if (this.userRole === "student") {
        return this.courses.filter((course) => !course.enrolled);
      }
      return this.courses; // Otros roles no deberían estar en esta vista
    },
  },
  async created() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No tienes una sesión activa. Por favor, inicia sesión.");
      this.$router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      this.userRole = payload.role || "";
      this.userId = payload.id || "";

      this.isLoading = true;
      const response = await axios.get("http://localhost:3000/api/courses/available", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      this.courses = response.data;
    } catch (error) {
      console.error("Error al obtener los cursos:", error.response?.data || error.message);
      alert("Error al cargar los cursos.");
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    /**
     * Maneja la inscripción en un curso.
     * @param {Number} courseId - ID del curso al que el usuario desea inscribirse.
     */
    async enrollInCourse(courseId) {
      try {
        this.isLoading = true;
        await axios.post(
          "http://localhost:3000/api/enrollments",
          { course_id: courseId },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        alert("Te has inscrito en el curso exitosamente.");
        this.courses = this.courses.filter((course) => course.id !== courseId); // Actualizar la lista de cursos disponibles
      } catch (error) {
        console.error("Error al inscribirse en el curso:", error.response?.data || error.message);
        alert(
          error.response?.data?.message || "No se pudo completar la inscripción."
        );
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.enroll-view {
  padding: 20px;
  background-color: #f9f9f9;
  min-height: 100vh;
}

.title {
  font-family: "Playfair Display", serif;
  font-size: 28px;
  color: #2a3b5f;
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

.course-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.no-courses {
  text-align: center;
  font-size: 18px;
  color: #999;
  font-family: "Roboto", sans-serif;
  margin-top: 20px;
}

.loading-spinner {
  text-align: center;
  font-size: 18px;
  color: #2e8b57;
  font-family: "Roboto", sans-serif;
}
</style>
