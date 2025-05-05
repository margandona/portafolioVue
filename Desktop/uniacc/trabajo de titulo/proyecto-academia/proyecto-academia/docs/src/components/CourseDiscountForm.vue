<template>
  <div class="discount-form">
    <h2>Gestionar Descuento</h2>
    <p class="course-title">{{ course.title }}</p>
    
    <!-- Current discount information -->
    <div v-if="course.discount > 0" class="current-discount">
      <h3>Descuento actual</h3>
      <div class="discount-info">
        <p><strong>Descuento:</strong> {{ course.discount }}%</p>
        <p><strong>Tipo:</strong> {{ getDiscountTypeName(course.discountType) }}</p>
        <p v-if="course.discountName"><strong>Nombre:</strong> {{ course.discountName }}</p>
        <p v-if="course.discountStartDate"><strong>Inicia:</strong> {{ formatDate(course.discountStartDate) }}</p>
        <p v-if="course.discountEndDate"><strong>Termina:</strong> {{ formatDate(course.discountEndDate) }}</p>
        
        <div class="price-preview">
          <p><strong>Precio original:</strong> ${{ formatPrice(course.totalPrice) }}</p>
          <p><strong>Precio con descuento:</strong> ${{ formatPrice(course.discountedTotalPrice) }}</p>
        </div>
        
        <div v-if="course.hasActiveDiscount" class="discount-active">
          <div class="status-badge active">Activo</div>
        </div>
        <div v-else class="discount-inactive">
          <div class="status-badge inactive">Inactivo</div>
          <p class="status-message">
            {{ getInactiveReason() }}
          </p>
        </div>
      </div>
      
      <div class="form-actions current-actions">
        <button class="btn btn-danger" @click="removeDiscount">
          Eliminar Descuento
        </button>
        <button class="btn btn-secondary" @click="editMode = true">
          Editar Descuento
        </button>
      </div>
    </div>
    
    <div v-if="!course.discount || editMode" class="new-discount-form">
      <h3>{{ editMode ? 'Editar descuento' : 'Nuevo descuento' }}</h3>
      <form @submit.prevent="applyDiscount">
        <div class="form-group">
          <label for="discount">Porcentaje de Descuento (%)</label>
          <input
            id="discount"
            type="number"
            class="form-control"
            v-model.number="discountForm.discount"
            min="1"
            max="100"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="discountType">Tipo de Descuento</label>
          <select
            id="discountType"
            class="form-control"
            v-model="discountForm.discountType"
            required
          >
            <option value="manual">Manual</option>
            <option value="campaign">Campaña</option>
            <option value="global">Global</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="discountName">Nombre del Descuento</label>
          <input
            id="discountName"
            type="text"
            class="form-control"
            v-model="discountForm.discountName"
            placeholder="Ej: Descuento por lanzamiento"
          />
        </div>
        
        <div class="form-row">
          <div class="form-group col">
            <label for="discountStartDate">Fecha de Inicio</label>
            <input
              id="discountStartDate"
              type="date"
              class="form-control"
              v-model="discountForm.discountStartDate"
            />
          </div>
          <div class="form-group col">
            <label for="discountEndDate">Fecha de Fin</label>
            <input
              id="discountEndDate"
              type="date"
              class="form-control"
              v-model="discountForm.discountEndDate"
            />
          </div>
        </div>
        
        <div class="price-preview">
          <h4>Vista Previa del Precio</h4>
          <p>Precio original: ${{ formatPrice(course.netPrice * 1.19) }}</p>
          <p>Precio con descuento: ${{ calculateDiscountedPrice() }}</p>
          <p>Ahorro: ${{ calculateSaving() }}</p>
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <div class="form-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click="cancelEdit"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Guardando...' : 'Aplicar Descuento' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api';

