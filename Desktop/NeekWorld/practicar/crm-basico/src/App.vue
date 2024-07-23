<!-- src/App.vue -->
<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">CRM Básico</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item" v-if="!user">
            <router-link class="nav-link" to="/">Login</router-link>
          </li>
          <li class="nav-item" v-if="!user">
            <router-link class="nav-link" to="/register">Registro</router-link>
          </li>
          <li class="nav-item" v-if="user && user.role === 'admin'">
            <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
          </li>
          <li class="nav-item" v-if="user && user.role === 'admin'">
            <router-link class="nav-link" to="/dashboard/clientes">Clientes</router-link>
          </li>
          <li class="nav-item" v-if="user && user.role === 'admin'">
            <router-link class="nav-link" to="/dashboard/ventas">Ventas</router-link>
          </li>
          <li class="nav-item" v-if="user && user.role === 'client'">
            <router-link class="nav-link" to="/dashboard/compras">Compras</router-link>
          </li>
        </ul>
        <ul class="navbar-nav ml-auto">
          <li class="nav-item" v-if="user">
            <span class="nav-link">{{ user.email }}</span>
          </li>
          <li class="nav-item" v-if="user">
            <button class="nav-link btn btn-link" @click="logout">Logout</button>
          </li>
        </ul>
      </div>
    </nav>
    <router-view></router-view>
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
    logout() {
      this.logout();
      this.$router.push('/');
    }
  }
};
</script>

<style>
@import 'https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css';
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
@import 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap';

body {
  font-family: 'Roboto', sans-serif;
}
</style>
