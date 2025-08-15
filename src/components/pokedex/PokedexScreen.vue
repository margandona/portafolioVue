<template>
  <div class="pokedex__header">
    <div class="pokedex__top">
      <div ref="pokedexCircle" class="pokedex__circle blue"></div>
      <div class="pokedex__lights">
        <div class="pokedex__light pokedex__light--blue" @click="resetPokedex"></div>
        <div class="pokedex__light pokedex__light--yellow" @click="resetPokedex"></div>
        <div class="pokedex__light pokedex__light--green" @click="resetPokedex"></div>
      </div>
      <button class="pokedex__button" @click="$emit('toggle-options')">
        <i class="fas fa-cog"></i>
      </button>
    </div>
    <div class="pokedex__screen">
      <h2 ref="pokemonName" class="pokedex__nombre"></h2>
      
      <!-- Carousel de imágenes Pokémon -->
      <div class="pokemon-carousel" v-if="pokemonSprites.length > 0">
        <div 
          class="carousel-container" 
          ref="carouselContainer"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <div class="carousel-track" :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }">
            <div 
              v-for="(sprite, index) in pokemonSprites" 
              :key="index" 
              class="carousel-slide"
            >
              <img 
                :src="sprite.url" 
                :alt="sprite.name" 
                class="pokedex__image carousel-image"
                @error="handleImageError(index)"
              >
              <span class="sprite-label">{{ sprite.name }}</span>
            </div>
          </div>
        </div>
        
        <!-- Controles del carousel -->
        <button class="carousel-btn carousel-btn--prev" @click="prevImage" :disabled="pokemonSprites.length <= 1">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button class="carousel-btn carousel-btn--next" @click="nextImage" :disabled="pokemonSprites.length <= 1">
          <i class="fas fa-chevron-right"></i>
        </button>
        
        <!-- Indicadores ocultos - mantener funcionalidad pero sin mostrar -->
        <!-- <div class="carousel-indicators" v-if="pokemonSprites.length > 1">
          <button 
            v-for="(sprite, index) in pokemonSprites" 
            :key="index"
            class="carousel-indicator"
            :class="{ active: index === currentImageIndex }"
            @click="goToImage(index)"
          ></button>
        </div> -->
        
        <!-- Contador de imágenes -->
        <div class="image-counter">
          {{ currentImageIndex + 1 }} / {{ pokemonSprites.length }}
        </div>
      </div>
      
      <div ref="pokemonPlaceholder" class="pokedex__placeholder" v-else></div>
    </div>
    <div class="pokedex__buttons">
      <button class="pokedex__button pokedex__button--left" @click="$emit('prev-pokemon')">
        <i class="fas fa-arrow-left"></i>
      </button>
      
      <!-- Controles de audio organizados horizontalmente -->
      <div class="audio-controls-horizontal" v-if="pokemonCries">
        <button 
          class="audio-btn-compact audio-btn--latest" 
          @click="playSound('latest')"
          :disabled="!pokemonCries.latest || isMuted"
          title="Sonido Moderno (Nuevo)"
        >
          <i class="fas fa-play-circle"></i>
        </button>
        
        <div class="volume-controls-compact">
          <button 
            class="mute-btn-compact" 
            @click="toggleMute"
            :class="{ 'muted': isMuted }"
            :title="isMuted ? 'Activar sonido' : 'Silenciar'"
          >
            <i :class="isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up'"></i>
          </button>
          <input 
            type="range" 
            min="0" 
            max="100" 
            :value="volume * 100"
            @input="changeVolume"
            class="volume-slider-compact"
            :disabled="isMuted"
            title="Volumen"
          >
        </div>
        
        <button 
          class="audio-btn-compact audio-btn--legacy" 
          @click="playSound('legacy')"
          :disabled="!pokemonCries.legacy || isMuted"
          title="Sonido Clásico (Retro)"
        >
          <i class="fas fa-gamepad"></i>
        </button>
      </div>
      
      <button class="pokedex__button pokedex__button--right" @click="$emit('next-pokemon')">
        <i class="fas fa-arrow-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PokedexScreen',
  props: {
    currentId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      circleColors: ['blue', 'green', 'yellow', 'red'],
      currentColorIndex: 0,
      intervalId: null,
      autoSlideInterval: null,
      pokemonSprites: [],
      currentImageIndex: 0,
      touchStartX: 0,
      touchEndX: 0,
      pokemonCries: null,
      volume: 0.5,
      isMuted: false,
      currentAudio: null
    };
  },
  methods: {
    setPokemon(pokemon) {
      this.$refs.pokemonName.textContent = this.capitalizarNombre(pokemon.name);
      this.setupPokemonSprites(pokemon);
      this.setupPokemonCries(pokemon);
    },
    setupPokemonSprites(pokemon) {
      const sprites = [];
      
      // Función auxiliar para añadir sprite si existe
      const addSprite = (url, name) => {
        if (url && url !== null && url !== undefined) {
          sprites.push({ url, name });
        }
      };
      
      // Arte oficial de alta calidad (prioridad máxima)
      addSprite(pokemon.sprites.other?.['official-artwork']?.front_default, 'Arte Oficial');
      addSprite(pokemon.sprites.other?.['official-artwork']?.front_shiny, 'Arte Oficial Shiny');
      
      // Sprites de Pokémon HOME
      addSprite(pokemon.sprites.other?.home?.front_default, 'HOME Normal');
      addSprite(pokemon.sprites.other?.home?.front_shiny, 'HOME Shiny');
      addSprite(pokemon.sprites.other?.home?.front_female, 'HOME Hembra');
      addSprite(pokemon.sprites.other?.home?.front_shiny_female, 'HOME Hembra Shiny');
      
      // Dream World sprites
      addSprite(pokemon.sprites.other?.dream_world?.front_default, 'Dream World');
      addSprite(pokemon.sprites.other?.dream_world?.front_female, 'Dream World Hembra');
      
      // Sprites principales (normales)
      addSprite(pokemon.sprites.front_default, 'Frontal Normal');
      addSprite(pokemon.sprites.front_shiny, 'Frontal Shiny');
      addSprite(pokemon.sprites.front_female, 'Frontal Hembra');
      addSprite(pokemon.sprites.front_shiny_female, 'Frontal Hembra Shiny');
      addSprite(pokemon.sprites.back_default, 'Trasero Normal');
      addSprite(pokemon.sprites.back_shiny, 'Trasero Shiny');
      addSprite(pokemon.sprites.back_female, 'Trasero Hembra');
      addSprite(pokemon.sprites.back_shiny_female, 'Trasero Hembra Shiny');
      
      // Sprites de versiones específicas (generaciones)
      if (pokemon.sprites.versions) {
        // Generación I (Red/Blue/Yellow)
        const genI = pokemon.sprites.versions['generation-i'];
        if (genI) {
          if (genI['red-blue']) {
            addSprite(genI['red-blue'].front_default, 'Red/Blue Frontal');
            addSprite(genI['red-blue'].back_default, 'Red/Blue Trasero');
            addSprite(genI['red-blue'].front_gray, 'Red/Blue Gris');
            addSprite(genI['red-blue'].back_gray, 'Red/Blue Trasero Gris');
            addSprite(genI['red-blue'].front_transparent, 'Red/Blue Transparente');
            addSprite(genI['red-blue'].back_transparent, 'Red/Blue Trasero Transparente');
          }
          if (genI.yellow) {
            addSprite(genI.yellow.front_default, 'Yellow Frontal');
            addSprite(genI.yellow.back_default, 'Yellow Trasero');
            addSprite(genI.yellow.front_gray, 'Yellow Gris');
            addSprite(genI.yellow.back_gray, 'Yellow Trasero Gris');
            addSprite(genI.yellow.front_transparent, 'Yellow Transparente');
            addSprite(genI.yellow.back_transparent, 'Yellow Trasero Transparente');
          }
        }
        
        // Generación II (Gold/Silver/Crystal)
        const genII = pokemon.sprites.versions['generation-ii'];
        if (genII) {
          ['gold', 'silver', 'crystal'].forEach(game => {
            if (genII[game]) {
              addSprite(genII[game].front_default, `${game.charAt(0).toUpperCase() + game.slice(1)} Frontal`);
              addSprite(genII[game].back_default, `${game.charAt(0).toUpperCase() + game.slice(1)} Trasero`);
              addSprite(genII[game].front_shiny, `${game.charAt(0).toUpperCase() + game.slice(1)} Shiny`);
              addSprite(genII[game].back_shiny, `${game.charAt(0).toUpperCase() + game.slice(1)} Trasero Shiny`);
              addSprite(genII[game].front_transparent, `${game.charAt(0).toUpperCase() + game.slice(1)} Transparente`);
              addSprite(genII[game].back_transparent, `${game.charAt(0).toUpperCase() + game.slice(1)} Trasero Transparente`);
            }
          });
        }
        
        // Generación III (Ruby/Sapphire/Emerald/FireRed/LeafGreen)
        const genIII = pokemon.sprites.versions['generation-iii'];
        if (genIII) {
          ['ruby-sapphire', 'emerald', 'firered-leafgreen'].forEach(game => {
            if (genIII[game]) {
              addSprite(genIII[game].front_default, `${game.replace('-', '/')} Frontal`);
              addSprite(genIII[game].back_default, `${game.replace('-', '/')} Trasero`);
              addSprite(genIII[game].front_shiny, `${game.replace('-', '/')} Shiny`);
              addSprite(genIII[game].back_shiny, `${game.replace('-', '/')} Trasero Shiny`);
            }
          });
        }
        
        // Generación IV (Diamond/Pearl/Platinum/HeartGold/SoulSilver)
        const genIV = pokemon.sprites.versions['generation-iv'];
        if (genIV) {
          ['diamond-pearl', 'platinum', 'heartgold-soulsilver'].forEach(game => {
            if (genIV[game]) {
              addSprite(genIV[game].front_default, `${game.replace('-', '/')} Frontal`);
              addSprite(genIV[game].back_default, `${game.replace('-', '/')} Trasero`);
              addSprite(genIV[game].front_shiny, `${game.replace('-', '/')} Shiny`);
              addSprite(genIV[game].back_shiny, `${game.replace('-', '/')} Trasero Shiny`);
              addSprite(genIV[game].front_female, `${game.replace('-', '/')} Hembra`);
              addSprite(genIV[game].back_female, `${game.replace('-', '/')} Hembra Trasero`);
              addSprite(genIV[game].front_shiny_female, `${game.replace('-', '/')} Hembra Shiny`);
              addSprite(genIV[game].back_shiny_female, `${game.replace('-', '/')} Hembra Trasero Shiny`);
            }
          });
        }
        
        // Generación V (Black/White/Black2/White2)
        const genV = pokemon.sprites.versions['generation-v'];
        if (genV) {
          ['black-white'].forEach(game => {
            if (genV[game]) {
              // Sprites estáticos
              addSprite(genV[game].front_default, `${game.replace('-', '/')} Frontal`);
              addSprite(genV[game].back_default, `${game.replace('-', '/')} Trasero`);
              addSprite(genV[game].front_shiny, `${game.replace('-', '/')} Shiny`);
              addSprite(genV[game].back_shiny, `${game.replace('-', '/')} Trasero Shiny`);
              addSprite(genV[game].front_female, `${game.replace('-', '/')} Hembra`);
              addSprite(genV[game].back_female, `${game.replace('-', '/')} Hembra Trasero`);
              addSprite(genV[game].front_shiny_female, `${game.replace('-', '/')} Hembra Shiny`);
              addSprite(genV[game].back_shiny_female, `${game.replace('-', '/')} Hembra Trasero Shiny`);
              
              // Sprites animados
              if (genV[game].animated) {
                addSprite(genV[game].animated.front_default, `${game.replace('-', '/')} Animado`);
                addSprite(genV[game].animated.back_default, `${game.replace('-', '/')} Animado Trasero`);
                addSprite(genV[game].animated.front_shiny, `${game.replace('-', '/')} Animado Shiny`);
                addSprite(genV[game].animated.back_shiny, `${game.replace('-', '/')} Animado Trasero Shiny`);
                addSprite(genV[game].animated.front_female, `${game.replace('-', '/')} Animado Hembra`);
                addSprite(genV[game].animated.back_female, `${game.replace('-', '/')} Animado Hembra Trasero`);
                addSprite(genV[game].animated.front_shiny_female, `${game.replace('-', '/')} Animado Hembra Shiny`);
                addSprite(genV[game].animated.back_shiny_female, `${game.replace('-', '/')} Animado Hembra Trasero Shiny`);
              }
            }
          });
        }
        
        // Generación VI (X/Y/OmegaRuby/AlphaSapphire)
        const genVI = pokemon.sprites.versions['generation-vi'];
        if (genVI) {
          ['x-y', 'omegaruby-alphasapphire'].forEach(game => {
            if (genVI[game]) {
              addSprite(genVI[game].front_default, `${game.replace('-', '/')} Frontal`);
              addSprite(genVI[game].front_shiny, `${game.replace('-', '/')} Shiny`);
              addSprite(genVI[game].front_female, `${game.replace('-', '/')} Hembra`);
              addSprite(genVI[game].front_shiny_female, `${game.replace('-', '/')} Hembra Shiny`);
            }
          });
        }
        
        // Generación VII (Sun/Moon/UltraSun/UltraMoon)
        const genVII = pokemon.sprites.versions['generation-vii'];
        if (genVII) {
          ['sun-moon', 'ultra-sun-ultra-moon'].forEach(game => {
            if (genVII[game]) {
              addSprite(genVII[game].front_default, `${game.replace('-', '/')} Frontal`);
              addSprite(genVII[game].front_shiny, `${game.replace('-', '/')} Shiny`);
              addSprite(genVII[game].front_female, `${game.replace('-', '/')} Hembra`);
              addSprite(genVII[game].front_shiny_female, `${game.replace('-', '/')} Hembra Shiny`);
            }
          });
        }
        
        // Generación VIII (Sword/Shield/Legends Arceus/Brilliant Diamond/Shining Pearl)
        const genVIII = pokemon.sprites.versions['generation-viii'];
        if (genVIII) {
          ['icons'].forEach(game => {
            if (genVIII[game]) {
              addSprite(genVIII[game].front_default, `${game} Frontal`);
              addSprite(genVIII[game].front_female, `${game} Hembra`);
            }
          });
        }
      }
      
      console.log(`Total de sprites encontrados para ${pokemon.name}:`, sprites.length);
      console.log('Lista de sprites:', sprites.map(s => s.name));
      
      this.pokemonSprites = sprites;
      this.currentImageIndex = 0;
      this.startAutoSlide();
    },
    setupPokemonCries(pokemon) {
      if (pokemon.cries) {
        this.pokemonCries = {
          latest: pokemon.cries.latest || null,
          legacy: pokemon.cries.legacy || null
        };
      } else {
        this.pokemonCries = null;
      }
    },
    playSound(type) {
      if (!this.pokemonCries || this.isMuted) return;
      
      const audioUrl = type === 'latest' ? this.pokemonCries.latest : this.pokemonCries.legacy;
      if (!audioUrl) return;
      
      // Detener audio actual si existe
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }
      
      // Crear nuevo audio
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.volume = this.volume;
      
      // Reproducir
      this.currentAudio.play().catch(error => {
        console.warn('Error reproduciendo sonido:', error);
      });
    },
    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.currentAudio) {
        this.currentAudio.volume = this.isMuted ? 0 : this.volume;
      }
    },
    changeVolume(event) {
      this.volume = event.target.value / 100;
      if (this.currentAudio && !this.isMuted) {
        this.currentAudio.volume = this.volume;
      }
    },
    prevImage() {
      if (this.pokemonSprites.length <= 1) return;
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.pokemonSprites.length - 1 
        : this.currentImageIndex - 1;
      this.resetAutoSlide();
    },
    nextImage() {
      if (this.pokemonSprites.length <= 1) return;
      this.currentImageIndex = (this.currentImageIndex + 1) % this.pokemonSprites.length;
      this.resetAutoSlide();
    },
    goToImage(index) {
      this.currentImageIndex = index;
      this.resetAutoSlide();
    },
    startAutoSlide() {
      this.stopAutoSlide();
      if (this.pokemonSprites.length > 1) {
        this.autoSlideInterval = setInterval(() => {
          this.nextImage();
        }, 5000); // Cambiar cada 5 segundos para dar más tiempo a ver cada imagen
      }
    },
    stopAutoSlide() {
      if (this.autoSlideInterval) {
        clearInterval(this.autoSlideInterval);
        this.autoSlideInterval = null;
      }
    },
    resetAutoSlide() {
      this.startAutoSlide();
    },
    handleImageError(index) {
      // Remover sprite que no se pudo cargar
      this.pokemonSprites.splice(index, 1);
      if (this.currentImageIndex >= this.pokemonSprites.length) {
        this.currentImageIndex = 0;
      }
    },
    handleTouchStart(event) {
      this.touchStartX = event.touches[0].clientX;
    },
    handleTouchMove(event) {
      this.touchEndX = event.touches[0].clientX;
    },
    handleTouchEnd() {
      if (!this.touchStartX || !this.touchEndX) return;
      
      const diffX = this.touchStartX - this.touchEndX;
      const threshold = 50; // Mínimo desplazamiento para activar
      
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          // Swipe left - siguiente imagen
          this.nextImage();
        } else {
          // Swipe right - imagen anterior
          this.prevImage();
        }
      }
      
      this.touchStartX = 0;
      this.touchEndX = 0;
    },
    clearScreen() {
      // This method only clears the screen (used by parent)
      if (this.$refs.pokemonName) {
        this.$refs.pokemonName.textContent = '';
      }
      
      this.pokemonSprites = [];
      this.currentImageIndex = 0;
      this.pokemonCries = null;
      
      // Detener audio actual
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      }
      
      this.stopAutoSlide();
      
      // Verificar que el placeholder existe antes de modificarlo
      if (this.$refs.pokemonPlaceholder) {
        this.$refs.pokemonPlaceholder.style.display = 'block';
      }
    },
    resetPokedex() {
      // This method is called by the reset buttons and triggers complete reset
      this.clearScreen();
      this.$emit('reset-pokedex');
    },
    capitalizarNombre(nombre) {
      return nombre.charAt(0).toUpperCase() + nombre.slice(1);
    },
    cambiarColorCirculo() {
      this.currentColorIndex = (this.currentColorIndex + 1) % this.circleColors.length;
      if (this.$refs.pokedexCircle) {
        this.$refs.pokedexCircle.className = 'pokedex__circle ' + this.circleColors[this.currentColorIndex];
      }
    }
  },
  mounted() {
    this.intervalId = setInterval(() => this.cambiarColorCirculo(), 500);
  },
  beforeUnmount() {
    clearInterval(this.intervalId);
    this.stopAutoSlide();
    
    // Limpiar audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }
};
</script>

