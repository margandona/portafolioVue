<template>
  <div class="pokedex-modal" v-if="isPokedexModalVisible">
    <div class="pokedex-container">
      <div class="pokedex">
        <div class="modal-close-button" @click="closePokedex">
          <i class="fas fa-times"></i>
        </div>
        <div class="pokedex__header">
          <div class="pokedex__top">
            <div id="pokedex-circle" class="pokedex__circle blue"></div>
            <div class="pokedex__lights">
              <div class="pokedex__light pokedex__light--blue"></div>
              <div class="pokedex__light pokedex__light--yellow"></div>
              <div class="pokedex__light pokedex__light--green"></div>
            </div>
            <button id="toggle-options" class="pokedex__button" @click="toggleOptions">
              <i class="fas fa-cog"></i>
            </button>
          </div>
          <div class="pokedex__screen">
            <h2 id="pokemon-name" class="pokedex__nombre"></h2>
            <img id="pokemon-image" class="pokedex__image" alt="Imagen de Pokémon" style="display:none;">
            <div id="pokemon-placeholder" class="pokedex__placeholder"></div>
          </div>
          <div class="pokedex__buttons">
            <button id="btn-prev" class="pokedex__button pokedex__button--left" @click="loadPreviousPokemon">
              <i class="fas fa-arrow-left"></i>
            </button>
            <button id="btn-next" class="pokedex__button pokedex__button--right" @click="loadNextPokemon">
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
        <div class="pokedex__body">
          <div class="pokedex__busqueda">
            <input id="search-input" type="text" class="form-control" placeholder="Buscar Pokémon por nombre, ID o tipo" 
                  aria-label="Buscar Pokémon por nombre, ID o tipo" 
                  v-model="searchQuery"
                  @input="findSuggestions">
            <div id="suggestions" class="pokedex__sugerencias" aria-live="polite" v-if="suggestions.length > 0">
              <ul>
                <li v-for="(suggestion, index) in suggestions" :key="index" @click="loadPokemon(suggestion.name)">
                  {{ suggestion.name }}
                </li>
              </ul>
            </div>
            <button id="search-btn" class="btn btn-primary" @click="searchPokemon">
              <i class="fas fa-search"></i> Buscar
            </button>
          </div>
          <div id="pokemon-info" class="pokedex__info"></div>
        </div>
        <div class="pokedex__menus">
          <button id="toggle-history" class="btn btn-secondary btn-menu" @click="toggleHistory">
            <i class="fas fa-history"></i> Historial
          </button>
          <div id="history" class="pokedex__historial" v-show="showHistory">
            <ul v-if="history.length > 0">
              <li v-for="(item, index) in history" :key="index" @click="loadPokemon(item.id)">
                <img :src="item.sprites.front_default" :alt="'Imagen de ' + item.name" class="pokedex__historial-imagen">
                <span>{{ item.id }} - {{ item.name }} ({{ item.timestamp }})</span>
                <span class="pokedex__types-list">
                  <span v-for="(type, tIndex) in item.types" :key="tIndex" :class="type.type.name">
                    {{ type.type.name }}
                  </span>
                </span>
              </li>
            </ul>
          </div>
          <button id="toggle-favorites" class="btn btn-secondary btn-menu" @click="toggleFavorites">
            <i class="fas fa-star"></i> Favoritos
          </button>
          <div id="favorites" class="pokedex__favoritos" v-show="showFavorites">
            <ul v-if="favorites.length > 0">
              <li v-for="(item, index) in favorites" :key="index" @click="loadPokemon(item.id)">
                <img :src="item.sprites.front_default" :alt="'Imagen de ' + item.name" class="pokedex__favoritos-imagen">
                <span>{{ item.id }} - {{ item.name }}</span>
                <span class="pokedex__types-list">
                  <span v-for="(type, tIndex) in item.types" :key="tIndex" :class="type.type.name">
                    {{ type.type.name }}
                  </span>
                </span>
                <button @click.stop="removeFavorite(item.id)" class="btn btn-danger btn-sm">
                  <i class="fas fa-trash"></i>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    
    <div id="options-menu" class="options-menu" :class="{ 'visible': showOptions }">
      <button id="increase-font" class="btn btn-primary" @click="increaseFontSize">
        <i class="fas fa-text-height"></i> Aumentar Letra
      </button>
      <button id="decrease-font" class="btn btn-primary" @click="decreaseFontSize">
        <i class="fas fa-text-height"></i> Disminuir Letra
      </button>
      <button id="reset-settings" class="btn btn-danger" @click="resetSettings">
        <i class="fas fa-undo"></i> Restaurar
      </button>
      <button id="clear-data" class="btn btn-danger" @click="clearData">
        <i class="fas fa-trash"></i> Borrar Datos
      </button>
    </div>
    
    <!-- Toasts -->
    <div id="toast-container" class="toast-container"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import '../../assets/css/pokedex.css'; // Assuming you have a CSS file for the Pokedex styles Assuming you have a CSS file for the Toast styles

