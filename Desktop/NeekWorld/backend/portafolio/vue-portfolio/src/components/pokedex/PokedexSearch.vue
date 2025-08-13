<template>
  <div class="pokedex__body">
    <div class="pokedex__busqueda">
      <input ref="searchInput" type="text" class="form-control" 
        placeholder="Buscar Pokémon por nombre, ID o tipo"
        @input="handleInput"
        aria-label="Buscar Pokémon por nombre, ID o tipo">
      <div ref="suggestions" class="pokedex__sugerencias" aria-live="polite"></div>
      <button class="btn btn-primary" @click="search">
        <i class="fas fa-search"></i> Buscar
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PokedexSearch',
  methods: {
    handleInput() {
      const query = this.$refs.searchInput.value.toLowerCase();
      this.$emit('input-changed', query);
    },
    search() {
      const filtro = this.$refs.searchInput.value.toLowerCase();
      this.$emit('search', filtro);
    },
    setSuggestions(resultados) {
      const sugerenciasHtml = resultados.map(pokemon => 
        `<li onclick="window.pokedexVue.cargarPokemon('${pokemon.name}')">${pokemon.name}</li>`
      ).join('');
      this.$refs.suggestions.innerHTML = '<ul>' + sugerenciasHtml + '</ul>';
    },
    clearSuggestions() {
      this.$refs.suggestions.innerHTML = '';
    },
    getValue() {
      return this.$refs.searchInput.value;
    },
    setValue(value) {
      this.$refs.searchInput.value = value;
    }
  }
};
</script>

<style scoped>
.pokedex__body {
  width: 100%;
  margin-top: 20px;
}

.pokedex__busqueda {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
}

.pokedex__sugerencias {
  position: absolute;
  top: 40px;
  left: 0;
  width: 100%;
  background-color: #fff;
  color: #000;
  border: 1px solid #000;
  border-radius: 5px;
  z-index: 10;
  max-height: 150px;
  overflow-y: auto;
  transition: max-height 0.3s;
}

.pokedex__sugerencias ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pokedex__sugerencias li {
  padding: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pokedex__sugerencias li:hover {
  background-color: #eee;
}
</style>
