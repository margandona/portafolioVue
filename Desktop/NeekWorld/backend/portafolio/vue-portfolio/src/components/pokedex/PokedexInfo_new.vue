<template>
  <div class="pokedex__info">
    <!-- Vista principal: Menú de botones -->
    <div v-if="currentView === 'menu'" class="info-menu">
      <div class="menu-buttons">
        <button 
          class="btn btn-secondary btn-menu" 
          @click="changeView('basic')"
        >
          <i class="fas fa-info-circle"></i> Información Básica
        </button>
        
        <button 
          class="btn btn-secondary btn-menu" 
          @click="changeView('stats')"
        >
          <i class="fas fa-chart-bar"></i> Estadísticas
        </button>
        
        <button 
          class="btn btn-secondary btn-menu" 
          @click="changeView('species')"
        >
          <i class="fas fa-dna"></i> Información de Especie
        </button>
        
        <button 
          class="btn btn-secondary btn-menu" 
          @click="changeView('evolution')"
        >
          <i class="fas fa-exchange-alt"></i> Cadena Evolutiva
        </button>
        
        <button 
          class="btn btn-secondary btn-menu" 
          @click="changeView('games')"
        >
          <i class="fas fa-gamepad"></i> Información de Juegos
        </button>
        
        <button 
          class="btn btn-secondary btn-menu" 
          @click="changeView('moves')"
        >
          <i class="fas fa-fist-raised"></i> Movimientos
        </button>
      </div>
    </div>

    <!-- Vista de Información Básica -->
    <div v-if="currentView === 'basic'" class="info-content">
      <button class="btn btn-primary btn-back" @click="changeView('menu')">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
      
      <div class="basic-info-content" v-if="currentPokemon">
        <h3><i class="fas fa-info-circle"></i> Información Básica de {{ capitalizarNombre(currentPokemon.name) }}</h3>
        
        <div class="basic-info-grid">
          <div class="info-item">
            <span class="info-label"><i class="fas fa-ruler-vertical"></i> Altura:</span>
            <span class="info-value">{{ (currentPokemon.height / 10).toFixed(1) }} m</span>
          </div>
          
          <div class="info-item">
            <span class="info-label"><i class="fas fa-weight"></i> Peso:</span>
            <span class="info-value">{{ (currentPokemon.weight / 10).toFixed(1) }} kg</span>
          </div>
          
          <div class="info-item">
            <span class="info-label"><i class="fas fa-tags"></i> Tipos:</span>
            <div class="types-container">
              <span v-for="type in currentPokemon.types" :key="type.type.name" 
                    :class="type.type.name" class="type-badge">
                {{ capitalizarNombre(type.type.name) }}
              </span>
            </div>
          </div>
          
          <div class="info-item">
            <span class="info-label"><i class="fas fa-star"></i> Habilidades:</span>
            <div class="abilities-container">
              <div v-for="ability in currentPokemon.abilities" :key="ability.ability.name" class="ability-item">
                {{ capitalizarNombre(ability.ability.name) }}
                <span v-if="ability.is_hidden" class="hidden-ability">(Oculta)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button class="btn btn-primary btn-back btn-back-bottom" @click="changeView('menu')">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
    </div>

    <!-- Vista de Estadísticas -->
    <div v-if="currentView === 'stats'" class="info-content">
      <button class="btn btn-primary btn-back" @click="changeView('menu')">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
      
      <div class="stats-content" v-if="currentPokemon">
        <h3><i class="fas fa-chart-bar"></i> Estadísticas de {{ capitalizarNombre(currentPokemon.name) }}</h3>
        <div class="stats-grid">
          <div class="stat-item" v-for="stat in currentPokemon.stats" :key="stat.stat.name">
            <span class="stat-name">{{ formatStatName(stat.stat.name) }}</span>
            <div class="stat-bar-container">
              <div class="stat-bar" :style="{ width: (stat.base_stat / 255 * 100) + '%' }"></div>
              <span class="stat-value">{{ stat.base_stat }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <button class="btn btn-primary btn-back btn-back-bottom" @click="changeView('menu')">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
    </div>

    <!-- Vista de Información de Especie -->
    <div v-if="currentView === 'species'" class="info-content">
      <button class="btn btn-primary btn-back" @click="changeView('menu')">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
      
      <div class="species-content" v-if="pokemonSpeciesData">
        <h3><i class="fas fa-dna"></i> Información de Especie</h3>
        <div class="species-info">
          <div class="info-section" v-if="pokemonSpeciesData.flavor_text_entries">
            <h4>Descripción</h4>
            <p class="description">{{ getFlavorText() }}</p>
          </div>
          <div class="info-section">
            <h4>Datos de Especie</h4>
            <p><strong>Color:</strong> {{ capitalizarNombre(pokemonSpeciesData.color?.name || 'No disponible') }}</p>
            <p><strong>Hábitat:</strong> {{ capitalizarNombre(pokemonSpeciesData.habitat?.name || 'No disponible') }}</p>
            <p><strong>Felicidad Base:</strong> {{ pokemonSpeciesData.base_happiness || 'No disponible' }}</p>
            <p><strong>Tasa de Captura:</strong> {{ pokemonSpeciesData.capture_rate || 'No disponible' }}</p>
          </div>
        </div>
      </div>
      
      <button class="btn btn-primary btn-back btn-back-bottom" @click="changeView('menu')">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
    </div>

    <!-- Vista de Cadena Evolutiva -->
    <div v-if="currentView === 'evolution'" class="info-content">
      <button class="btn btn-primary btn-back" @click="changeView('menu')">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
      
      <div class="evolution-content" v-if="evolutionChainData">
        <h3><i class="fas fa-exchange-alt"></i> Cadena Evolutiva</h3>
        <div class="evolution-chain">
          <div class="evolution-step" v-for="evolution in evolutionChainData" :key="evolution.name">
            <div class="evolution-pokemon">
              <img :src="evolution.sprite" :alt="evolution.name" class="evolution-image">
              <h4>{{ capitalizarNombre(evolution.name) }}</h4>
              <p v-if="evolution.level" class="evolution-trigger">Nivel {{ evolution.level }}</p>
              <p v-if="evolution.method && evolution.method !== 'level-up'" class="evolution-trigger">{{ evolution.method }}</p>
            </div>
            <div v-if="evolution.next" class="evolution-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>
      
      <button class="btn btn-primary btn-back btn-back-bottom" @click="changeView('menu')">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
    </div>

    <!-- Vista de Información de Juegos -->
    <div v-if="currentView === 'games'" class="info-content">
      <button class="btn btn-primary btn-back" @click="changeView('menu')">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
      
      <div class="games-content" v-if="currentPokemon">
        <h3><i class="fas fa-gamepad"></i> Información de Juegos</h3>
        <div class="games-info">
          <div class="info-section">
            <h4>Experiencia y Crecimiento</h4>
            <p><strong>Experiencia Base:</strong> {{ currentPokemon.base_experience || 'No disponible' }}</p>
            <p v-if="pokemonSpeciesData?.egg_groups"><strong>Grupo de Huevo:</strong> 
              {{ pokemonSpeciesData.egg_groups.map(group => capitalizarNombre(group.name)).join(', ') }}
            </p>
            <p v-if="pokemonSpeciesData?.hatch_counter"><strong>Pasos para Eclosionar:</strong> 
              {{ pokemonSpeciesData.hatch_counter * 255 }} pasos
            </p>
          </div>
        </div>
      </div>
      
      <button class="btn btn-primary btn-back btn-back-bottom" @click="changeView('menu')">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
    </div>

    <!-- Vista de Movimientos -->
    <div v-if="currentView === 'moves'" class="info-content">
      <button class="btn btn-primary btn-back" @click="changeView('menu')">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
      
      <div class="moves-content" v-if="currentPokemon?.moves">
        <h3><i class="fas fa-fist-raised"></i> Movimientos de {{ capitalizarNombre(currentPokemon.name) }}</h3>
        <div class="moves-counter">
          <span class="badge bg-info">{{ currentPokemon.moves.length }} movimientos disponibles</span>
        </div>
        <div class="moves-list">
          <div class="moves-grid">
            <div v-for="move in currentPokemon.moves.slice(0, 20)" :key="move.move.name" class="move-item">
              <span class="move-name">{{ capitalizarNombre(move.move.name) }}</span>
              <span class="move-level">Nivel: {{ move.version_group_details[0]?.level_learned_at || 'N/A' }}</span>
            </div>
          </div>
          <p v-if="currentPokemon.moves.length > 20" class="moves-note">
            Mostrando los primeros 20 de {{ currentPokemon.moves.length }} movimientos
          </p>
        </div>
      </div>
      
      <button class="btn btn-primary btn-back btn-back-bottom" @click="changeView('menu')">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PokedexInfo',
  data() {
    return {
      currentView: 'menu', // 'menu', 'basic', 'stats', 'species', 'evolution', 'games', 'moves'
      currentPokemon: null,
      pokemonSpeciesData: null,
      evolutionChainData: null
    };
  },
  methods: {
    async showPokemon(pokemon) {
      this.currentPokemon = pokemon;
      this.currentView = 'menu';
      
      // Limpiar datos anteriores
      this.pokemonSpeciesData = null;
      this.evolutionChainData = null;
    },
    
    changeView(view) {
      this.currentView = view;
      
      // Cargar datos específicos cuando se necesiten
      if (view === 'species' && !this.pokemonSpeciesData) {
        this.fetchSpeciesData();
      } else if (view === 'evolution' && !this.evolutionChainData) {
        this.fetchEvolutionData();
      }
    },

    async fetchSpeciesData() {
      if (!this.currentPokemon) return;
      
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${this.currentPokemon.id}/`);
        this.pokemonSpeciesData = await response.json();
      } catch (error) {
        console.error('Error fetching species data:', error);
      }
    },

    async fetchEvolutionData() {
      if (!this.currentPokemon) return;
      
      try {
        // Primero obtener la especie si no la tenemos
        if (!this.pokemonSpeciesData) {
          await this.fetchSpeciesData();
        }
        
        if (this.pokemonSpeciesData?.evolution_chain?.url) {
          const response = await fetch(this.pokemonSpeciesData.evolution_chain.url);
          const evolutionChain = await response.json();
          this.evolutionChainData = await this.parseEvolutionChain(evolutionChain.chain);
        }
      } catch (error) {
        console.error('Error fetching evolution data:', error);
      }
    },

    async parseEvolutionChain(chain) {
      const evolutionData = [];
      
      const addEvolution = async (pokemon, level = null, method = null) => {
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.species.name}/`);
          const pokemonData = await response.json();
          
          evolutionData.push({
            name: pokemon.species.name,
            sprite: pokemonData.sprites.front_default,
            level: level,
            method: method,
            next: pokemon.evolves_to.length > 0
          });
        } catch (error) {
          console.error('Error fetching evolution pokemon:', error);
        }
      };

      // Pokémon base
      await addEvolution(chain);

      // Evoluciones
      for (const evolution of chain.evolves_to) {
        const evoDetail = evolution.evolution_details[0];
        const level = evoDetail?.min_level;
        const method = evoDetail?.trigger?.name;
        
        await addEvolution(evolution, level, method);

        // Tercera evolución
        for (const thirdEvolution of evolution.evolves_to) {
          const thirdEvoDetail = thirdEvolution.evolution_details[0];
          const thirdLevel = thirdEvoDetail?.min_level;
          const thirdMethod = thirdEvoDetail?.trigger?.name;
          
          await addEvolution(thirdEvolution, thirdLevel, thirdMethod);
        }
      }

      return evolutionData;
    },

    getFlavorText() {
      if (!this.pokemonSpeciesData?.flavor_text_entries) return 'No hay descripción disponible';
      
      // Buscar texto en español
      const spanishText = this.pokemonSpeciesData.flavor_text_entries.find(
        entry => entry.language.name === 'es'
      );
      
      if (spanishText) return spanishText.flavor_text.replace(/\f/g, ' ');
      
      // Si no hay español, buscar en inglés
      const englishText = this.pokemonSpeciesData.flavor_text_entries.find(
        entry => entry.language.name === 'en'
      );
      
      return englishText ? englishText.flavor_text.replace(/\f/g, ' ') : 'No hay descripción disponible';
    },

    formatStatName(statName) {
      const statNames = {
        'hp': 'HP',
        'attack': 'Ataque',
        'defense': 'Defensa',
        'special-attack': 'Ataque Especial',
        'special-defense': 'Defensa Especial',
        'speed': 'Velocidad'
      };
      return statNames[statName] || this.capitalizarNombre(statName);
    },

    capitalizarNombre(nombre) {
      return nombre.charAt(0).toUpperCase() + nombre.slice(1);
    }
  }
};
</script>

