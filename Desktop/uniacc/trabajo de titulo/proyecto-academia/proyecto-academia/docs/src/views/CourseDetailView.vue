<template>
  <div class="course-detail-page">
    <BackToDashboardButton class="back-btn" />
    
    <!-- Loading spinner -->
    <div v-if="isLoading" class="loading-spinner">
      <p>Cargando detalles del curso...</p>
    </div>
    
    <!-- Error message -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="loadCourse">Reintentar</button>
    </div>
    
    <!-- Course details -->
    <div v-else>
      <div class="course-header">
        <h1 class="course-title">{{ course.title }}</h1>
        
        <!-- Course tags -->
        <div class="course-tags">
          <span v-if="course.isFree" class="tag tag-free">Gratis</span>
          <span v-else-if="course.hasActiveDiscount" class="tag tag-discount">
            {{ course.discount }}% OFF
          </span>
        </div>
      </div>
      
      <p class="course-description">{{ course.description }}</p>
      
      <!-- Course metadata -->
      <div class="metadata-container">
        <div class="course-metadata">
          <p><strong>Categoría:</strong> {{ course.category }}</p>
          <p><strong>Modalidad:</strong> {{ course.modality === 'synchronized' ? 'Sincronizada' : 'Asincrónica' }}</p>
          <p v-if="course.modality === 'synchronized'">
            <strong>Inicio:</strong> {{ formatDate(course.start_date) }} <br />
            <strong>Fin:</strong> {{ formatDate(course.end_date) }}
          </p>
          <p v-if="course.modality === 'asynchronized'">
            <strong>Duración:</strong> {{ course.duration_days }} días
          </p>
          <p><strong>Profesor:</strong> {{ course.teacher?.name || 'No disponible' }}</p>
        </div>
        
        <!-- Pricing information -->
        <div class="course-price-card" v-if="!course.isFree">
          <h3>Precio del curso</h3>
          <div v-if="course.hasActiveDiscount" class="price-with-discount">
            <span class="original-price">${{ formatPrice(course.totalPrice) }}</span>
            <span class="current-price">${{ formatPrice(course.discountedTotalPrice) }}</span>
            <span class="discount-tag">{{ course.discount }}% OFF</span>
            <div class="discount-info" v-if="course.discountName">
              <span>{{ course.discountName }}</span>
              <span v-if="course.discountEndDate" class="discount-expiry">
                Vence: {{ formatDate(course.discountEndDate) }}
              </span>
            </div>
          </div>
          <div v-else class="price-regular">
            <span class="current-price">${{ formatPrice(course.totalPrice) }}</span>
          </div>
          
          <!-- Purchase button for students -->
          <div v-if="userRole === 'student'" class="purchase-actions">
            <button 
              v-if="!course.purchased && !course.hasPendingSale" 
              class="btn btn-primary btn-purchase"
              @click="purchaseCourse"
            >
              Comprar Ahora
            </button>
            <button 
              v-else-if="!course.purchased && course.hasPendingSale"
              class="btn btn-warning"
              @click="goToCheckout(course.pendingSaleId)"
            >
              Continuar Compra
            </button>
            <span v-else class="purchased-badge">Ya tienes acceso a este curso</span>
          </div>
        </div>
        <div class="course-price-card free" v-else>
          <h3>Curso gratuito</h3>
          <div class="free-course-info">
            <p>Este curso es completamente gratuito.</p>
            <button 
              v-if="userRole === 'student' && !enrollment" 
              class="btn btn-success btn-enroll"
              @click="enrollInCourse"
            >
              Inscribirme Ahora
            </button>
          </div>
        </div>
      </div>

      <!-- Progreso del usuario -->
      <div v-if="enrollment" class="enrollment-info">
        <h3>Tu Progreso</h3>
        <ProgressBar :progress="enrollment.progress" />
        <p>{{ enrollment.progress }}% completado</p>
      </div>

      <!-- Evaluaciones -->
      <div v-if="evaluations.length > 0" class="evaluations-section">
        <h3>Evaluaciones</h3>
        <ul class="evaluation-list">
          <li v-for="evaluation in evaluations" :key="evaluation.id">
            <p><strong>{{ evaluation.title }}</strong></p>
            <button
              v-if="!completedEvaluations.includes(evaluation.id)"
              class="btn btn-primary"
              @click="startEvaluation(evaluation.id)"
            >
              Comenzar Evaluación
            </button>
            <span v-else class="completed-label">Completado</span>
          </li>
        </ul>
      </div>
      <p v-else-if="enrollment">No hay evaluaciones disponibles para este curso.</p>

      <!-- Teacher/Admin actions -->
      <div v-if="isTeacherOrAdmin" class="admin-actions">
        <h3>Acciones de administración</h3>
        
        <!-- Assign free access button -->
        <button
          v-if="!course.isFree"
          class="btn btn-secondary"
          @click="showAssignAccessForm = true"
        >
          <i class="fas fa-user-plus"></i> Asignar Acceso Gratuito
        </button>
        
        <!-- Apply discount button -->
        <button
          v-if="!course.isFree"
          class="btn btn-info"
          @click="showDiscountForm = true"
        >
          <i class="fas fa-tags"></i> Gestionar Descuento
        </button>
        
        <!-- Edit course button -->
        <button
          class="btn btn-primary"
          @click="editCourse"
        >
          <i class="fas fa-edit"></i> Editar Curso
        </button>
        
        <!-- Students' access -->
        <div class="students-access">
          <h4>Estudiantes inscritos</h4>
          <div v-if="enrolledStudents.length > 0" class="enrolled-list">
            <table class="students-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Progreso</th>
                  <th>Tipo de acceso</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in enrolledStudents" :key="student.id">
                  <td>{{ student.name }}</td>
                  <td>{{ student.email }}</td>
                  <td>{{ student.progress || 0 }}%</td>
                  <td>
                    <span :class="['access-type', student.enrollmentType]">
                      {{ getEnrollmentTypeLabel(student.enrollmentType) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else>No hay estudiantes inscritos en este curso.</p>
        </div>
      </div>
      
      <!-- Modal for free access -->
      <div v-if="showAssignAccessForm" class="modal-overlay">
        <div class="modal-container">
          <AssignFreeAccessForm 
            :course="course"
            @success="handleFreeAccessAssigned"
            @cancel="showAssignAccessForm = false"
          />
        </div>
      </div>
      
      <!-- Modal for discount management -->
      <div v-if="showDiscountForm" class="modal-overlay">
        <div class="modal-container">
          <CourseDiscountForm 
            :course="course"
            @success="handleDiscountUpdated"
            @cancel="showDiscountForm = false"
          />
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn btn-secondary" @click="goBack">Volver a Mis Cursos</button>
        <button
          v-if="isTeacherOrAdmin"
          class="btn btn-danger"
          @click="deleteCourse"
        >
          Eliminar Curso
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ProgressBar from "@/components/ProgressBarComponent.vue";
import BackToDashboardButton from "@/components/BackToDashboardButton.vue";
import AssignFreeAccessForm from "@/components/AssignFreeAccessForm.vue";
import CourseDiscountForm from "@/components/CourseDiscountForm.vue";

export default {
  name: "CourseDetailView",
  components: {
    ProgressBar,
    BackToDashboardButton,
    AssignFreeAccessForm,
    CourseDiscountForm
  },
  data() {
    return {
      course: {},
      enrollment: null,
      evaluations: [],
      completedEvaluations: [],
      enrolledStudents: [],
      isTeacherOrAdmin: false,
      userRole: "",
      userId: "",
      isLoading: true,
      error: null,
      showAssignAccessForm: false,
      showDiscountForm: false
    };
  },
  async created() {
    this.loadUserData();
    await this.loadCourse();
  },
  methods: {
    loadUserData() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          this.userRole = payload.role || "";
          this.userId = payload.id || "";
          this.isTeacherOrAdmin = ['admin', 'teacher'].includes(this.userRole);
        } catch (error) {
          console.error("Error parsing token:", error);
        }
      }
    },
    async loadCourse() {
      const courseId = this.$route.params.id;
      const token = localStorage.getItem("token");
      if (!token) {
        this.error = "No estás autenticado.";
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      this.isLoading = true;
      this.error = null;

      try {
        // Load course details, enrollments, and evaluations in parallel
        const [courseResponse, enrollmentsResponse, evaluationsResponse] = await Promise.all([
          axios.get(`https://us-central1-casiangelesydemonios.cloudfunctions.net/api/courses/${courseId}`, { headers }),
          axios.get(`https://us-central1-casiangelesydemonios.cloudfunctions.net/api/enrollments`, { headers }),
          axios.get(`https://us-central1-casiangelesydemonios.cloudfunctions.net/api/evaluations/course/${courseId}`, { headers }),
        ]);

        this.course = courseResponse.data;
        
        // Check if user is enrolled
        if (enrollmentsResponse.data) {
          this.enrollment = enrollmentsResponse.data.find(
            (e) => e.courseId === courseId && e.userId === this.userId
          );
        }
        
        this.evaluations = evaluationsResponse.data?.data || [];
        this.completedEvaluations = this.enrollment?.completedEvaluations || [];

        // Load enrolled students if teacher or admin
        if (this.isTeacherOrAdmin) {
          try {
            const enrolledResponse = await axios.get(
              `https://us-central1-casiangelesydemonios.cloudfunctions.net/api/courses/${courseId}/enrolled-students`,
              { headers }
            );
            this.enrolledStudents = enrolledResponse.data || [];
          } catch (error) {
            console.error("Error loading enrolled students:", error);
          }
        }
      } catch (error) {
        console.error("Error loading course details:", error);
        this.error = error.response?.data?.message || "Error al cargar el curso.";
      } finally {
        this.isLoading = false;
      }
    },
    formatDate(date) {
      if (!date) return "Fecha no disponible";
      return new Date(date).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    formatPrice(price) {
      if (price === undefined || price === null) return '0';
      return Number(price).toLocaleString('es-CL');
    },
    goBack() {
      this.$router.push("/courses");
    },
    editCourse() {
      this.$router.push(`/courses/edit/${this.course.id}`);
    },
    async deleteCourse() {
      if (!confirm("¿Estás seguro de eliminar este curso? Esta acción no se puede deshacer.")) {
        return;
      }
      
      try {
        await axios.delete(`https://us-central1-casiangelesydemonios.cloudfunctions.net/api/courses/${this.course.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        alert("Curso eliminado exitosamente.");
        this.$router.push("/courses");
      } catch (error) {
        alert("No se pudo eliminar el curso: " + (error.response?.data?.message || error.message));
      }
    },
    startEvaluation(evaluationId) {
      this.$router.push(`/evaluations/${evaluationId}`);
    },
    async enrollInCourse() {
      if (!confirm(`¿Deseas inscribirte en "${this.course.title}"?`)) return;
      
      try {
        await axios.post(
          `https://us-central1-casiangelesydemonios.cloudfunctions.net/api/enrollments`,
          { courseId: this.course.id },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        
        alert("¡Te has inscrito exitosamente en el curso!");
        this.loadCourse(); // Reload to update enrollment status
      } catch (error) {
        alert("Error al inscribirse: " + (error.response?.data?.message || error.message));
      }
    },
    async purchaseCourse() {
      try {
        const response = await axios.post(
          `https://us-central1-casiangelesydemonios.cloudfunctions.net/api/courses/${this.course.id}/purchase`,
          {},
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        
        if (response.data.redirectTo) {
          this.$router.push(response.data.redirectTo);
        } else if (response.data.saleId) {
          this.goToCheckout(response.data.saleId);
        }
      } catch (error) {
        alert("Error al iniciar la compra: " + (error.response?.data?.message || error.message));
      }
    },
    goToCheckout(saleId) {
      this.$router.push(`/checkout/${saleId}`);
    },
    getEnrollmentTypeLabel(type) {
      const labels = {
        free: 'Gratuito',
        paid: 'Comprado',
        assigned: 'Asignado'
      };
      return labels[type] || type;
    },
    handleFreeAccessAssigned() {
      this.showAssignAccessForm = false;
      alert("Se ha asignado acceso gratuito exitosamente");
      this.loadCourse(); // Reload course data to update students list
    },
    handleDiscountUpdated() {
      this.showDiscountForm = false;
      alert("El descuento ha sido actualizado exitosamente");
      this.loadCourse(); // Reload course data to update discount info
    }
  },
};
</script>

<style scoped>
.course-detail-page {
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  margin: 0 auto;
}

.back-btn {
  margin-bottom: 20px;
}

.course-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.course-title {
  font-family: "Playfair Display", serif;
  font-size: 28px;
  color: #2a3b5f;
  flex: 1;
  margin: 0;
}

.course-tags {
  display: flex;
  gap: 10px;
}

.tag {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: bold;
}

.tag-free {
  background-color: #28a745;
  color: white;
}

.tag-discount {
  background-color: #fd7e14;
  color: white;
}

.course-description {
  font-size: 16px;
  line-height: 1.6;
  color: #555;
  margin-bottom: 20px;
}

.metadata-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
}

.course-metadata {
  flex: 1;
  min-width: 300px;
}

.course-price-card {
  width: 280px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.course-price-card h3 {
  font-size: 18px;
  color: #2a3b5f;
  margin-top: 0;
  margin-bottom: 15px;
}

.price-with-discount {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.original-price {
  text-decoration: line-through;
  color: #6c757d;
  font-size: 16px;
}

.current-price {
  font-size: 24px;
  font-weight: bold;
  color: #2e8b57;
  margin: 5px 0;
}

.discount-tag {
  background-color: #fd7e14;
  color: white;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
}

.discount-info {
  text-align: center;
  font-size: 12px;
  color: #6c757d;
  margin-top: 5px;
}

.discount-expiry {
  display: block;
  margin-top: 5px;
  font-style: italic;
}

.purchase-actions {
  margin-top: 20px;
  text-align: center;
}

.btn-purchase {
  width: 100%;
  padding: 10px;
}

.purchased-badge {
  display: block;
  text-align: center;
  color: #28a745;
  font-weight: bold;
  margin-top: 10px;
}

.course-price-card.free {
  background-color: #e8f4ea;
}

.free-course-info {
  text-align: center;
}

.free-course-info p {
  margin-bottom: 15px;
  color: #28a745;
  font-weight: bold;
}

.btn-enroll {
  width: 100%;
  background-color: #28a745;
}

.btn-enroll:hover {
  background-color: #218838;
}

.enrollment-info {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.evaluations-section {
  margin: 20px 0;
}

.evaluation-list {
  list-style-type: none;
  padding: 0;
}

.evaluation-list li {
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #e9ecef;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.completed-label {
  color: #28a745;
  font-weight: bold;
}

.admin-actions {
  margin: 30px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.admin-actions h3 {
  margin-top: 0;
  color: #2a3b5f;
  margin-bottom: 15px;
}

.admin-actions button {
  margin-right: 10px;
  margin-bottom: 10px;
}

.students-access {
  margin-top: 20px;
}

.students-access h4 {
  margin-bottom: 15px;
  color: #2a3b5f;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
}

.students-table th,
.students-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.students-table th {
  background-color: #2e8b57;
  color: white;
}

.access-type {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.access-type.free {
  background-color: #28a745;
  color: white;
}

.access-type.paid {
  background-color: #0d6efd;
  color: white;
}

.access-type.assigned {
  background-color: #6f42c1;
  color: white;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.loading-spinner, .error-message {
  text-align: center;
  padding: 30px;
}

.error-message {
  color: #dc3545;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
}
</style>
