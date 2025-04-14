<template>
  <section class="about-section" id="about">
    <div class="container">
      <h2 class="section-title">Acerca de Makuaz</h2>
      
      <div class="row align-items-center mb-5">
        <div class="col-lg-4 text-center mb-4 mb-lg-0">
          <div class="profile-container">
            <img src="@/assets/img/img.jpg" alt="Marcos Makuaz" class="img-fluid about-image">
            <a href="mailto:m.argando@gmail.com" class="contact-link"><i class="fas fa-envelope"></i> m.argando@gmail.com</a>
          </div>
        </div>
        <div class="col-lg-8">
          <div class="about-card">
            <h3 class="mb-3">Hola, soy Marcos (MaKuaZ)</h3>
            <p>
              Ingeniero informático multimedia y profesor de historia, combino ambos mundos para crear experiencias digitales
              accesibles e inclusivas. Mi enfoque multidisciplinario me permite abordar proyectos desde diferentes perspectivas,
              uniendo tecnología, educación y creatividad.
            </p>
            <p>
              Actualmente lidero proyectos en NeekWorld, donde diseñamos soluciones innovadoras 
              para empresas que buscan transformar su presencia digital y optimizar procesos mediante tecnología.
            </p>
            <a href="/documents/curriculum.pdf" download="curriculum-marcos-argandona.pdf" class="btn btn-primary mt-3 download-btn">
              <i class="fas fa-download"></i> Descargar Currículum
            </a>
          </div>
        </div>
      </div>
      
      <div class="row skills-section">
        <div class="col-12 mb-4">
          <h3 class="skills-title">Áreas de especialización</h3>
        </div>
        
        <div class="col-md-6 col-lg-3">
          <div class="skill-card">
            <div class="skill-icon"><i class="fas fa-laptop-code"></i></div>
            <h4>Desarrollo</h4>
            <ul class="skills-list">
              <li>Full Stack</li>
              <li>Multimedia</li>
              <li>Videojuegos</li>
              <li>Integración APIs</li>
              <li>JavaScript / TypeScript</li>
              <li>Vue.js / Node.js</li>
            </ul>
          </div>
        </div>
        
        <div class="col-md-6 col-lg-3">
          <div class="skill-card">
            <div class="skill-icon"><i class="fas fa-paint-brush"></i></div>
            <h4>Diseño</h4>
            <ul class="skills-list">
              <li>UX/UI Design</li>
              <li>Design Thinking</li>
              <li>Accesibilidad Web</li>
              <li>Adobe Creative Suite</li>
              <li>Figma / Sketch</li>
              <li>CSS BEM / SASS</li>
            </ul>
          </div>
        </div>
        
        <div class="col-md-6 col-lg-3">
          <div class="skill-card">
            <div class="skill-icon"><i class="fas fa-robot"></i></div>
            <h4>Tecnologías</h4>
            <ul class="skills-list">
              <li>Docker</li>
              <li>AWS / Azure</li>
              <li>Firebase</li>
              <li>Automatizaciones IA</li>
              <li>Git / GitHub</li>
              <li>Oracle Data Modeler</li>
            </ul>
          </div>
        </div>
        
        <div class="col-md-6 col-lg-3">
          <div class="skill-card">
            <div class="skill-icon"><i class="fas fa-graduation-cap"></i></div>
            <h4>Educación</h4>
            <ul class="skills-list">
              <li>Ing. Informático Multimedia</li>
              <li>Prof. Historia y Geografía</li>
              <li>Scrum Master Certified</li>
              <li>Google UX Design Certificate</li>
              <li>Frontend Trainee VUE</li>
              <li>Backend Trainee Node.js</li>
            </ul>
          </div>
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
  padding: 70px 0;
  background: linear-gradient(135deg, #5b86e5, #36d1dc);
  color: white;
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 40px;
  text-align: center;
  font-weight: 700;
  letter-spacing: 1.5px;
  position: relative;
}

.section-title::after {
  content: '';
  width: 60px;
  height: 4px;
  background: #fff;
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
}

.profile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.about-image {
  border-radius: 50%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  width: 200px;
  height: 200px;
  object-fit: cover;
  border: 5px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.about-image:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.4);
}

.contact-link {
  margin-top: 15px;
  color: #ffd700;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
}

.contact-link:hover {
  color: white;
  text-decoration: none;
}

.contact-link i {
  margin-right: 5px;
}

.about-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  height: 100%;
}

.about-card h3 {
  color: #ffd700;
  font-weight: 700;
}

.about-card p {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.skills-section {
  margin-top: 50px;
}

.skills-title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 30px;
  color: #fff;
}

.skill-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  height: 100%;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.skill-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.3);
}

.skill-icon {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 15px;
  color: #ffd700;
}

.skill-card h4 {
  text-align: center;
  font-weight: 600;
  margin-bottom: 15px;
  color: white;
  font-size: 1.3rem;
}

.skills-list {
  list-style-type: none;
  padding-left: 0;
}

.skills-list li {
  position: relative;
  padding-left: 20px;
  margin-bottom: 8px;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.skills-list li:before {
  content: '→';
  position: absolute;
  left: 0;
  color: #ffd700;
}

.download-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 10px 20px;
  font-weight: bold;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.download-btn:hover {
  background: #ffd700;
  color: #333;
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.download-btn i {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .about-section {
    padding: 50px 0;
  }
  
  .about-card {
    margin-bottom: 30px;
  }
  
  .skill-card {
    margin-bottom: 20px;
  }
  
  .section-title {
    font-size: 2rem;
  }
}
</style>