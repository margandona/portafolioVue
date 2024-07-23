<template>
    <div class="usuarios">
      <h1>Usuarios</h1>
      <div v-for="user in users" :key="user.id" class="card mb-2">
        <div class="card-body">
          <h5 class="card-title">{{ user.nombre }}</h5>
          <p class="card-text">Email: {{ user.email }}</p>
          <p class="card-text">Rol: {{ user.role }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex';
  
  export default {
    computed: {
      ...mapState(['users'])
    },
    methods: {
      ...mapActions(['fetchUsers']),
    },
    created() {
      this.fetchUsers();
    }
  };
  </script>
  
  <style scoped>
  .usuarios {
    padding: 20px;
  }
  </style>
  