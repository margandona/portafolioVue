<template>
    <div class="board">
      <h2>{{ board.name }}</h2>
      <div class="lists">
        <List v-for="list in board.lists" :key="list.id" :list="list" />
      </div>
      <form @submit.prevent="addList">
        <div class="form-group">
          <input type="text" v-model="newList.name" class="form-control" placeholder="Nombre de la Lista" required />
        </div>
        <button type="submit" class="btn btn-primary">Agregar Lista</button>
      </form>
    </div>
  </template>
  
  <script>
  import { mapGetters, mapActions } from 'vuex';
  import List from './List.vue';
  
  export default {
    components: {
      List
    },
    data() {
      return {
        newList: {
          name: ''
        }
      };
    },
    computed: {
      ...mapGetters(['getBoardById']),
      board() {
        return this.getBoardById(this.$route.params.id);
      }
    },
    methods: {
      ...mapActions(['fetchBoard', 'addList']),
      async addList() {
        await this.addList({ boardId: this.board.id, list: this.newList });
        this.newList.name = '';
      }
    },
    created() {
      this.fetchBoard(this.$route.params.id);
    }
  };
  </script>
  
  <style scoped>
  .board {
    max-width: 800px;
    margin: 0 auto;
  }
  .lists {
    display: flex;
    flex-wrap: wrap;
  }
  </style>
  