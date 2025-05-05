<template>
  <div v-if="isVisible" class="modal-overlay" role="dialog" aria-modal="true">
    <div class="modal-container">
      <button class="close-button" @click="$emit('close')" aria-label="Cerrar modal">✕</button>
      <h2 class="modal-title">{{ course.title }}</h2>
      <p class="modal-description">{{ course.description }}</p>
      <ul class="modal-details">
        <li><strong>Categoría:</strong> {{ course.category }}</li>
        <li><strong>Modalidad:</strong> {{ course.modality === 'synchronized' ? 'Sincronizada' : 'Asincrónica' }}</li>
        <li v-if="course.modality === 'synchronized'">
          <strong>Fechas:</strong> {{ formatDate(course.start_date) }} - {{ formatDate(course.end_date) }}
        </li>
        <li v-if="course.modality === 'asynchronized'">
          <strong>Duración:</strong> {{ course.duration_days }} días
        </li>
        <li><strong>Profesor:</strong> {{ course.teacher?.name || 'No disponible' }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "CourseModalComponent",
  props: {
    course: {
      type: Object,
      required: true,
    },
    isVisible: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  methods: {
    formatDate(date) {
      if (!date) return "No disponible";
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString("es-ES", options);
    },
  },
};
</script>

<style scoped>
/* Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semitransparente */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;
}

/* Modal container */
.modal-container {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  animation: fadeIn 0.3s ease-in-out;
}

/* Modal close button */
.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  color: #dc3545; /* Rojo */
  cursor: pointer;
}

.close-button:hover {
  color: #b21f2d; /* Rojo oscuro */
}

/* Modal title */
.modal-title {
  font-family: "Playfair Display", serif;
  font-size: 24px;
  color: #2a3b5f; /* Azul Marino */
  margin-bottom: 15px;
  text-align: center;
}

/* Modal description */
.modal-description {
  font-family: "Roboto", sans-serif;
  font-size: 16px;
  color: #6c757d; /* Gris oscuro */
  margin-bottom: 20px;
}

/* Modal details */
.modal-details {
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  color: #333;
  list-style: none;
  padding: 0;
  line-height: 1.6;
}

.modal-details li {
  margin-bottom: 10px;
}

.modal-details strong {
  color: #2e8b57; /* Verde Esmeralda */
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
