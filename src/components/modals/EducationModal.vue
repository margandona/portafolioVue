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
      this.currentReflection = this.reflections[reflectionKey] || 'Reflexión no disponible';
      // Usar bootstrap para mostrar el modal
      if (window.$ && window.$.fn && window.$.fn.modal) {
        window.$('#educationModal').modal('show');
      }
    }
  },
  mounted() {
    // Inicializar el modal usando Bootstrap
    if (window.$ && window.$.fn && window.$.fn.modal) {
      window.$('#educationModal').on('hidden.bs.modal', () => {
        this.currentReflection = '';
        // Reset the reflection key in Vuex when modal is closed
        this.$store.dispatch('modals/showEducationReflection', null);
      });
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