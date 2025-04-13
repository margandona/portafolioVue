export default {
  computed: {
    isColorblindMode() {
      return this.$store.state.accessibility.isColorblindMode;
    },
    isVisualRestMode() {
      return this.$store.state.accessibility.isVisualRestMode;
    },
    isNightMode() {
      return this.$store.state.accessibility.isNightMode;
    },
    sectionClasses() {
      return {
        'daltonismo': this.isColorblindMode,
        'descanso-visual': this.isVisualRestMode,
        'modo-nocturno': this.isNightMode
      };
    }
  }
}
