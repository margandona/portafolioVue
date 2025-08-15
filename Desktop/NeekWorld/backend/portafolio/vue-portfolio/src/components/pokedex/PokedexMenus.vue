<template>
  <div class="pokedex__menus">
    <div class="menu-buttons">
      <button class="btn-modern btn-history" @click="$emit('toggle-history')">
        <div class="btn-content">
          <div class="btn-icon">
            <i class="fas fa-history"></i>
          </div>
          <div class="btn-text">
            <span class="btn-title">Historial</span>
            <span class="btn-subtitle">Pokémon visitados</span>
          </div>
          <div class="btn-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
        <div class="btn-glow"></div>
      </button>
      
      <button class="btn-modern btn-favorites" @click="$emit('toggle-favorites')">
        <div class="btn-content">
          <div class="btn-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="btn-text">
            <span class="btn-title">Favoritos</span>
            <span class="btn-subtitle">Pokémon guardados</span>
          </div>
          <div class="btn-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
        <div class="btn-glow"></div>
      </button>
    </div>
    
    <div ref="history" class="modern-panel history-panel" style="display: none;">
      <div class="panel-header">
        <h3><i class="fas fa-history"></i> Historial de Búsquedas</h3>
        <button class="close-btn" @click="toggleHistory">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="panel-content"></div>
    </div>
    
    <div ref="favorites" class="modern-panel favorites-panel" style="display: none;">
      <div class="panel-header">
        <h3><i class="fas fa-star"></i> Pokémon Favoritos</h3>
        <button class="close-btn" @click="toggleFavorites">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="panel-content"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PokedexMenus',
  props: {
    historial: {
      type: Array,
      required: true
    },
    favoritos: {
      type: Array,
      required: true
    }
  },
  methods: {
    updateHistorial(historial) {
      const historialHtml = historial.map(item => `
        <div class="pokemon-item" onclick="window.pokedexVue.cargarPokemon(${item.id})">
          <div class="pokemon-image">
            <img src="${item.sprites.front_default}" alt="Imagen de ${item.name}" loading="lazy">
          </div>
          <div class="pokemon-info">
            <div class="pokemon-name">${item.name}</div>
            <div class="pokemon-id">#${String(item.id).padStart(3, '0')}</div>
            <div class="pokemon-timestamp">${item.timestamp}</div>
            <div class="pokemon-types">
              ${item.types.map(t => `<span class="type-badge ${t.type.name}">${t.type.name}</span>`).join('')}
            </div>
          </div>
          <div class="pokemon-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
      `).join('');
      
      const historyPanel = this.$refs.history.querySelector('.panel-content');
      if (historyPanel) {
        historyPanel.innerHTML = historialHtml || '<div class="empty-state"><i class="fas fa-history"></i><p>No hay historial disponible</p></div>';
      }
    },
    
    updateFavoritos(favoritos) {
      const favoritosHtml = favoritos.map(item => `
        <div class="pokemon-item favorite-item">
          <div class="pokemon-image">
            <img src="${item.sprites.front_default}" alt="Imagen de ${item.name}" loading="lazy">
          </div>
          <div class="pokemon-info" onclick="window.pokedexVue.cargarPokemon(${item.id})">
            <div class="pokemon-name">${item.name}</div>
            <div class="pokemon-id">#${String(item.id).padStart(3, '0')}</div>
            <div class="pokemon-types">
              ${item.types.map(t => `<span class="type-badge ${t.type.name}">${t.type.name}</span>`).join('')}
            </div>
          </div>
          <div class="pokemon-actions">
            <button onclick="window.pokedexVue.cargarPokemon(${item.id})" class="action-btn view-btn" title="Ver Pokémon">
              <i class="fas fa-eye"></i>
            </button>
            <button onclick="window.pokedexVue.borrarFavorito(${item.id})" class="action-btn delete-btn" title="Eliminar de favoritos">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `).join('');
      
      const favoritesPanel = this.$refs.favorites.querySelector('.panel-content');
      if (favoritesPanel) {
        favoritesPanel.innerHTML = favoritosHtml || '<div class="empty-state"><i class="fas fa-star"></i><p>No tienes Pokémon favoritos</p></div>';
      }
    },
    
    toggleHistory() {
      const historyElement = this.$refs.history;
      const isVisible = historyElement.style.display !== 'none' && historyElement.style.display !== '';
      
      if (isVisible) {
        historyElement.style.display = 'none';
        historyElement.classList.remove('panel-visible');
      } else {
        // Cerrar favoritos si está abierto
        const favoritesElement = this.$refs.favorites;
        favoritesElement.style.display = 'none';
        favoritesElement.classList.remove('panel-visible');
        
        historyElement.style.display = 'block';
        setTimeout(() => {
          historyElement.classList.add('panel-visible');
        }, 10);
      }
    },
    
    toggleFavorites() {
      const favoritesElement = this.$refs.favorites;
      const isVisible = favoritesElement.style.display !== 'none' && favoritesElement.style.display !== '';
      
      if (isVisible) {
        favoritesElement.style.display = 'none';
        favoritesElement.classList.remove('panel-visible');
      } else {
        // Cerrar historial si está abierto
        const historyElement = this.$refs.history;
        historyElement.style.display = 'none';
        historyElement.classList.remove('panel-visible');
        
        favoritesElement.style.display = 'block';
        setTimeout(() => {
          favoritesElement.classList.add('panel-visible');
        }, 10);
      }
    }
  },
  mounted() {
    // Only update if props are available
    if (this.historial && Array.isArray(this.historial)) {
      this.updateHistorial(this.historial);
    }
    if (this.favoritos && Array.isArray(this.favoritos)) {
      this.updateFavoritos(this.favoritos);
    }
  },
  watch: {
    historial: {
      handler(newVal) {
        if (newVal && Array.isArray(newVal)) {
          this.updateHistorial(newVal);
        }
      },
      immediate: false
    },
    favoritos: {
      handler(newVal) {
        if (newVal && Array.isArray(newVal)) {
          this.updateFavoritos(newVal);
        }
      },
      immediate: false
    }
  }
};
</script>

