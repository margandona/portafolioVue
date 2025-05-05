<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/" class="logo">
          <img src="../assets/logo.png" alt="Academia Logo" class="logo-img" />
          <span class="logo-text">Academia</span>
        </router-link>
      </div>

      <div class="navbar-links" :class="{ active: mobileMenuOpen }">
        <!-- Course links -->
        <router-link to="/courses" class="nav-link">Cursos</router-link>
        
        <template v-if="isLoggedIn">
          <!-- Student specific links -->
          <router-link v-if="userRole === 'student'" to="/enrolled" class="nav-link">
            Mis Cursos
          </router-link>
          
          <!-- Teacher specific links -->
          <router-link v-if="userRole === 'teacher'" to="/teacher/courses" class="nav-link">
            Mis Cursos
          </router-link>
          <router-link v-if="userRole === 'teacher'" to="/teacher/students" class="nav-link">
            Mis Estudiantes
          </router-link>
          
          <!-- Admin specific links -->
          <router-link v-if="userRole === 'admin'" to="/admin/courses" class="nav-link">
            Gestión de Cursos
          </router-link>
          <router-link v-if="userRole === 'admin'" to="/admin/users" class="nav-link">
            Gestión de Usuarios
          </router-link>
          <router-link v-if="userRole === 'admin'" to="/admin/sales" class="nav-link">
            Ventas
          </router-link>
        </template>
      </div>

      <!-- Right section: Profile, Cart, Login/Logout -->
      <div class="navbar-right">
        <!-- Cart button for students -->
        <div v-if="isLoggedIn && userRole === 'student'" class="cart-container">
          <button 
            class="cart-button"
            @click="goToCart"
            aria-label="Carrito de compras"
          >
            <i class="fas fa-shopping-cart"></i>
            <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
          </button>
        </div>

        <!-- User Menu -->
        <div v-if="isLoggedIn" class="user-menu">
          <button 
            class="user-button" 
            @click="toggleUserMenu"
            aria-label="Menú de usuario"
            aria-haspopup="true"
            :aria-expanded="userMenuOpen"
          >
            <img 
              v-if="userPhotoUrl" 
              :src="userPhotoUrl" 
              alt="Foto de perfil" 
              class="user-avatar"
            />
            <div v-else class="user-initials">
              {{ userInitials }}
            </div>
          </button>
          
          <div v-if="userMenuOpen" class="dropdown-menu">
            <div class="user-info">
              <p class="user-name">{{ userName }}</p>
              <p class="user-role">{{ userRoleDisplay }}</p>
            </div>
            <router-link to="/profile" class="dropdown-item">
              Mi Perfil
            </router-link>
            <router-link v-if="userRole === 'student'" to="/purchases" class="dropdown-item">
              Mis Compras
            </router-link>
            <button @click="logout" class="dropdown-item logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </div>
        
        <!-- Login/Register buttons -->
        <div v-else class="auth-buttons">
          <router-link to="/login" class="auth-btn login">Iniciar Sesión</router-link>
          <router-link to="/register" class="auth-btn register">Registrarse</router-link>
        </div>
        
        <!-- Mobile menu toggle -->
        <button 
          class="mobile-menu-btn"
          @click="toggleMobileMenu"
          aria-label="Abrir menú"
        >
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'NavbarComponent',
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
      'userRole',
      'pendingSales'
    ]),
    isLoggedIn() {
      return this.isAuthenticated;
    },
    userInitials() {
      const name = this.userName || 'Usuario';
      return name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    },
    userName() {
      return this.getUser?.name || 'Usuario';
    },
    userPhotoUrl() {
      return this.getUser?.photoURL || null;
    },
    userRoleDisplay() {
      const roles = {
        'student': 'Estudiante',
        'teacher': 'Profesor',
        'admin': 'Administrador'
      };
      return roles[this.userRole] || 'Usuario';
    },
    cartCount() {
      return this.pendingSales?.length || 0;
    }
  },
  methods: {
    ...mapActions(['logout', 'fetchPendingSales']),
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      if (this.mobileMenuOpen) {
        this.userMenuOpen = false;
      }
    },
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen;
    },
    goToCart() {
      this.$router.push('/cart');
    },
    closeMenus() {
      this.mobileMenuOpen = false;
      this.userMenuOpen = false;
    }
  },
  mounted() {
    // Close menus when clicking outside
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
    
    // For students, fetch pending sales to show cart count
    if (this.isLoggedIn && this.userRole === 'student') {
      this.fetchPendingSales();
    }
  },
  watch: {
    // Update cart when route changes
    $route() {
      if (this.isLoggedIn && this.userRole === 'student') {
        this.fetchPendingSales();
      }
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

.navbar-brand {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #2A3B5F;
}

.logo-img {
  height: 40px;
  margin-right: 10px;
}

.logo-text {
  font-family: "Playfair Display", serif;
  font-size: 22px;
  font-weight: 700;
}

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
}

.nav-link:hover, .nav-link.router-link-active {
  color: #2E8B57;
  background-color: rgba(46, 139, 87, 0.1);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* Cart styles */
.cart-container {
  position: relative;
}

.cart-button {
  background: none;
  border: none;
  font-size: 20px;
  color: #2A3B5F;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.cart-button:hover {
  background-color: rgba(46, 139, 87, 0.1);
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #FF6B6B;
  color: white;
  font-size: 10px;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* User menu styles */
.user-menu {
  position: relative;
}

.user-button {
  background: none;
  border: none;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  padding: 0;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-initials {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #2E8B57;
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
  margin-top: 10px;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-info {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f9f9f9;
}

.user-name {
  font-weight: bold;
  margin: 0 0 5px 0;
  color: #2A3B5F;
}

.user-role {
  margin: 0;
  font-size: 12px;
  color: #6c757d;
}

.dropdown-item {
  display: block;
  padding: 12px 15px;
  color: #2A3B5F;
  text-decoration: none;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.logout-btn {
  text-align: left;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  color: #dc3545;
}

.logout-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

/* Auth buttons styles */
.auth-buttons {
  display: flex;
  gap: 10px;
}

.auth-btn {
  padding: 8px 15px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s, color 0.3s;
}

.login {
  color: #2E8B57;
  border: 1px solid #2E8B57;
  background-color: white;
}

.login:hover {
  background-color: rgba(46, 139, 87, 0.1);
}

.register {
  background-color: #2E8B57;
  color: white;
  border: 1px solid #2E8B57;
}

.register:hover {
  background-color: #3aa870;
}

/* Mobile menu */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #2A3B5F;
  padding: 8px;
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
  }
  
  .navbar-links.active {
    display: flex;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .nav-link {
    width: 100%;
    text-align: center;
    padding: 12px 0;
  }
  
  .auth-buttons {
    display: none;
  }
  
  .dropdown-menu {
    right: -10px;
  }
}
</style>
