<template>
  <div class="register-page">
    <div class="register-container">
      <h1>Crear Cuenta</h1>
      <form @submit.prevent="handleRegister">
        <!-- Nombre Completo -->
        <div class="form-group">
          <label for="name">Nombre Completo</label>
          <input
            id="name"
            type="text"
            class="form-control"
            v-model="name"
            required
            placeholder="Ingrese su nombre completo"
          />
        </div>

        <!-- Correo Electrónico -->
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

        <!-- Contraseña -->
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            type="password"
            class="form-control"
            v-model="password"
            required
            placeholder="Cree una contraseña"
          />
        </div>

        <!-- Confirmar Contraseña -->
        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            class="form-control"
            v-model="confirmPassword"
            required
            placeholder="Confirme su contraseña"
          />
        </div>

        <!-- Rol (opcional, según requerimientos) -->
        <div class="form-group">
          <label for="role">Tipo de Usuario</label>
          <select id="role" class="form-control" v-model="role" required>
            <option value="student">Estudiante</option>
            <option value="teacher">Profesor</option>
          </select>
        </div>

        <!-- Mensaje de error -->
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>

        <!-- Botón de registro -->
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isLoading || !passwordsMatch"
        >
          {{ isLoading ? "Registrando..." : "Registrarse" }}
        </button>
      </form>

      <!-- Enlaces adicionales -->
      <div class="links">
        <router-link to="/login">¿Ya tienes una cuenta? Inicia sesión</router-link>
      </div>
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
      role: "student", // Por defecto, el rol es estudiante
      errorMessage: "",
      isLoading: false,
    };
  },
  computed: {
    passwordsMatch() {
      return this.password === this.confirmPassword;
    },
  },
  methods: {
    async handleRegister() {
      // Validar que las contraseñas coincidan
      if (!this.passwordsMatch) {
        this.errorMessage = "Las contraseñas no coinciden.";
        return;
      }

      this.isLoading = true;
      this.errorMessage = "";

      try {
        const response = await axios.post(
          "https://us-central1-casiangelesydemonios.cloudfunctions.net/api/auth/register",
          {
            name: this.name,
            email: this.email,
            password: this.password,
            role: this.role,
          }
        );

        // Si la respuesta incluye un token, iniciar sesión automáticamente
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          
          // Extraer info del usuario desde el token
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
        } else {
          // Si no hay token pero el registro fue exitoso, redirigir al login
          alert("Registro exitoso. Por favor inicia sesión.");
          this.$router.push("/login");
        }
      } catch (error) {
        console.error("Error en el registro:", error.response?.data || error.message);
        
        if (error.response?.status === 400 && error.response?.data?.message) {
          this.errorMessage = error.response.data.message;
        } else if (error.response?.status === 409) {
          this.errorMessage = "Este correo electrónico ya está registrado.";
        } else {
          this.errorMessage = "Error al registrar. Inténtalo nuevamente.";
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.register-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.register-container {
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
  text-align: center;
}

.links a {
  color: #007bff;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
</style>
