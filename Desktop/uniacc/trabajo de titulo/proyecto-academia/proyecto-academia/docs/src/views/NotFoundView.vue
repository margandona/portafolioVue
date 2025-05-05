<template>
    <div class="not-found">
      <h1>404 - Página no encontrada</h1>
      <p>La página que estás buscando no existe.</p>
      <router-link to="/" class="btn btn-primary">Volver al inicio</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: "NotFoundView",
  };
  </script>
  
  <style scoped>
  .not-found {
    text-align: center;
    margin: auto;
    padding: 50px 20px;
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 20px;
    color: #dc3545;
  }
  
  p {
    font-size: 1.2rem;
    margin-bottom: 20px;
  }
  
  .btn {
    background-color: #2e8b57;
    color: #ffffff;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    font-size: 1rem;
    text-decoration: none;
    display: inline-block;
  }
  
  .btn:hover {
    background-color: #3aa870;
  }
  </style>
  