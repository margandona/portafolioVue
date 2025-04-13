<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light nav">
    <img src="@/assets/img/logo1.png" alt="logotipo" style="width: 45px;">
    <a class="navbar-brand" href="#" @click.prevent="navigateTo('home')">MaKuaZ</a>
    <button class="navbar-toggler" type="button" @click="toggleMenu" 
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" :class="{ 'show': isMenuOpen }" id="navbarNav">
      <ul class="navbar-nav w-100 justify-content-around">
        <li v-for="(item, index) in navItems" :key="index" class="nav-item nav__item">
          <a href="#" 
             class="nav-link" 
             :class="{ 'active': isActive(item.id) }"
             @click.prevent="navigateAndCloseMenu(item.id)">
            <span class="nav-icon"><i :class="item.icon"></i></span>
            {{ item.text }}
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavbarComponent',
  data() {
    return {
      isMenuOpen: false,
      navItems: [
        { text: 'Inicio', id: 'home', route: '/', icon: 'fas fa-home' },
        { text: 'Accesibilidad', id: 'accessibility', route: '/accessibility', icon: 'fas fa-universal-access' },
        { text: 'Diversión', id: 'playground', route: '/playground', icon: 'fas fa-gamepad' },
        { text: 'Educación', id: 'education', route: '/education', icon: 'fas fa-graduation-cap' },
        { text: 'Comunicaciones', id: 'communications', route: '/communications', icon: 'fas fa-comments' },
        { text: 'Acerca de', id: 'about', route: '/about', icon: 'fas fa-user' },
        { text: 'RRSS', id: 'rrss', route: '/#rrss', icon: 'fas fa-share-alt' }
      ]
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    navigateAndCloseMenu(sectionId) {
      this.navigateTo(sectionId);
      // Cerramos el menú después de navegar en dispositivos móviles
      this.isMenuOpen = false;
    },
    navigateTo(sectionId) {
      // Si es inicio, limpiar la sección activa para mostrar el ProfilePresentation
      if (sectionId === 'home') {
        this.$store.dispatch('navigation/setActiveSection', null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } 
      // Si es RRSS, simplemente desplazarse al elemento
      else if (sectionId === 'rrss') {
        this.scrollToElement('#rrss');
      } 
      // Para cualquier otra sección, activarla y desplazarse a ella
      else {
        this.$store.dispatch('navigation/setActiveSection', sectionId);
        
        // Esperar a que la sección se muestre antes de desplazarse
        this.$nextTick(() => {
          this.scrollToSection(sectionId);
        });
      }
    },
    isActive(sectionId) {
      return this.$store.getters['navigation/isActive'](sectionId);
    },
    scrollToSection(sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    scrollToElement(selector) {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}
</script>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  width: 100%;
  background: white;
  z-index: 1000;
  transition: background-color 0.5s, color 0.5s;
}

.navbar-nav {
  align-items: center;
}

.nav__item {
  margin: 0 5px;
  text-align: center;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
}

.nav-icon {
  display: block;
  margin-bottom: 5px;
  font-size: 1.2rem;
  transition: transform 0.5s ease;
}

.nav-link:hover .nav-icon {
  transform: rotate(360deg);
}

.nav-link.active {
  font-weight: bold;
  color: #36d1dc !important;
}

.nav-link.active .nav-icon {
  color: #36d1dc;
}

@media (max-width: 991px) {
  .navbar-nav {
    flex-direction: column;
    width: 100%;
  }
  
  .navbar-collapse {
    transition: height 0.3s ease;
    overflow: hidden;
  }
  
  .navbar-collapse.show {
    height: auto;
    max-height: 500px;
  }
  
  .navbar-collapse:not(.show) {
    height: 0;
  }
  
  .nav__item {
    margin: 8px 0;
    text-align: center;
  }
  
  .navbar-nav {
    width: 100%;
    text-align: center;
  }
  
  .navbar-toggler {
    margin-right: 15px;
  }
  
  .nav-link {
    flex-direction: row;
    justify-content: center;
  }
  
  .nav-icon {
    margin-bottom: 0;
    margin-right: 10px;
  }
}

/* Estilos para modo de accesibilidad visual */
.nav.descanso-visual {
  background-color: #f0f0f0;
}

.nav.daltonismo {
  filter: grayscale(100%);
}

.nav.modo-nocturno {
  background-color: #2e2e2e;
}

.nav.modo-nocturno .nav-link {
  color: #cccccc !important;
}

.nav.modo-nocturno .nav-link.active {
  color: #36d1dc !important;
}

.nav.descanso-visual .nav-link {
  color: #333 !important;
}
</style>