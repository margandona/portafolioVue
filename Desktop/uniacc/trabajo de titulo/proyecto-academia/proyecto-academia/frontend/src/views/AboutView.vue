<template>
    <div class="about-page">
      <h1>Acerca de Nosotros</h1>
      <p>
        Bienvenido a nuestra plataforma. Nos dedicamos a proporcionar los mejores
        recursos de aprendizaje para estudiantes y profesores.
      </p>
      <p>
        Nuestra misión es conectar a los educadores con los estudiantes mediante
        una experiencia de aprendizaje innovadora y efectiva.
      </p>
    </div>
  </template>
  
  <script>
  export default {
    name: "AboutView",
  };
  </script>
  
  <style scoped>
  .about-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: "Roboto", sans-serif;
    color: #2a3b5f; /* Azul Marino */
  }
  
  .about-page h1 {
    font-size: 2.5rem;
    color: #2e8b57; /* Verde Esmeralda */
    margin-bottom: 10px;
  }
  
  .about-page p {
    font-size: 1.2rem;
    line-height: 1.8;
    margin-bottom: 15px;
  }
  </style>
  