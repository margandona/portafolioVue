<template>
  <nav class="navbar">
    <div class="navbar-container">
      <NavbarBrand />

      <NavbarLinks 
        :isLoggedIn="isLoggedIn" 
        :userRole="userRole" 
        :isMenuOpen="mobileMenuOpen"
      />

      <!-- Right section: Profile, Login/Logout -->
      <div class="navbar-right">
        <!-- User Menu -->
        <UserMenu 
          v-if="isLoggedIn" 
          :userName="userName" 
          :userRole="userRole" 
          :isOpen="userMenuOpen"
          @toggle="toggleUserMenu" 
          @logout="handleLogout"
        />
        
        <!-- Login/Register buttons -->
        <AuthButtons v-else />
        
        <!-- Mobile menu toggle -->
        <MobileMenuButton @toggle="toggleMobileMenu" />
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import NavbarBrand from './navbar/NavbarBrand.vue';
import NavbarLinks from './navbar/NavbarLinks.vue';
import UserMenu from './navbar/UserMenu.vue';
import AuthButtons from './navbar/AuthButtons.vue';
import MobileMenuButton from './navbar/MobileMenuButton.vue';

export default {
  name: 'NavbarComponent',
  components: {
    NavbarBrand,
    NavbarLinks,
    UserMenu,
    AuthButtons,
    MobileMenuButton
  },
  data() {
    return {
      mobileMenuOpen: false,
      userMenuOpen: false,
    };
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'getUser',
      'userRole'
    ]),
    isLoggedIn() {
      return this.isAuthenticated;
    },
    userName() {
      return this.getUser?.name || localStorage.getItem('name') || 'Usuario';
    }
  },
  methods: {
    ...mapActions(['logout', 'fetchUserProfile']),
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      if (this.mobileMenuOpen) {
        this.userMenuOpen = false;
      }
    },
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen;
    },
    closeMenus() {
      this.mobileMenuOpen = false;
      this.userMenuOpen = false;
    },
    async handleLogout() {
      await this.logout();
      this.closeMenus();
      this.$router.push('/');
    }
  },
  mounted() {
    // Cargar datos del usuario si está autenticado
    if (this.isAuthenticated && !this.getUser) {
      this.fetchUserProfile();
    }
    
    // Cerrar menús cuando se hace clic fuera
    document.addEventListener('click', (e) => {
      const userMenu = this.$el.querySelector('.user-menu');
      const mobileMenu = this.$el.querySelector('.navbar-links');
      
      if (userMenu && !userMenu.contains(e.target) && 
          !e.target.classList.contains('user-button')) {
        this.userMenuOpen = false;
      }
      
      if (mobileMenu && !mobileMenu.contains(e.target) && 
          !e.target.classList.contains('mobile-menu-btn') && 
          window.innerWidth <= 768) {
        this.mobileMenuOpen = false;
      }
    });
  },
  watch: {
    // Actualizar cuando cambie la ruta
    $route() {
      this.closeMenus();
    }
  }
};
</script>

<style scoped>
.navbar {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  font-family: "Roboto", sans-serif;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 70px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
}
</style>
