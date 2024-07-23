<template>
    <div class="list">
      <h3>{{ list.name }}</h3>
      <div class="cards">
        <Card v-for="card in list.cards" :key="card.id" :card="card" />
      </div>
      <form @submit.prevent="addCard">
        <div class="form-group">
          <input type="text" v-model="newCard.title" class="form-control" placeholder="Título de la Tarjeta" required />
        </div>
        <button type="submit" class="btn btn-primary">Agregar Tarjeta</button>
      </form>
    </div>
  </template>
  
  <script>
  import { mapGetters, mapActions } from 'vuex';
  import Card from './Card.vue';
  
  export default {
    components: {
      Card
    },
    props: {
      list: Object
    },
    data() {
      return {
        newCard: {
          title: ''
        }
      };
    },
    methods: {
      ...mapActions(['addCard']),
      async addCard() {
        await this.addCard({ listId: this.list.id, card: this.newCard });
        this.newCard.title = '';
      }
    }
  };
  </script>
  
  <style scoped>
  .list {
    background: #f4f5f7;
    border-radius: 3px;
    padding: 10px;
    margin: 10px;
    width: 250px;
  }
  .cards {
    margin-bottom: 10px;
  }
  </style>
  