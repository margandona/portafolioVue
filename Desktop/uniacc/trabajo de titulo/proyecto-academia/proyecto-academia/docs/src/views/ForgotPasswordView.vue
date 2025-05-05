<template>
  <div class="forgot-password-page">
    <div class="forgot-password-container">
      <h1>Recuperar Contraseña</h1>
      <p>Introduce tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.</p>
      <form @submit.prevent="handleForgotPassword">
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
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="alert alert-success" role="alert">
          {{ successMessage }}
        </div>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isLoading"
          :aria-busy="isLoading"
        >
          {{ isLoading ? "Enviando..." : "Enviar" }}
        </button>
      </form>
      <div class="links">
        <router-link to="/login" class="back-to-login-link">
          Volver al inicio de sesión
        </router-link>
        <router-link to="/register" class="register-link">
          ¿No tienes una cuenta? Regístrate aquí
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ForgotPasswordView",
  data() {
    return {
      email: "",
      errorMessage: "",
      successMessage: "",
      isLoading: false,
    };
  },
  methods: {
    async handleForgotPassword() {
      this.isLoading = true;
      this.errorMessage = "";
      this.successMessage = "";
      try {
        await axios.post("https://us-central1-casiangelesydemonios.cloudfunctions.net/api/auth/forgot-password", {
          email: this.email,
        });
        this.successMessage =
          "Se ha enviado un correo electrónico con las instrucciones para restablecer tu contraseña.";
      } catch (error) {
        if (error.response?.status === 404) {
          this.errorMessage = "No se encontró una cuenta asociada con este correo.";
        } else {
          this.errorMessage = "Error al enviar el correo. Inténtelo más tarde.";
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.forgot-password-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.forgot-password-container {
  margin: auto;
  padding: 30px;
  max-width: 400px;
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

p {
  color: #6c757d;
  font-family: "Roboto", sans-serif;
  font-size: 14px;
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
  transition: border-color 0.3s;
}

.form-control:focus {
  border-color: #2e8b57;
  outline: none;
  box-shadow: 0px 0px 5px rgba(46, 139, 87, 0.5);
}

.alert {
  margin-top: 20px;
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
}

.alert-danger {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.alert-success {
  color: #28a745;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
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
  transition: background-color 0.3s, transform 0.2s;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn:hover {
  background-color: #3aa870;
}

.links {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.back-to-login-link,
.register-link {
  color: #007bff;
  text-decoration: underline;
}

.back-to-login-link:hover,
.register-link:hover {
  color: #0056b3;
}
</style>
