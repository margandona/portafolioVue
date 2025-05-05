<template>
  <div class="enroll-container">
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Cargando curso...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <h2>Error</h2>
      <p>{{ error }}</p>
      <button class="btn btn-secondary" @click="$router.push('/courses')">
        Volver a cursos
      </button>
    </div>
    
    <div v-else class="enroll-content">
      <h1>Inscripción en Curso</h1>
      
      <div class="course-details">
        <h2>{{ course.title }}</h2>
        <p class="course-description">{{ course.description }}</p>
        
        <div class="course-meta">
          <div class="meta-item">
            <i class="fas fa-tag"></i>
            <span>{{ course.category }}</span>
          </div>
          <div class="meta-item">
            <i class="fas fa-user-tie"></i>
            <span>{{ course.teacher?.name || 'Profesor no especificado' }}</span>
          </div>
          <div class="meta-item">
            <i class="fas fa-clock"></i>
            <span v-if="course.modality === 'synchronized'">
              Curso sincronizado ({{ formatDate(course.start_date) }} - {{ formatDate(course.end_date) }})
            </span>
            <span v-else>
              Curso asincrónico ({{ course.duration_days }} días)
            </span>
          </div>
        </div>
        
        <div class="enrollment-type">
          <div v-if="course.isFree" class="free-course">
            <i class="fas fa-gift"></i>
            <span>Curso Gratuito</span>
          </div>
          <div v-else class="paid-course">
            <div v-if="course.hasActiveDiscount" class="course-price discounted">
              <span class="original-price">${{ formatPrice(course.totalPrice) }}</span>
              <span class="discount-badge">{{ course.discount }}% OFF</span>
              <span class="final-price">${{ formatPrice(course.discountedTotalPrice) }}</span>
            </div>
            <div v-else class="course-price">
              <span class="final-price">${{ formatPrice(course.totalPrice) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="enrollment-options">
        <div class="confirmation-message">
          <template v-if="course.isFree">
            <h3>Inscripción Gratuita</h3>
            <p>Este curso es completamente gratuito. Al inscribirte tendrás acceso inmediato a todo el contenido.</p>
          </template>
          <template v-else>
            <h3>Curso de Pago</h3>
            <p>Este curso requiere un pago para poder inscribirte y acceder al contenido.</p>
            <p class="price-note">
              <template v-if="course.hasActiveDiscount">
                ¡Aprovecha el descuento de {{ course.discount }}%! 
                Precio final: <strong>${{ formatPrice(course.discountedTotalPrice) }}</strong>
              </template>
              <template v-else>
                Precio: <strong>${{ formatPrice(course.totalPrice) }}</strong> (IVA incluido)
              </template>
            </p>
          </template>
        </div>
        
        <div class="enroll-actions">
          <button class="btn btn-secondary" @click="$router.push('/courses')">
            Cancelar
          </button>
          <button 
            class="btn btn-primary" 
            @click="confirmEnrollment" 
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="spinner-small"></span>
            {{ isSubmitting ? 'Procesando...' : course.isFree ? 'Inscribirme Ahora' : 'Ir a Pagar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api';
import { formatPrice } from '@/utils/apiHelper';

export default {
  name: 'EnrollView',
  data() {
    return {
      courseId: '',
      course: {},
      isLoading: true,
      isSubmitting: false,
      error: null,
    };
  },
  created() {
    this.courseId = this.$route.params.id;
    this.loadCourse();
  },
  methods: {
    formatPrice,
    
    formatDate(date) {
      if (!date) return 'Fecha no disponible';
      return new Date(date).toLocaleDateString('es-CL');
    },
    
    async loadCourse() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await api.courses.getById(this.courseId);
        this.course = response.data;
      } catch (error) {
        console.error('Error loading course:', error);
        this.error = error.response?.data?.message || 'Error al cargar la información del curso';
      } finally {
        this.isLoading = false;
      }
    },
    
    async confirmEnrollment() {
      this.isSubmitting = true;
      
      try {
        if (this.course.isFree) {
          // Para cursos gratuitos, inscribir directamente
          await api.enrollments.create(this.courseId);
          this.$router.push('/enrolled');
          
          // Mostrar mensaje de éxito
          this.$toast.success('¡Inscripción exitosa! Ya puedes comenzar a aprender.');
        } else {
          // Para cursos de pago, iniciar proceso de compra
          const response = await api.courses.initiatePurchase(this.courseId);
          
          if (response.data.redirectTo) {
            // Redirigir a la página de pago
            this.$router.push(response.data.redirectTo);
          } else if (response.data.saleId) {
            this.$router.push(`/checkout/${response.data.saleId}`);
          } else {
            throw new Error('No se recibió información de pago');
          }
        }
      } catch (error) {
        console.error('Error enrolling in course:', error);
        this.error = error.response?.data?.message || 'Error al procesar la inscripción';
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.enroll-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 20px;
}

h1 {
  font-family: "Playfair Display", serif;
  color: #2A3B5F;
  text-align: center;
  margin-bottom: 30px;
}

.loading, .error {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #2E8B57;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.course-details {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 25px;
  margin-bottom: 30px;
}

.course-details h2 {
  font-family: "Playfair Display", serif;
  color: #2A3B5F;
  margin-bottom: 15px;
}

.course-description {
  color: #555;
  margin-bottom: 20px;
  line-height: 1.5;
}

.course-meta {
  margin-bottom: 20px;
  padding: 15px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.meta-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.meta-item i {
  color: #2E8B57;
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.enrollment-type {
  text-align: center;
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.free-course {
  color: #2E8B57;
  font-weight: 600;
  font-size: 20px;
}

.free-course i {
  margin-right: 8px;
}

.paid-course .course-price {
  font-size: 24px;
  font-weight: bold;
}

.original-price {
  text-decoration: line-through;
  color: #6c757d;
  font-size: 16px;
  margin-right: 10px;
}

.discount-badge {
  background-color: #fd7e14;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  margin: 0 10px;
  vertical-align: middle;
}

.final-price {
  color: #2E8B57;
}

.enrollment-options {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 25px;
}

.confirmation-message {
  margin-bottom: 30px;
}

.confirmation-message h3 {
  font-family: "Playfair Display", serif;
  color: #2A3B5F;
  margin-bottom: 15px;
}

.price-note {
  font-size: 18px;
  margin-top: 15px;
}

.enroll-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.btn {
  padding: 12px 25px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
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
</style>
