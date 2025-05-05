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
            placeholder="Ingrese su correo"
          />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            type="password"
            class="form-control"
            v-model="password"
            required
            placeholder="Ingrese su contraseña"
          />
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
import axios from "axios";

export default {
  name: "LoginView",
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      isLoading: false,
    };
  },
  methods: {
    async handleLogin() {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const response = await axios.post(
          "https://us-central1-casiangelesydemonios.cloudfunctions.net/api/auth/login",
          {
            email: this.email,
            password: this.password,
          }
        );

        // Guardar el token en localStorage
        localStorage.setItem("token", response.data.token);
        
        // Extraer y guardar información del usuario desde el token
        try {
          const payload = JSON.parse(atob(response.data.token.split(".")[1]));
          localStorage.setItem("user_id", payload.id || "");
          localStorage.setItem("role", payload.role || "");
          localStorage.setItem("name", payload.name || "");
        } catch (error) {
          console.error("Error al decodificar el token:", error);
        }

        // Redirigir al Dashboard
        this.$router.push("/dashboard");
      } catch (error) {
        console.error("Error en el inicio de sesión:", error.response?.data || error.message);
        
        if (error.response?.status === 401) {
          this.errorMessage = "Credenciales incorrectas. Por favor, intenta nuevamente.";
        } else if (error.response?.status === 404) {
          this.errorMessage = "Usuario no encontrado. Verifica tu correo electrónico.";
        } else {
          this.errorMessage = "Error al iniciar sesión. Inténtalo nuevamente.";
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.login-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-container {
  margin: auto;
  padding: 30px;
  max-width: 400px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #2a3b5f;
  font-family: "Playfair Display", serif;
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-control {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.form-control:focus {
  border-color: #2e8b57;
  outline: none;
  box-shadow: 0px 0px 5px rgba(46, 139, 87, 0.5);
}

.btn {
  width: 100%;
  padding: 10px 15px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: #2e8b57;
  color: white;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #3aa870;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.alert {
  margin-top: 20px;
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
}

.links a {
  color: #007bff;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
</style>