export default {
  name: 'PokedexModal',
  data() {
    return {
      currentId: 1,
      pokemonData: null,
      favorites: [],
      history: [],
      showFavorites: false,
      showHistory: false,
      showOptions: false,
      circleColors: ['blue', 'green', 'yellow', 'red'],
      currentColorIndex: 0,
      colorInterval: null,
      searchQuery: '',
      suggestions: [],
      largeFontEnabled: false
    };
  },
  computed: {
    ...mapGetters('modals', ['isPokedexModalVisible'])
  },
  mounted() {
    // Load saved data
    this.favorites = JSON.parse(localStorage.getItem('favoritos')) || [];
    this.history = JSON.parse(localStorage.getItem('historial')) || [];
    
    // Start color cycling
    this.colorInterval = setInterval(this.changeCircleColor, 500);
    
    // Load default Pokemon
    this.loadPokemon(1);
  },
  beforeUnmount() {
    if (this.colorInterval) {
      clearInterval(this.colorInterval);
    }
  },
  methods: {
    closePokedex() {
      this.$store.dispatch('modals/hidePokedexModal');
    },
    loadPokemon(id) {
      document.getElementById('pokemon-info').innerHTML = '<div class="pokedex__loading">Cargando...</div>';
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Pokemon not found');
          }
          return response.json();
        })
        .then(data => {
          this.pokemonData = data;
          this.currentId = data.id;
          this.showPokemon(data);
          this.addToHistory(data);
          this.saveState(data);
        })
        .catch(() => {
          document.getElementById('pokemon-info').innerHTML = '<div class="pokedex__error">Pokémon no encontrado</div>';
          this.showToast('Error', 'Pokémon no encontrado', 'bg-danger');
        });
    },
    loadNextPokemon() {
      this.loadPokemon(this.currentId + 1);
    },
    loadPreviousPokemon() {
      if (this.currentId > 1) {
        this.loadPokemon(this.currentId - 1);
      }
    },
    showPokemon(pokemon) {
      const types = pokemon.types.map(t => `<li class="pokedex__types-item ${t.type.name}">${t.type.name}</li>`).join('');
      const stats = pokemon.stats.map(s => `<li><strong>${s.stat.name}:</strong> ${s.base_stat}</li>`).join('');
      const abilities = pokemon.abilities.map(a => `<li>${a.ability.name} (${a.is_hidden ? 'Oculta' : 'Visible'})</li>`).join('');
      const moves = pokemon.moves.map(m => `<li>${m.move.name} (Nivel: ${m.version_group_details[0].level_learned_at})</li>`).join('');
      
      document.getElementById('pokemon-name').textContent = this.capitalizeName(pokemon.name);
      const pokemonImage = document.getElementById('pokemon-image');
      pokemonImage.src = pokemon.sprites.front_default;
      pokemonImage.style.display = 'block';
      document.getElementById('pokemon-placeholder').style.display = 'none';
      
      document.getElementById('pokemon-info').innerHTML = `
        <div class="pokedex__pokemon">
          <h3 class="pokedex__nombre-pokemon">${this.capitalizeName(pokemon.name)}</h3>
          <div class="pokedex__details">
            <div class="pokedex__info-col">
              <div class="pokedex__info-item">
                <h3>Altura:</h3>
                <p>${pokemon.height} dm</p>
              </div>
              <div class="pokedex__info-item">
                <h3>Peso:</h3>
                <p>${pokemon.weight} hg</p>
              </div>
              <div class="pokedex__info-item">
                <h3>Experiencia base:</h3>
                <p>${pokemon.base_experience}</p>
              </div>
              <div class="pokedex__info-item">
                <h3>Tipos:</h3>
                <ul class="pokedex__types">${types}</ul>
              </div>
            </div>
            <div class="pokedex__info-col">
              <div class="pokedex__info-item">
                <h3>Estadísticas:</h3>
                <ul class="pokedex__stats">${stats}</ul>
              </div>
              <div class="pokedex__info-item">
                <h3>Habilidades:</h3>
                <ul class="pokedex__abilities">${abilities}</ul>
              </div>
              <div class="pokedex__info-item">
                <button class="btn btn-info" id="toggle-moves">
                  <i class="fas fa-list"></i> Ver Movimientos
                </button>
                <ul class="pokedex__moves" style="display: none;">${moves}</ul>
              </div>
              <div class="pokedex__info-item">
                <button class="btn btn-warning" onclick="document.querySelector('.pokedex-modal').__vue__.$options.methods.addToFavorites(${pokemon.id})">
                  <i class="fas fa-star"></i> Agregar a Favoritos
                </button>
                <button class="btn btn-danger" onclick="document.querySelector('.pokedex-modal').__vue__.$options.methods.removeFavorite(${pokemon.id})">
                  <i class="fas fa-trash"></i> Borrar de Favoritos
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      document.getElementById('toggle-moves').addEventListener('click', () => {
        const movesList = document.querySelector('.pokedex__moves');
        const isHidden = movesList.style.display === 'none';
        movesList.style.display = isHidden ? 'block' : 'none';
        document.getElementById('toggle-moves').textContent = isHidden ? 'Ocultar Movimientos' : 'Ver Movimientos';
      });

      this.searchQuery = '';
      this.suggestions = [];
    },
    capitalizeName(name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    },
    changeCircleColor() {
      this.currentColorIndex = (this.currentColorIndex + 1) % this.circleColors.length;
      document.getElementById('pokedex-circle').className = 'pokedex__circle ' + this.circleColors[this.currentColorIndex];
    },
    addToHistory(pokemon) {
      const timestamp = new Date().toLocaleString();
      const exists = this.history.findIndex(item => item.id === pokemon.id);
      
      if (exists >= 0) {
        this.history.splice(exists, 1);
      }
      
      this.history.unshift({ 
        id: pokemon.id, 
        name: pokemon.name, 
        sprites: pokemon.sprites, 
        types: pokemon.types, 
        timestamp: timestamp 
      });
      
      if (this.history.length > 10) {
        this.history.pop();
      }
      
      localStorage.setItem('historial', JSON.stringify(this.history));
    },
    addToFavorites(id) {
      if (!this.favorites.find(f => f.id === id)) {
        const pokemon = this.history.find(p => p.id === id) || this.pokemonData;
        if (pokemon) {
          this.favorites.push({
            id: pokemon.id,
            name: pokemon.name,
            sprites: pokemon.sprites,
            types: pokemon.types
          });
          localStorage.setItem('favoritos', JSON.stringify(this.favorites));
          this.showToast('Éxito', 'Pokémon agregado a favoritos', 'bg-success');
        }
      } else {
        this.showToast('Error', 'Pokémon ya está en favoritos', 'bg-warning');
      }
    },
    removeFavorite(id) {
      this.favorites = this.favorites.filter(f => f.id !== id);
      localStorage.setItem('favoritos', JSON.stringify(this.favorites));
      this.showToast('Éxito', 'Pokémon eliminado de favoritos', 'bg-success');
    },
    toggleHistory() {
      this.showHistory = !this.showHistory;
      if (this.showFavorites && this.showHistory) {
        this.showFavorites = false;
      }
    },
    toggleFavorites() {
      this.showFavorites = !this.showFavorites;
      if (this.showHistory && this.showFavorites) {
        this.showHistory = false;
      }
    },
    toggleOptions() {
      this.showOptions = !this.showOptions;
    },
    increaseFontSize() {
      document.body.classList.add('large-font');
      this.largeFontEnabled = true;
    },
    decreaseFontSize() {
      document.body.classList.remove('large-font');
      this.largeFontEnabled = false;
    },
    resetSettings() {
      document.body.classList.remove('large-font');
      this.largeFontEnabled = false;
    },
    clearData() {
      localStorage.removeItem('historial');
      localStorage.removeItem('favoritos');
      this.history = [];
      this.favorites = [];
      this.showToast('Éxito', 'Datos guardados eliminados', 'bg-success');
    },
    saveState(pokemon) {
      localStorage.setItem('currentPokemon', JSON.stringify(pokemon));
    },
    showToast(title, message, bgClass) {
      const toastContainer = document.getElementById('toast-container');
      const toastId = 'toast-' + Date.now();
      
      const toastHtml = `
        <div class="toast ${bgClass}" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header">
            <strong class="mr-auto">${title}</strong>
            <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="toast-body">
            ${message}
          </div>
        </div>
      `;
      
      toastContainer.insertAdjacentHTML('beforeend', toastHtml);
      const toastElement = document.getElementById(toastId);
      
      // Manual implementation of toast behavior
      toastElement.classList.add('showing');
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        toastElement.classList.remove('showing');
        setTimeout(() => {
          toastElement.remove();
        }, 500);
      }, 3000);
      
      // Close button functionality
      toastElement.querySelector('.close').addEventListener('click', () => {
        toastElement.classList.remove('showing');
        setTimeout(() => {
          toastElement.remove();
        }, 500);
      });
    },
    findSuggestions() {
      if (this.searchQuery.length > 1) {
        fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`)
          .then(response => response.json())
          .then(data => {
            this.suggestions = data.results.filter(pokemon => 
              pokemon.name.includes(this.searchQuery.toLowerCase())
            ).slice(0, 10);
          })
          .catch(() => {
            this.showToast('Error', 'No se pudo obtener las sugerencias', 'bg-danger');
          });
      } else {
        this.suggestions = [];
      }
    },
    searchPokemon() {
      if (this.searchQuery.trim()) {
        this.loadPokemon(this.searchQuery.toLowerCase());
      } else {
        this.showToast('Error', 'Por favor ingrese un nombre, ID o tipo de Pokémon', 'bg-warning');
      }
    }
  }
};


</script>
