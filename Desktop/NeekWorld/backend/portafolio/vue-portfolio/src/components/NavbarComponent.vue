<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light nav" :class="accessibilityClasses">
    <!-- Left side: Toggle menu button -->
    <button class="navbar-toggler order-1" type="button" @click="toggleMenu" 
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    
    <!-- Center: Logo and title -->
    <div class="navbar-brand-container order-2 order-lg-1 mx-auto">
      <img src="@/assets/img/logo1.png" alt="logotipo" class="navbar-logo">
      <a class="navbar-brand" href="#" @click.prevent="navigateTo('home')">MaKuaZ</a>
    </div>
    
    <!-- Right side: Accessibility button -->
    <button 
      class="btn accessibility-shortcut d-lg-none order-3" 
      type="button" 
      @click="toggleAccessibilityMenu"
      aria-label="Accessibility Options">
      <i class="fas fa-universal-access"></i>
    </button>
    
    <!-- Collapsible menu -->
    <div class="collapse navbar-collapse order-4" :class="{ 'show': isMenuOpen }" id="navbarNav">
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
    
    <!-- Mobile accessibility menu -->
    <div class="accessibility-menu" v-if="isAccessibilityMenuOpen">
      <div class="accessibility-menu-content">
        <button @click="toggleAccessibilityOption('daltonismo')" class="access-btn" :class="{'active': isColorblindMode}">
          <i class="fas fa-palette"></i>
        </button>
        <button @click="toggleAccessibilityOption('descanso-visual')" class="access-btn" :class="{'active': isVisualRestMode}">
          <i class="fas fa-eye"></i>
        </button>
        <button @click="toggleAccessibilityOption('modo-nocturno')" class="access-btn" :class="{'active': isNightMode}">
          <i class="fas fa-moon"></i>
        </button>
        <button @click="resetAccessibility" class="access-btn">
          <i class="fas fa-sync"></i>
        </button>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'NavbarComponent',
  data() {
    return {
      isMenuOpen: false,
      isAccessibilityMenuOpen: false,
      navItems: [
        { text: 'Inicio', id: 'home', route: '/', icon: 'fas fa-home' },
        { text: 'Accesibilidad', id: 'accessibility', route: '/accessibility', icon: 'fas fa-universal-access' },
        { text: 'Diversión', id: 'playground', route: '/playground', icon: 'fas fa-gamepad' },
        { text: 'Educación', id: 'education', route: '/education', icon: 'fas fa-graduation-cap' },
        { text: 'Seguridad', id: 'security', route: '/security', icon: 'fas fa-shield-alt' },
        { text: 'Radio', id: 'radio', route: null, icon: 'fas fa-broadcast-tower' },
        { text: 'GitHub', id: 'github', route: '/github', icon: 'fab fa-github' },
        { text: 'Acerca de', id: 'about', route: '/about', icon: 'fas fa-user' },
        { text: 'RRSS', id: 'rrss', route: '/#rrss', icon: 'fas fa-share-alt' }
      ]
    }
  },
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
    accessibilityClasses() {
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
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
      // Close accessibility menu if it's open
      if (this.isAccessibilityMenuOpen) {
        this.isAccessibilityMenuOpen = false;
      }
    },
    toggleAccessibilityMenu() {
      this.isAccessibilityMenuOpen = !this.isAccessibilityMenuOpen;
      // Close main menu if it's open
      if (this.isMenuOpen) {
        this.isMenuOpen = false;
      }
    },
    toggleAccessibilityOption(option) {
      switch(option) {
        case 'daltonismo':
          this.$store.dispatch('accessibility/toggleColorblindMode');
          break;
        case 'descanso-visual':
          this.$store.dispatch('accessibility/toggleVisualRestMode');
          break;
        case 'modo-nocturno':
          this.$store.dispatch('accessibility/toggleNightMode');
          break;
      }
    },
    resetAccessibility() {
      this.$store.dispatch('accessibility/resetAccessibility');
    },
    navigateAndCloseMenu(sectionId) {
      if (sectionId === 'radio') {
        try {
          this.$store.dispatch('modals/showRadioModal');
        } catch (error) {
          console.error('Error dispatching showRadioModal action:', error);
        }
      } else {
        this.navigateTo(sectionId);
      }
      // Close the menu after navigation on mobile devices
      this.isMenuOpen = false;
    },
    navigateTo(sectionId) {
      // If it's Radio, show the modal instead of navigating
      if (sectionId === 'radio') {
        try {
          this.$store.dispatch('modals/showRadioModal');
        } catch (error) {
          console.error('Error dispatching showRadioModal action:', error);
        }
        return;
      }
      
      // If it's home, clear the active section to show ProfilePresentation
      if (sectionId === 'home') {
        this.$store.dispatch('navigation/setActiveSection', null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } 
      // If it's RRSS, simply scroll to the element
      else if (sectionId === 'rrss') {
        this.scrollToElement('#rrss');
      } 
      // For any other section, activate it and scroll to it
      else {
        this.$store.dispatch('navigation/setActiveSection', sectionId);
        
        // Wait for the section to display before scrolling
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
  margin-bottom: 0 !important;
  display: flex;
  justify-content: space-between;
}

/* Center brand and logo container */
.navbar-brand-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Logo styling */
.navbar-logo {
  width: 45px;
  height: auto;
  margin-right: 10px;
}

/* Accessibility shortcut positioned on the right */
.accessibility-shortcut {
  margin-left: auto;
  margin-right: 15px;
  padding: 8px 10px;
  background-color: #36d1dc;
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.3s ease;
}

.accessibility-shortcut:hover {
  background-color: #5b86e5;
  transform: scale(1.1);
}

/* Hamburger menu button positioned on the left */
.navbar-toggler {
  margin-left: 15px;
  margin-right: auto;
}

/* Mobile accessibility menu */
.accessibility-menu {
  position: fixed;
  top: 56px;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 0 0 0 10px;
  padding: 10px;
  z-index: 1001;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.accessibility-menu-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.access-btn {
  background-color: #36d1dc;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.access-btn:hover {
  background-color: #5b86e5;
  transform: scale(1.1);
}

.access-btn.active {
  background-color: #ffd700;
  color: #333;
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

.navbar-brand {
  font-family: 'Lobster', cursive;
  font-size: 1.8rem;
  margin-right: 20px;
  transition: all 0.3s ease;
}

.navbar-brand:hover {
  transform: scale(1.05);
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
  
  /* Ensure proper spacing in mobile view */
  .navbar-brand-container {
    flex-grow: 1;
    justify-content: center;
  }

  /* Override Bootstrap's default toggler margin */
  .navbar-toggler {
    margin-right: 0;
  }
}

/* Estilos para modo de accesibilidad visual */
.nav.descanso-visual {
  background-color: #f0f0f0;
}

.nav.daltonismo {
  filter: grayscale(100%);
}

/* Estilos mejorados para el modo daltonismo */
.nav.daltonismo {
  filter: none !important; /* Evitamos aplicar doble filtro */
  position: fixed !important;
  top: 0 !important;
  margin: 0 !important;
  padding-top: 0.5rem !important;
  padding-bottom: 0.5rem !important;
  background: #333 !important;
}

.nav.daltonismo .navbar-brand,
.nav.daltonismo .nav-link,
.nav.daltonismo .nav-icon {
  filter: grayscale(100%) !important;
}

.nav.daltonismo .navbar-brand {
  color: white !important;
}

.nav.daltonismo .nav-link {
  color: white !important;
}

.nav.daltonismo .navbar-toggler {
  filter: grayscale(100%) !important;
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

/* Estilos específicos para el modo de alto contraste en el navbar */
.nav.alto-contraste {
  background-color: #000 !important;
  border-bottom: 2px solid #fff !important;
}

.nav.alto-contraste .navbar-brand {
  color: #fff !important;
  font-weight: bold !important;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.5) !important;
}

.nav.alto-contraste .nav-link {
  color: #fff !important;
  font-weight: bold !important;
  text-decoration: underline !important;
}

.nav.alto-contraste .nav-link:hover,
.nav.alto-contraste .nav-link:focus,
.nav.alto-contraste .nav-link.active {
  background-color: #fff !important;
  color: #000 !important;
  border-radius: 5px !important;
}

.nav.alto-contraste .navbar-toggler {
  background-color: #fff !important;
  border: 2px solid #fff !important;
}

.nav.alto-contraste .navbar-toggler-icon {
  filter: invert(1) !important;
}

.nav.alto-contraste .navbar-nav .nav-item {
  margin: 5px 2px !important;
}

.nav.alto-contraste .accessibility-shortcut {
  background-color: #fff !important;
  color: #000 !important;
  border: 2px solid #fff !important;
}

.nav.alto-contraste .accessibility-menu {
  background-color: #000 !important;
  border: 2px solid #fff !important;
}

.nav.alto-contraste .access-btn {
  background-color: #fff !important;
  color: #000 !important;
  border: 2px solid #fff !important;
}

.nav.alto-contraste .access-btn:hover,
.nav.alto-contraste .access-btn.active {
  background-color: #000 !important;
  color: #fff !important;
  outline: 2px solid #fff !important;
}

.nav.alto-contraste .navbar-logo {
  filter: invert(1) !important;
}

/* Estilos específicos para fuente dislexia en el navbar */
.nav.fuente-dislexia .nav-icon,
.nav.fuente-dislexia i[class*="fa-"] {
  font-family: 'Font Awesome 5 Free', 'Font Awesome 5 Brands' !important;
  display: inline-block !important;
}

.nav.fuente-dislexia .navbar-brand {
  font-family: 'Lobster', cursive !important;
}

.nav.fuente-dislexia .nav-link {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  text-align: center !important;
}
</style>