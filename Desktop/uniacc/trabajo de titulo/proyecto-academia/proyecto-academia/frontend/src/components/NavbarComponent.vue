<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        NeeKWoRLD
      </router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">
              <i class="fas fa-home"></i> Inicio
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/about">
              <i class="fas fa-info-circle"></i> Acerca de
            </router-link>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              href="https://virtual.neekworld.cl/moodle41/login/index.php"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i class="fas fa-school"></i> Academia Virtual
            </a>
          </li>

          <!-- Opciones para estudiantes -->
          <li class="nav-item" v-if="isAuthenticated && userRole === 'student'">
            <router-link class="nav-link" to="/dashboard">
              <i class="fas fa-tachometer-alt"></i> Panel
            </router-link>
          </li>
          <li class="nav-item" v-if="isAuthenticated && userRole === 'student'">
            <router-link class="nav-link" to="/courses">
              <i class="fas fa-book"></i> Mis Cursos
            </router-link>
          </li>

          <!-- Opciones para profesores -->
          <li class="nav-item" v-if="isAuthenticated && userRole === 'teacher'">
            <router-link class="nav-link" to="/dashboard">
              <i class="fas fa-chalkboard-teacher"></i> Panel
            </router-link>
          </li>
          <li class="nav-item" v-if="isAuthenticated && userRole === 'teacher'">
            <router-link class="nav-link" to="/courses">
              <i class="fas fa-folder"></i> Gestionar Cursos
            </router-link>
          </li>

          <!-- Opciones para administradores -->
          <li class="nav-item" v-if="isAuthenticated && userRole === 'admin'">
            <router-link class="nav-link" to="/dashboard">
              <i class="fas fa-tools"></i> Admin Panel
            </router-link>
          </li>
          <li class="nav-item" v-if="isAuthenticated && userRole === 'admin'">
            <router-link class="nav-link" to="/courses">
              <i class="fas fa-folder-open"></i> Todos los Cursos
            </router-link>
          </li>

          <!-- Opciones generales -->
          <li class="nav-item" v-if="!isAuthenticated">
            <router-link class="nav-link" to="/login">
              <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
            </router-link>
          </li>
          <li class="nav-item" v-if="isAuthenticated">
            <button
              class="btn btn-outline-danger nav-link"
              @click="logout"
            >
              <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "NavbarComponent",
  data() {
    return {
      isAuthenticated: false,
      userRole: "",
    };
  },
  created() {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        this.isAuthenticated = true;
        this.userRole = payload.role || "";
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        this.logout();
      }
    }
  },
  methods: {
    logout() {
      localStorage.removeItem("token");
      this.isAuthenticated = false;
      this.userRole = "";
      this.$router.push("/login");
      alert("Has cerrado sesión exitosamente.");
    },
  },
};
</script>

<style scoped>
/* Logo personalizado */
.logo {
  height: 60px;
  margin-right: 10px;
}

/* Estilos del branding */
.navbar-brand {
  font-family: "Playfair Display", serif;
  font-size: 24px;
  font-weight: bold;
  color: #2E8B57; /* Verde Esmeralda */
}

.navbar-brand:hover {
  color: #3aa870; /* Verde Esmeralda oscuro */
}

/* Estilos del menú de navegación */
.nav-link {
  font-family: "Roboto", sans-serif;
  font-size: 16px;
  color: #f5f5f5; /* Azul Marino */
}

.nav-link:hover {
  color: #ffa500; /* Azul Marino claro */
}

/* Estilos generales */
.navbar {
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); /* Sombra sutil */
}

.bg-light {
  background-color: #2a3b5f !important; /* Gris Claro */
}

/* Estilo del botón de cerrar sesión */
.btn-outline-danger {
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  color: #dc3545;
  border: 1px solid #dc3545;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: #fff;
}
</style>
