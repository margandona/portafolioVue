<template>
  <div class="modal fade" id="figmaPrototypeModal" tabindex="-1" aria-labelledby="figmaPrototypeModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="figmaPrototypeModalLabel">Prototipo Educativo</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="isLoading" class="loading-container">
            <div class="spinner"></div>
            <p class="loading-text">Cargando prototipo de Figma...</p>
          </div>
          <iframe 
            v-show="!isLoading"
            class="figma-embed"
            :src="figmaUrl" 
            allowfullscreen
            @load="hideLoader"
          ></iframe>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FigmaPrototypeModal',
  data() {
    return {
      isLoading: true,
      figmaUrl: 'https://www.figma.com/proto/obrv3qczH3QcqHAvODPtdW/Untitled?node-id=1-2018'
    }
  },
  methods: {
    hideLoader() {
      // Add a small delay to ensure the iframe is fully rendered
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    },
    showModal() {
      this.isLoading = true;
      if (window.jQuery) {
        try {
          window.jQuery('#figmaPrototypeModal').modal('show');
          console.log('Modal show command executed');
        } catch (error) {
          console.error('Error showing modal:', error);
        }
      } else {
        console.error('jQuery not found, cannot show modal');
      }
    }
  },
  mounted() {
    console.log('FigmaPrototypeModal component mounted');
    // Initialize modal on mount
    if (window.jQuery) {
      console.log('jQuery found in mounted, initializing modal');
      try {
        window.jQuery('#figmaPrototypeModal').modal({
          show: false
        });
        console.log('Modal initialized successfully');
      } catch (error) {
        console.error('Error initializing modal:', error);
      }
    } else {
      console.error('jQuery not found in mounted hook');
    }
  }
}
</script>

<style scoped>
.modal-content {
  border-radius: 10px;
}

.modal-header {
  background: linear-gradient(135deg, #5b86e5, #36d1dc);
  color: white;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.figma-embed {
  width: 100%;
  height: 600px;
  border: none;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(54, 209, 220, 0.25);
  border-top: 5px solid #36d1dc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 15px;
  font-size: 1.1rem;
  color: #333;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-secondary {
  background: #36d1dc;
  border: none;
}

.btn-secondary:hover {
  background: #5b86e5;
}

/* Full width modal for Figma embed */
.modal-xl {
  max-width: 90%;
}
</style>
