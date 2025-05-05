<template>
  <div id="app">
    <NavbarComponent />
    
    <main class="main-content">
      <router-view />
    </main>
    
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section about">
          <h3>Academia Online</h3>
          <p>Plataforma educativa para cursos en línea, con opciones sincrónicas y asincrónicas.</p>
          <div class="contact">
            <p><i class="fas fa-map-marker-alt"></i> Santiago, Chile</p>
            <p><i class="fas fa-envelope"></i> info@academia-online.com</p>
            <p><i class="fas fa-phone"></i> +56 22 123 4567</p>
          </div>
          <div class="social">
            <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
          </div>
        </div>
        
        <div class="footer-section links">
          <h3>Enlaces Rápidos</h3>
          <ul>
            <li><router-link to="/">Inicio</router-link></li>
            <li><router-link to="/courses">Cursos</router-link></li>
            <li><router-link to="/about">Sobre Nosotros</router-link></li>
            <li><router-link to="/contact">Contacto</router-link></li>
            <li><router-link to="/faq">Preguntas Frecuentes</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section categories">
          <h3>Categorías</h3>
          <ul>
            <li><a href="#">Programación</a></li>
            <li><a href="#">Diseño</a></li>
            <li><a href="#">Negocios</a></li>
            <li><a href="#">Marketing Digital</a></li>
            <li><a href="#">Desarrollo Personal</a></li>
          </ul>
        </div>
        
        <div class="footer-section newsletter">
          <h3>Suscríbete al Boletín</h3>
          <p>Recibe actualizaciones sobre nuevos cursos y noticias.</p>
          <form @submit.prevent="subscribeNewsletter">
            <input 
              type="email" 
              v-model="newsletterEmail" 
              placeholder="Tu correo electrónico" 
              required
              aria-label="Email para newsletter"
            >
            <button type="submit" aria-label="Suscribirse">
              <i class="fas fa-paper-plane"></i>
            </button>
          </form>
          <p v-if="newsletterMessage" :class="'newsletter-message ' + newsletterMessageType">
            {{ newsletterMessage }}
          </p>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Academia Online. Todos los derechos reservados.</p>
        <div class="footer-bottom-links">
          <router-link to="/privacy">Política de Privacidad</router-link>
          <router-link to="/terms">Términos de Servicio</router-link>
        </div>
      </div>
    </footer>
    
    <!-- Botón para volver arriba -->
    <button 
      v-show="showBackToTop" 
      class="back-to-top" 
      @click="scrollToTop"
      aria-label="Volver al inicio de la página"
    >
      <i class="fas fa-chevron-up"></i>
    </button>
  </div>
</template>

<script>
import NavbarComponent from '@/components/NavbarComponent.vue'
import { mapActions } from 'vuex';

export default {
  name: 'App',
  components: {
    NavbarComponent
  },
  data() {
    return {
      newsletterEmail: '',
      newsletterMessage: '',
      newsletterMessageType: 'success',
      showBackToTop: false,
      currentYear: new Date().getFullYear()
    }
  },
  created() {
    // Inicializar estado de autenticación desde localStorage
    this.checkAuthState();
    
    // Event listener para el botón volver arriba
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    // Limpiar event listener
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    ...mapActions(['autoLogin']),
    
    checkAuthState() {
      this.autoLogin();
    },
    
    subscribeNewsletter() {
      // Simulación de suscripción al newsletter
      this.newsletterMessageType = 'success';
      this.newsletterMessage = '¡Gracias por suscribirte a nuestro boletín!';
      
      // Limpiar el campo de email
      this.newsletterEmail = '';
      
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => {
        this.newsletterMessage = '';
      }, 3000);
    },
    
    handleScroll() {
      // Mostrar el botón cuando se desplaza más de 300px
      this.showBackToTop = window.scrollY > 300;
    },
    
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
}
</script>

<style>
/* Importar fuentes de Google */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Roboto:wght@300;400;500;700&display=swap');

/* Resetear estilos */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Variables de colores */
:root {
  --primary-color: #2e8b57; /* Verde Esmeralda */
  --secondary-color: #2a3b5f; /* Azul Marino */
  --accent-color: #fd7e14; /* Naranja */
  --light-color: #f9f9f9; /* Gris claro */
  --text-color: #333; /* Negro suave */
  --text-light: #6c757d; /* Gris oscuro */
  --success-color: #28a745;
  --danger-color: #dc3545;
}

/* Estilos globales */
body {
  font-family: 'Roboto', sans-serif;
  color: var(--text-color);
  background-color: var(--light-color);
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Playfair Display', serif;
  color: var(--secondary-color);
  font-weight: 600;
}

a {
  text-decoration: none;
  color: var(--primary-color);
  transition: color 0.3s ease;
}

a:hover {
  color: var(--accent-color);
}

button {
  cursor: pointer;
}

/* Layout */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding-bottom: 40px;
}

/* Footer */
.footer {
  background-color: #2A3B5F;
  color: white;
  padding-top: 50px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  padding: 0 20px;
}

.footer-section h3 {
  color: white;
  margin-bottom: 15px;
  font-size: 18px;
}

.footer-section p {
  font-size: 14px;
  margin-bottom: 10px;
}

.contact p {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.contact i {
  margin-right: 10px;
  width: 16px;
}

.social {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.social a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: white;
  font-size: 18px;
  transition: all 0.3s ease;
}

.social a:hover {
  background-color: var(--primary-color);
  transform: translateY(-3px);
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  margin-bottom: 10px;
}

.footer-section ul li a {
  color: #ddd;
  font-size: 14px;
  transition: all 0.3s ease;
}

.footer-section ul li a:hover {
  color: white;
  margin-left: 5px;
}

.newsletter form {
  display: flex;
  margin-top: 15px;
}

.newsletter input {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
}

.newsletter button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 0 4px 4px 0;
  transition: background-color 0.3s ease;
}

.newsletter button:hover {
  background-color: var(--accent-color);
}

.newsletter-message {
  margin-top: 10px;
  font-size: 12px;
}

.newsletter-message.success {
  color: #8dffa8;
}

.newsletter-message.error {
  color: #ff8d8d;
}

.footer-bottom {
  max-width: 1200px;
  margin: 30px auto 0;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.footer-bottom p {
  font-size: 14px;
}

.footer-bottom-links {
  display: flex;
  gap: 20px;
}

.footer-bottom-links a {
  color: #ddd;
  font-size: 14px;
}

/* Botón volver arriba */
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 40px;
  height: 40px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.3s, transform 0.3s;
  z-index: 1000;
}

.back-to-top:hover {
  opacity: 1;
  transform: translateY(-5px);
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .back-to-top {
    bottom: 15px;
    right: 15px;
  }
}
</style>
