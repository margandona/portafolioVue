<template>
  <div class="login-page">
    <div class="login-container">
      <h1>Iniciar Sesión</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            id="email"
            type="email"
            class="form-control"
            v-model="email"
            required
            placeholder="Ingrese su correo electrónico"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Contraseña</label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              class="form-control"
              v-model="password"
              required
              placeholder="Ingrese su contraseña"
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
        </div>
        
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>
        
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isLoading"
        >
          {{ isLoading ? "Iniciando sesión..." : "Iniciar Sesión" }}
        </button>
      </form>
      
      <div class="links">
        <router-link to="/forgot-password">¿Olvidaste tu contraseña?</router-link>
        <router-link to="/register">¿No tienes una cuenta? Regístrate aquí</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: "LoginView",
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      showPassword: false,
    };
  },
  computed: {
    ...mapGetters(['isLoading', 'getError', 'isAuthenticated']),
    isLoading() {
      return this.isLoading;
    }
  },
  methods: {
    ...mapActions(['login']),
    async handleLogin() {
      this.errorMessage = "";
      
      try {
        await this.login({
          email: this.email,
          password: this.password
        });
        
        // Redirect to dashboard after successful login
        this.$router.push('/dashboard');
      } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        
        // Display appropriate error message
        if (error.response?.status === 401) {
          this.errorMessage = "Credenciales incorrectas. Por favor, intenta nuevamente.";
        } else if (error.response?.status === 404) {
          this.errorMessage = "Usuario no encontrado. Verifica tu correo electrónico.";
        } else {
          this.errorMessage = this.getError || "Error al iniciar sesión. Inténtalo nuevamente.";
        }
      }
    },
  },
  // If already authenticated, redirect to dashboard
  created() {
    if (this.isAuthenticated) {
      this.$router.push('/dashboard');
    }
  }
};
</script>

<style scoped>
.login-page {
  background-color: #f5f5f5;
  min-height: calc(100vh - 140px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.login-container {
  width: 100%;
  max-width: 400px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

h1 {
  color: #2a3b5f;
  font-family: "Playfair Display", serif;
  font-size: 24px;
  margin-bottom: 25px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.form-control:focus {
  border-color: #2e8b57;
  outline: none;
  box-shadow: 0 0 0 2px rgba(46, 139, 87, 0.2);
}

.password-input {
  position: relative;
  display: flex;
}

.password-input input {
  flex: 1;
  padding-right: 80px;
}

.toggle-password {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  padding: 0 15px;
  background: none;
  border: none;
  color: #2E8B57;
  cursor: pointer;
  font-size: 14px;
}

.btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  background-color: #2e8b57;
  color: white;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.btn:hover:not(:disabled) {
  background-color: #3aa870;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.alert {
  margin-top: 15px;
  padding: 10px;
  border-radius: 5px;
  background-color: #f8d7da;
  color: #dc3545;
  border: 1px solid #f5c6cb;
}

.links {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
}

.links a {
  color: #2E8B57;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}

@media (max-width: 576px) {
  .login-container {
    padding: 20px;
    margin: 0 15px;
  }
}
</style>
