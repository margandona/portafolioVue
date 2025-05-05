<template>
  <div class="course-form">
    <h1 class="form-title">{{ isEditMode ? "Editar Curso" : "Crear Curso" }}</h1>
    <form @submit.prevent="handleSubmit">
      <!-- Campos existentes -->
      <div class="form-group">
        <label for="title">Título del Curso</label>
        <input
          id="title"
          type="text"
          class="form-control"
          v-model="course.title"
          placeholder="Introduce el título del curso"
          required
        />
      </div>
      <div class="form-group">
        <label for="description">Descripción</label>
        <textarea
          id="description"
          class="form-control"
          v-model="course.description"
          placeholder="Describe el contenido del curso"
          required
        ></textarea>
      </div>
      <div class="form-group">
        <label for="category">Categoría</label>
        <input
          id="category"
          type="text"
          class="form-control"
          v-model="course.category"
          placeholder="Especifica la categoría del curso"
          required
        />
      </div>
      <div class="form-group">
        <label for="modality">Modalidad</label>
        <select
          id="modality"
          class="form-control"
          v-model="course.modality"
          @change="handleModalityChange"
          required
        >
          <option value="synchronized">Sincronizada</option>
          <option value="asynchronized">Asincrónica</option>
        </select>
      </div>
      
      <!-- Campos específicos de modalidad -->
      <div v-if="course.modality === 'synchronized'" class="form-group">
        <label for="start_date">Fecha de Inicio</label>
        <input
          id="start_date"
          type="date"
          class="form-control"
          v-model="course.start_date"
          required
        />
        <label for="end_date">Fecha de Término</label>
        <input
          id="end_date"
          type="date"
          class="form-control"
          v-model="course.end_date"
          required
        />
      </div>
      <div v-if="course.modality === 'asynchronized'" class="form-group">
        <label for="duration_days">Duración (en días)</label>
        <input
          id="duration_days"
          type="number"
          class="form-control"
          v-model="course.duration_days"
          min="1"
          placeholder="Especifica la duración en días"
          required
        />
      </div>
      
      <!-- Nuevos campos para precios y descuentos -->
      <div class="form-group pricing-section">
        <h3>Configuración de Precio</h3>
        <div class="form-check">
          <input 
            type="checkbox" 
            id="isFree" 
            class="form-check-input" 
            v-model="course.isFree"
            @change="handleFreeToggle" 
          />
          <label for="isFree" class="form-check-label">Curso Gratuito</label>
        </div>
        
        <div v-if="!course.isFree" class="price-fields">
          <div class="form-group">
            <label for="sku">SKU</label>
            <input
              id="sku"
              type="text"
              class="form-control"
              v-model="course.sku"
              placeholder="Código único del producto (SKU)"
              required
            />
            <small class="form-text text-muted">Código único para identificar el curso en ventas</small>
          </div>
          
          <div class="form-group">
            <label for="netPrice">Precio Neto (sin IVA)</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text">$</span>
              </div>
              <input
                id="netPrice"
                type="number"
                class="form-control"
                v-model="course.netPrice"
                min="0"
                placeholder="Precio sin IVA"
                required
              />
            </div>
            <small class="form-text text-muted">
              Precio con IVA: ${{ calculateTotalPrice(course.netPrice) }}
            </small>
          </div>
          
          <!-- Sección de descuentos -->
          <div class="discount-section">
            <h4>Descuento</h4>
            <div class="form-group">
              <label for="discount">Porcentaje de Descuento</label>
              <div class="input-group">
                <input
                  id="discount"
                  type="number"
                  class="form-control"
                  v-model="course.discount"
                  min="0"
                  max="100"
                  placeholder="Porcentaje de descuento"
                />
                <div class="input-group-append">
                  <span class="input-group-text">%</span>
                </div>
              </div>
              <small v-if="course.discount > 0" class="form-text text-success">
                Precio con descuento: ${{ calculateDiscountedPrice(course.netPrice, course.discount) }}
              </small>
            </div>
            
            <div class="form-group" v-if="course.discount > 0">
              <label for="discountType">Tipo de Descuento</label>
              <select
                id="discountType"
                class="form-control"
                v-model="course.discountType"
                required
              >
                <option value="manual">Manual</option>
                <option value="campaign">Campaña</option>
                <option value="global">Global</option>
              </select>
            </div>
            
            <div class="form-group" v-if="course.discount > 0">
              <label for="discountName">Nombre del Descuento</label>
              <input
                id="discountName"
                type="text"
                class="form-control"
                v-model="course.discountName"
                placeholder="Ej: Oferta Especial"
              />
            </div>
            
            <div class="form-row" v-if="course.discount > 0">
              <div class="col">
                <label for="discountStartDate">Fecha de Inicio</label>
                <input
                  id="discountStartDate"
                  type="date"
                  class="form-control"
                  v-model="course.discountStartDate"
                />
              </div>
              <div class="col">
                <label for="discountEndDate">Fecha de Fin</label>
                <input
                  id="discountEndDate"
                  type="date"
                  class="form-control"
                  v-model="course.discountEndDate"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div v-if="isLoading" class="loading-message">Guardando...</div>
      <button
        type="submit"
        class="btn btn-primary submit-button"
        :disabled="isLoading"
      >
        {{ isEditMode ? "Guardar Cambios" : "Crear Curso" }}
      </button>
    </form>
  </div>
