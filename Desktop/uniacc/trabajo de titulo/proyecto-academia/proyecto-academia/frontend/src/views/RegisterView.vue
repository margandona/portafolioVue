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
            v-model="form.name"
            required
            placeholder="Ingrese su nombre completo"
            :class="{ 'is-invalid': formErrors.name }"
          />
          <div v-if="formErrors.name" class="invalid-feedback">
            {{ formErrors.name }}
          </div>
        </div>

        <!-- Correo Electrónico -->
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            id="email"
            type="email"
            class="form-control"
            v-model="form.email"
            required
            placeholder="Ingrese su correo electrónico"
            :class="{ 'is-invalid': formErrors.email }"
          />
          <div v-if="formErrors.email" class="invalid-feedback">
            {{ formErrors.email }}
          </div>
        </div>

        <!-- Contraseña -->
        <div class="form-group">
          <label for="password">Contraseña</label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              class="form-control"
              v-model="form.password"
              required
              placeholder="Cree una contraseña"
              :class="{ 'is-invalid': formErrors.password }"
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
          <div v-if="formErrors.password" class="invalid-feedback">
            {{ formErrors.password }}
          </div>
          <div class="password-hint">
            La contraseña debe tener al menos 8 caracteres e incluir una mayúscula, una minúscula, un número y un símbolo especial.
          </div>
        </div>

        <!-- Confirmar Contraseña -->
        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña</label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="confirmPassword"
              class="form-control"
              v-model="form.confirmPassword"
              required
              placeholder="Confirme su contraseña"
              :class="{ 'is-invalid': formErrors.confirmPassword }"
            />
          </div>
          <div v-if="formErrors.confirmPassword" class="invalid-feedback">
            {{ formErrors.confirmPassword }}
          </div>
        </div>

        <!-- Rol del Usuario -->
        <div class="form-group">
          <label for="role">Tipo de Usuario</label>
          <select
            id="role"
            class="form-control"
            v-model="form.role"
            required
          >
            <option value="student">Estudiante</option>
            <option value="teacher">Profesor</option>
          </select>
          <div class="role-hint">
            Selecciona el tipo de cuenta que necesitas
          </div>
        </div>

        <!-- Mensaje de error -->
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>

        <!-- Botón de registro -->
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isLoading"
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
import { mapActions, mapGetters } from 'vuex';

export default {
  name: "RegisterView",
  data() {
    return {
      form: {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student"
      },
      formErrors: {
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
      },
      errorMessage: "",
      showPassword: false
    };
  },
  computed: {
    ...mapGetters(['isLoading', 'getError', 'isAuthenticated']),
    passwordsMatch() {
      return this.form.password === this.form.confirmPassword;
    },
  },
  methods: {
    ...mapActions(['register']),
    validateForm() {
      let isValid = true;
      this.formErrors = {
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
      };
      
      // Validar nombre
      if (!this.form.name) {
        this.formErrors.name = "El nombre completo es obligatorio";
        isValid = false;
      }
      
      // Validar email
      if (!this.form.email) {
        this.formErrors.email = "El correo electrónico es obligatorio";
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.formErrors.email = "Por favor ingrese un correo electrónico válido";
        isValid = false;
      }
      
      // Validar contraseña
      if (!this.form.password) {
        this.formErrors.password = "La contraseña es obligatoria";
        isValid = false;
      } else if (this.form.password.length < 8) {
        this.formErrors.password = "La contraseña debe tener al menos 8 caracteres";
        isValid = false;
      } else if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]+$/.test(this.form.password)) {
        this.formErrors.password = "La contraseña debe incluir mayúsculas, minúsculas, números y símbolos especiales";
        isValid = false;
      }
      
      // Validar confirmación de contraseña
      if (!this.form.confirmPassword) {
        this.formErrors.confirmPassword = "La confirmación de contraseña es obligatoria";
        isValid = false;
      } else if (this.form.password !== this.form.confirmPassword) {
        this.formErrors.confirmPassword = "Las contraseñas no coinciden";
        isValid = false;
      }
      
      return isValid;
    },
    async handleRegister() {
      if (!this.validateForm()) {
        return;
      }
      
      this.errorMessage = "";
      
      const userData = {
        name: this.form.name,
        email: this.form.email,
        password: this.form.password,
        confirmPassword: this.form.confirmPassword,
        role: this.form.role
      };
      
      console.log('📝 Datos a enviar al backend:', userData);
      
      try {
        // Call to Vuex action
        await this.register(userData);
        
        // Redirect to dashboard on success
        this.$router.push('/dashboard');
      } catch (error) {
        console.error("Error en el registro:", error);
        console.error("Error response:", error.response);
        this.errorMessage = this.getError || "Error al registrarse. Inténtalo nuevamente.";
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
.register-page {
  background-color: #f5f5f5;
  min-height: calc(100vh - 140px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.register-container {
  width: 100%;
  max-width: 500px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin: 0 15px;
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

.is-invalid {
  border-color: #dc3545 !important;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
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

.password-hint {
  font-size: 12px;
  color: #6c757d;
  margin-top: 5px;
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
  margin: 15px 0;
  padding: 10px;
  border-radius: 5px;
  background-color: #f8d7da;
  color: #dc3545;
  border: 1px solid #f5c6cb;
}

.role-hint {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  font-style: italic;
}

.links {
  margin-top: 20px;
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
  .register-container {
    padding: 20px;
  }
}
</style>
