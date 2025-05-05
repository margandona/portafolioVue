<template>
  <div
    class="modal-overlay"
    @click.self="closeModal"
    role="dialog"
    aria-labelledby="course-title"
    aria-describedby="course-details"
  >
    <div class="modal-content">
      <header class="modal-header">
        <h2 id="course-title">{{ course.title || "Título no disponible" }}</h2>
        <button
          class="close-button"
          @click="closeModal"
          aria-label="Cerrar modal"
          tabindex="0"
        >
          &times;
        </button>
      </header>
      <section id="course-details" class="modal-body">
        <p><strong>Descripción:</strong> {{ course.description || "No disponible" }}</p>
        <p><strong>Categoría:</strong> {{ course.category || "No disponible" }}</p>
        <p><strong>Profesor:</strong> {{ course.teacher?.name || "No disponible" }}</p>
        <p v-if="course.start_date">
          <strong>Inicio:</strong> {{ formatDate(course.start_date) }}
        </p>
        <p v-if="course.end_date">
          <strong>Fin:</strong> {{ formatDate(course.end_date) }}
        </p>
        <p v-else>
          <strong>Duración:</strong> {{ course.duration_days || "No especificada" }} días
        </p>
      </section>
      <footer class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">
          Cerrar
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: "CourseDetailModal",
  props: {
    course: {
      type: Object,
      required: true,
    },
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },
  },
};
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal Content */
.modal-content {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  padding: 20px;
  position: relative;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 20px;
  font-family: "Playfair Display", serif;
  color: #2a3b5f;
  margin: 0;
}

/* Close Button */
.close-button {
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: #999999;
}

.close-button:hover {
  color: #2a3b5f;
}

/* Modal Body */
.modal-body p {
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 10px;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 10px 15px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #6c757d;
  color: #ffffff;
  border: none;
}

.btn-secondary:hover {
  background-color: #5a6268;
}
</style>
