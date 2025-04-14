<template>
  <section class="section work-section" id="accessibility" :class="accessibilityClasses">
    <div class="container">
      <h2 class="section-title">Accesibilidad y Ajustes</h2>
      <div class="row">
        <!-- Primera columna -->
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Modos de Visualización</h5>
              <p class="card-text">Cambiar entre diferentes modos de visualización para mejorar la accesibilidad.</p>
              <button @click="toggleVisualAccessibility" class="btn btn-primary" :class="{ 'active': isVisualRestMode }">
                <i class="fas fa-eye"></i> Descanso Visual
              </button>
              <button @click="toggleDaltonism" class="btn btn-primary" :class="{ 'active': isColorblindMode }">
                <i class="fas fa-palette"></i> Daltonismo
              </button>
              <button @click="toggleNightMode" class="btn btn-primary" :class="{ 'active': isNightMode }">
                <i class="fas fa-moon"></i> Modo Nocturno
              </button>
              <button @click="toggleHighContrastMode" class="btn btn-primary" :class="{ 'active': isHighContrastMode }">
                <i class="fas fa-adjust"></i> Alto Contraste
              </button>
            </div>
          </div>
        </div>
        
        <!-- Segunda columna -->
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Ajustes de Texto</h5>
              <p class="card-text">Personaliza el texto para mejorar la legibilidad.</p>
              <div class="button-group">
                <button @click="increaseFontSize" class="btn btn-primary">
                  <i class="fas fa-plus"></i> Aumentar Fuente
                </button>
                <button @click="decreaseFontSize" class="btn btn-primary">
                  <i class="fas fa-minus"></i> Disminuir Fuente
                </button>
              </div>
              <div class="button-group mt-2">
                <button @click="toggleLineSpacingMode" class="btn btn-primary" :class="{ 'active': isLineSpacingMode }">
                  <i class="fas fa-text-height"></i> Espaciado de Líneas
                </button>
                <button @click="toggleDyslexiaFriendlyMode" class="btn btn-primary" :class="{ 'active': isDyslexiaFriendlyMode }">
                  <i class="fas fa-font"></i> Fuente para Dislexia
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Tercera columna -->
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Opciones adicionales</h5>
              <p class="card-text">Más opciones para adaptar la experiencia a tus necesidades.</p>
              <button @click="toggleLinkHighlightMode" class="btn btn-primary" :class="{ 'active': isLinkHighlightMode }">
                <i class="fas fa-link"></i> Resaltar Enlaces
              </button>
              <button @click="toggleCursorLargeMode" class="btn btn-primary" :class="{ 'active': isCursorLargeMode }">
                <i class="fas fa-mouse-pointer"></i> Cursor Grande
              </button>
              <button @click="toggleNoAnimationsMode" class="btn btn-primary" :class="{ 'active': isNoAnimationsMode }">
                <i class="fas fa-ban"></i> Sin Animaciones
              </button>
              <button @click="resetAccessibility" class="btn btn-danger mt-3">
                <i class="fas fa-sync"></i> Restablecer Todo
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-5 text-center">
        <h1>La Danza de las Mentes</h1>
        <h2>Explorando la Diversidad Cognitiva</h2>
        <p>"Imagina que nuestras mentes son como un coro de bailarines. Algunos se deslizan con gracia, 
        otros danzan al ritmo de su propia melodía. La diversidad cognitiva es la coreografía que une a 
        todos. Algunos pasos son rápidos y precisos, mientras que otros son más lentos y sinceros. 
        Pero juntos, crean una danza única e inolvidable. Así que, en este gran escenario de la vida, 
        celebremos cada mente como una estrella brillante en nuestro ballet mental."</p>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'AccessibilitySection',
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
  },
  methods: {
    toggleVisualAccessibility() {
      this.$store.dispatch('accessibility/toggleVisualRestMode');
    },
    toggleDaltonism() {
      this.$store.dispatch('accessibility/toggleColorblindMode');
    },
    resetAccessibility() {
      this.$store.dispatch('accessibility/resetAccessibility');
    },
    increaseFontSize() {
      this.$store.dispatch('accessibility/increaseFontSize');
    },
    decreaseFontSize() {
      this.$store.dispatch('accessibility/decreaseFontSize');
    },
    toggleNightMode() {
      this.$store.dispatch('accessibility/toggleNightMode');
    },
    toggleHighContrastMode() {
      this.$store.dispatch('accessibility/toggleHighContrastMode');
      // Aseguramos que los otros modos visuales se desactiven para evitar conflictos
      if (this.isHighContrastMode) {
        if (this.isVisualRestMode) this.$store.dispatch('accessibility/toggleVisualRestMode');
        if (this.isNightMode) this.$store.dispatch('accessibility/toggleNightMode');
        if (this.isColorblindMode) this.$store.dispatch('accessibility/toggleColorblindMode');
      }
    },
    toggleLineSpacingMode() {
      this.$store.dispatch('accessibility/toggleLineSpacingMode');
    },
    toggleLinkHighlightMode() {
      this.$store.dispatch('accessibility/toggleLinkHighlightMode');
    },
    toggleCursorLargeMode() {
      this.$store.dispatch('accessibility/toggleCursorLargeMode');
    },
    toggleNoAnimationsMode() {
      this.$store.dispatch('accessibility/toggleNoAnimationsMode');
    },
    toggleDyslexiaFriendlyMode() {
      this.$store.dispatch('accessibility/toggleDyslexiaFriendlyMode');
    }
  }
}
</script>

<style scoped>
.section {
  padding: 50px 0;
}

.section.daltonismo,
.section.descanso-visual,
.section.modo-nocturno,
.section.alto-contraste,
.section.espaciado-lineas,
.section.resaltar-enlaces,
.section.cursor-grande,
.section.sin-animaciones,
.section.fuente-dislexia {
  transition: all 0.3s ease;
}

.btn {
  margin: 5px;
  text-align: center;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.btn.active {
  background-color: #ffd700;
  color: #333;
}

.section-title {
  margin-bottom: 30px;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
</style>