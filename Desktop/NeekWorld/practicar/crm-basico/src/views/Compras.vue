<template>
    <div class="compras">
      <h1>Mis Compras</h1>
      <div v-for="compra in compras" :key="compra.id" class="card mb-2">
        <div class="card-body">
          <h5 class="card-title">{{ compra.producto }}</h5>
          <p class="card-text">{{ compra.cantidad }}</p>
          <p class="card-text">{{ compra.precio }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex';
  
  export default {
    computed: {
      ...mapState(['compras'])
    },
    methods: {
      ...mapActions(['fetchCompras'])
    },
    created() {
      this.fetchCompras();
    }
  };
  </script>
  
  <style scoped>
  .compras {
    padding: 20px;
  }
  </style>
  