<style scoped>
.pokedex__menus {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  gap: 20px;
}

/* Botones modernos */
.menu-buttons {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn-modern {
  position: relative;
  width: 100%;
  padding: 0;
  border: none;
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.btn-modern:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.btn-modern:active {
  transform: translateY(-1px) scale(0.98);
  transition: all 0.1s ease;
}

.btn-content {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 15px;
  position: relative;
  z-index: 2;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.4em;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.btn-history .btn-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 8px 24px rgba(79, 172, 254, 0.3);
}

.btn-favorites .btn-icon {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  box-shadow: 0 8px 24px rgba(252, 182, 159, 0.3);
  color: #333;
}

.btn-modern:hover .btn-icon {
  transform: scale(1.1) rotate(5deg);
}

.btn-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.btn-title {
  font-size: 1.2em;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.btn-subtitle {
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

.btn-arrow {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.2em;
  transition: all 0.3s ease;
}

.btn-modern:hover .btn-arrow {
  color: white;
  transform: translateX(5px);
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.btn-modern:hover .btn-glow {
  left: 100%;
}

/* Paneles modernos */
.modern-panel {
  width: 100%;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 240, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.1),
    0 8px 24px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-panel.panel-visible {
  max-height: 400px;
  opacity: 1;
  transform: translateY(0);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.history-panel .panel-header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.favorites-panel .panel-header {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #333;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.3em;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.panel-content {
  max-height: 320px;
  overflow-y: auto;
  padding: 20px;
}

/* Items de Pokémon */
.pokemon-item {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 12px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(250, 250, 250, 0.8));
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.pokemon-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(79, 172, 254, 0.1), transparent);
  transition: left 0.4s ease;
}

.pokemon-item:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(79, 172, 254, 0.2);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(245, 250, 255, 0.9));
}

.pokemon-item:hover::before {
  left: 100%;
}

.pokemon-image {
  width: 70px;
  height: 70px;
  border-radius: 15px;
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(0, 242, 254, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.pokemon-image img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.pokemon-item:hover .pokemon-image {
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(79, 172, 254, 0.2);
}

.pokemon-item:hover .pokemon-image img {
  transform: scale(1.2);
}

.pokemon-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.pokemon-name {
  font-size: 1.2em;
  font-weight: 700;
  color: #333;
  text-transform: capitalize;
  letter-spacing: 0.5px;
}

.pokemon-id {
  font-size: 0.9em;
  color: #666;
  font-weight: 600;
}

.pokemon-timestamp {
  font-size: 0.8em;
  color: #888;
  font-style: italic;
}

.pokemon-types {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 5px;
}

.type-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.pokemon-arrow {
  color: #666;
  font-size: 1.2em;
  transition: all 0.3s ease;
}

.pokemon-item:hover .pokemon-arrow {
  color: #4facfe;
  transform: translateX(5px);
}

/* Acciones para favoritos */
.favorite-item .pokemon-info {
  cursor: pointer;
}

.pokemon-actions {
  display: flex;
  gap: 8px;
  margin-left: 10px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9em;
}

.view-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.view-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(79, 172, 254, 0.4);
}

.delete-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
}

.delete-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-state i {
  font-size: 3em;
  margin-bottom: 15px;
  color: #ccc;
}

.empty-state p {
  margin: 0;
  font-size: 1.1em;
  font-style: italic;
}

/* Colores de tipos Pokémon */
.normal { background: linear-gradient(135deg, #A8A878, #C6C684); }
.fire { background: linear-gradient(135deg, #F08030, #FF9F5F); }
.water { background: linear-gradient(135deg, #6890F0, #8FA8FF); }
.electric { background: linear-gradient(135deg, #F8D030, #FFE066); color: #333 !important; }
.grass { background: linear-gradient(135deg, #78C850, #A0DB71); }
.ice { background: linear-gradient(135deg, #98D8D8, #BCE8E8); color: #333 !important; }
.fighting { background: linear-gradient(135deg, #C03028, #D05850); }
.poison { background: linear-gradient(135deg, #A040A0, #C768C7); }
.ground { background: linear-gradient(135deg, #E0C068, #EDD294); color: #333 !important; }
.flying { background: linear-gradient(135deg, #A890F0, #C7B0FF); }
.psychic { background: linear-gradient(135deg, #F85888, #FF7FA7); }
.bug { background: linear-gradient(135deg, #A8B820, #C6D16E); }
.rock { background: linear-gradient(135deg, #B8A038, #D1C166); }
.ghost { background: linear-gradient(135deg, #705898, #9183C7); }
.dragon { background: linear-gradient(135deg, #7038F8, #A27DFA); }
.dark { background: linear-gradient(135deg, #705848, #A08A7A); }
.steel { background: linear-gradient(135deg, #B8B8D0, #D6D6ED); color: #333 !important; }
.fairy { background: linear-gradient(135deg, #EE99AC, #F4B7C7); color: #333 !important; }

/* Scrollbar personalizada */
.panel-content::-webkit-scrollbar {
  width: 8px;
}

.panel-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  border-radius: 10px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

/* Responsive */
@media (max-width: 768px) {
  .btn-content {
    padding: 16px;
    gap: 12px;
  }
  
  .btn-icon {
    width: 45px;
    height: 45px;
    font-size: 1.2em;
  }
  
  .btn-title {
    font-size: 1.1em;
  }
  
  .btn-subtitle {
    font-size: 0.85em;
  }
  
  .pokemon-item {
    padding: 12px;
  }
  
  .pokemon-image {
    width: 60px;
    height: 60px;
  }
  
  .pokemon-image img {
    width: 50px;
    height: 50px;
  }
  
  .pokemon-name {
    font-size: 1.1em;
  }
}

@media (max-width: 480px) {
  .pokedex__menus {
    margin-top: 15px;
    gap: 15px;
  }
  
  .menu-buttons {
    gap: 12px;
  }
  
  .btn-content {
    padding: 14px;
    gap: 10px;
  }
  
  .btn-icon {
    width: 40px;
    height: 40px;
    font-size: 1.1em;
  }
  
  .btn-title {
    font-size: 1em;
  }
  
  .btn-subtitle {
    font-size: 0.8em;
  }
  
  .panel-header {
    padding: 15px 20px;
  }
  
  .panel-header h3 {
    font-size: 1.2em;
  }
  
  .panel-content {
    padding: 15px;
  }
  
  .pokemon-item {
    padding: 10px;
    margin-bottom: 10px;
  }
  
  .pokemon-image {
    width: 50px;
    height: 50px;
    margin-right: 12px;
  }
  
  .pokemon-image img {
    width: 40px;
    height: 40px;
  }
  
  .pokemon-name {
    font-size: 1em;
  }
  
  .pokemon-id {
    font-size: 0.85em;
  }
  
  .pokemon-timestamp {
    font-size: 0.75em;
  }
  
  .type-badge {
    padding: 3px 8px;
    font-size: 0.7em;
  }
  
  .action-btn {
    width: 35px;
    height: 35px;
    font-size: 0.8em;
  }
}

/* Animaciones adicionales */
@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.pokemon-item {
  animation: slideInFromLeft 0.3s ease forwards;
}

.pokemon-item:nth-child(1) { animation-delay: 0.05s; }
.pokemon-item:nth-child(2) { animation-delay: 0.1s; }
.pokemon-item:nth-child(3) { animation-delay: 0.15s; }
.pokemon-item:nth-child(4) { animation-delay: 0.2s; }
.pokemon-item:nth-child(5) { animation-delay: 0.25s; }
.pokemon-item:nth-child(6) { animation-delay: 0.3s; }

/* Efecto de pulso para iconos */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.btn-icon i {
  animation: pulse 2s infinite;
}

.btn-modern:hover .btn-icon i {
  animation: none;
}
</style>
