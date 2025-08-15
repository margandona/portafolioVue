<template>
  <div class="pokedex__body">
    <div class="pokedex__busqueda">
      <div class="search-container">
        <div class="input-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input ref="searchInput" type="text" class="search-input" 
            placeholder="Buscar Pokémon por nombre, ID o tipo"
            @input="handleInput"
            @keyup.enter="search"
            aria-label="Buscar Pokémon por nombre, ID o tipo">
          <div class="input-highlight"></div>
        </div>
        <div ref="suggestions" class="pokedex__sugerencias" aria-live="polite"></div>
        <button class="search-btn" @click="search">
          <span class="btn-content">
            <i class="fas fa-search"></i>
            <span class="btn-text">Buscar</span>
          </span>
          <div class="btn-glow"></div>
        </button>
      </div>
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
      if (sugerenciasHtml) {
        this.$refs.suggestions.innerHTML = '<ul>' + sugerenciasHtml + '</ul>';
      } else {
        this.$refs.suggestions.innerHTML = '';
      }
    },
    clearSuggestions() {
      this.$refs.suggestions.innerHTML = '';
    },
    clearSearch() {
      this.$refs.searchInput.value = '';
      this.clearSuggestions();
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

.search-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: relative;
}

/* Input moderno con efectos */
.input-wrapper {
  position: relative;
  overflow: hidden;
}

.search-input {
  width: 100%;
  padding: 15px 20px 15px 50px;
  font-size: 1.1em;
  border: 2px solid transparent;
  border-radius: 25px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.9));
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.8);
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #333;
  backdrop-filter: blur(10px);
  font-weight: 500;
}

.search-input::placeholder {
  color: #666;
  font-weight: 400;
}

.search-input:focus {
  border-color: #4facfe;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 245, 0.95));
  box-shadow: 
    0 12px 40px rgba(79, 172, 254, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.9),
    0 0 0 4px rgba(79, 172, 254, 0.1);
  transform: translateY(-2px);
}

.search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 1.2em;
  z-index: 2;
  transition: all 0.3s ease;
}

.search-input:focus + .search-icon {
  color: #4facfe;
  transform: translateY(-50%) scale(1.1);
}

.input-highlight {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
}

.search-input:focus ~ .input-highlight {
  width: 100%;
}

/* Botón de búsqueda moderno */
.search-btn {
  position: relative;
  padding: 15px 30px;
  font-size: 1.1em;
  font-weight: 600;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 8px 32px rgba(102, 126, 234, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  min-height: 55px;
}

.search-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 
    0 12px 40px rgba(102, 126, 234, 0.5),
    0 4px 16px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.search-btn:active {
  transform: translateY(-1px) scale(0.98);
  transition: all 0.1s ease;
}

.btn-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.btn-text {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.search-btn:hover .btn-glow {
  left: 100%;
}

/* Sugerencias modernas */
.pokedex__sugerencias {
  position: absolute;
  top: 65px;
  left: 0;
  width: 100%;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 240, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.1),
    0 8px 24px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
}

.pokedex__sugerencias:not(:empty) {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.pokedex__sugerencias ul {
  list-style: none;
  padding: 8px;
  margin: 0;
}

.pokedex__sugerencias li {
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #333;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.pokedex__sugerencias li::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(79, 172, 254, 0.1), transparent);
  transition: left 0.3s ease;
}

.pokedex__sugerencias li:hover {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(0, 242, 254, 0.1));
  color: #4facfe;
  transform: translateX(5px);
  box-shadow: 0 4px 16px rgba(79, 172, 254, 0.2);
}

.pokedex__sugerencias li:hover::before {
  left: 100%;
}

/* Animación de entrada para las sugerencias */
.pokedex__sugerencias li {
  animation: slideInSuggestion 0.3s ease forwards;
  opacity: 0;
  transform: translateX(-20px);
}

.pokedex__sugerencias li:nth-child(1) { animation-delay: 0.05s; }
.pokedex__sugerencias li:nth-child(2) { animation-delay: 0.1s; }
.pokedex__sugerencias li:nth-child(3) { animation-delay: 0.15s; }
.pokedex__sugerencias li:nth-child(4) { animation-delay: 0.2s; }
.pokedex__sugerencias li:nth-child(5) { animation-delay: 0.25s; }

@keyframes slideInSuggestion {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Scrollbar personalizada para sugerencias */
.pokedex__sugerencias::-webkit-scrollbar {
  width: 6px;
}

.pokedex__sugerencias::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.pokedex__sugerencias::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  border-radius: 10px;
}

.pokedex__sugerencias::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

/* Responsive */
@media (max-width: 768px) {
  .search-input {
    padding: 12px 16px 12px 45px;
    font-size: 1em;
  }
  
  .search-btn {
    padding: 12px 24px;
    font-size: 1em;
    min-height: 50px;
  }
  
  .search-icon {
    left: 15px;
    font-size: 1.1em;
  }
}

@media (max-width: 480px) {
  .pokedex__busqueda {
    margin-bottom: 15px;
  }
  
  .search-container {
    gap: 12px;
  }
  
  .search-input {
    padding: 10px 14px 10px 40px;
    font-size: 0.95em;
    border-radius: 20px;
  }
  
  .search-btn {
    padding: 10px 20px;
    font-size: 0.95em;
    min-height: 45px;
    border-radius: 20px;
  }
  
  .search-icon {
    left: 12px;
    font-size: 1em;
  }
  
  .btn-text {
    font-size: 0.9em;
  }
}

/* Efectos adicionales para interactividad */
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  }
  50% {
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.6);
  }
}

.search-btn:focus {
  animation: pulse 2s infinite;
  outline: none;
}

/* Efecto de ondas al hacer clic */
.search-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.search-btn:active::after {
  width: 300px;
  height: 300px;
}
</style>
