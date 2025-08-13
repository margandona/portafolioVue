<template>
  <div class="pokedex__header">
    <div class="pokedex__top">
      <div ref="pokedexCircle" class="pokedex__circle blue"></div>
      <div class="pokedex__lights">
        <div class="pokedex__light pokedex__light--blue" @click="clearScreen"></div>
        <div class="pokedex__light pokedex__light--yellow" @click="clearScreen"></div>
        <div class="pokedex__light pokedex__light--green" @click="clearScreen"></div>
      </div>
      <button class="pokedex__button" @click="$emit('toggle-options')">
        <i class="fas fa-cog"></i>
      </button>
    </div>
    <div class="pokedex__screen">
      <h2 ref="pokemonName" class="pokedex__nombre"></h2>
      <img ref="pokemonImage" class="pokedex__image" alt="Imagen de Pokémon" style="display:none;">
      <div ref="pokemonPlaceholder" class="pokedex__placeholder"></div>
    </div>
    <div class="pokedex__buttons">
      <button class="pokedex__button pokedex__button--left" @click="$emit('prev-pokemon')">
        <i class="fas fa-arrow-left"></i>
      </button>
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
      intervalId: null
    };
  },
  methods: {
    setPokemon(pokemon) {
      this.$refs.pokemonName.textContent = this.capitalizarNombre(pokemon.name);
      this.$refs.pokemonImage.src = pokemon.sprites.front_default;
      this.$refs.pokemonImage.style.display = 'block';
      this.$refs.pokemonPlaceholder.style.display = 'none';
    },
    clearScreen() {
      this.$refs.pokemonName.textContent = '';
      this.$refs.pokemonImage.style.display = 'none';
      this.$refs.pokemonPlaceholder.style.display = 'block';
      this.$emit('clear-screen');
    },
    capitalizarNombre(nombre) {
      return nombre.charAt(0).toUpperCase() + nombre.slice(1);
    },
    cambiarColorCirculo() {
      this.currentColorIndex = (this.currentColorIndex + 1) % this.circleColors.length;
      this.$refs.pokedexCircle.className = 'pokedex__circle ' + this.circleColors[this.currentColorIndex];
    }
  },
  mounted() {
    this.intervalId = setInterval(() => this.cambiarColorCirculo(), 500);
  },
  beforeUnmount() {
    clearInterval(this.intervalId);
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
  width: 100%;
  margin-top: 10px;
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
</style>
