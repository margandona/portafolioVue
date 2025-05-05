<template>
  <button 
    class="mobile-menu-btn"
    @click="toggleMenu"
    aria-label="Abrir menú"
  >
    <v-icon icon="mdi-menu"></v-icon>
  </button>
</template>

<script>
export default {
  name: 'MobileMenuButton',
  methods: {
    toggleMenu() {
      this.$emit('toggle');
    }
  }
}
</script>

<style scoped>
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #2A3B5F;
  padding: 8px;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }
}
</style>
