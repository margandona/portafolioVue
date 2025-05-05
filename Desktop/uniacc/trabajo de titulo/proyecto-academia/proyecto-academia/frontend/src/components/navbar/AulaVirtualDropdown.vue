<template>
  <div class="nav-dropdown">
    <button class="nav-link dropdown-toggle" @click="toggleMenu">
      Aula Virtual <i class="fas fa-caret-down"></i>
    </button>
    <div class="nav-dropdown-menu" v-if="isOpen">
      
      <a href="https://neekworld.cl/NW/course/index.php" target="_blank" rel="noopener noreferrer" class="dropdown-item">
        Ir a Moodle <i class="fas fa-external-link-alt external-icon"></i>
      </a>
      <a href="https://neekworld.cl/NW/login/index.php" target="_blank" rel="noopener noreferrer" class="dropdown-item">
        Iniciar sesión en Moodle <i class="fas fa-external-link-alt external-icon"></i>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AulaVirtualDropdown',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    toggleMenu() {
      this.$emit('toggle');
    }
  }
}
</script>

<style scoped>
.nav-dropdown {
  position: relative;
}

.dropdown-toggle {
  cursor: pointer;
}

.nav-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
  margin-top: 10px;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-item {
  display: block;
  padding: 12px 15px;
  color: #2A3B5F;
  text-decoration: none;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.external-icon {
  font-size: 12px;
  margin-left: 5px;
  opacity: 0.7;
}
</style>
