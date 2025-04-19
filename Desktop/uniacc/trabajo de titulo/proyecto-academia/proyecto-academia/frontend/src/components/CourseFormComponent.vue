<template>
  <div class="course-form">
    <h1 class="form-title">{{ isEditMode ? "Editar Curso" : "Crear Curso" }}</h1>
    <form @submit.prevent="handleSubmit">
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
    return {
      course: {
        title: "",
        description: "",
        category: "",
        modality: "synchronized",
        duration_days: null,
        start_date: null,
        end_date: null,
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
    validateForm() {
      if (this.course.modality === "synchronized" && this.course.start_date && this.course.end_date) {
        if (new Date(this.course.start_date) > new Date(this.course.end_date)) {
          this.errorMessage = "La fecha de inicio debe ser anterior o igual a la fecha de término.";
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
</style>
