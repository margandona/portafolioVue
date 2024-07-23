<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">Design Thinking Trello</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link to="/boards" class="nav-link">Tableros</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/login" class="nav-link">Iniciar Sesión</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/register" class="nav-link">Registrarse</router-link>
          </li>
        </ul>
      </div>
    </nav>
  </template>
  
  <script>
  export default {
    name: 'Header'
  };
  </script>
  
  <style scoped>
  .navbar {
    margin-bottom: 20px;
  }
  </style>
  