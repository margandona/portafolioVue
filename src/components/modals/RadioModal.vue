<template>
  <div class="radio-modal" v-if="visible" :class="[accessibilityClasses, { 'minimized': isMinimized, 'playing': isPlaying }]">
    <div class="radio-player" v-if="!isMinimized">
      <div class="radio-header">
        <div class="radio-player__title">Radio <span class="makuaz-brand">MaKuaZ</span></div>
        <div class="radio-controls">
          <button class="control-btn minimize-btn" @click="minimizeRadio">
            <i class="fas fa-window-minimize"></i>
          </button>
          <button class="control-btn close-btn" @click="closeRadio">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      <div class="radio-player__progress-container">
        <div class="radio-player__progress-bar">
          <div ref="progressBarFill" class="radio-player__progress-bar-fill"></div>
        </div>
      </div>
      <div class="radio-player__controls">
        <div class="radio-player__control-buttons">
          <button class="radio-player__button radio-player__button--play" @click="playRadio">
            <i class="fas fa-play"></i>
          </button>
          <button class="radio-player__button radio-player__button--pause" @click="pauseRadio">
            <i class="fas fa-pause"></i>
          </button>
        </div>
        <div class="radio-player__volume-control">
          <i :class="['radio-player__volume-icon', isMuted ? 'fa-volume-mute' : 'fa-volume-up', 'fas']" @click="toggleMute"></i>
          <input type="range" class="radio-player__volume-slider" min="0" max="100" :value="volumeValue" @input="updateVolume">
        </div>
      </div>
      <div class="radio-player__visualizer-container">
        <div class="radio-player__visualizer" ref="visualizer">
          <!-- Bars generated dynamically -->
        </div>
      </div>
    </div>
    <div v-else class="radio-minimized" @click="maximizeRadio" :class="{ 'playing': isPlaying }">
      <i class="fas fa-broadcast-tower"></i>
      <span>Radio <span class="makuaz-brand">MaKuaZ</span></span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'RadioModal',
  data() {
    return {
      audio: null,
      lastVolume: 0.5,
      isMuted: false,
      volumeValue: 50,
      isMinimized: false,
      visualizerInterval: null,
      isPlaying: false
    };
  },
  computed: {
    ...mapGetters('modals', ['isRadioModalVisible']),
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
    visible() {
      return this.isRadioModalVisible;
    },
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
  created() {
    // Check if the modals module is registered correctly
    try {
      this.$store && this.$store._modules.root._children.modals;
    } catch (error) {
      console.error('Error checking modals module:', error);
    }
  },
  mounted() {
    try {
      this.audio = new Audio('https://s57.radiolize.com/radio/8090/radio.mp3');
      this.audio.volume = this.lastVolume;
      
      // Create visualizer bars
      this.createVisualizerBars();
      
      // Update progress bar
      this.audio.addEventListener('timeupdate', this.updateProgressBar);
    } catch (error) {
      console.error('Error in RadioModal mounted:', error);
    }
  },
  beforeUnmount() {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeEventListener('timeupdate', this.updateProgressBar);
    }
    this.clearVisualizerInterval();
  },
  methods: {
    playRadio() {
      this.audio.play();
      this.startVisualizer();
      this.isPlaying = true;
    },
    pauseRadio() {
      this.audio.pause();
      this.clearVisualizerInterval();
      this.isPlaying = false;
    },
    updateVolume(event) {
      const volume = event.target.value / 100;
      this.volumeValue = event.target.value;
      this.audio.volume = volume;
      
      if (volume === 0) {
        this.isMuted = true;
      } else {
        this.isMuted = false;
        this.lastVolume = volume;
      }
    },
    toggleMute() {
      if (this.isMuted) {
        this.audio.volume = this.lastVolume;
        this.volumeValue = this.lastVolume * 100;
        this.isMuted = false;
      } else {
        this.lastVolume = this.audio.volume;
        this.audio.volume = 0;
        this.volumeValue = 0;
        this.isMuted = true;
      }
    },
    updateProgressBar() {
      if (this.$refs.progressBarFill && this.audio.duration) {
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        this.$refs.progressBarFill.style.width = progress + '%';
      }
    },
    createVisualizerBars() {
      if (this.$refs.visualizer) {
        for (let i = 0; i < 20; i++) {
          const bar = document.createElement('div');
          bar.className = 'radio-player__bar';
          this.$refs.visualizer.appendChild(bar);
        }
      }
    },
    startVisualizer() {
      this.clearVisualizerInterval();
      this.visualizerInterval = setInterval(() => {
        if (this.$refs.visualizer && !this.audio.paused) {
          const bars = this.$refs.visualizer.querySelectorAll('.radio-player__bar');
          bars.forEach(bar => {
            const height = Math.random() * 100;
            bar.style.height = height + 'px';
          });
        }
      }, 200);
    },
    clearVisualizerInterval() {
      if (this.visualizerInterval) {
        clearInterval(this.visualizerInterval);
        this.visualizerInterval = null;
      }
    },
    minimizeRadio() {
      this.isMinimized = true;
    },
    maximizeRadio() {
      this.isMinimized = false;
    },
    closeRadio() {
      this.pauseRadio();
      this.$store.dispatch('modals/hideRadioModal');
    }
  }
}
</script>