</template>

<script>
export default {
  props: {
    initialData: {
      type: Object,
      default: () => ({}),
    },
    isEditMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    // Valores por defecto
    const defaultData = {
      title: "",
      description: "",
      category: "",
      modality: "synchronized",
      duration_days: null,
      start_date: null,
      end_date: null,
      isFree: false,
      sku: "",
      netPrice: 0,
      discount: 0,
      discountType: "manual",
      discountName: "",
      discountStartDate: null,
      discountEndDate: null,
    };

    // Combinar valores por defecto con datos iniciales
    return {
      course: {
        ...defaultData,
        ...this.initialData,
      },
      errorMessage: "",
      isLoading: false,
    };
  },
  methods: {
    handleModalityChange() {
      if (this.course.modality === "synchronized") {
        this.course.duration_days = null;
      } else {
        this.course.start_date = null;
        this.course.end_date = null;
      }
    },
    handleFreeToggle() {
      if (this.course.isFree) {
        // Si se marca como gratuito, guardar el precio anterior y establecerlo a 0
        this._previousPrice = this.course.netPrice;
        this.course.netPrice = 0;
        this.course.discount = 0;
      } else {
        // Si se desmarca, restaurar el precio anterior si existía
        this.course.netPrice = this._previousPrice || 0;
      }
    },
    calculateTotalPrice(netPrice) {
      if (!netPrice) return 0;
      const iva = 0.19; // 19% IVA en Chile
      return Math.round((netPrice * (1 + iva)) * 100) / 100;
    },
    calculateDiscountedPrice(netPrice, discount) {
      if (!netPrice || !discount) return this.calculateTotalPrice(netPrice);
      const discountedNet = netPrice * (1 - discount / 100);
      return this.calculateTotalPrice(discountedNet);
    },
    validateForm() {
      // Validaciones existentes
      if (this.course.modality === "synchronized" && this.course.start_date && this.course.end_date) {
        if (new Date(this.course.start_date) > new Date(this.course.end_date)) {
          this.errorMessage = "La fecha de inicio debe ser anterior o igual a la fecha de término.";
          return false;
        }
      }

      // Validaciones adicionales para precios
      if (!this.course.isFree) {
        if (!this.course.sku) {
          this.errorMessage = "El SKU es obligatorio para cursos de pago.";
          return false;
        }
        
        if (this.course.netPrice < 0) {
          this.errorMessage = "El precio debe ser mayor o igual a cero.";
          return false;
        }
      }

      // Validaciones para fechas de descuento
      if (this.course.discount > 0 && this.course.discountStartDate && this.course.discountEndDate) {
        if (new Date(this.course.discountStartDate) > new Date(this.course.discountEndDate)) {
          this.errorMessage = "La fecha de inicio del descuento debe ser anterior a la fecha de fin.";
          return false;
        }
      }

      return true;
    },
    async handleSubmit() {
      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;
      this.errorMessage = "";

      try {
        this.$emit("submit", this.course);
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Error al guardar el curso. Inténtalo nuevamente.";
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.course-form {
  max-width: 600px;
  margin: 30px auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.form-title {
  font-family: "Playfair Display", serif;
  font-size: 24px;
  color: #2A3B5F; /* Azul Marino */
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: "Roboto", sans-serif;
}

.alert {
  margin-top: 20px;
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px;
  border-radius: 5px;
}

.loading-message {
  text-align: center;
  margin: 10px 0;
  font-size: 16px;
  color: #007bff;
}

.submit-button {
  background-color: #2E8B57; /* Verde Esmeralda */
  border: none;
  color: white;
  padding: 10px 15px;
  text-align: center;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
}

.submit-button:hover {
  background-color: #3AA870; /* Verde más oscuro */
}

/* Estilos para la sección de precios */
.pricing-section, .discount-section {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  background-color: #f8f9fa;
}

.pricing-section h3, .discount-section h4 {
  color: #2A3B5F;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 500;
}

.discount-section h4 {
  font-size: 16px;
}

.form-check {
  margin-bottom: 15px;
}

.form-check-input {
  margin-right: 8px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -5px;
  margin-left: -5px;
}

.col {
  flex: 1;
  padding: 0 5px;
}

.input-group {
  display: flex;
  align-items: center;
  width: 100%;
}

.input-group-prepend, .input-group-append {
  display: flex;
}

.input-group-text {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #e9ecef;
  border: 1px solid #ccc;
}

.input-group > .form-control {
  flex: 1;
  width: auto;
}

.input-group-prepend .input-group-text {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.input-group-append .input-group-text {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.text-success {
  color: #28a745;
}

.text-muted {
  color: #6c757d;
  font-size: 12px;
}
</style>
