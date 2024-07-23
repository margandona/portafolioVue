<template>
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">{{ card.title }}</h5>
        <button @click="removeCard(card.id)" class="btn btn-danger btn-sm float-right">Eliminar</button>
      </div>
    </div>
  </template>
  
  <script>
  import { mapActions } from 'vuex';
  
  export default {
    props: {
      card: Object
    },
    methods: {
      ...mapActions(['removeCard']),
      async removeCard(cardId) {
        await this.removeCard(cardId);
      }
    }
  };
  </script>
  
  <style scoped>
  .card {
    margin-bottom: 10px;
  }
  </style>
  