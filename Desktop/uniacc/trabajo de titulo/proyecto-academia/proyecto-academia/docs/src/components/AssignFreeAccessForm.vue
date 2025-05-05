<template>
  <div class="assign-free-access-form">
    <h2>Asignar Acceso Gratuito</h2>
    <p class="description">
      Otorga acceso gratuito a este curso de pago para un estudiante específico.
    </p>

    <div class="form-content">
      <div class="course-info">
        <strong>Curso:</strong> {{ course.title }}
        <div v-if="!course.isFree" class="price-info">
          <span>Precio regular: ${{ formatPrice(course.totalPrice) }}</span>
        </div>
      </div>

      <form @submit.prevent="assignFreeAccess">
        <div class="form-group">
          <label for="student-select">Seleccionar Estudiante</label>
          <div class="select-wrapper">
            <select
              id="student-select"
              v-model="selectedStudentId"
              class="form-control"
              required
            >
              <option value="" disabled selected>Seleccione un estudiante</option>
              <option v-for="student in students" :key="student.id" :value="student.id">
                {{ student.name }} ({{ student.email }})
              </option>
            </select>
            
            <div class="loading-spinner" v-if="isLoadingStudents">
              <span class="spinner"></span>
            </div>
          </div>
          
          <div v-if="!students.length && !isLoadingStudents" class="no-students">
            No hay estudiantes disponibles
          </div>
        </div>

        <div class="form-group">
          <label for="reason">Motivo de la asignación gratuita</label>
          <textarea
            id="reason"
            v-model="reason"
            class="form-control"
            placeholder="Explica el motivo de la asignación gratuita"
            rows="3"
            required
          ></textarea>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click="$emit('cancel')"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting || !selectedStudentId"
          >
            {{ isSubmitting ? "Asignando..." : "Asignar Acceso Gratuito" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AssignFreeAccessForm",
  props: {
    course: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      students: [],
      selectedStudentId: "",
      reason: "",
      errorMessage: "",
      isLoadingStudents: false,
      isSubmitting: false,
    };
  },
  async created() {
    await this.loadStudents();
  },
  methods: {
    formatPrice(price) {
      if (price === undefined || price === null) return '0';
      return Number(price).toLocaleString('es-CL');
    },
    
    async loadStudents() {
      this.isLoadingStudents = true;
      this.errorMessage = "";
      
      try {
        // Obtener todos los estudiantes
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://us-central1-casiangelesydemonios.cloudfunctions.net/api/users/students",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        // Filtrar estudiantes que ya están inscritos
        const enrolledResponse = await axios.get(
          `https://us-central1-casiangelesydemonios.cloudfunctions.net/api/courses/${this.course.id}/enrolled-students`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        const enrolledStudentIds = enrolledResponse.data.map(student => student.id);
        
        // Mostrar solo estudiantes que no están inscritos aún
        this.students = response.data.filter(student => !enrolledStudentIds.includes(student.id));
      } catch (error) {
        this.errorMessage = "Error al cargar la lista de estudiantes";
        console.error("Error loading students:", error);
      } finally {
        this.isLoadingStudents = false;
      }
    },
    
    async assignFreeAccess() {
      if (!this.selectedStudentId) {
        this.errorMessage = "Por favor seleccione un estudiante";
        return;
      }
      
      this.isSubmitting = true;
      this.errorMessage = "";
      
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `https://us-central1-casiangelesydemonios.cloudfunctions.net/api/courses/${this.course.id}/assign-free-access`,
          {
            userId: this.selectedStudentId,
            reason: this.reason
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        this.$emit("success", {
          courseId: this.course.id,
          studentId: this.selectedStudentId
        });
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 
                           "Error al asignar acceso gratuito";
        console.error("Error assigning free access:", error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.assign-free-access-form {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

h2 {
  color: #2A3B5F;
  font-size: 20px;
  margin-bottom: 10px;
  text-align: center;
  font-family: "Playfair Display", serif;
}

.description {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
}

.form-content {
  margin-top: 20px;
}

.course-info {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 14px;
}

.price-info {
  margin-top: 5px;
  font-size: 12px;
  color: #6c757d;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #495057;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

textarea.form-control {
  resize: vertical;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin: 10px 0;
  padding: 8px;
  background-color: #f8d7da;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #2E8B57;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #3AA870;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.select-wrapper {
  position: relative;
}

.loading-spinner {
  position: absolute;
  right: 10px;
  top: 10px;
}

.spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: #2E8B57;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.no-students {
  padding: 8px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 14px;
  color: #6c757d;
  text-align: center;
}
</style>