<style scoped>
.pokedex__info {
  width: 100%;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: white;
  min-height: 400px;
}

/* Estilos del menú principal */
.info-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
}

.btn-menu {
  width: 100%;
  padding: 15px 20px;
  font-size: 1.1em;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-menu:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-menu i {
  font-size: 1.2em;
}

/* Estilos de contenido de vistas */
.info-content {
  animation: slideIn 0.3s ease-in-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.btn-back {
  margin-bottom: 20px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-back-bottom {
  margin-top: 20px;
  margin-bottom: 0;
}

/* Información básica */
.basic-info-content h3 {
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.5em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.basic-info-grid {
  display: grid;
  gap: 20px;
}

.info-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #f0f0f0;
}

.info-value {
  font-size: 1.2em;
  font-weight: 700;
  color: #fff;
}

.types-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.type-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.abilities-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ability-item {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 500;
}

.hidden-ability {
  font-style: italic;
  color: #ffd700;
  margin-left: 5px;
}

/* Estadísticas */
.stats-content h3 {
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.5em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.stats-grid {
  display: grid;
  gap: 15px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-name {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #f0f0f0;
}

.stat-bar-container {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.stat-bar {
  height: 20px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 10px;
  transition: width 0.5s ease;
  flex: 1;
  position: relative;
  overflow: hidden;
}

.stat-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.stat-value {
  font-weight: 700;
  color: #fff;
  min-width: 40px;
  text-align: right;
}

/* Especies */
.species-content h3 {
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.5em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.species-info {
  display: grid;
  gap: 20px;
}

.info-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-section h4 {
  margin-bottom: 15px;
  color: #f0f0f0;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 8px;
}

.description {
  line-height: 1.6;
  font-size: 1.1em;
  text-align: justify;
}

/* Evoluciones */
.evolution-content h3 {
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.5em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.evolution-chain {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.evolution-step {
  display: flex;
  align-items: center;
  gap: 20px;
}

.evolution-pokemon {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.evolution-image {
  width: 80px;
  height: 80px;
  margin-bottom: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  padding: 5px;
}

.evolution-pokemon h4 {
  margin-bottom: 5px;
  color: #f0f0f0;
}

.evolution-trigger {
  font-size: 0.9em;
  color: #ffd700;
  margin: 0;
}

.evolution-arrow {
  color: #ffd700;
  font-size: 1.5em;
}

/* Juegos */
.games-content h3 {
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.5em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* Movimientos */
.moves-content h3 {
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.5em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.moves-counter {
  text-align: center;
  margin-bottom: 20px;
}

.badge {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: 600;
}

.moves-grid {
  display: grid;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
}

.move-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.move-name {
  font-weight: 600;
  color: #f0f0f0;
}

.move-level {
  font-size: 0.9em;
  color: #ffd700;
}

.moves-note {
  text-align: center;
  margin-top: 15px;
  font-style: italic;
  color: #f0f0f0;
}

/* Colores de tipos Pokémon */
.normal { background: linear-gradient(135deg, #A8A878, #C6C684); }
.fire { background: linear-gradient(135deg, #F08030, #FF9F5F); }
.water { background: linear-gradient(135deg, #6890F0, #8FA8FF); }
.electric { background: linear-gradient(135deg, #F8D030, #FFE066); color: #333; }
.grass { background: linear-gradient(135deg, #78C850, #A0DB71); }
.ice { background: linear-gradient(135deg, #98D8D8, #BCE8E8); color: #333; }
.fighting { background: linear-gradient(135deg, #C03028, #D05850); }
.poison { background: linear-gradient(135deg, #A040A0, #C768C7); }
.ground { background: linear-gradient(135deg, #E0C068, #EDD294); color: #333; }
.flying { background: linear-gradient(135deg, #A890F0, #C7B0FF); }
.psychic { background: linear-gradient(135deg, #F85888, #FF7FA7); }
.bug { background: linear-gradient(135deg, #A8B820, #C6D16E); }
.rock { background: linear-gradient(135deg, #B8A038, #D1C166); }
.ghost { background: linear-gradient(135deg, #705898, #9183C7); }
.dragon { background: linear-gradient(135deg, #7038F8, #A27DFA); }
.dark { background: linear-gradient(135deg, #705848, #A08A7A); }
.steel { background: linear-gradient(135deg, #B8B8D0, #D6D6ED); color: #333; }
.fairy { background: linear-gradient(135deg, #EE99AC, #F4B7C7); color: #333; }

/* Responsive */
@media (min-width: 768px) {
  .basic-info-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .species-info {
    grid-template-columns: 1fr;
  }
  
  .moves-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .evolution-chain {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .pokedex__info {
    padding: 15px;
  }
  
  .btn-menu {
    padding: 12px 15px;
    font-size: 1em;
  }
  
  .basic-info-content h3,
  .stats-content h3,
  .species-content h3,
  .evolution-content h3,
  .games-content h3,
  .moves-content h3 {
    font-size: 1.3em;
  }
}

/* Scrollbar personalizada */
.moves-grid::-webkit-scrollbar {
  width: 8px;
}

.moves-grid::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.moves-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 10px;
}

.moves-grid::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
