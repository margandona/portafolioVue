<template>
  <div class="student-list-modal" v-if="show" role="dialog" aria-labelledby="modal-title" aria-describedby="modal-description">
    <div class="modal-overlay" @click="closeModal"></div>
    <div class="modal-content">
      <header class="modal-header">
        <h2 id="modal-title">Estudiantes Inscritos en {{ courseTitle }}</h2>
        <button class="close-button" @click="closeModal" aria-label="Cerrar modal">&times;</button>
      </header>
      <main class="modal-body" id="modal-description">
        <!-- Tabla de Estudiantes -->
        <table class="students-table" v-if="students.length > 0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Progreso</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.id">
              <td>{{ student.name }}</td>
              <td>{{ student.email }}</td>
              <td>{{ student.progress }}%</td>
            </tr>
          </tbody>
        </table>
        <p v-else>No hay estudiantes inscritos en este curso.</p>
        <!-- Mensaje de error -->
        <p v-if="error" class="error-message">{{ error }}</p>
      </main>
      <footer class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">Cerrar</button>
      </footer>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "StudentListModal",
  props: {
    courseId: {
      type: Number,
      required: true,
    },
    courseTitle: {
      type: String,
      required: false,
      default: "Curso",
    },
    show: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      students: [],
      error: null,
    };
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.loadStudents();
      }
    },
  },
  methods: {
    async loadStudents() {
      try {
        this.error = null; // Limpiar errores previos
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/courses/${this.courseId}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.students = response.data || [];
      } catch (error) {
        console.error("Error al cargar estudiantes:", error.response?.data || error.message);
        this.error = "No se pudieron cargar los estudiantes. Inténtalo nuevamente.";
      }
    },
    closeModal() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.student-list-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  margin-bottom: 15px;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: bold;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
}

.modal-body {
  max-height: 300px;
  overflow-y: auto;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
}

.students-table th,
.students-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.students-table th {
  background-color: #2e8b57;
  color: white;
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 15px;
}

.modal-footer {
  text-align: right;
  margin-top: 15px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}
</style>
