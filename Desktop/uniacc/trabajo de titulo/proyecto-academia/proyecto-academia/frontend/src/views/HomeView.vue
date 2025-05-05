<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Bienvenido a Academia Virtual</h1>
        <p class="hero-subtitle">
          Potencia tus conocimientos con nuestros cursos diseñados por expertos
        </p>
        <div class="hero-buttons">
          <router-link to="/courses" class="btn btn-primary">Explorar Cursos</router-link>
          <router-link v-if="!isAuthenticated" to="/register" class="btn btn-secondary">
            Registrarse Gratis
          </router-link>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="container">
        <h2 class="section-title">¿Por qué elegirnos?</h2>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📚</div>
            <h3>Variedad de Cursos</h3>
            <p>Descubre cursos en numerosas áreas de conocimiento</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">👨‍🏫</div>
            <h3>Instructores Expertos</h3>
            <p>Aprende de profesionales con experiencia en la industria</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>Aprendizaje Flexible</h3>
            <p>Estudia a tu propio ritmo, cuando y donde quieras</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🏅</div>
            <h3>Certificaciones</h3>
            <p>Obtén certificados que validen tus nuevas habilidades</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>¿Listo para empezar tu viaje de aprendizaje?</h2>
          <p>Únete hoy a nuestra comunidad de estudiantes y transforma tu futuro</p>
          <router-link to="/register" class="btn btn-primary">Comenzar ahora</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'HomeView',
  computed: {
    ...mapGetters(['isAuthenticated'])
  }
}
</script>

<style scoped>
.home-page {
  font-family: 'Roboto', sans-serif;
  color: #333333;
}

.hero-section {
  background-color: #2A3B5F;
  color: white;
  text-align: center;
  padding: 80px 20px;
  background-image: linear-gradient(135deg, #2A3B5F, #1E293B);
  background-size: cover;
  background-position: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: 48px;
  margin-bottom: 20px;
  color: white;
}

.hero-subtitle {
  font-size: 20px;
  margin-bottom: 40px;
  line-height: 1.5;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #2E8B57;
  color: white;
  border: 2px solid #2E8B57;
}

.btn-primary:hover {
  background-color: #3aa870;
  border-color: #3aa870;
}

.btn-secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.features-section {
  padding: 80px 20px;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-family: 'Playfair Display', serif;
  font-size: 36px;
  color: #2A3B5F;
  margin-bottom: 50px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 30px;
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 40px;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 20px;
  color: #2E8B57;
  margin-bottom: 15px;
}

.feature-card p {
  line-height: 1.6;
}

.cta-section {
  background-color: #FFA500;
  color: white;
  padding: 60px 20px;
  text-align: center;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
}

.cta-content h2 {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  margin-bottom: 20px;
  color: white;
}

.cta-content p {
  font-size: 18px;
  margin-bottom: 30px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }
  
  .hero-subtitle {
    font-size: 18px;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
