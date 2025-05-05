<template>
  <div class="edit-course-page">
    <BackToDashboardButton class="back-btn" />
    <h1 class="page-title">Editar Curso</h1>
    <p class="page-description">Modifica los datos del curso y guarda los cambios.</p>
    <div v-if="isLoading" class="spinner">Cargando curso...</div>
    <div v-else-if="course">
      <CourseFormComponent
        :initialData="course"
        :isEditMode="true"
        @submit="handleEditCourse"
      />
    </div>
    <div v-else class="error-message">No se pudo cargar el curso.</div>
  </div>
</template>

<script>
import CourseFormComponent from "@/components/CourseFormComponent.vue";
import BackToDashboardButton from "@/components/BackToDashboardButton.vue";
import axios from "axios";

export default {
  name: "EditCourseView",
  components: {
    CourseFormComponent,
    BackToDashboardButton
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      course: null,
      isLoading: false,
      errorMessage: "",
    };
  },
  async created() {
    await this.loadCourse();
  },
  methods: {
    async loadCourse() {
      this.isLoading = true;
      try {
        const response = await axios.get(`https://us-central1-casiangelesydemonios.cloudfunctions.net/api/courses/${this.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.course = response.data;
      } catch (error) {
        console.error("Error al cargar curso:", error.response?.data || error.message);
        this.errorMessage =
          error.response?.data?.message || "Error al cargar el curso.";
        this.$router.push("/courses");
      } finally {
        this.isLoading = false;
      }
    },
    async handleEditCourse(updatedCourse) {
      this.isLoading = true;
      try {
        await axios.put(`https://us-central1-casiangelesydemonios.cloudfunctions.net/api/courses/${this.id}`, updatedCourse, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        alert("Curso actualizado exitosamente");
        this.$router.push("/courses");
      } catch (error) {
        console.error("Error al actualizar curso:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Error al actualizar curso");
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.edit-course-page {
  padding: 20px;
  max-width: 800px;
  margin: auto;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  color: #2A3B5F;
  text-align: center;
  margin-bottom: 10px;
}

.page-description {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  color: #6c757d;
  text-align: center;
  margin-bottom: 20px;
}

.back-btn {
  margin-bottom: 20px;
}

.spinner {
  text-align: center;
  font-size: 18px;
  color: #2e8b57;
  margin: 20px 0;
}

.error-message {
  text-align: center;
  color: #dc3545;
  font-size: 16px;
}
</style>
