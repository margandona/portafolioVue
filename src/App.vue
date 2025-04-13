<template>
  <div :class="accessibilityClasses">
    <NavbarComponent />
    <router-view/>
    <ScrollToTop />
  </div>
</template>

<script>
import NavbarComponent from '@/components/NavbarComponent.vue'
import ScrollToTop from '@/components/ScrollToTop.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  components: {
    NavbarComponent,
    ScrollToTop
  },
  computed: {
    ...mapGetters('accessibility', [
      'isColorblindMode', 
      'isVisualRestMode', 
      'isNightMode'
    ]),
    accessibilityClasses() {
      return {
        'daltonismo': this.isColorblindMode,
        'descanso-visual': this.isVisualRestMode,
        'modo-nocturno': this.isNightMode
      }
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&family=Lobster&display=swap');
@import 'assets/css/style.css';

body {
  font-family: 'Poppins', sans-serif;
  transition: background-color 0.5s, color 0.5s;
  padding-top: 56px; /* Espacio para el navbar fijo */
}

/* Estilos globales para accesibilidad */
.daltonismo {
  filter: grayscale(100%);
}

.descanso-visual {
  background-color: #f0f0f0 !important;
  color: #333 !important;
}

.modo-nocturno {
  background-color: #2e2e2e !important;
  color: #cccccc !important;
}

.modo-nocturno .card,
.modo-nocturno .card-body {
  background-color: #333 !important;
  color: #cccccc !important;
}

.modo-nocturno .card-title,
.modo-nocturno .card-text {
  color: #cccccc !important;
}

.descanso-visual .card,
.descanso-visual .card-body,
.descanso-visual .card-title,
.descanso-visual .card-text {
  background-color: #e0e0e0 !important;
  color: #333 !important;
}
</style>