<style scoped>
.pokedex__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.pokedex__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.pokedex__circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.blue { background-color: #00f; }
.green { background-color: #0f0; }
.yellow { background-color: #ff0; }
.red { background-color: #f00; }

.pokedex__lights {
  display: flex;
  gap: 5px;
  cursor: pointer;
}

.pokedex__light {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.pokedex__light--blue { background-color: #00f; }
.pokedex__light--yellow { background-color: #ff0; }
.pokedex__light--green { background-color: #0f0; }

.pokedex__screen {
  width: 100%;
  height: 200px;
  background-color: #fff;
  border: 5px solid #000;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background-color 0.5s;
}

.pokedex__image {
  width: 150px;
  height: 150px;
  transition: transform 0.3s;
}

.pokedex__image:hover {
  transform: scale(1.1);
}

.pokedex__placeholder {
  width: 150px;
  height: 150px;
  background-color: #ccc;
}

.pokedex__buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 10px;
  gap: 10px;
}

.pokedex__button {
  width: 40px;
  height: 40px;
  background-color: #000;
  color: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pokedex__button:hover {
  background-color: #444;
}

/* Estilos del carousel de imágenes */
.pokemon-carousel {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-container {
  width: 180px;
  height: 150px;
  overflow: hidden;
  border-radius: 10px;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

.carousel-track {
  display: flex;
  transition: transform 0.5s ease-in-out;
  height: 100%;
}

.carousel-slide {
  min-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.carousel-image {
  width: 100% !important;
  height: auto !important;
  max-height: 120px;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.sprite-label {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 500;
  white-space: nowrap;
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 25px;
  height: 25px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  font-size: 0.7rem;
}

.carousel-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-50%) scale(1.1);
}

.carousel-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-btn--prev {
  left: 5px;
}

.carousel-btn--next {
  right: 5px;
}

.image-counter {
  position: absolute;
  top: -20px;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 500;
}

/* Responsive para móviles */
@media (max-width: 480px) {
  .carousel-container {
    width: 160px;
    height: 130px;
  }
  
  .carousel-btn {
    width: 22px;
    height: 22px;
    font-size: 0.6rem;
  }
  
  .carousel-btn--prev {
    left: 3px;
  }
  
  .carousel-btn--next {
    right: 3px;
  }
  
  .carousel-image {
    max-height: 100px;
  }
  
  .sprite-label {
    font-size: 0.6rem;
    max-width: 150px;
    padding: 1px 4px;
  }
  
  .image-counter {
    font-size: 0.6rem;
    top: -18px;
  }
}

/* Animación de hover para las imágenes */
.carousel-slide:hover .carousel-image {
  transform: scale(1.05);
}

/* Efecto de carga para imágenes */
.carousel-image {
  opacity: 0;
  animation: fadeInImage 0.5s ease-in-out forwards;
}

@keyframes fadeInImage {
  to {
    opacity: 1;
  }
}

/* Estilos para controles de audio compactos horizontales */
.audio-controls-horizontal {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  border: 2px solid #007acc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex: 0 0 auto;
}

.audio-btn-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(145deg, #4CAF50, #45a049);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 0.8rem;
}

.audio-btn-compact:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.audio-btn-compact:active {
  transform: translateY(0) scale(1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.audio-btn-compact:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #ccc;
}

.audio-btn-compact.audio-btn--latest {
  background: linear-gradient(145deg, #2196F3, #1976D2);
}

.audio-btn-compact.audio-btn--legacy {
  background: linear-gradient(145deg, #FF9800, #F57C00);
}

.volume-controls-compact {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 4px;
}

.mute-btn-compact {
  width: 28px;
  height: 28px;
  background: #f44336;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mute-btn-compact:hover {
  background: #d32f2f;
  transform: scale(1.05);
}

.mute-btn-compact.muted {
  background: #757575;
}

.mute-btn-compact.muted:hover {
  background: #616161;
}

.volume-slider-compact {
  width: 50px;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  appearance: none;
}

.volume-slider-compact::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: #007acc;
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider-compact::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #007acc;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.volume-slider-compact:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive para controles de audio compactos */
@media (max-width: 480px) {
  .audio-controls-horizontal {
    gap: 4px;
    padding: 3px 6px;
  }
  
  .audio-btn-compact {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }
  
  .mute-btn-compact {
    width: 24px;
    height: 24px;
    font-size: 0.6rem;
  }
  
  .volume-slider-compact {
    width: 40px;
  }
  
  .pokedex__buttons {
    gap: 5px;
  }
}

/* Estilos para controles de audio originales (mantener para compatibilidad) */
.audio-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  border: 2px solid #007acc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.audio-buttons {
  display: flex;
  gap: 8px;
}

.audio-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  background: linear-gradient(145deg, #4CAF50, #45a049);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 50px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.audio-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.audio-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.audio-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #ccc;
}

.audio-btn--latest {
  background: linear-gradient(145deg, #2196F3, #1976D2);
}

.audio-btn--legacy {
  background: linear-gradient(145deg, #FF9800, #F57C00);
}

.audio-btn i {
  font-size: 0.8rem;
}

.audio-btn span {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.volume-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mute-btn {
  padding: 4px 6px;
  background: #f44336;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.7rem;
}

.mute-btn:hover {
  background: #d32f2f;
  transform: scale(1.05);
}

.mute-btn.muted {
  background: #757575;
}

.mute-btn.muted:hover {
  background: #616161;
}

.volume-slider {
  width: 60px;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: #007acc;
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #007acc;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.volume-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive para controles de audio */
@media (max-width: 480px) {
  .audio-controls {
    padding: 6px;
    gap: 4px;
  }
  
  .audio-btn {
    padding: 4px 6px;
    min-width: 40px;
    font-size: 0.6rem;
  }
  
  .audio-btn i {
    font-size: 0.7rem;
  }
  
  .audio-btn span {
    font-size: 0.55rem;
  }
  
  .volume-slider {
    width: 50px;
  }
  
  .mute-btn {
    padding: 3px 5px;
    font-size: 0.6rem;
  }
}
</style>
