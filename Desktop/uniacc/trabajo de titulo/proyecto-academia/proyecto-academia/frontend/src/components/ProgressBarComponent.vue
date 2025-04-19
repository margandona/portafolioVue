<template>
  <div class="progress-bar" :aria-label="'Progreso: ' + progress + '%'" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
    <div class="progress-bar-fill" :style="{ width: progress + '%' }"></div>
    <span class="progress-bar-text">{{ Math.round(progress) }}%</span>
  </div>
</template>

<script>
export default {
  name: "ProgressBar",
  props: {
    progress: {
      type: Number,
      required: true,
      validator: (value) => value >= 0 && value <= 100,
    },
  },
  watch: {
    progress(newValue) {
      if (newValue < 0 || newValue > 100) {
        console.warn("El progreso debe estar entre 0 y 100.");
      }
    },
  },
};
</script>

<style scoped>
.progress-bar {
  position: relative;
  height: 25px;
  width: 100%;
  background-color: #e9ecef; /* Gris claro */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-bar-fill {
  height: 100%;
  background-color: #2e8b57; /* Verde Esmeralda */
  transition: width 0.3s ease-in-out;
}

.progress-bar-text {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  line-height: 25px;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.5); /* Mejora la visibilidad */
}
</style>
