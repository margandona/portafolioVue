<template>
  <div class="about-page">
    <div class="container">
      <h1>Acerca de Nosotros</h1>
      <section class="about-section">
        <h2>Nuestra Misión</h2>
        <p>
          En Academia Virtual, nos dedicamos a proporcionar educación de calidad accesible a todos. 
          Creemos que el aprendizaje debe ser flexible, adaptable y personalizado para satisfacer 
          las necesidades de cada estudiante.
        </p>
      </section>
      
      <section class="about-section">
        <h2>Nuestra Historia</h2>
        <p>
          Fundada en 2023, Academia Virtual surgió como respuesta a la creciente necesidad de 
          soluciones educativas en línea que fueran tanto efectivas como accesibles. Desde 
          entonces, hemos estado comprometidos con la excelencia en la educación digital.
        </p>
      </section>
      
      <section class="about-section">
        <h2>Nuestro Enfoque</h2>
        <p>
          Nos enfocamos en crear experiencias de aprendizaje que combinen teoría con práctica. 
          Nuestros cursos están diseñados por expertos en la materia y utilizan metodologías 
          pedagógicas comprobadas para asegurar que los estudiantes no solo adquieran conocimientos, 
          sino que también desarrollen habilidades aplicables en el mundo real.
        </p>
      </section>
      
      <section class="about-section">
        <h2>Nuestro Equipo</h2>
        <p>
          Contamos con un equipo diverso de educadores, desarrolladores y expertos en diversas 
          disciplinas, todos unidos por la pasión de hacer que el aprendizaje sea accesible, 
          efectivo y agradable para todos.
        </p>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: "AboutView",
};
</script>

<style scoped>
.about-page {
  padding: 40px 0;
  font-family: "Roboto", sans-serif;
  color: #2a3b5f;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  font-family: "Playfair Display", serif;
  font-size: 2.5rem;
  color: #2e8b57;
  margin-bottom: 30px;
  text-align: center;
}

.about-section {
  margin-bottom: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 25px;
}

.about-section h2 {
  color: #2e8b57;
  font-size: 1.5rem;
  margin-bottom: 15px;
  font-family: "Playfair Display", serif;
}

.about-section p {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #555;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }
  
  .about-section h2 {
    font-size: 1.3rem;
  }
  
  .about-section p {
    font-size: 1rem;
  }
}
</style>
