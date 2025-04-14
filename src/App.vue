<template>
  <div :class="accessibilityClasses">
    <NavbarComponent />
    <router-view/>
    <ScrollToTop />
    <DisponibilityModal />
  </div>
</template>

<script>
import NavbarComponent from '@/components/NavbarComponent.vue'
import ScrollToTop from '@/components/ScrollToTop.vue'
import DisponibilityModal from '@/components/modals/DisponibilityModal.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  components: {
    NavbarComponent,
    ScrollToTop,
    DisponibilityModal
  },
  computed: {
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
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&family=Lobster&display=swap');
@import url('https://fonts.googleapis.com/css2?family=OpenDyslexic:wght@400;700&display=swap');
@import 'assets/css/style.css';

body {
  font-family: 'Poppins', sans-serif;
  transition: background-color 0.5s, color 0.5s;
  padding-top: 56px; /* Espacio para el navbar fijo */
}

/* Estilos globales para accesibilidad con mayor especificidad - Daltonismo mejorado */
html body .daltonismo {
  background-color: inherit !important;
  color: inherit !important;
}

html body .daltonismo * {
  filter: grayscale(100%) !important;
}

/* Corrección para eliminar el espacio en blanco sobre el navbar */
html body .daltonismo .nav {
  position: fixed !important;
  top: 0 !important;
  margin-top: 0 !important;
  padding-top: 0 !important;
}

/* Corrección para el modal de radio en modo daltonismo - Arreglado */
html body .daltonismo .radio-modal {
  filter: grayscale(100%) !important;
  position: fixed !important;
  z-index: 1050 !important; /* Aseguramos que esté por encima */
}

html body .daltonismo .radio-player {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
  z-index: 1050 !important;
}

html body .daltonismo .radio-minimized {
  position: fixed !important;
  bottom: 20px !important;
  right: 20px !important;
  z-index: 1050 !important;
}

/* Estilos globales para accesibilidad con mayor especificidad */
html body .daltonismo,
html body div.daltonismo,
html body div.daltonismo * {
  filter: grayscale(100%) !important;
}

html body .descanso-visual,
html body div.descanso-visual {
  background-color: #f0f0f0 !important;
  color: #333 !important;
}

html body .descanso-visual section,
html body .descanso-visual .header,
html body .descanso-visual .presentation,
html body .descanso-visual .github-section,
html body .descanso-visual .education-section,
html body .descanso-visual .playground-section,
html body .descanso-visual .about-section {
  background: linear-gradient(135deg, #f7f7f7, #e2e2e2) !important;
  color: #333 !important;
}

html body .modo-nocturno,
html body div.modo-nocturno {
  background-color: #2e2e2e !important;
  color: #cccccc !important;
}

html body .modo-nocturno section,
html body .modo-nocturno .header,
html body .modo-nocturno .presentation,
html body .modo-nocturno .github-section,
html body .modo-nocturno .education-section,
html body .modo-nocturno .playground-section,
html body .modo-nocturno .about-section {
  background: linear-gradient(135deg, #333, #444) !important;
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

/* Nuevos estilos para las opciones de accesibilidad adicionales */

/* Alto contraste */
html body .alto-contraste,
html body div.alto-contraste {
  background-color: #000 !important;
  color: #fff !important;
}

html body .alto-contraste p,
html body .alto-contraste h1,
html body .alto-contraste h2,
html body .alto-contraste h3,
html body .alto-contraste h4,
html body .alto-contraste h5,
html body .alto-contraste h6 {
  color: #fff !important;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.5) !important;
}

html body .alto-contraste section,
html body .alto-contraste .card,
html body .alto-contraste .card-body {
  background-color: #000 !important;
  color: #fff !important;
  border: 2px solid #fff !important;
}

html body .alto-contraste .btn {
  background-color: #fff !important;
  color: #000 !important;
  border: 2px solid #fff !important;
  font-weight: bold !important;
}

/* Espaciado de líneas */
html body .espaciado-lineas,
html body div.espaciado-lineas {
  line-height: 2 !important;
}

html body .espaciado-lineas p,
html body .espaciado-lineas h1,
html body .espaciado-lineas h2,
html body .espaciado-lineas h3,
html body .espaciado-lineas h4,
html body .espaciado-lineas h5,
html body .espaciado-lineas h6 {
  line-height: 2 !important;
  margin-bottom: 1.5em !important;
}

/* Resaltar enlaces */
html body .resaltar-enlaces a {
  color: #ff00ff !important;
  text-decoration: underline !important;
  font-weight: bold !important;
  border-bottom: 3px solid #ff00ff !important;
  padding-bottom: 2px !important;
}

html body .resaltar-enlaces a:hover,
html body .resaltar-enlaces a:focus {
  background-color: #ff00ff !important;
  color: #fff !important;
  border-radius: 3px !important;
}

/* Cursor grande */
html body .cursor-grande,
html body.large-cursor,
html body.large-cursor * {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="black"/><circle cx="8" cy="8" r="7" fill="white"/><circle cx="8" cy="8" r="5.5" fill="black"/></svg>') 16 16, auto !important;
}

html body .cursor-grande a,
html body .cursor-grande button,
html body.large-cursor a,
html body.large-cursor button {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="black"/><circle cx="8" cy="8" r="7" fill="white"/><circle cx="8" cy="8" r="5.5" fill="red"/></svg>') 16 16, pointer !important;
}

/* Sin animaciones */
html body .sin-animaciones *,
html body .sin-animaciones *:hover,
html body .sin-animaciones *:after,
html body .sin-animaciones *:before {
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

/* Fuente para dislexia - Modificada para preservar iconos y centrado */
html body .fuente-dislexia p,
html body .fuente-dislexia h1,
html body .fuente-dislexia h2,
html body .fuente-dislexia h3,
html body .fuente-dislexia h4,
html body .fuente-dislexia h5,
html body .fuente-dislexia h6,
html body .fuente-dislexia span:not(.nav-icon):not([class*="fa-"]),
html body .fuente-dislexia div:not(.nav-icon),
html body .fuente-dislexia a:not(.nav-icon),
html body .fuente-dislexia button:not(.nav-icon) {
  font-family: 'OpenDyslexic', sans-serif !important;
  letter-spacing: 0.05em !important;
  word-spacing: 0.1em !important;
}

/* Aseguramos que los iconos no usen la fuente de dislexia */
html body .fuente-dislexia [class*="fa-"],
html body .fuente-dislexia .nav-icon,
html body .fuente-dislexia i {
  font-family: 'Font Awesome 5 Free', 'Font Awesome 5 Brands' !important;
}

/* Preservamos el centrado original */
html body .fuente-dislexia .text-center,
html body .fuente-dislexia .nav-link,
html body .fuente-dislexia .navbar-brand-container,
html body .fuente-dislexia .header,
html body .fuente-dislexia [class*="align-center"] {
  text-align: center !important;
}

/* Eliminamos la alineación justify que puede causar problemas para personas con dislexia */
html body .fuente-dislexia p {
  text-align: left !important;
  max-width: 70ch !important;
  line-height: 1.6 !important;
}

/* Aseguramos que los modos de accesibilidad se apliquen incluso en elementos con estilos scoped */
html body .modo-nocturno [class*="section"],
html body .descanso-visual [class*="section"],
html body .daltonismo [class*="section"],
html body .alto-contraste [class*="section"],
html body .espaciado-lineas [class*="section"],
html body .resaltar-enlaces [class*="section"],
html body .cursor-grande [class*="section"],
html body .sin-animaciones [class*="section"],
html body .fuente-dislexia [class*="section"] {
  transition: all 0.3s ease !important;
}
</style>