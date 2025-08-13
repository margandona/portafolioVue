<template>
  <div class="pokedex__menus">
    <button class="btn btn-secondary btn-menu" @click="$emit('toggle-history')">
      <i class="fas fa-history"></i> Historial
    </button>
    <div ref="history" class="pokedex__historial" style="display: none;"></div>
    <button class="btn btn-secondary btn-menu" @click="$emit('toggle-favorites')">
      <i class="fas fa-star"></i> Favoritos
    </button>
    <div ref="favorites" class="pokedex__favoritos" style="display: none;"></div>
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
        <li onclick="window.pokedexVue.cargarPokemon(${item.id})">
          <img src="${item.sprites.front_default}" alt="Imagen de ${item.name}" class="pokedex__historial-imagen">
          <span>${item.id} - ${item.name} (${item.timestamp})</span>
          <span class="pokedex__types-list">
            ${item.types.map(t => `<span class="${t.type.name}">${t.type.name}</span>`).join('')}
          </span>
        </li>
      `).join('');
      this.$refs.history.innerHTML = '<ul>' + historialHtml + '</ul>';
    },
    updateFavoritos(favoritos) {
      const favoritosHtml = favoritos.map(item => `
        <li onclick="window.pokedexVue.cargarPokemon(${item.id})">
          <img src="${item.sprites.front_default}" alt="Imagen de ${item.name}" class="pokedex__favoritos-imagen">
          <span>${item.id} - ${item.name}</span>
          <span class="pokedex__types-list">
            ${item.types.map(t => `<span class="${t.type.name}">${t.type.name}</span>`).join('')}
          </span>
          <button onclick="window.pokedexVue.borrarFavorito(${item.id})" class="btn btn-danger btn-sm">
            <i class="fas fa-trash"></i>
          </button>
        </li>
      `).join('');
      this.$refs.favorites.innerHTML = '<ul>' + favoritosHtml + '</ul>';
    },
    toggleHistory() {
      this.$refs.history.style.display = this.$refs.history.style.display === 'none' ? 'block' : 'none';
    },
    toggleFavorites() {
      this.$refs.favorites.style.display = this.$refs.favorites.style.display === 'none' ? 'block' : 'none';
    }
  },
  mounted() {
    this.updateHistorial(this.historial);
    this.updateFavoritos(this.favoritos);
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
}

.btn-menu {
  margin-top: 10px;
  width: 100%;
  font-size: 1em;
}

.pokedex__historial,
.pokedex__favoritos {
  margin-top: 20px;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background-color: #fff;
  color: #000;
  border: 2px solid #000;
  border-radius: 10px;
  padding: 10px;
  transition: max-height 0.3s;
}

.pokedex__historial h3,
.pokedex__favoritos h3 {
  text-align: center;
}

.pokedex__historial ul,
.pokedex__favoritos ul {
  list-style: none;
  padding: 0;
}

.pokedex__historial li,
.pokedex__favoritos li {
  display: flex;
  align-items: center;
  margin: 5px 0;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pokedex__historial li:hover,
.pokedex__favoritos li:hover {
  background-color: #eee;
}

.pokedex__historial-imagen,
.pokedex__favoritos-imagen {
  width: 50px;
  height: 50px;
  margin-right: 10px;
  transition: transform 0.3s;
}

.pokedex__historial-imagen:hover,
.pokedex__favoritos-imagen:hover {
  transform: scale(1.1);
}

.pokedex__types-list {
  display: flex;
  flex-direction: row;
  gap: 5px;
}

/* Types colors */
:deep(.normal) { background-color: #A8A878; color: #fff; }
:deep(.fire) { background-color: #F08030; color: #fff; }
:deep(.water) { background-color: #6890F0; color: #fff; }
:deep(.electric) { background-color: #F8D030; color: #000; }
:deep(.grass) { background-color: #78C850; color: #fff; }
:deep(.ice) { background-color: #98D8D8; color: #000; }
:deep(.fighting) { background-color: #C03028; color: #fff; }
:deep(.poison) { background-color: #A040A0; color: #fff; }
:deep(.ground) { background-color: #E0C068; color: #000; }
:deep(.flying) { background-color: #A890F0; color: #fff; }
:deep(.psychic) { background-color: #F85888; color: #fff; }
:deep(.bug) { background-color: #A8B820; color: #fff; }
:deep(.rock) { background-color: #B8A038; color: #fff; }
:deep(.ghost) { background-color: #705898; color: #fff; }
:deep(.dragon) { background-color: #7038F8; color: #fff; }
:deep(.dark) { background-color: #705848; color: #fff; }
:deep(.steel) { background-color: #B8B8D0; color: #000; }
:deep(.fairy) { background-color: #EE99AC; color: #000; }
</style>
