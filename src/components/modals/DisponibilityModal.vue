<template>
  <div class="modal-overlay" v-if="isDisponibilityModalVisible">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Funcionalidad No Disponible</h3>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      <div class="modal-body">
        <div class="icon-container">
          <i class="fas fa-tools"></i>
        </div>
        <p class="message">Lo sentimos, esta funcionalidad no está disponible temporalmente.</p>
        <p class="submessage">Estamos trabajando para mejorar tu experiencia. ¡Vuelve pronto!</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" @click="closeModal">Entendido</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'DisponibilityModal',
  computed: {
    ...mapGetters('modals', ['isDisponibilityModalVisible'])
  },
  methods: {
    closeModal() {
      this.$store.dispatch('modals/hideDisponibilityModal');
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  animation: modal-appear 0.3s ease-out;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
}

.modal-body {
  padding: 30px 20px;
  text-align: center;
}

.icon-container {
  font-size: 4rem;
  color: #8e44ad;
  margin-bottom: 20px;
}

.message {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.submessage {
  font-size: 1rem;
  color: #666;
}

.modal-footer {
  padding: 15px 20px;
  text-align: center;
  border-top: 1px solid #e9ecef;
}

.btn-primary {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  border: none;
  padding: 10px 25px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}
</style>
