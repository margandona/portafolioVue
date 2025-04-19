<template>
  <div class="login-page">
    <div class="login-container">
      <h1>Iniciar Sesión</h1>
      <form @submit.prevent="handleLogin" aria-labelledby="login-title">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            id="email"
            type="email"
            class="form-control"
            v-model="email"
            required
            placeholder="Ingrese su correo"
            aria-required="true"
            aria-label="Correo Electrónico"
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
            aria-required="true"
            aria-label="Contraseña"
          />
        </div>
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isLoading"
          :aria-busy="isLoading"
        >
          {{ isLoading ? "Cargando..." : "Entrar" }}
        </button>
        <p class="extra-links">
          <router-link to="/forgot-password" class="forgot-password-link">
            ¿Olvidaste tu contraseña?
          </router-link>
        </p>
        <p class="register-link">
          ¿No tienes una cuenta?
          <router-link to="/register">Regístrate aquí</router-link>
        </p>
      </form>
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
        const response = await axios.post("http://localhost:3000/api/auth/login", {
          email: this.email,
          password: this.password,
        });

        const token = response.data.token;
        localStorage.setItem("token", token); // Almacenar token

        alert("Inicio de sesión exitoso");
        this.$router.push("/dashboard"); // Redirigir al dashboard
      } catch (error) {
        if (error.response?.status === 404) {
          this.errorMessage = "El usuario no existe. Verifique sus datos.";
        } else if (error.response?.status === 401) {
          this.errorMessage = "Contraseña incorrecta. Inténtelo de nuevo.";
        } else {
          this.errorMessage = "Error al iniciar sesión. Inténtelo más tarde.";
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.login-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-container {
  padding: 30px;
  max-width: 400px;
  width: 100%;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h1 {
  color: #2a3b5f;
  font-family: "Playfair Display", serif;
  font-size: 24px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

.form-control {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  border-color: #2e8b57;
  outline: none;
  box-shadow: 0px 0px 5px rgba(46, 139, 87, 0.5);
}

.alert {
  margin-top: 20px;
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px;
  border-radius: 5px;
}

.btn {
  font-family: "Roboto", sans-serif;
  font-size: 16px;
  background-color: #2e8b57;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn:hover {
  background-color: #3aa870;
}

.extra-links {
  margin-top: 20px;
}

.forgot-password-link {
  color: #007bff;
  text-decoration: underline;
}

.forgot-password-link:hover {
  color: #0056b3;
}

.register-link {
  margin-top: 10px;
  font-size: 14px;
}

.register-link a {
  color: #2a3b5f;
  text-decoration: underline;
}

.register-link a:hover {
  color: #2e8b57;
}
</style>
