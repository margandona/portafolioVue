<template>
  <div class="courses-component">
    <div class="header">
      <h1 class="text-center">Lista de Cursos</h1>
      <p class="text-center description">
        Explora los cursos disponibles y mejora tus competencias.
      </p>
      <button
        v-if="canCreateCourses"
        class="btn btn-primary create-course-btn"
        @click="navigateToCreateCourse"
        aria-label="Crear un nuevo curso"
      >
        Crear Nuevo Curso
      </button>
    </div>

    <div v-if="filteredCourses.length > 0" class="course-list">
      <CourseCardComponent
        v-for="course in filteredCourses"
        :key="course.id"
        :course="course"
        :role="role"
        @edit="editCourse"
        @delete="deleteCourse"
        @select="selectCourse"
      />
    </div>

    <div v-else class="no-courses">
      <p>No hay cursos disponibles con los filtros seleccionados.</p>
    </div>

    <!-- Modal for course details -->
    <CourseModalComponent
      v-if="showModal"
      :course="selectedCourse"
      :is-visible="showModal"
      @close="closeModal"
    />
  </div>
</template>

<script>
import CourseCardComponent from "@/components/CourseCardComponent.vue";
import CourseModalComponent from "@/components/CourseModalComponent.vue";

export default {
  name: "CoursesComponent",
  components: {
    CourseCardComponent,
    CourseModalComponent,
  },
  props: {
    courses: {
      type: Array,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    filters: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      selectedCourse: null,
      showModal: false,
    };
  },
  computed: {
    filteredCourses() {
      // Aplicar filtros de categoría y duración
      return this.courses.filter((course) => {
        const matchesCategory =
          !this.filters.category || course.category === this.filters.category;
        const matchesDuration =
          !this.filters.duration_days ||
          course.duration_days <= this.filters.duration_days;
        return matchesCategory && matchesDuration;
      });
    },
    canCreateCourses() {
      return this.role === "teacher" || this.role === "admin";
    },
  },
  methods: {
    navigateToCreateCourse() {
      this.$router.push("/courses/create");
    },
    editCourse(courseId) {
      this.$router.push(`/courses/edit/${courseId}`);
    },
    deleteCourse(courseId) {
      this.$emit("delete", courseId);
    },
    selectCourse(course) {
      this.selectedCourse = course;
      this.showModal = true;
    },
    closeModal() {
      this.selectedCourse = null;
      this.showModal = false;
    },
  },
};
</script>

<style scoped>
/* Contenedor principal */
.courses-component {
  padding: 20px;
  background-color: #f9f9f9;
  min-height: 100vh;
}

/* Encabezado */
.text-center {
  text-align: center;
  color: #2a3b5f; /* Azul Marino */
  font-family: "Playfair Display", serif;
}

.description {
  font-size: 16px;
  color: #6c757d; /* Gris Oscuro */
  margin-bottom: 20px;
}

/* Lista de cursos */
.course-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* Botón para crear curso */
.create-course-btn {
  display: block;
  margin: 0 auto 20px;
  padding: 10px 20px;
  background-color: #2e8b57; /* Verde Esmeralda */
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-family: "Roboto", sans-serif;
  transition: background-color 0.3s ease;
}

.create-course-btn:hover {
  background-color: #3aa870; /* Verde Esmeralda oscuro */
}

/* Sin cursos */
.no-courses {
  text-align: center;
  font-size: 18px;
  color: #999;
  font-family: "Roboto", sans-serif;
}

/* Adaptación para pantallas pequeñas */
@media (max-width: 768px) {
  .course-list {
    grid-template-columns: 1fr;
  }
}
</style>
