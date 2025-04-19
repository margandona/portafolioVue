<template>
  <div class="course-list" aria-labelledby="course-list-title">
    <h2 id="course-list-title" class="title text-center">Lista de Cursos</h2>

    <!-- Estado de Cargando -->
    <div v-if="isLoading" class="loading" role="status">
      <p>Cargando cursos...</p>
    </div>

    <!-- Mensaje de Error -->
    <div v-if="errorMessage" class="error" role="alert">
      {{ errorMessage }}
    </div>

    <!-- Lista de Cursos -->
    <ul v-if="courses.length" class="courses">
      <li v-for="course in courses" :key="course.id" class="course-item">
        <div class="course-details">
          <h3 class="course-title" tabindex="0">{{ course.title }}</h3>
          <p class="course-description">{{ course.description || "Sin descripción" }}</p>
          <p class="course-teacher">
            <strong>Profesor:</strong> {{ course.teacher?.name || "Desconocido" }}
          </p>
        </div>

        <!-- Botones de Acción -->
        <div class="course-actions">
          <button
            v-if="userRole === 'student'"
            class="btn btn-primary"
            @click="enrollInCourse(course.id)"
            :aria-label="'Inscribirse en el curso: ' + course.title"
          >
            Inscribirse
          </button>
          <button
            v-if="userRole === 'teacher' || userRole === 'admin'"
            class="btn btn-secondary"
            @click="viewEvaluations(course.id)"
            :aria-label="'Ver evaluaciones del curso: ' + course.title"
          >
            Ver Evaluaciones
          </button>
          <button
            v-if="userRole === 'teacher' || userRole === 'admin'"
            class="btn btn-warning"
            @click="editCourse(course.id)"
            :aria-label="'Editar el curso: ' + course.title"
          >
            Editar
          </button>
          <button
            v-if="userRole === 'admin'"
            class="btn btn-danger"
            @click="deleteCourse(course.id)"
            :aria-label="'Eliminar el curso: ' + course.title"
          >
            Eliminar
          </button>
        </div>
      </li>
    </ul>

    <!-- Sin Cursos -->
    <div v-else-if="!isLoading && !errorMessage" class="no-courses">
      <p>No hay cursos disponibles en este momento.</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { getAuthToken } from "@/utils/auth";

export default {
  name: "CourseListComponent",
  props: {
    userRole: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      courses: [],
      isLoading: true,
      errorMessage: "",
    };
  },
  async created() {
    await this.loadCourses();
  },
  methods: {
    /**
     * Cargar cursos desde el servidor.
     */
    async loadCourses() {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const response = await axios.get("/api/courses/available", {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
        this.courses = response.data || [];
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Error al cargar los cursos.";
        console.error("Error al cargar cursos:", error.message);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Inscribirse en un curso.
     * @param {number} courseId - ID del curso.
     */
    async enrollInCourse(courseId) {
      try {
        this.isLoading = true;
        await axios.post(
          `/api/courses/enroll/${courseId}`,
          {},
          {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          }
        );
        alert("Inscripción exitosa en el curso.");
        this.loadCourses(); // Actualizar la lista de cursos disponibles
      } catch (error) {
        console.error("Error al inscribirse en el curso:", error.message);
        alert(
          error.response?.data?.message ||
            "No se pudo inscribir en el curso. Intenta nuevamente."
        );
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Editar un curso.
     * @param {number} courseId - ID del curso.
     */
    editCourse(courseId) {
      this.$router.push(`/courses/edit/${courseId}`);
    },

    /**
     * Eliminar un curso.
     * @param {number} courseId - ID del curso.
     */
    async deleteCourse(courseId) {
      if (confirm("¿Estás seguro de que deseas eliminar este curso?")) {
        try {
          await axios.delete(`/api/courses/${courseId}`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          });
          alert("Curso eliminado exitosamente.");
          this.loadCourses();
        } catch (error) {
          console.error("Error al eliminar curso:", error.message);
          alert(
            error.response?.data?.message ||
              "No se pudo eliminar el curso. Intenta nuevamente."
          );
        }
      }
    },

    /**
     * Ver evaluaciones de un curso.
     * @param {number} courseId - ID del curso.
     */
    viewEvaluations(courseId) {
      this.$router.push(`/courses/${courseId}/evaluations`);
    },
  },
};
</script>

<style scoped>
.course-list {
  padding: 20px;
}

.title {
  font-size: 24px;
  margin-bottom: 20px;
}

.loading,
.error,
.no-courses {
  text-align: center;
  margin: 20px 0;
}

.courses {
  list-style: none;
  padding: 0;
}

.course-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  margin-bottom: 10px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.course-details {
  flex-grow: 1;
}

.course-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.btn {
  margin-bottom: 10px;
}

.btn-primary {
  background-color: #2e8b57;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-warning {
  background-color: #ffc107;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}
</style>
