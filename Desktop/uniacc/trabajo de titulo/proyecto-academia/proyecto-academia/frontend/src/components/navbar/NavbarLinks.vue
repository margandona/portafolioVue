<template>
  <div class="navbar-links" :class="{ 'show': isMenuOpen }">
    <router-link to="/" class="nav-link">
      <v-icon size="small" class="nav-icon">mdi-home</v-icon>
      Inicio
    </router-link>
    
    <router-link to="/courses" class="nav-link">
      <v-icon size="small" class="nav-icon">mdi-book-open-variant</v-icon>
      Cursos
    </router-link>
    
    <!-- Aula Virtual Dropdown -->
    <AulaVirtualDropdown 
      :isOpen="aulaVirtualOpen" 
      @toggle="toggleAulaVirtual" 
    />
    
    <!-- Links for authenticated users -->
    <template v-if="isLoggedIn">
      <!-- Student links -->
      <router-link 
        v-if="userRole === 'student'" 
        to="/courses/enrolled" 
        class="nav-link"
      >
        <v-icon size="small" class="nav-icon">mdi-school</v-icon>
        Mis cursos
      </router-link>
      
      <!-- Teacher links -->
      <router-link 
        v-if="userRole === 'teacher' || userRole === 'admin'" 
        to="/courses/manage" 
        class="nav-link"
      >
        <v-icon size="small" class="nav-icon">mdi-teach</v-icon>
        Gestión de cursos
      </router-link>
      
      <!-- Admin links -->
      <router-link 
        v-if="userRole === 'admin'" 
        to="/dashboard" 
        class="nav-link"
      >
        <v-icon size="small" class="nav-icon">mdi-view-dashboard</v-icon>
        Administración
      </router-link>
    </template>
    
    <router-link to="/about" class="nav-link">
      <v-icon size="small" class="nav-icon">mdi-information</v-icon>
      Acerca de
    </router-link>
  </div>
</template>

<script>
import AulaVirtualDropdown from './AulaVirtualDropdown.vue';

export default {
  name: 'NavbarLinks',
  components: {
    AulaVirtualDropdown
  },
  props: {
    isLoggedIn: {
      type: Boolean,
      required: true
    },
    userRole: {
      type: String,
      default: ''
    },
    isMenuOpen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      aulaVirtualOpen: false
    };
  },
  methods: {
    toggleAulaVirtual() {
      this.aulaVirtualOpen = !this.aulaVirtualOpen;
    }
  },
  watch: {
    // Close dropdown when mobile menu closes
    isMenuOpen(newVal) {
      if (!newVal) {
        this.aulaVirtualOpen = false;
      }
    }
  }
}
</script>

<style scoped>
.navbar-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #2A3B5F;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 4px;
  transition: color 0.3s, background-color 0.3s;
  display: flex;
  align-items: center;
}

.nav-icon {
  margin-right: 6px;
}

.nav-link:hover, .nav-link.router-link-active {
  color: #2E8B57;
  background-color: rgba(46, 139, 87, 0.1);
}

@media (max-width: 768px) {
  .navbar-links {
    display: none;
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    background-color: white;
    flex-direction: column;
    padding: 10px 0;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }
  
  .navbar-links.show {
    display: flex;
  }
  
  .nav-link {
    width: 100%;
    text-align: center;
    padding: 12px 0;
    justify-content: center;
  }
}
</style>
