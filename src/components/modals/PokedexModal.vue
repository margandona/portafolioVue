<template>
  <div class="pokedex-modal" v-if="isPokedexModalVisible" :class="{ 'minimized': isMinimized }">
    <template v-if="!isMinimized">
      <div class="modal" tabindex="-1">
        <div class="modal-backdrop" @click="hidePokedexModal"></div>
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Pokédex</h5>
              <div class="modal-controls">
                <button type="button" class="control-btn minimize-btn" @click="minimizePokedex">
                  <i class="fas fa-window-minimize"></i>
                </button>
                <button type="button" class="close" @click="hidePokedexModal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            </div>
            <div class="modal-body">
              <div class="pokedex-container">
                <div class="pokedex">
                  <pokedex-screen 
                    ref="pokedexScreen"
                    :current-id="currentId"
                    @prev-pokemon="prevPokemon"
                    @next-pokemon="nextPokemon"
                    @clear-screen="limpiarPantalla"
                    @toggle-options="toggleOptionsMenu"
                  />
                  
                  <pokedex-search
                    ref="pokedexSearch"
                    @search="searchPokemon"
                    @input-changed="handleSearchInput"
                  />
                  
                  <pokedex-info
                    ref="pokedexInfo"
                  />
                  
                  <pokedex-menus
                    ref="pokedexMenus"
                    :historial="historial"
                    :favoritos="favoritos"
                    @toggle-history="toggleHistory"
                    @toggle-favorites="toggleFavorites"
                    @load-pokemon="cargarPokemon"
                    @save-favorite="guardarFavorito"
                    @delete-favorite="borrarFavorito"
                  />
                </div>
              </div>
              
              <div ref="optionsMenu" class="options-menu">
                <button class="btn btn-primary" @click="increaseFontSize">
                  <i class="fas fa-text-height"></i> Aumentar Letra
                </button>
                <button class="btn btn-primary" @click="decreaseFontSize">
                  <i class="fas fa-text-height"></i> Disminuir Letra
                </button>
                <button class="btn btn-danger" @click="resetSettings">
                  <i class="fas fa-undo"></i> Restaurar
                </button>
                <button class="btn btn-danger" @click="clearData">
                  <i class="fas fa-trash"></i> Borrar Datos
                </button>
              </div>
              
              <!-- Toasts -->
              <div aria-live="polite" aria-atomic="true" style="position: relative; z-index: 1000;">
                <div ref="toastContainer" style="position: absolute; top: 10px; right: 10px;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <div v-else class="pokedex-minimized" @click="maximizePokedex">
      <i class="fas fa-gamepad pokedex-icon"></i>
      <span>Pokédex</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import PokedexScreen from '@/components/pokedex/PokedexScreen.vue';
import PokedexSearch from '@/components/pokedex/PokedexSearch.vue';
import PokedexInfo from '@/components/pokedex/PokedexInfo.vue';
import PokedexMenus from '@/components/pokedex/PokedexMenus.vue';

