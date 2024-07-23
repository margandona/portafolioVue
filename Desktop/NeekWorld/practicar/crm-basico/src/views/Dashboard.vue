<template>
    <div class="dashboard">
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand" href="#">Dashboard</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item" v-if="user && user.role === 'admin'">
              <router-link class="nav-link" to="/dashboard/clientes">Clientes</router-link>
            </li>
            <li class="nav-item" v-if="user && user.role === 'admin'">
              <router-link class="nav-link" to="/dashboard/ventas">Ventas</router-link>
            </li>
            <li class="nav-item" v-if="user && user.role === 'admin'">
              <router-link class="nav-link" to="/dashboard/productos">Productos</router-link>
            </li>
            <li class="nav-item" v-if="user && user.role === 'client'">
              <router-link class="nav-link" to="/dashboard/compras">Compras</router-link>
            </li>
            <li class="nav-item" v-if="user">
              <router-link class="nav-link" to="/dashboard/opciones">Opciones de Usuario</router-link>
            </li>
          </ul>
          <ul class="navbar-nav ml-auto">
            <li class="nav-item" v-if="user">
              <span class="nav-link">{{ user.email }}</span>
            </li>
            <li class="nav-item" v-if="user">
              <button class="nav-link btn btn-link" @click="handleLogout">Logout</button>
            </li>
          </ul>
        </div>
      </nav>
      <div v-if="user">
        <router-view></router-view>
      </div>
      <div v-else>
        <p>Cargando...</p>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex';
  
  export default {
    computed: {
      ...mapState(['user'])
    },
    methods: {
      ...mapActions(['logout']),
      handleLogout() {
        this.logout();
        this.$router.push('/');
      }
    }
  };
  </script>
  
  <style scoped>
  .dashboard {
    padding: 20px;
  }
  </style>
  