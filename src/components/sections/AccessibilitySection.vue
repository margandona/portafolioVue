<template>
  <section class="section work-section" id="accessibility" :class="accessibilityClasses">
    <div class="container">
      <h2 class="section-title">Accesibilidad y Ajustes</h2>
      <div class="row">
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Modo de Accesibilidad Visual</h5>
              <p class="card-text">Un modo que permite a los usuarios cambiar entre diferentes configuraciones visuales para mejorar la accesibilidad.</p>
              <button @click="toggleVisualAccessibility" class="btn btn-primary">
                <i class="fas fa-eye"></i> Descanso Visual
              </button>
              <button @click="toggleDaltonism" class="btn btn-primary">
                <i class="fas fa-palette"></i> Daltonismo
              </button>
              <button @click="resetAccessibility" class="btn btn-primary">
                <i class="fas fa-sync"></i> Normal
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Ajustes de Tamaño de Fuente y Espaciado</h5>
              <p class="card-text">Permite a los usuarios ajustar el tamaño de la fuente y el espaciado entre líneas y párrafos para mejorar la legibilidad.</p>
              <button @click="increaseFontSize" class="btn btn-primary">
                <i class="fas fa-plus"></i> Aumentar Fuente
              </button>
              <button @click="decreaseFontSize" class="btn btn-primary">
                <i class="fas fa-minus"></i> Disminuir Fuente
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Modo de Lectura Nocturna</h5>
              <p class="card-text">Un modo nocturno para reducir la fatiga ocular durante la lectura en condiciones de poca luz.</p>
              <button @click="toggleNightMode" class="btn btn-primary">
                <i class="fas fa-moon"></i> Modo Nocturno
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
      'isNightMode'
    ]),
    accessibilityClasses() {
      return {
        'daltonismo': this.isColorblindMode,
        'descanso-visual': this.isVisualRestMode,
        'modo-nocturno': this.isNightMode
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
.section.modo-nocturno {
  transition: all 0.3s ease;
}

.btn {
  margin: 5px;
  text-align: center;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.section-title {
  margin-bottom: 30px;
}
</style>