<style scoped>
.radio-modal {
  position: fixed;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-player {
  background: linear-gradient(135deg, #71b7e6, #9b59b6);
  border-radius: 15px;
  padding: 25px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Estilos para modos de accesibilidad */
.radio-modal.alto-contraste .radio-player,
.radio-modal.alto-contraste .radio-minimized {
  background: #000 !important;
  border: 2px solid #fff !important;
  color: #fff !important;
}

.radio-modal.alto-contraste .radio-player__button,
.radio-modal.alto-contraste .control-btn {
  background-color: #fff !important;
  color: #000 !important;
  border: 2px solid #fff !important;
}

.radio-modal.modo-nocturno .radio-player,
.radio-modal.modo-nocturno .radio-minimized {
  background: linear-gradient(135deg, #333, #444) !important;
  color: #cccccc !important;
}

.radio-modal.descanso-visual .radio-player,
.radio-modal.descanso-visual .radio-minimized {
  background: linear-gradient(135deg, #f7f7f7, #e2e2e2) !important;
  color: #333 !important;
}

.radio-modal.sin-animaciones .radio-player__bar,
.radio-modal.sin-animaciones .radio-player.playing,
.radio-modal.sin-animaciones .radio-minimized.playing i {
  animation: none !important;
}

.radio-modal.espaciado-lineas .radio-player__title,
.radio-modal.espaciado-lineas .radio-minimized span {
  line-height: 1.8 !important;
  letter-spacing: 0.05em !important;
}

.radio-modal.fuente-dislexia .radio-player__title,
.radio-modal.fuente-dislexia .radio-minimized span {
  font-family: 'OpenDyslexic', sans-serif !important;
}

/* Estilos específicos para el modo daltonismo */
.radio-modal.daltonismo {
  filter: grayscale(100%) !important; /* Apply grayscale without affecting layout */
}

.radio-modal.daltonismo .radio-player {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
  z-index: 1051 !important;
  background: linear-gradient(135deg, #444, #666) !important;
  color: white !important;
}

.radio-modal.daltonismo .radio-minimized {
  position: fixed !important;
  bottom: 20px !important;
  right: 20px !important;
  z-index: 1051 !important;
  background: linear-gradient(135deg, #444, #666) !important;
  color: white !important;
}

/* Aseguramos que las animaciones no afecten al posicionamiento en modo daltonismo */
.radio-modal.daltonismo .radio-player.playing,
.radio-modal.daltonismo .radio-minimized.playing {
  animation: none !important;
  /* Mantener posicionamiento aunque esté reproduciendo */
  transform: translate(-50%, -50%) !important; 
}

.radio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.radio-controls {
  display: flex;
  gap: 5px;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  transform: scale(1.2);
}

.close-btn:hover {
  color: #ff5252;
}

.minimize-btn:hover {
  color: #ffca28;
}

.radio-player__title {
  margin-bottom: 0;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  width: 100%;
}

.makuaz-brand {
  font-family: 'Lobster', cursive;
}

.radio-player__progress-container {
  width: 100%;
  margin: 10px 0;
}

.radio-player__progress-bar {
  width: 100%;
  height: 10px;
  background-color: #5b86e5;
  border-radius: 5px;
  position: relative;
}

.radio-player__progress-bar-fill {
  height: 100%;
  background-color: #36d1dc;
  border-radius: 5px;
  width: 0;
}

.radio-player__controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.radio-player__control-buttons {
  display: flex;
  gap: 10px;
}

.radio-player__volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.radio-player__volume-slider {
  width: 120px;
}

.radio-player__button {
  border: none;
  padding: 10px;
  font-size: 1rem;
  border-radius: 50%;
  transition: background-color 0.3s ease;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.radio-player__button--play {
  background-color: #36d1dc;
  color: #fff;
}

.radio-player__button--play:hover {
  background-color: #5b86e5;
}

.radio-player__button--pause {
  background-color: #e74c3c;
  color: #fff;
}

.radio-player__button--pause:hover {
  background-color: #c0392b;
}

.radio-player__volume-icon {
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
}

.radio-player__visualizer-container {
  width: 100%;
  overflow: hidden;
  margin-top: 10px;
}

.radio-player__visualizer {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
}

.radio-player__bar {
  width: 5px;
  height: 20px;
  background: linear-gradient(45deg, #f90598, #28a745, #dc3545);
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1);
  }
}

/* Visual effects when playing */
.radio-player.playing {
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }
  to {
    box-shadow: 0 8px 28px rgba(54, 209, 220, 0.5);
  }
}

.radio-minimized.playing i {
  animation: pulse 1.5s infinite, colorchange 3s infinite alternate;
}

@keyframes colorchange {
  0% {
    color: white;
  }
  50% {
    color: #36d1dc;
  }
  100% {
    color: #9b59b6;
  }
}

.radio-modal.playing .radio-player__bar {
  background: linear-gradient(45deg, #f90598, #28a745, #dc3545);
  animation: bounce 1s ease infinite, colorshift 3s infinite linear;
}

@keyframes colorshift {
  0% {
    filter: hue-rotate(0deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
}

/* Minimized radio styles */
.radio-minimized {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #71b7e6, #9b59b6);
  color: white;
  padding: 10px 15px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 1050;
  transition: all 0.3s ease;
}

.radio-minimized:hover {
  transform: scale(1.05);
}

.radio-minimized i {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 576px) {
  .radio-player {
    padding: 15px;
    max-width: 95%;
  }

  .radio-player__volume-slider {
    width: 80px;
  }

  .radio-player__button {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
  }
  
  .radio-minimized {
    bottom: 10px;
    right: 10px;
    padding: 8px 12px;
    font-size: 0.9rem;
  }
}
</style>
