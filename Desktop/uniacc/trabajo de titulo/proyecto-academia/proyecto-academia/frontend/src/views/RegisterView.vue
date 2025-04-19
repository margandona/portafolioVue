<template>
  <div class="register-page">
    <div class="register-container">
      <h1>Regístrate</h1>
      <form @submit.prevent="handleRegister" aria-label="Formulario de Registro">
        <div class="form-group">
          <label for="name">Nombre Completo</label>
          <input
            id="name"
            type="text"
            class="form-control"
            v-model="name"
            required
            placeholder="Ingrese su nombre completo"
            aria-required="true"
            aria-label="Nombre Completo"
          />
        </div>
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            id="email"
            type="email"
            class="form-control"
            v-model="email"
            required
            placeholder="Ingrese su correo electrónico"
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
            placeholder="Cree una contraseña"
            aria-required="true"
            aria-label="Contraseña"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            class="form-control"
            v-model="confirmPassword"
            required
            placeholder="Repita la contraseña"
            aria-required="true"
            aria-label="Confirmar Contraseña"
          />
        </div>
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>
        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          {{ isLoading ? "Registrando..." : "Crear Cuenta" }}
        </button>
        <p class="login-link">
          ¿Ya tienes una cuenta?
          <router-link to="/login">Inicia sesión aquí</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "RegisterView",
  data() {
    return {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      errorMessage: "",
      isLoading: false,
    };
  },
  methods: {
    async handleRegister() {
      // Validaciones básicas
      if (!this.name || !this.email || !this.password || !this.confirmPassword) {
        this.errorMessage = "Todos los campos son obligatorios.";
        return;
      }
      if (!this.validateEmail(this.email)) {
        this.errorMessage = "Por favor, ingrese un correo electrónico válido.";
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.errorMessage = "Las contraseñas no coinciden.";
        return;
      }

      this.isLoading = true;
      this.errorMessage = "";
      try {
        await axios.post("http://localhost:3000/api/auth/register", {
          name: this.name,
          email: this.email,
          password: this.password,
        });
        alert("Usuario registrado exitosamente.");
        this.$router.push("/login");
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Error al registrar usuario. Inténtalo más tarde.";
      } finally {
        this.isLoading = false;
      }
    },
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
  },
};
</script>

<style scoped lang="scss">
.register-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.register-container {
  padding: 30px;
  max-width: 400px;
  width: 100%;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h1 {
  color: #2a3b5f; /* Azul Marino */
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

input {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

input:focus {
  border-color: #2e8b57;
  outline: none;
  box-shadow: 0 0 5px rgba(46, 139, 87, 0.5);
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
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border-radius: 8px;
  background-color: #2e8b57;
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn:hover {
  background-color: #3aa870;
}

.login-link {
  margin-top: 20px;
  font-size: 14px;
}

.login-link a {
  color: #2a3b5f;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
