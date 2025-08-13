<template>
  <section id="github" class="github-section section" :class="[mode]">
    <div class="container">
      <h2 class="section-title">Mis Repositorios de GitHub</h2>
      <p class="github-intro">Explora mis proyectos open source y otros trabajos en GitHub</p>
      
      <!-- Featured Bootcamp Projects Section -->
      <div class="featured-projects mb-5">
        <h3 class="featured-title mb-4">Actividades que corresponden a certificacionescd</h3>
        <div class="row">
          <!-- Card 1: Portfolio Project -->
          <div class="col-md-4 mb-4">
            <div class="repo-card card featured-card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="fab fa-github repo-icon me-2"></i>
                  <h3 class="card-title mb-0">Portfolio Vue</h3>
                </div>
                <p class="card-text repo-description">
                  Este portafolio representa la culminación de mi aprendizaje en desarrollo web. A través de este proyecto, logré integrar mis conocimientos de frontend con Vue y backend con Node.js, creando una solución completa que muestra mi evolución como desarrollador.
                </p>
                <div class="repo-stats">
                  <span class="repo-stat">
                    <span class="language-dot" style="backgroundColor: #41b883"></span>
                    Vue
                  </span>
                  <span class="repo-stat">
                    <i class="far fa-calendar-alt"></i> 2023
                  </span>
                </div>
              </div>
              <div class="card-footer">
                <a href="https://github.com/margandona/portafolioVue/tree/master/Desktop/NeekWorld/backend/portafolio" 
                   target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                  <i class="fas fa-code"></i> Ver Código
                </a>
              </div>
            </div>
          </div>
          
          <!-- Card 2: Backend Bootcamp Project -->
          <div class="col-md-4 mb-4">
            <div class="repo-card card featured-card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="fab fa-github repo-icon me-2"></i>
                  <h3 class="card-title mb-0">Backend Node.js</h3>
                </div>
                <p class="card-text repo-description">
                  Este proyecto representó un hito en mi camino como desarrollador backend. Gracias a la excelente mentoría y retroalimentación de los profesores del bootcamp, pude construir una API robusta que implementa las mejores prácticas de Node.js, demostrando la potencia del JavaScript en el servidor.
                </p>
                <div class="repo-stats">
                  <span class="repo-stat">
                    <span class="language-dot" style="backgroundColor: #f1e05a"></span>
                    JavaScript
                  </span>
                  <span class="repo-stat">
                    <i class="far fa-calendar-alt"></i> 2023
                  </span>
                </div>
              </div>
              <div class="card-footer">
                <a href="https://github.com/margandona/trabajo3m4" 
                   target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                  <i class="fas fa-code"></i> Ver Código
                </a>
              </div>
            </div>
          </div>
          
          <!-- Card 3: Vue Framework Project -->
          <div class="col-md-4 mb-4">
            <div class="repo-card card featured-card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="fab fa-github repo-icon me-2"></i>
                  <h3 class="card-title mb-0">Bootstrap + Vue</h3>
                </div>
                <p class="card-text repo-description">
                  Proyecto realizado durante mi certificación frontend con Vue. Este desafío me permitió mejorar mis habilidades combinando el poder de Vue.js con Bootstrap para crear interfaces modernas y responsivas, consolidando mi formación como desarrollador frontend certificado.
                </p>
                <div class="repo-stats">
                  <span class="repo-stat">
                    <span class="language-dot" style="backgroundColor: #563d7c"></span>
                    CSS/Bootstrap
                  </span>
                  <span class="repo-stat">
                    <i class="far fa-calendar-alt"></i> 2022
                  </span>
                </div>
              </div>
              <div class="card-footer">
                <a href="https://github.com/margandona/desafio_bootstrap" 
                   target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                  <i class="fas fa-code"></i> Ver Código
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <h3 class="other-repos-title mb-4">Otros Repositorios</h3>
      
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3">Cargando repositorios...</p>
      </div>
      
      <div v-else-if="error" class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ error }}
      </div>
      
      <div v-else class="row">
        <div v-for="repo in repositories" :key="repo.id" class="col-md-6 col-lg-4 mb-4">
          <div class="repo-card card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <i class="fab fa-github repo-icon me-2"></i>
                <h3 class="card-title mb-0">{{ repo.name }}</h3>
              </div>
              
              <p class="card-text repo-description">{{ repo.description || 'Sin descripción disponible' }}</p>
              
              <div class="repo-stats">
                <span class="repo-stat" v-if="repo.language">
                  <span class="language-dot" :style="{ backgroundColor: getLanguageColor(repo.language) }"></span>
                  {{ repo.language }}
                </span>
                <span class="repo-stat" v-if="repo.stargazers_count">
                  <i class="fas fa-star"></i> {{ repo.stargazers_count }}
                </span>
                <span class="repo-stat" v-if="repo.forks_count">
                  <i class="fas fa-code-branch"></i> {{ repo.forks_count }}
                </span>
                <span class="repo-stat">
                  <i class="far fa-calendar-alt"></i> {{ formatDate(repo.updated_at) }}
                </span>
              </div>
            </div>
            <div class="card-footer">
              <a :href="repo.html_url" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                <i class="fas fa-code"></i> Ver Código
              </a>
              <a v-if="repo.homepage" :href="repo.homepage" target="_blank" rel="noopener noreferrer" class="btn btn-secondary ms-2">
                <i class="fas fa-external-link-alt"></i> Demo
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="repositories.length > 0" class="text-center mt-4">
        <a href="https://github.com/margandona" target="_blank" rel="noopener noreferrer" class="btn btn-light btn-lg">
          <i class="fab fa-github me-2"></i> Ver todos los repositorios
        </a>
      </div>
      
      <!-- External Projects Section -->
      <div class="external-projects mt-5 pt-4">
        <h3 class="external-title mb-4">Otros Proyectos Destacados</h3>
        <div class="row justify-content-center">
          <div class="col-md-4 mb-4">
            <div class="external-card card h-100">
              <div class="card-body text-center">
                <i class="fas fa-landmark fa-3x mb-3"></i>
                <h4>Proyecto Museo</h4>
                <p>Una experiencia virtual inmersiva para explorar exposiciones digitales.</p>
              </div>
              <div class="card-footer text-center">
                <a href="https://margandona.github.io/proyecto_museo/" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary">
                  <i class="fas fa-external-link-alt me-2"></i> Visitar Sitio
                </a>
              </div>
            </div>
          </div>
          
          <div class="col-md-4 mb-4">
            <div class="external-card card h-100">
              <div class="card-body text-center">
                <i class="fas fa-globe fa-3x mb-3"></i>
                <h4>NeekWorld</h4>
                <p>Mi portal profesional con proyectos y servicios digitales.</p>
              </div>
              <div class="card-footer text-center">
                <a href="https://www.neekworld.cl" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary">
                  <i class="fas fa-external-link-alt me-2"></i> Visitar Sitio
                </a>
              </div>
            </div>
          </div>
          
          <div class="col-md-4 mb-4">
            <div class="external-card card h-100">
              <div class="card-body text-center">
                <i class="fas fa-gamepad fa-3x mb-3"></i>
                <h4>Juego Mascota</h4>
                <p>Un divertido juego interactivo con mascotas virtuales.</p>
              </div>
              <div class="card-footer text-center">
                <a href="https://margandona.github.io/juego_mascota/" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary">
                  <i class="fas fa-external-link-alt me-2"></i> Visitar Sitio
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'GithubSection',
  data() {
    return {
      repositories: [],
      loading: true,
      error: null,
      languageColors: {
        JavaScript: '#f1e05a',
        TypeScript: '#2b7489',
        HTML: '#e34c26',
        CSS: '#563d7c',
        Vue: '#41b883',
        Python: '#3572A5',
        Java: '#b07219',
        PHP: '#4F5D95',
        'C#': '#178600',
        Ruby: '#701516'
      }
    }
  },
  computed: {
    ...mapGetters('accessibility', [
      'currentMode'
    ]),
    mode() {
      return this.currentMode;
    }
  },
  mounted() {
    this.fetchRepositories();
  },
  methods: {
    async fetchRepositories() {
      this.loading = true;
      this.error = null;
      
      try {
        // Replace with your GitHub username
        const username = 'margandona';
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
        
        if (!response.ok) {
          throw new Error(`Error al cargar repositorios: ${response.statusText}`);
        }
        
        const data = await response.json();
        this.repositories = data;
      } catch (error) {
        console.error('Error fetching repositories:', error);
        this.error = 'No se pudieron cargar los repositorios. Por favor, intenta más tarde.';
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    getLanguageColor(language) {
      return this.languageColors[language] || '#858585';
    }
  }
}
</script>

<style scoped>
.github-section {
  padding: 50px 0;
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

/* Featured and External Projects Styles */
.featured-title, .other-repos-title, .external-title {
  font-size: 1.8rem;
  text-align: center;
  font-weight: 600;
  position: relative;
  padding-bottom: 10px;
}

.featured-title::after, .other-repos-title::after, .external-title::after {
  content: '';
  width: 40px;
  height: 3px;
  background: #fff;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.featured-card {
  border-left: 5px solid #41b883;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.external-card {
  transition: transform 0.3s, box-shadow 0.3s;
  border: none;
  border-radius: 8px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  color: #333;
}

.external-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
}

.external-card .card-body i {
  color: #5b86e5;
}

.external-projects {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

/* Existing Styles */
.github-intro {
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto 40px auto;
  text-align: center;
  opacity: 0.9;
}

.repo-card {
  transition: transform 0.3s, box-shadow 0.3s;
  border: none;
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.repo-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.repo-card .card-title {
  font-size: 1.4rem;
  color: #333;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.repo-icon {
  font-size: 1.8rem;
  color: #333;
}

.repo-description {
  color: #555;
  height: 4.5rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.repo-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 15px;
  font-size: 0.85rem;
  color: #666;
}

.repo-stat {
  display: flex;
  align-items: center;
  gap: 5px;
}

.language-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.card-footer {
  background-color: rgba(0, 0, 0, 0.03);
  border-top: 1px solid rgba(0, 0, 0, 0.125);
  padding: 15px;
}

/* Compatibility with accessibility modes */
.github-section.modo-nocturno {
  background: linear-gradient(135deg, #333, #444);
  color: #cccccc;
}

.github-section.descanso-visual {
  background: linear-gradient(135deg, #f7f7f7, #e2e2e2);
  color: #333;
}

.github-section.daltonismo {
  filter: grayscale(100%);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .repo-card .card-title {
    font-size: 1.2rem;
  }
  
  .github-intro {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .featured-title, .other-repos-title, .external-title {
    font-size: 1.5rem;
  }
}
</style>
