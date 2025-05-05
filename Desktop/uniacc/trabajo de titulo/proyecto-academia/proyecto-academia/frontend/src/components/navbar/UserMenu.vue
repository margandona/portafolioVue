<template>
  <div class="user-menu">
    <button 
      class="user-button" 
      @click="toggleMenu"
      aria-label="Menú de usuario"
      aria-haspopup="true"
      :aria-expanded="isOpen"
    >
      <div class="user-initials">
        {{ userInitials }}
      </div>
    </button>
    
    <div v-if="isOpen" class="dropdown-menu">
      <div class="user-info">
        <p class="user-name">{{ userName }}</p>
        <p class="user-role">{{ userRoleDisplay }}</p>
      </div>
      <router-link to="/profile" class="dropdown-item">
        Mi Perfil
      </router-link>
      <button @click="handleLogout" class="dropdown-item logout-btn">
        Cerrar Sesión
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserMenu',
  props: {
    userName: {
      type: String,
      required: true
    },
    userRole: {
      type: String,
      default: ''
    },
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    userInitials() {
      const name = this.userName || 'Usuario';
      return name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    },
    userRoleDisplay() {
      const roles = {
        'student': 'Estudiante',
        'teacher': 'Profesor',
        'admin': 'Administrador'
      };
      return roles[this.userRole] || 'Usuario';
    }
  },
  methods: {
    toggleMenu() {
      this.$emit('toggle');
    },
    handleLogout() {
      this.$emit('logout');
    }
  }
}
</script>

<style scoped>
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
  padding: 12px 15px;
}

.logout-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

@media (max-width: 768px) {
  .dropdown-menu {
    right: -10px;
  }
}
</style>
