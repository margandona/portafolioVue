<template>
  <section class="education-section" id="education">
    <div class="container">
      <h2 class="section-title">Educación</h2>
      <p>Reflexionando sobre la importancia de la educación en el desarrollo personal y profesional.</p>
      
      <div class="row">
        <div class="col-md-6">
          <h3>Una de mis más grandes pasiones se asocian con la educación</h3>
          <p>"Durante mi infancia, crecí rodeado de docentes, lo que me llevó a elegir la enseñanza como mi primera carrera. 
          Estar en un ambiente educativo desde pequeño influyó profundamente en mis decisiones y aspiraciones profesionales.<br><br>
          Sin embargo, una vez inmerso en el campo, me di cuenta de que muchos métodos eran obsoletos y necesitaban una 
          renovación urgente. La enseñanza tradicional no estaba cumpliendo con las demandas y necesidades de los 
          estudiantes modernos, lo que me llevó a buscar soluciones innovadoras.<br><br>
          Actualmente, me dedico a automatizar y actualizar esos enfoques, buscando mejorar la educación a través de la 
          innovación tecnológica. Mi objetivo es transformar la manera en que enseñamos y aprendemos, adaptándola a las 
          necesidades del siglo XXI."</p>
        </div>
        <div class="col-md-6">
          <div class="card">
            <img src="@/assets/img/mistralymaturana.webp" class="card-img-top" alt="Proyecto 1">
            <div class="card-body">
              <h5 class="card-title">La educación en linea es el nuevo paradigma</h5>
              <p class="card-text">Chilenos de renombre como Gabriela Mistral, quien defendía la educación con amor, 
              y Humberto Maturana, cuyas teorías se basan en las neurociencias, han tenido razón en sus planteamientos. 
              Sin embargo, estos visionarios no podían prever cómo la enseñanza se transformaría en nuestros tiempos, 
              adaptándose a nuevas metodologías y tecnologías.</p>
              <button @click="openFigmaPrototype" class="btn btn-primary">
                <i class="fas fa-laptop-code"></i> Ver Prototipo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-4">
          <div class="card">
            <img src="@/assets/img/aprenderjugar.webp" class="card-img-top" alt="Proyecto 1">
            <div class="card-body">
              <h5 class="card-title">Aprender jugando</h5>
              <p class="card-text">Convertir el aprendizaje en una experiencia divertida y relevante promueve una asimilación más efectiva de los conocimientos, 
              mejorando la comprensión y el interés de los estudiantes en el proceso educativo.</p>
              <button @click="showReflection('reflexion2')" class="btn btn-primary">Leer más</button>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <img src="@/assets/img/aprendercrear.webp" class="card-img-top" alt="Proyecto 2">
            <div class="card-body">
              <h5 class="card-title">Aprender Creando</h5>
              <p class="card-text">Aprender mediante la práctica y la experiencia facilita una asimilación más efectiva y duradera de los conocimientos, 
              asegurando que los estudiantes retengan y comprendan mejor lo que han aprendido.</p>
              <button @click="showReflection('reflexion3')" class="btn btn-primary">Leer más</button>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <img src="@/assets/img/aprenderaprender.webp" class="card-img-top" alt="Proyecto 3">
            <div class="card-body">
              <h5 class="card-title">Aprendiendo a aprender</h5>
              <p class="card-text">Desarrollar la habilidad de aprender a aprender en un entorno tecnológico capacita a las personas para adaptarse y evolucionar continuamente, 
              asimilando nuevos conocimientos y habilidades de manera efectiva y autónoma.</p>
              <button @click="showReflection('reflexion4')" class="btn btn-primary">Leer más</button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-5 text-center">
        <h1>Adaptar las metodologías educativas tanto a los tiempos como a la tecnología es la llave al futuro.</h1>
        <h2>Tomando lo mas importante, como lo que dice Gabriela Mistral o Humberto Maturana.</h2>
        <p>"Amar educa", afirmaba Humberto Maturana. Cuando creamos un espacio que acoge, 
        escucha y permite la presencia del otro, los niños se transforman en personas reflexivas, 
        autónomas y responsables. El amor y la ternura son esenciales para que la educación florezca.</p>
      </div>
    </div>
    
    <!-- Figma prototype modal -->
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
              src="https://www.figma.com/proto/obrv3qczH3QcqHAvODPtdW/Untitled?node-id=1-2018" 
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
  </section>
</template>

<script>
export default {
  name: 'EducationSection',
  data() {
    return {
      isLoading: true
    };
  },
  methods: {
    showReflection(reflectionKey) {
      console.log('Attempting to show reflection:', reflectionKey);
      this.$store.dispatch('modals/showEducationReflection', reflectionKey);
      
      // Add debugging for jQuery
      if (window.jQuery) {
        console.log('jQuery is available, attempting to show modal');
        window.jQuery('#educationModal').modal('show');
      } else {
        console.error('jQuery is NOT available - modal cannot be shown');
      }
    },
    openFigmaPrototype() {
      console.log('Attempting to open Figma prototype modal');
      this.isLoading = true;
      
      // Try multiple approaches to show the modal
      if (window.jQuery && typeof window.jQuery.fn.modal === 'function') {
        // Use Bootstrap's modal function if available
        console.log('Using Bootstrap modal function');
        window.jQuery('#figmaPrototypeModal').modal('show');
      } else if (window.jQuery) {
        // Fallback: Try to use jQuery to show the modal manually
        console.log('Fallback: Using jQuery to show modal manually');
        window.jQuery('#figmaPrototypeModal').addClass('show');
        window.jQuery('#figmaPrototypeModal').css('display', 'block');
        window.jQuery('body').addClass('modal-open');
        window.jQuery('body').append('<div class="modal-backdrop fade show"></div>');
      } else {
        // Fallback: Use vanilla JavaScript
        console.log('Fallback: Using vanilla JavaScript to show modal');
        const modal = document.getElementById('figmaPrototypeModal');
        if (modal) {
          modal.classList.add('show');
          modal.style.display = 'block';
          document.body.classList.add('modal-open');
          
          const backdrop = document.createElement('div');
          backdrop.className = 'modal-backdrop fade show';
          document.body.appendChild(backdrop);
        } else {
          console.error('Modal element not found');
          alert('Could not open the Figma prototype. Please try again later.');
        }
      }
    },
    hideLoader() {
      // Add a small delay to ensure the iframe is fully rendered
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    }
  },
  mounted() {
    console.log('EducationSection mounted');
    // Initialize modals with debugging
    if (window.jQuery) {
      console.log('jQuery is available in mounted - initializing Figma modal');
      try {
        window.jQuery('#figmaPrototypeModal').modal({
          show: false
        });
        console.log('Figma modal initialized successfully');
      } catch (error) {
        console.error('Error initializing Figma modal:', error);
      }
    } else {
      console.error('jQuery is NOT available in mounted hook');
    }
  }
};
</script>

<style scoped>
.education-section {
  padding: 50px 0;
  background: linear-gradient(135deg, #5b86e5, #36d1dc);
  color: white;
}
.section-title {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

/* Modal styles */
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

/* Bootstrap modal override */
.modal-xl {
  max-width: 90%;
}
</style>