export default {
  name: 'PokedexModal',
  components: {
    PokedexScreen,
    PokedexSearch,
    PokedexInfo,
    PokedexMenus
  },
  data() {
    return {
      pokemonData: null,
      currentId: 1,
      favoritos: [],
      historial: [],
      intervalId: null,
      optionsVisible: false,
      isMinimized: false
    };
  },
  computed: {
    ...mapGetters('modals', ['isPokedexModalVisible'])
  },
  methods: {
    hidePokedexModal() {
      this.$store.dispatch('modals/hidePokedexModal');
      clearInterval(this.intervalId);
    },
    minimizePokedex() {
      this.isMinimized = true;
    },
    maximizePokedex() {
      this.isMinimized = false;
    },
    cargarPokemon(id) {
      this.$refs.pokedexInfo.setLoading();
      
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Pokémon no encontrado');
          }
          return response.json();
        })
        .then(data => {
          this.pokemonData = data;
          this.currentId = data.id;
          this.$refs.pokedexScreen.setPokemon(data);
          this.$refs.pokedexInfo.showPokemon(data);
          this.agregarAlHistorial(data);
          this.guardarEstado(data);
        })
        .catch(() => {
          this.$refs.pokedexInfo.setError();
          this.mostrarToast('Error', 'Pokémon no encontrado', 'bg-danger');
        });
    },
    agregarAlHistorial(pokemon) {
      const timestamp = new Date().toLocaleString();
      this.historial.push({ 
        id: pokemon.id, 
        name: pokemon.name, 
        sprites: pokemon.sprites, 
        types: pokemon.types, 
        timestamp: timestamp 
      });
      localStorage.setItem('historial', JSON.stringify(this.historial));
    },
    guardarFavorito(id) {
      if (!this.favoritos.find(f => f.id === id)) {
        const pokemon = this.historial.find(p => p.id === id);
        if (pokemon) {
          this.favoritos.push(pokemon);
          localStorage.setItem('favoritos', JSON.stringify(this.favoritos));
          this.$refs.pokedexMenus.updateFavoritos(this.favoritos);
          this.mostrarToast('Éxito', 'Pokémon agregado a favoritos', 'bg-success');
        }
      } else {
        this.mostrarToast('Error', 'Pokémon ya está en favoritos', 'bg-warning');
      }
    },
    borrarFavorito(id) {
      this.favoritos = this.favoritos.filter(f => f.id !== id);
      localStorage.setItem('favoritos', JSON.stringify(this.favoritos));
      this.$refs.pokedexMenus.updateFavoritos(this.favoritos);
      this.mostrarToast('Éxito', 'Pokémon eliminado de favoritos', 'bg-success');
    },
    guardarEstado(pokemon) {
      localStorage.setItem('currentPokemon', JSON.stringify(pokemon));
    },
    clearData() {
      localStorage.removeItem('historial');
      localStorage.removeItem('favoritos');
      localStorage.removeItem('currentPokemon');
      this.historial = [];
      this.favoritos = [];
      this.$refs.pokedexMenus.updateFavoritos(this.favoritos);
      this.$refs.pokedexMenus.updateHistorial(this.historial);
      this.mostrarToast('Éxito', 'Datos guardados eliminados', 'bg-success');
    },
    limpiarPantalla() {
      this.$refs.pokedexScreen.clearScreen();
      this.$refs.pokedexInfo.clearInfo();
      this.mostrarToast('Éxito', 'Pantalla limpiada', 'bg-success');
    },
    mostrarToast(titulo, mensaje, clase) {
      const toastHtml = `
        <div class="toast ${clase}" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header">
            <strong class="mr-auto">${titulo}</strong>
            <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="toast-body">
            ${mensaje}
          </div>
        </div>
      `;
      this.$refs.toastContainer.innerHTML += toastHtml;
      
      // Use vanilla JS to manually create and show the toast
      const toasts = this.$refs.toastContainer.querySelectorAll('.toast');
      const toast = toasts[toasts.length - 1];
      
      // Add showing class to animate it in
      toast.classList.add('showing');
      
      // Hide and remove after 3 seconds
      setTimeout(() => {
        toast.classList.remove('showing');
        setTimeout(() => {
          toast.remove();
        }, 500); // Wait for the fade out animation
      }, 3000);
    },
    handleSearchInput(query) {
      if (query.length > 1) {
        fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`)
          .then(response => response.json())
          .then(data => {
            const resultados = data.results.filter(pokemon => pokemon.name.includes(query.toLowerCase()));
            this.$refs.pokedexSearch.setSuggestions(resultados);
          })
          .catch(() => {
            this.mostrarToast('Error', 'No se pudo obtener las sugerencias', 'bg-danger');
          });
      } else {
        this.$refs.pokedexSearch.clearSuggestions();
      }
    },
    nextPokemon() {
      this.cargarPokemon(this.currentId + 1);
    },
    prevPokemon() {
      if (this.currentId > 1) {
        this.cargarPokemon(this.currentId - 1);
      }
    },
    searchPokemon(filtro) {
      if (filtro) {
        this.cargarPokemon(filtro);
      } else {
        this.mostrarToast('Error', 'Por favor ingrese un nombre, ID o tipo de Pokémon', 'bg-warning');
      }
    },
    toggleHistory() {
      this.$refs.pokedexMenus.toggleHistory();
    },
    toggleFavorites() {
      this.$refs.pokedexMenus.toggleFavorites();
    },
    toggleOptionsMenu() {
      this.optionsVisible = !this.optionsVisible;
      this.$refs.optionsMenu.classList.toggle('visible');
    },
    increaseFontSize() {
      document.body.classList.add('large-font');
    },
    decreaseFontSize() {
      document.body.classList.remove('large-font');
    },
    resetSettings() {
      document.body.classList.remove('large-font');
    }
  },
  mounted() {
    // Expose component instance for global access
    window.pokedexVue = this;
    
    // Load saved data
    this.historial = JSON.parse(localStorage.getItem('historial')) || [];
    this.favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    
    // Update child components with data
    this.$nextTick(() => {
      this.$refs.pokedexMenus.updateHistorial(this.historial);
      this.$refs.pokedexMenus.updateFavoritos(this.favoritos);
    });
    
    // Try to load the last Pokemon
    const lastPokemon = JSON.parse(localStorage.getItem('currentPokemon'));
    if (lastPokemon) {
      this.cargarPokemon(lastPokemon.id);
    }
  },
  beforeUnmount() {
    // Cleanup when component is destroyed
    delete window.pokedexVue; // Remove global reference
  }
};
</script>

<style scoped>
.pokedex-modal {
  z-index: 1050;
}

.modal {
  display: block;
  position: fixed;
  z-index: 1050;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  outline: 0;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-dialog {
  position: relative;
  width: auto;
  margin: 1.75rem auto;
  z-index: 1050;
}

.modal-dialog-centered {
  display: flex;
  align-items: center;
  min-height: calc(100% - 3.5rem);
}

.modal-xl {
  max-width: 90%;
}

.modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.3rem;
  outline: 0;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  border-top-left-radius: 0.3rem;
  border-top-right-radius: 0.3rem;
}

.modal-body {
  position: relative;
  flex: 1 1 auto;
  padding: 1rem;
}

.modal-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  transform: scale(1.2);
}

.minimize-btn:hover {
  color: #ffca28;
}

.close {
  float: right;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: #000;
  text-shadow: 0 1px 0 #fff;
  opacity: 0.5;
  background: transparent;
  border: 0;
  padding: 0;
  margin: 0;
}

.close:hover {
  color: #000;
  opacity: 0.75;
}

/* Pokedex Container Styles */
.pokedex-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.pokedex {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ff0000;
  border: 10px solid #000;
  border-radius: 15px;
  width: 400px;
  padding: 10px;
  color: #fff;
  position: relative;
  margin: 0 auto;
}

/* Toast Styles */
.toast {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 10000;
  min-width: 200px;
  transition: opacity 0.5s, transform 0.5s;
}

.toast.showing {
  transform: translateY(-20px);
  opacity: 1;
}

.toast:not(.showing) {
  transform: translateY(0);
  opacity: 0;
}

/* Options Menu Styles */
.options-menu {
  display: none;
  position: absolute;
  top: 50px;
  right: 50%;
  transform: translateX(50%);
  background-color: #fff;
  color: #000;
  border: 2px solid #000;
  border-radius: 10px;
  padding: 10px;
  width: 200px;
  z-index: 1000;
}

.options-menu.visible {
  display: block;
}

.options-menu button {
  width: 100%;
  margin-bottom: 10px;
}

/* Minimized Pokedex Styles */
.pokedex-minimized {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: linear-gradient(135deg, #ff0000, #cc0000);
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

.pokedex-minimized:hover {
  transform: scale(1.05);
}

.pokedex-icon {
  font-size: 24px;
  color: white;
  animation: spin 3s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Global Font Size Class */
:global(.large-font) {
  font-size: 1.2em !important;
}

@media (max-width: 768px) {
  .pokedex {
    width: 300px;
  }
  
  .modal-xl {
    max-width: 95%;
  }
}
</style>
