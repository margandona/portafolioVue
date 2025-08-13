<template>
  <div class="home" :class="accessibilityClasses">
    <AppHeader />
    
    <!-- Secciones dinámicas que aparecen/desaparecen según navegación -->
    <div class="dynamic-sections">
      <AccessibilitySection v-if="isActive('accessibility')" id="accessibility" />
      <PlaygroundSection v-if="isActive('playground')" id="playground" />
      <EducationSection v-if="isActive('education')" id="education" />
      <SecuritySection v-if="isActive('security')" id="security" />
      <GithubSection v-if="isActive('github')" id="github" />
      <CommunicationsSection v-if="isActive('communications')" id="communications" />
      <AboutSection v-if="isActive('about')" id="about" />
    </div>
    
    <!-- ProfilePresentation siempre visible (sin condición) -->
    <ProfilePresentation />
    <ScrollToTop />
    <EducationModal ref="educationModal" />
    <FigmaPrototypeModal ref="figmaModal" />
    <RadioModal />
  </div>
</template>

<script>
import AppHeader from '@/components/Header.vue'
import ProfilePresentation from '@/components/Presentation.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import AccessibilitySection from '@/components/sections/AccessibilitySection.vue'
import PlaygroundSection from '@/components/sections/PlaygroundSection.vue'
import EducationSection from '@/components/sections/EducationSection.vue'
import SecuritySection from '@/components/sections/SecuritySection.vue'
import CommunicationsSection from '@/components/sections/CommunicationsSection.vue'
import GithubSection from '@/components/sections/GithubSection.vue'
import ScrollToTop from '@/components/ScrollToTop.vue'
import EducationModal from '@/components/modals/EducationModal.vue'
import FigmaPrototypeModal from '@/components/modals/FigmaPrototypeModal.vue'
import RadioModal from '@/components/modals/RadioModal.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'HomeView',
  components: {
    AppHeader,
    ProfilePresentation,
    AboutSection,
    AccessibilitySection,
    PlaygroundSection,
    EducationSection,
    SecuritySection,
    CommunicationsSection,
    GithubSection,
    ScrollToTop,
    EducationModal,
    FigmaPrototypeModal,
    RadioModal
  },
  computed: {
    activeSection() {
      return this.$store.getters['navigation/activeSection'];
    },
    isActive() {
      return (sectionId) => this.$store.getters['navigation/isActive'](sectionId);
    },
    ...mapGetters('accessibility', [
      'isColorblindMode', 
      'isVisualRestMode', 
      'isNightMode',
      'isHighContrastMode',
      'isLineSpacingMode',
      'isLinkHighlightMode',
      'isCursorLargeMode',
      'isNoAnimationsMode',
      'isDyslexiaFriendlyMode'
    ]),
    accessibilityClasses() {
      return {
        'daltonismo': this.isColorblindMode,
        'descanso-visual': this.isVisualRestMode,
        'modo-nocturno': this.isNightMode,
        'alto-contraste': this.isHighContrastMode,
        'espaciado-lineas': this.isLineSpacingMode,
        'resaltar-enlaces': this.isLinkHighlightMode,
        'cursor-grande': this.isCursorLargeMode,
        'sin-animaciones': this.isNoAnimationsMode,
        'fuente-dislexia': this.isDyslexiaFriendlyMode
      }
    }
  },
  mounted() {
    // Inicializar tooltips (equivalente a $('[data-toggle="tooltip"]').tooltip())
    this.$nextTick(() => {
      if (window.$ && window.$.fn && window.$.fn.tooltip) {
        window.$('[data-toggle="tooltip"]').tooltip();
      }
    });
  }
}
</script>

<style>
.dynamic-sections {
  scroll-margin-top: 80px; /* Ajustar para el navbar fijo */
}

/* Incorporar estilos necesarios del CSS original */
.colorblind-mode {
  filter: grayscale(100%);
}

.descanso-visual {
  background-color: #f0f0f0;
  color: #333;
}

.modo-nocturno {
  background-color: #2e2e2e;
  color: #cccccc;
}

/* Estilos específicos para el modo de alto contraste */
.alto-contraste .dynamic-sections section,
.alto-contraste .header,
.alto-contraste .presentation {
  background: #000 !important;
  color: #fff !important;
  border: 2px solid #fff !important;
}

.alto-contraste .card,
.alto-contraste .card-body {
  background-color: #000 !important;
  color: #fff !important;
  border: 2px solid #fff !important;
}

.alto-contraste .btn {
  background-color: #fff !important;
  color: #000 !important;
  border: 2px solid #fff !important;
  font-weight: bold !important;
}

.alto-contraste a {
  color: #fff !important;
  text-decoration: underline !important;
}
</style>