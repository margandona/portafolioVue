<template>
    <div class="task-list">
      <ul class="list-group">
        <li class="list-group-item" v-for="task in tasks" :key="task.id">
          {{ task.title }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import { mapGetters } from 'vuex';
  
  export default {
    name: 'TaskList',
    computed: {
      ...mapGetters(['allTasks'])
    },
    created() {
      this.$store.dispatch('fetchTasks');
    }
  };
  </script>
  
  <style scoped>
  .task-list {
    max-width: 600px;
    margin: 0 auto;
  }
  </style>
  