<template>
  <section id="github" class="github-section section" :class="[mode]">
    <div class="container">
      <h2 class="section-title">Mis Repositorios de GitHub</h2>
      <p class="github-intro">Explora mis proyectos open source y otros trabajos en GitHub</p>
      
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
}
</style>
