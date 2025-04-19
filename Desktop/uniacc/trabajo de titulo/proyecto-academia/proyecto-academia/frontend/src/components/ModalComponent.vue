<template>
  <div
    class="modal-overlay"
    v-if="visible"
    @click.self="close"
    role="dialog"
    :aria-labelledby="`modal-title-${_uid}`"
    aria-modal="true"
  >
    <div class="modal-content">
      <!-- Encabezado del Modal -->
      <header class="modal-header">
        <h2 :id="`modal-title-${_uid}`" class="modal-title">{{ title }}</h2>
        <button
          class="close-button"
          @click="close"
          aria-label="Cerrar modal"
        >
          &times;
        </button>
      </header>

      <!-- Contenido del Modal -->
      <div class="modal-body">
        <slot name="body">
          <p>Contenido del modal aquí.</p>
        </slot>
      </div>

      <!-- Pie del Modal -->
      <footer class="modal-footer">
        <button class="btn btn-secondary" @click="close">Cancelar</button>
        <button class="btn btn-danger" @click="confirm">Confirmar</button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: "ModalComponent",
  props: {
    title: {
      type: String,
      default: "Modal",
    },
    visible: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    close() {
      this.$emit("close");
    },
    confirm() {
      this.$emit("confirm");
    },
  },
};
</script>

<style scoped>
/* Estilos del overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Estilos del contenido del modal */
.modal-content {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  padding: 20px;
  position: relative;
}

/* Encabezado del modal */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  font-family: "Playfair Display", serif;
  font-size: 20px;
  color: #2a3b5f;
}

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

/* Cuerpo del modal */
.modal-body {
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 20px;
}

/* Pie del modal */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 10px 15px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
}

.btn-secondary {
  background-color: #6c757d;
  color: #ffffff;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-danger {
  background-color: #dc3545;
  color: #ffffff;
}

.btn-danger:hover {
  background-color: #b21f2d;
}
</style>
