<template>
  <section id="security" class="security-section section" :class="[mode]">
    <div class="container">
      <h2 class="section-title">Ciberseguridad y Hacking Ético</h2>
      <p class="security-intro">Explora mis proyectos y conocimientos en el campo de la ciberseguridad</p>
      
      <!-- Cybersecurity Overview Section -->
      <div class="cybersecurity-overview mb-5">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="overview-card">
              <h3 class="overview-title">¿Qué es la Ciberseguridad?</h3>
              <p class="overview-description">
                La ciberseguridad es la práctica de proteger sistemas, redes y programas de ataques digitales. 
                Estos ataques cibernéticos generalmente tienen como objetivo acceder, cambiar o destruir 
                información confidencial, extorsionar dinero a los usuarios o interrumpir los procesos 
                comerciales normales.
              </p>
              
              <h4 class="overview-subtitle">Hacking Ético</h4>
              <p class="overview-description">
                El hacking ético, también conocido como penetration testing o pentesting, es la práctica 
                de intentar comprometer sistemas y redes de forma autorizada para identificar 
                vulnerabilidades de seguridad antes de que los atacantes maliciosos puedan explotarlas.
              </p>
              
              <div class="portfolio-link-container">
                <a href="https://drive.google.com/drive/folders/1TC-lKZIjgb7QgErUMqGjbt_DGgr0TLjl?usp=sharing" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="portfolio-link btn">
                  <i class="fas fa-folder-open"></i>
                  Ver Portafolio Completo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Security Projects Section -->
      <div class="security-projects">
        <h3 class="projects-title mb-4">Proyectos de Ciberseguridad</h3>
        <div class="row">
          <!-- Ciberseguridad 1 -->
          <div class="col-md-6 col-lg-4 mb-4">
            <div class="repo-card card security-card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="fas fa-shield-alt repo-icon me-2"></i>
                  <h4 class="card-title mb-0">Ciberseguridad 1</h4>
                </div>
                <p class="card-text repo-description">
                  Proyecto fundamental de introducción a la ciberseguridad. Incluye conceptos básicos 
                  de seguridad informática, análisis de vulnerabilidades y implementación de medidas 
                  de protección básicas.
                </p>
                <div class="repo-stats">
                  <span class="repo-stat">
                    <span class="language-dot security"></span>
                    Security
                  </span>
                  <span class="repo-stat">
                    <i class="far fa-calendar-alt"></i> 2024
                  </span>
                </div>
              </div>
              <div class="card-footer">
                <a href="https://github.com/margandona/ciberseguridad1" 
                   target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                  <i class="fas fa-code"></i> Ver Código
                </a>
              </div>
            </div>
          </div>
          
          <!-- Análisis -->
          <div class="col-md-6 col-lg-4 mb-4">
            <div class="repo-card card security-card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="fas fa-search repo-icon me-2"></i>
                  <h4 class="card-title mb-0">Análisis</h4>
                </div>
                <p class="card-text repo-description">
                  Herramientas y técnicas de análisis de seguridad. Incluye metodologías para 
                  evaluación de riesgos, análisis forense digital y técnicas de investigación 
                  de incidentes de seguridad.
                </p>
                <div class="repo-stats">
                  <span class="repo-stat">
                    <span class="language-dot analysis"></span>
                    Analysis
                  </span>
                  <span class="repo-stat">
                    <i class="far fa-calendar-alt"></i> 2024
                  </span>
                </div>
              </div>
              <div class="card-footer">
                <a href="https://github.com/margandona/analisis" 
                   target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                  <i class="fas fa-code"></i> Ver Código
                </a>
              </div>
            </div>
          </div>
          
          <!-- Evaluación -->
          <div class="col-md-6 col-lg-4 mb-4">
            <div class="repo-card card security-card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="fas fa-clipboard-check repo-icon me-2"></i>
                  <h4 class="card-title mb-0">Evaluación</h4>
                </div>
                <p class="card-text repo-description">
                  Sistemas y metodologías de evaluación de seguridad. Implementación de frameworks 
                  de evaluación, auditorías de seguridad y validación de controles de protección.
                </p>
                <div class="repo-stats">
                  <span class="repo-stat">
                    <span class="language-dot evaluation"></span>
                    Evaluation
                  </span>
                  <span class="repo-stat">
                    <i class="far fa-calendar-alt"></i> 2024
                  </span>
                </div>
              </div>
              <div class="card-footer">
                <a href="https://github.com/margandona/evaluacion" 
                   target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                  <i class="fas fa-code"></i> Ver Código
                </a>
              </div>
            </div>
          </div>
          
          <!-- Calculadora -->
          <div class="col-md-6 col-lg-4 mb-4">
            <div class="repo-card card security-card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="fas fa-calculator repo-icon me-2"></i>
                  <h4 class="card-title mb-0">Calculadora</h4>
                </div>
                <p class="card-text repo-description">
                  Herramienta de cálculo especializada para métricas de seguridad. Incluye 
                  calculadoras para análisis de riesgo, evaluación de impacto y métricas 
                  de seguridad cuantitativas.
                </p>
                <div class="repo-stats">
                  <span class="repo-stat">
                    <span class="language-dot tools"></span>
                    Tools
                  </span>
                  <span class="repo-stat">
                    <i class="far fa-calendar-alt"></i> 2024
                  </span>
                </div>
              </div>
              <div class="card-footer">
                <a href="https://github.com/margandona/calculadora" 
                   target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                  <i class="fas fa-code"></i> Ver Código
                </a>
              </div>
            </div>
          </div>
          
          <!-- Vectores -->
          <div class="col-md-6 col-lg-4 mb-4">
            <div class="repo-card card security-card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="fas fa-vector-square repo-icon me-2"></i>
                  <h4 class="card-title mb-0">Vectores</h4>
                </div>
                <p class="card-text repo-description">
                  Análisis de vectores de ataque y superficies de ataque. Mapeo de posibles 
                  puntos de entrada, modelado de amenazas y análisis de vectores de compromiso 
                  en sistemas de información.
                </p>
                <div class="repo-stats">
                  <span class="repo-stat">
                    <span class="language-dot vectors"></span>
                    Vectors
                  </span>
                  <span class="repo-stat">
                    <i class="far fa-calendar-alt"></i> 2024
                  </span>
                </div>
              </div>
              <div class="card-footer">
                <a href="https://github.com/margandona/vectores" 
                   target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                  <i class="fas fa-code"></i> Ver Código
                </a>
              </div>
            </div>
          </div>
          
          <!-- Reconocimiento -->
          <div class="col-md-6 col-lg-4 mb-4">
            <div class="repo-card card security-card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="fas fa-eye repo-icon me-2"></i>
                  <h4 class="card-title mb-0">Reconocimiento</h4>
                </div>
                <p class="card-text repo-description">
                  Técnicas y herramientas de reconocimiento ético. Incluye metodologías OSINT, 
                  footprinting, fingerprinting y técnicas de recopilación de información 
                  para pentesting autorizado.
                </p>
                <div class="repo-stats">
                  <span class="repo-stat">
                    <span class="language-dot recon"></span>
                    Reconnaissance
                  </span>
                  <span class="repo-stat">
                    <i class="far fa-calendar-alt"></i> 2024
                  </span>
                </div>
              </div>
              <div class="card-footer">
                <a href="https://github.com/margandona/reconociento" 
                   target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                  <i class="fas fa-code"></i> Ver Código
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
  name: 'SecuritySection',
  computed: {
    ...mapGetters('accessibility', [
      'isColorblindMode', 
      'isVisualRestMode', 
      'isNightMode',
      'isHighContrastMode',
      'isLineSpacingMode',
      'isLinkHighlightMode',
      'isCursorLargeMode',
      'isNoAnimationsMode',
      'isDyslexiaFriendlyMode'
    ]),
    mode() {
      return {
        'daltonismo': this.isColorblindMode,
        'descanso-visual': this.isVisualRestMode,
        'modo-nocturno': this.isNightMode,
        'alto-contraste': this.isHighContrastMode,
        'espaciado-lineas': this.isLineSpacingMode,
        'resaltar-enlaces': this.isLinkHighlightMode,
        'cursor-grande': this.isCursorLargeMode,
        'sin-animaciones': this.isNoAnimationsMode,
        'fuente-dislexia': this.isDyslexiaFriendlyMode
      }
    }
  }
}
</script>

