<template>
  <section class="about-section" id="about">
    <div class="container">
      <h2 class="section-title">Acerca de Makuaz</h2>
      
      <div class="row">
        <div class="col-lg-8">
          <h3>Hola, mi nombre es Marcos, pero también me conocen como MaKuaZ.</h3>
          <p>
            Me gradué como profesor de historia y geografía en 2011 y posteriormente como ingeniero informático multimedia. 
            Siempre he trabajado de forma independiente en áreas medioambientales, desarrollo 
            y análisis web. He participado en diversos cursos que abarcan temas como ventas, 
            evaluación educativa, liderazgo de unidad técnico-pedagógica y neurociencias aplicadas a la educación.
          </p>
          <p>Actualmente estoy diseñando con mi equipo de NeekWorld soluciones para empresas y organizaciones
          que desean innovar en su presencia digital y mejora de procesos mediante tecnología.</p>
          <p>
            Mi enfoque se centra en la accesibilidad y la inclusión, asegurando que todos puedan disfrutar de las experiencias digitales que creo. 
            Estoy comprometido a aprender y crecer continuamente en este campo en constante evolución.
          </p>
          <p>¡Me encantaría saber de ti! <a href="mailto:marcos@makuaz.com">marcos@makuaz.com</a></p>
        </div>
        <div class="col-lg-4">
          <img src="@/assets/img/img.jpg" alt="Marcos Makuaz" class="img-fluid about-image">
        </div>
      </div>
      
      <div class="row mt-5">
        <div class="col-md-3">
          <h3>Habilidades</h3>
          <ul class="skills-list">
            <li>Diseño centrado en el usuario</li>
            <li>Comunicación efectiva</li>
            <li>Investigación de usuarios</li>
            <li>Desarrollo Full Stack</li>
            <li>Marketing digital</li>
            <li>Desarrollo Multimedia</li>
            <li>Desarrollo de Videojuegos</li>
            <li>Automatizaciones IA</li>
            <li>Integración de APIs</li>
            <li>Accesibilidad web</li>
          </ul>
        </div>
        <div class="col-md-3">
          <h3>Tecnologías</h3>
          <ul class="skills-list">
            <li>Oracle Data Modeler</li>
            <li>Firebase</li>
            <li>Scrum by Trello</li>
            <li>VSCode</li>
            <li>Git / GitHub</li>
            <li>Docker</li>
            <li>AWS / Azure</li>
            <li>Adobe Creative Suite</li>
            <li>Figma / Sketch</li>
          </ul>
        </div>
        <div class="col-md-3">
          <h3>Lenguajes</h3>
          <ul class="skills-list">
            <li>JavaScript / TypeScript</li>
            <li>Java</li>
            <li>Python</li>
            <li>PHP</li>
            <li>CSS BEM</li>
            <li>HTML5</li>
            <li>SQL</li>
            <li>GraphQL</li>
          </ul>
        </div>
        <div class="col-md-3">
          <h3>Frameworks</h3>
          <ul class="skills-list">
            <li>Design Thinking</li>
            <li>Vue.js</li>
            <li>Ionic by Angular</li>
            <li>Bootstrap</li>
            <li>jQuery</li>
            <li>SASS / SCSS</li>
            <li>Node.js</li>
            <li>Express</li>
            <li>Laravel</li>
          </ul>
        </div>
      </div>
      
      <div class="row mt-5">
        <div class="col-12 text-center">
          <h3>Certificaciones y Educación</h3>
          <p>
            Ingeniero Informático Multimedia - Universidad UNIACC<br>
            Profesor de Historia y Geografía - Universidad Andrés Bello<br>
            Scrum Master Certified<br>
            Google UX Design Professional Certificate<br>
            Microsoft Certified: Azure Fundamentals
          </p>
        </div>
      </div>
      
      <div class="row mt-3">
        <div class="col-12 text-center">
          <a href="/documents/curriculum.pdf" download="curriculum-marcos-argandona.pdf" class="btn btn-primary mt-3 download-btn">
            <i class="fas fa-download"></i> Descarga mi Currículum Completo
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'AboutSection',
};
</script>

<style scoped>
.about-section {
  padding: 50px 0;
  background: linear-gradient(135deg, #5b86e5, #36d1dc);
  color: white;
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 30px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  position: relative;
}

.section-title::after {
  content: '';
  width: 60px;
  height: 4px;
  background: #fff;
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
}

.about-section h3 {
  font-size: 1.5rem;
  margin-top: 20px;
  margin-bottom: 15px;
}

.about-section p {
  font-size: 1.2rem;
  line-height: 1.6;
}

.about-section a {
  color: #ffd700;
  text-decoration: none;
  transition: color 0.3s;
}

.about-section a:hover {
  text-decoration: underline;
  color: #fff;
}

.about-image {
  border-radius: 10px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  max-width: 100%;
  height: auto;
}

.skills-list {
  list-style-type: none;
  padding-left: 0;
}

.skills-list li {
  position: relative;
  padding-left: 20px;
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.skills-list li:before {
  content: '→';
  position: absolute;
  left: 0;
  color: #ffd700;
}

.btn-primary, .download-btn {
  background: linear-gradient(135deg, #5b86e5, #36d1dc);
  color: white;
  border: none;
  padding: 10px 20px;
  font-weight: bold;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: 0 auto;
  border-radius: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover, .download-btn:hover {
  background: linear-gradient(135deg, #36d1dc, #5b86e5);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.btn-primary i, .download-btn i {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .about-section .col-lg-8,
  .about-section .col-lg-4 {
    text-align: center;
  }

  .section-title {
    font-size: 2rem;
  }

  .about-section p {
    font-size: 1rem;
  }
  
  .skills-list li {
    font-size: 0.9rem;
  }

  .about-image {
    margin-top: 20px;
    max-width: 200px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>