export default {
  name: "CourseDiscountForm",
  props: {
    course: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      editMode: false,
      isSubmitting: false,
      errorMessage: '',
      discountForm: {
        discount: this.course.discount || 10,
        discountType: this.course.discountType || 'manual',
        discountName: this.course.discountName || '',
        discountStartDate: this.formatDateForInput(this.course.discountStartDate) || this.formatDateForInput(new Date()),
        discountEndDate: this.formatDateForInput(this.course.discountEndDate) || this.formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // +30 days
      }
    };
  },
  methods: {
    formatPrice(price) {
      if (price === undefined || price === null) return '0';
      return Number(price).toLocaleString('es-CL');
    },
    
    formatDate(date) {
      if (!date) return "No especificado";
      
      if (typeof date === 'object' && date.toDate) {
        // Handle Firestore Timestamp
        date = date.toDate();
      } else if (typeof date === 'string') {
        date = new Date(date);
      }
      
      return new Date(date).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    formatDateForInput(date) {
      if (!date) return '';
      
      if (typeof date === 'object' && date.toDate) {
        // Handle Firestore Timestamp
        date = date.toDate();
      } else if (typeof date === 'string') {
        date = new Date(date);
      }
      
      const d = new Date(date);
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${d.getFullYear()}-${month}-${day}`;
    },
    
    getDiscountTypeName(type) {
      const types = {
        'manual': 'Manual',
        'campaign': 'Campaña',
        'global': 'Global'
      };
      return types[type] || type;
    },
    
    getInactiveReason() {
      if (!this.course.discount || this.course.discount <= 0) {
        return 'No hay descuento aplicado';
      }
      
      if (this.course.discountStartDate && this.course.discountEndDate) {
        const now = new Date();
        const startDate = new Date(this.course.discountStartDate);
        const endDate = new Date(this.course.discountEndDate);
        
        if (now < startDate) {
          return `El descuento comenzará el ${this.formatDate(startDate)}`;
        }
        
        if (now > endDate) {
          return `El descuento finalizó el ${this.formatDate(endDate)}`;
        }
      }
      
      return 'Descuento inactivo por razones desconocidas';
    },
    
    calculateDiscountedPrice() {
      if (!this.course.netPrice) return '0';
      
      const discount = this.discountForm.discount || 0;
      const discountMultiplier = (100 - discount) / 100;
      const discountedNetPrice = this.course.netPrice * discountMultiplier;
      const totalWithTax = discountedNetPrice * 1.19; // Include IVA
      
      return this.formatPrice(Math.round(totalWithTax));
    },
    
    calculateSaving() {
      if (!this.course.netPrice) return '0';
      
      const originalPrice = this.course.netPrice * 1.19;
      const discount = this.discountForm.discount || 0;
      const discountMultiplier = (100 - discount) / 100;
      const discountedNetPrice = this.course.netPrice * discountMultiplier;
      const discountedTotal = discountedNetPrice * 1.19;
      
      return this.formatPrice(Math.round(originalPrice - discountedTotal));
    },
    
    cancelEdit() {
      if (this.editMode) {
        this.editMode = false;
        // Reset form to current course values
        this.discountForm = {
          discount: this.course.discount || 10,
          discountType: this.course.discountType || 'manual',
          discountName: this.course.discountName || '',
          discountStartDate: this.formatDateForInput(this.course.discountStartDate),
          discountEndDate: this.formatDateForInput(this.course.discountEndDate)
        };
      } else {
        this.$emit('cancel');
      }
    },
    
    async applyDiscount() {
      this.errorMessage = '';
      
      // Basic validations
      if (!this.discountForm.discount || this.discountForm.discount <= 0 || this.discountForm.discount > 100) {
        this.errorMessage = 'El descuento debe estar entre 1% y 100%';
        return;
      }
      
      if (this.discountForm.discountStartDate && this.discountForm.discountEndDate) {
        const start = new Date(this.discountForm.discountStartDate);
        const end = new Date(this.discountForm.discountEndDate);
        
        if (end < start) {
          this.errorMessage = 'La fecha de fin debe ser posterior a la fecha de inicio';
          return;
        }
      }
      
      try {
        this.isSubmitting = true;
        
        const response = await api.courses.applyDiscount(this.course.id, {
          discount: this.discountForm.discount,
          discountType: this.discountForm.discountType,
          discountName: this.discountForm.discountName,
          discountStartDate: this.discountForm.discountStartDate,
          discountEndDate: this.discountForm.discountEndDate
        });
        
        this.$emit('success', response.data);
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Error al aplicar el descuento';
        console.error('Error applying discount:', error);
      } finally {
        this.isSubmitting = false;
      }
    },
    
    async removeDiscount() {
      if (!confirm("¿Estás seguro de eliminar este descuento?")) {
        return;
      }
      
      try {
        this.isSubmitting = true;
        
        const response = await api.courses.removeDiscount(this.course.id);
        
        this.$emit('success', response.data);
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Error al eliminar el descuento';
        console.error('Error removing discount:', error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.discount-form {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  color: #2A3B5F;
  font-size: 24px;
  margin-bottom: 16px;
  text-align: center;
}

.course-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.current-discount {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

h3 {
  font-size: 18px;
  color: #2A3B5F;
  margin-bottom: 16px;
}

.discount-info p {
  margin: 8px 0;
}

.price-preview {
  background-color: #e9f7ef;
  border-radius: 6px;
  padding: 12px;
  margin: 16px 0;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 8px;
  border-radius: 4px;
  margin: 16px 0;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.btn {
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #2E8B57;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #3aa870;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-row {
  display: flex;
  margin-left: -8px;
  margin-right: -8px;
}

.col {
  padding: 0 8px;
  flex: 1;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  margin-top: 8px;
}

.active {
  background-color: #28a745;
  color: white;
}

.inactive {
  background-color: #dc3545;
  color: white;
}

.status-message {
  font-size: 14px;
  font-style: italic;
  margin-top: 8px;
  color: #6c757d;
}

h4 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #2A3B5F;
}

.current-actions {
  margin-top: 16px;
}
</style>
