<template>
    <div class="board-list">
      <h2>Mis Tableros</h2>
      <ul class="list-group">
        <li class="list-group-item" v-for="board in boards" :key="board.id">
          <router-link :to="'/board/' + board.id">{{ board.name }}</router-link>
        </li>
      </ul>
      <form @submit.prevent="addBoard">
        <div class="form-group">
          <input type="text" v-model="newBoard.name" class="form-control" placeholder="Nombre del Tablero" required />
        </div>
        <button type="submit" class="btn btn-primary">Agregar Tablero</button>
      </form>
    </div>
  </template>
  
  <script>
  import { mapGetters, mapActions } from 'vuex';
  
  export default {
    data() {
      return {
        newBoard: {
          name: ''
        }
      };
    },
    computed: {
      ...mapGetters(['allBoards']),
      boards() {
        return this.allBoards;
      }
    },
    methods: {
      ...mapActions(['fetchBoards', 'addBoard']),
      async addBoard() {
        await this.addBoard(this.newBoard);
        this.newBoard.name = '';
      }
    },
    created() {
      this.fetchBoards();
    }
  };
  </script>
  
  <style scoped>
  .board-list {
    max-width: 600px;
    margin: 0 auto;
  }
  </style>
  