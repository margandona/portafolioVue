<template>
  <div class="enrollment-list">
    <h1>Gestión de Inscripciones</h1>

    <!-- Indicador de Carga -->
    <div v-if="isLoading" class="loading-spinner">Cargando...</div>

    <!-- Búsqueda de estudiantes -->
    <div class="search-container">
      <label for="search">Buscar Estudiante</label>
      <input
        id="search"
        type="text"
        v-model="searchQuery"
        placeholder="ID o correo electrónico"
      />
      <button
        class="btn btn-primary"
        @click="searchStudent"
        :disabled="isLoading || !searchQuery"
      >
        Buscar
      </button>
    </div>

    <!-- Lista de inscripciones -->
    <div v-if="enrollments.length > 0" class="enrollment-table">
      <table>
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Correo</th>
            <th>Curso</th>
            <th>Progreso</th>
            <th v-if="userRole === 'admin'">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="enrollment in enrollments" :key="enrollment.id">
            <td>{{ enrollment.User?.name || "Datos del usuario no disponibles" }}</td>
            <td>{{ enrollment.User?.email || "Correo no disponible" }}</td>
            <td>{{ enrollment.Course?.title || "Curso no disponible" }}</td>
            <td>
              {{ enrollment.progress !== undefined ? enrollment.progress + "%" : "No disponible" }}
            </td>
            <td v-if="userRole === 'admin'">
              <button
                class="btn btn-danger"
                @click="deleteEnrollment(enrollment.id)"
                :disabled="isLoading"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mensaje cuando no hay inscripciones -->
    <p v-if="!isLoading && enrollments.length === 0">No se encontraron inscripciones.</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "EnrollmentListView",
  data() {
    return {
      enrollments: [], // Lista de inscripciones
      searchQuery: "", // Búsqueda por ID o correo electrónico
      userRole: null, // Rol del usuario autenticado
      isLoading: false, // Indicador de carga
    };
  },
  async created() {
    this.getRole();
    await this.loadEnrollments();
  },
  methods: {
    // Cargar todas las inscripciones
    async loadEnrollments() {
      this.isLoading = true;
      try {
        const response = await axios.get("/api/enrollments", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.enrollments = response.data || [];
      } catch (error) {
        console.error(
          "Error al cargar las inscripciones:",
          error.response?.data || error.message
        );
        this.enrollments = [];
      } finally {
        this.isLoading = false;
      }
    },
    // Buscar estudiante por ID o correo electrónico
    async searchStudent() {
      if (!this.searchQuery) {
        alert("Por favor, ingrese un ID o correo electrónico para buscar.");
        return;
      }
      this.isLoading = true;
      try {
        const response = await axios.get("/api/enrollments/students", {
          params: {
            id: isNaN(this.searchQuery) ? null : this.searchQuery,
            email: isNaN(this.searchQuery) ? this.searchQuery : null,
          },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.enrollments = response.data?.enrollments || [];
        if (this.enrollments.length === 0) {
          alert("No se encontraron resultados para la búsqueda.");
        }
      } catch (error) {
        console.error("Error al buscar estudiante:", error.response?.data || error.message);
        alert("No se pudo encontrar al estudiante.");
      } finally {
        this.isLoading = false;
      }
    },
    // Eliminar una inscripción
    async deleteEnrollment(id) {
      if (!confirm("¿Está seguro de que desea eliminar esta inscripción?")) {
        return;
      }
      this.isLoading = true;
      try {
        await axios.delete(`/api/enrollments/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.enrollments = this.enrollments.filter((enrollment) => enrollment.id !== id);
        alert("Inscripción eliminada exitosamente.");
      } catch (error) {
        console.error("Error al eliminar inscripción:", error.response?.data || error.message);
        alert("No se pudo eliminar la inscripción.");
      } finally {
        this.isLoading = false;
      }
    },
    // Obtener el rol del usuario autenticado
    getRole() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          this.userRole = payload.role || null;
        } catch (error) {
          console.error("Error al decodificar el token:", error);
        }
      }
    },
  },
};
</script>

<style scoped>
/* Estilos existentes */
.enrollment-list {
  padding: 20px;
  max-width: 900px;
  margin: auto;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  font-family: "Playfair Display", serif;
  color: #2a3b5f;
  margin-bottom: 20px;
}

.search-container {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-container input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.search-container button {
  padding: 10px 20px;
  background-color: #2e8b57;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.search-container button:hover {
  background-color: #3aa870;
}

.enrollment-table {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
}

table th,
table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

table th {
  background-color: #2e8b57;
  color: white;
}

table tr:hover {
  background-color: #f1f1f1;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger:hover {
  background-color: #c82333;
}

.loading-spinner {
  text-align: center;
  margin: 10px 0;
  font-size: 18px;
  color: #2e8b57;
}
</style>