<style scoped>
.security-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  transition: all 0.5s ease;
}

.section-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.security-intro {
  text-align: center;
  font-size: 1.2rem;
  color: #6c757d;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Cybersecurity Overview Styles */
.cybersecurity-overview {
  margin-bottom: 4rem;
}

.overview-card {
  background: white;
  border-radius: 15px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.overview-title {
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}

.overview-subtitle {
  color: #495057;
  font-size: 1.4rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.overview-description {
  color: #6c757d;
  font-size: 1.1rem;
  line-height: 1.7;
  text-align: justify;
  margin-bottom: 1.5rem;
}

.portfolio-link-container {
  text-align: center;
  margin-top: 2rem;
}

.portfolio-link {
  background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.portfolio-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(54, 209, 220, 0.3);
  color: white;
  text-decoration: none;
}

/* Projects Section */
.projects-title {
  font-size: 2rem;
  text-align: center;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 2rem;
}

.security-card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  background: white;
}

.security-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card-body {
  padding: 1.5rem;
}

.repo-icon {
  font-size: 1.5rem;
  color: #36d1dc;
  margin-right: 0.5rem;
}

.card-title {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.2rem;
}

.repo-description {
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  text-align: justify;
}

.repo-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.repo-stat {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #6c757d;
}

.language-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.language-dot.security {
  background-color: #e74c3c;
}

.language-dot.analysis {
  background-color: #3498db;
}

.language-dot.evaluation {
  background-color: #2ecc71;
}

.language-dot.tools {
  background-color: #f39c12;
}

.language-dot.vectors {
  background-color: #9b59b6;
}

.language-dot.recon {
  background-color: #1abc9c;
}

.card-footer {
  background: transparent;
  border-top: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%);
  border: none;
  border-radius: 20px;
  padding: 8px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
  color: white;
  text-decoration: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(54, 209, 220, 0.3);
  color: white;
  text-decoration: none;
}

/* Accessibility Modes */
.security-section.modo-nocturno {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

.security-section.modo-nocturno .section-title {
  color: #ecf0f1;
  background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.security-section.modo-nocturno .security-intro {
  color: #bdc3c7;
}

.security-section.modo-nocturno .overview-card,
.security-section.modo-nocturno .security-card {
  background: #34495e;
  border-color: #4a5f7a;
}

.security-section.modo-nocturno .overview-title,
.security-section.modo-nocturno .projects-title,
.security-section.modo-nocturno .card-title {
  color: #ecf0f1;
}

.security-section.modo-nocturno .overview-subtitle {
  color: #bdc3c7;
}

.security-section.modo-nocturno .overview-description,
.security-section.modo-nocturno .repo-description,
.security-section.modo-nocturno .repo-stat {
  color: #95a5a6;
}

.security-section.modo-nocturno .card-footer {
  border-color: #4a5f7a;
}

.security-section.daltonismo {
  filter: grayscale(100%);
}

.security-section.alto-contraste {
  background: #000 !important;
}

.security-section.alto-contraste .section-title,
.security-section.alto-contraste .overview-title,
.security-section.alto-contraste .projects-title,
.security-section.alto-contraste .card-title {
  color: #fff !important;
  background: none !important;
  -webkit-text-fill-color: #fff !important;
}

.security-section.alto-contraste .overview-card,
.security-section.alto-contraste .security-card {
  background: #fff !important;
  border: 2px solid #000 !important;
}

.security-section.alto-contraste .btn-primary,
.security-section.alto-contraste .portfolio-link {
  background: #fff !important;
  color: #000 !important;
  border: 2px solid #000 !important;
}

.security-section.descanso-visual {
  background: #f8f9fa;
}

.security-section.espaciado-lineas .overview-description,
.security-section.espaciado-lineas .repo-description {
  line-height: 2 !important;
}

.security-section.sin-animaciones * {
  animation: none !important;
  transition: none !important;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }
  
  .overview-card {
    padding: 1.5rem;
  }
  
  .overview-title {
    font-size: 1.5rem;
  }
  
  .overview-subtitle {
    font-size: 1.2rem;
  }
  
  .overview-description {
    font-size: 1rem;
  }
  
  .projects-title {
    font-size: 1.5rem;
  }
}
</style>
