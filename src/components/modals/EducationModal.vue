<template>
  <div class="modal fade" id="educationModal" tabindex="-1" aria-labelledby="educationModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="educationModalLabel">Reflexión</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body" id="modal-content">
          {{ currentReflection }}
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
  name: 'EducationModal',
  data() {
    return {
      currentReflection: '',
      reflections: {
        reflexion1: '¿Cómo crees que Gabriela Mistral y Humberto Maturana habrían adaptado sus enfoques educativos a las metodologías y tecnologías modernas para seguir mejorando la enseñanza?',
        reflexion2: '¿Cómo podemos diseñar experiencias educativas que sean tanto divertidas como relevantes para maximizar la efectividad del aprendizaje y mantener el interés de los estudiantes?',
        reflexion3: '¿Cómo podemos integrar más oportunidades de práctica y experiencias reales en el aprendizaje para garantizar una asimilación más efectiva y duradera de los conocimientos?',
        reflexion4: '¿Cómo podemos diseñar entornos tecnológicos que fomenten y faciliten el desarrollo de la habilidad de aprender a aprender, asegurando que las personas puedan adaptarse y evolucionar de manera autónoma?',
        reflexion5: 'Estoy trabajando para que pronto interactues con esta sección.'
      }
    };
  },
  computed: {
    reflectionKey() {
      return this.$store.getters['modals/educationReflection'];
    }
  },
  watch: {
    reflectionKey(newValue) {
      if (newValue) {
        this.showReflection(newValue);
      }
    }
  },
  methods: {
    showReflection(reflectionKey) {
      console.log('EducationModal - showReflection called with:', reflectionKey);
      this.currentReflection = this.reflections[reflectionKey] || 'Reflexión no disponible';
      // Direct jQuery call to ensure modal shows
      if (window.jQuery) {
        console.log('EducationModal - jQuery found, showing modal');
        try {
          window.jQuery('#educationModal').modal('show');
          console.log('EducationModal - show command executed');
        } catch (error) {
          console.error('EducationModal - Error showing modal:', error);
        }
      } else {
        console.error('EducationModal - jQuery not found, cannot show modal');
      }
    }
  },
  mounted() {
    console.log('EducationModal component mounted');
    // Check and initialize the modal
    if (window.jQuery) {
      console.log('EducationModal - jQuery found in mounted');
      try {
        window.jQuery('#educationModal').modal({
          show: false
        });
        console.log('EducationModal - Modal initialized successfully');
        
        window.jQuery('#educationModal').on('hidden.bs.modal', () => {
          console.log('EducationModal - Modal hidden event triggered');
          this.currentReflection = '';
          // Reset the reflection key in Vuex when modal is closed
          this.$store.dispatch('modals/showEducationReflection', null);
        });
      } catch (error) {
        console.error('EducationModal - Error initializing modal:', error);
      }
    } else {
      console.error('EducationModal - jQuery not found in mounted hook');
    }
  }
};
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

.modal-body {
  padding: 20px;
  font-size: 1.1rem;
  line-height: 1.6;
}

.btn-secondary {
  background: #36d1dc;
  border: none;
}

.btn-secondary:hover {
  background: #5b86e5;
}
</style>