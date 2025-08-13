<template>
  <div ref="pokemonInfo" class="pokedex__info"></div>
</template>

<script>
export default {
  name: 'PokedexInfo',
  data() {
    return {
      mostrarMovimientos: false
    };
  },
  methods: {
    showPokemon(pokemon) {
      const tipos = pokemon.types.map(t => `<li class="pokedex__types-item ${t.type.name}">${t.type.name}</li>`).join('');
      const stats = pokemon.stats.map(s => `<li><strong>${s.stat.name}:</strong> ${s.base_stat}</li>`).join('');
      const abilities = pokemon.abilities.map(a => `<li>${a.ability.name} (${a.is_hidden ? 'Oculta' : 'Visible'})</li>`).join('');
      const moves = pokemon.moves.map(m => `<li>${m.move.name} (Nivel: ${m.version_group_details[0]?.level_learned_at || 'N/A'})</li>`).join('');
      
      this.$refs.pokemonInfo.innerHTML = `
        <div class="pokedex__pokemon">
          <h3 class="pokedex__nombre-pokemon">${this.capitalizarNombre(pokemon.name)}</h3>
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
                <ul class="pokedex__types">${tipos}</ul>
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
                <button class="btn btn-warning" onclick="window.pokedexVue.guardarFavorito(${pokemon.id})">
                  <i class="fas fa-star"></i> Agregar a Favoritos
                </button>
                <button class="btn btn-danger" onclick="window.pokedexVue.borrarFavorito(${pokemon.id})">
                  <i class="fas fa-trash"></i> Borrar de Favoritos
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Attach event listener after DOM has been updated
      this.$nextTick(() => {
        const toggleMovesBtn = document.getElementById('toggle-moves');
        if (toggleMovesBtn) {
          toggleMovesBtn.addEventListener('click', () => {
            this.mostrarMovimientos = !this.mostrarMovimientos;
            const movesElement = document.querySelector('.pokedex__moves');
            if (movesElement) {
              movesElement.style.display = this.mostrarMovimientos ? 'block' : 'none';
              toggleMovesBtn.textContent = this.mostrarMovimientos ? 'Ocultar Movimientos' : 'Ver Movimientos';
            }
          });
        }
      });
    },
    setLoading() {
      this.$refs.pokemonInfo.innerHTML = '<div class="pokedex__loading">Cargando...</div>';
    },
    setError() {
      this.$refs.pokemonInfo.innerHTML = '<div class="pokedex__error">Pokémon no encontrado</div>';
    },
    clearInfo() {
      this.$refs.pokemonInfo.innerHTML = '';
    },
    capitalizarNombre(nombre) {
      return nombre.charAt(0).toUpperCase() + nombre.slice(1);
    }
  }
};
</script>

<style scoped>
.pokedex__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  transition: all 0.5s ease;
}

.pokedex__loading {
  font-size: 1.2em;
  color: #000;
}

.pokedex__pokemon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  color: #000;
  border: 2px solid #000;
  border-radius: 10px;
  width: 100%;
  padding: 10px;
  transition: transform 0.3s;
}

.pokedex__nombre-pokemon {
  text-align: center;
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 10px;
}

.pokedex__details {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
}

.pokedex__info-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 48%;
}

.pokedex__info-item {
  margin-bottom: 10px;
}

.pokedex__types,
.pokedex__stats,
.pokedex__abilities,
.pokedex__moves {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pokedex__types li {
  display: inline-block;
  background-color: #ddd;
  border-radius: 5px;
  padding: 2px 5px;
  margin-right: 5px;
}

.pokedex__moves {
  max-height: 150px;
  overflow-y: auto;
}

.pokedex__error {
  color: #ff0000;
  margin-top: 10px;
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
