<template>
  <div class="create-course-page">
    <BackToDashboardButton class="back-btn" />
    <h1 class="page-title">Crear Nuevo Curso</h1>
    <p class="page-description">Llena los campos para registrar un nuevo curso en la plataforma.</p>
    <CourseFormComponent @submit="handleCreateCourse" />
  </div>
</template>

<script>
import CourseFormComponent from "@/components/CourseFormComponent.vue";
import BackToDashboardButton from "@/components/BackToDashboardButton.vue";
import axios from "axios";

export default {
  name: "CreateCourseView",
  components: {
    CourseFormComponent,
    BackToDashboardButton
  },
  data() {
    return {
      userRole: "",
      isLoading: false,
    };
  },
  created() {
    // Verificar autenticación y rol antes de renderizar la vista
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión para acceder a esta página.");
      this.$router.push("/login");
      return;
    }
    
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      this.userRole = payload.role || "";
      
      // Solo permitir a profesores y administradores crear cursos
      if (this.userRole !== "teacher" && this.userRole !== "admin") {
        alert("No tienes permisos para crear cursos.");
        this.$router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error al verificar permisos:", error);
      this.$router.push("/login");
    }
  },
  methods: {
    async handleCreateCourse(course) {
      try {
        this.isLoading = true;
        // Enviar datos del formulario al backend
        await axios.post("https://us-central1-casiangelesydemonios.cloudfunctions.net/api/courses", course, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        alert("Curso creado exitosamente");
        this.$router.push("/courses"); // Redirigir a la lista de cursos
      } catch (error) {
        // Manejar errores
        console.error("Error al crear curso:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          alert("No estás autenticado. Por favor inicia sesión.");
          this.$router.push("/login");
        } else if (error.response?.status === 403) {
          alert("No tienes permisos para crear un curso.");
        } else {
          alert(error.response?.data?.message || "Error al crear curso");
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.create-course-page {
  padding: 20px;
  max-width: 800px;
  margin: auto;
  background-color: #ffffff; /* Fondo blanco */
  border-radius: 12px; /* Bordes redondeados */
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); /* Sombra sutil */
}

.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  color: #2A3B5F; /* Azul Marino */
  text-align: center;
  margin-bottom: 20px;
}

.page-description {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  color: #6c757d; /* Gris oscuro */
  text-align: center;
  margin-bottom: 30px;
}

.back-btn {
  margin-bottom: 20px;
}

/* Estilos adaptativos */
@media (max-width: 768px) {
  .create-course-page {
    padding: 10px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-description {
    font-size: 14px;
  }
}
</style>
