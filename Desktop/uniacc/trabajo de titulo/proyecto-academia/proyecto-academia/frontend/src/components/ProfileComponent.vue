<template>
  <div class="profile-page">
    <h1 id="profile-header" aria-label="Perfil del Usuario">Perfil del Usuario</h1>
    <form @submit.prevent="handleUpdateProfile" aria-labelledby="profile-header">
      <!-- Nombre -->
      <div class="form-group">
        <label for="name">Nombre Completo</label>
        <input
          id="name"
          type="text"
          v-model="user.name"
          required
          class="form-control"
          aria-required="true"
        />
      </div>

      <!-- Correo Electrónico -->
      <div class="form-group">
        <label for="email">Correo Electrónico</label>
        <input
          id="email"
          type="email"
          v-model="user.email"
          required
          class="form-control"
          aria-required="true"
        />
      </div>

      <!-- Nueva Contraseña -->
      <div class="form-group">
        <label for="password">Nueva Contraseña</label>
        <input
          id="password"
          type="password"
          v-model="password"
          placeholder="Nueva contraseña"
          class="form-control"
        />
      </div>

      <!-- Confirmar Contraseña -->
      <div class="form-group">
        <label for="confirm-password">Confirmar Nueva Contraseña</label>
        <input
          id="confirm-password"
          type="password"
          v-model="confirmPassword"
          placeholder="Confirma tu contraseña"
          class="form-control"
        />
      </div>

      <!-- Aceptar Cambios -->
      <div class="form-group align-checkbox">
        <input
          type="checkbox"
          id="accept-changes"
          v-model="acceptChanges"
          required
          aria-required="true"
        />
        <label for="accept-changes">Acepto actualizar mis datos</label>
      </div>

      <!-- Mensaje de Error -->
      <div v-if="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage }}
      </div>

      <!-- Botón Actualizar -->
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="!acceptChanges || isUpdating"
        :aria-busy="isUpdating"
      >
        Actualizar Perfil
      </button>
    </form>

    <button class="btn btn-secondary mt-3" @click="goBack">
      Volver al Dashboard
    </button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ProfileComponent",
  data() {
    return {
      user: {
        name: "",
        email: "",
      },
      password: "",
      confirmPassword: "",
      acceptChanges: false, // Controla el checkbox
      errorMessage: "",
      isUpdating: false, // Indicador de estado para accesibilidad
    };
  },
  async created() {
    try {
      const response = await axios.get("http://localhost:3000/api/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      this.user = response.data;
    } catch (error) {
      console.error("Error al cargar el perfil del usuario:", error.response?.data || error.message);
      this.errorMessage = "No se pudo cargar la información del usuario.";
    }
  },
  methods: {
    async handleUpdateProfile() {
      this.isUpdating = true;

      // Validar contraseñas
      if (this.password && this.password !== this.confirmPassword) {
        this.errorMessage = "Las contraseñas no coinciden.";
        this.isUpdating = false;
        return;
      }

      try {
        const updatedData = {
          ...this.user,
          password: this.password || undefined, // Solo enviar si se proporciona
        };

        await axios.put("http://localhost:3000/api/users/me", updatedData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        alert("Perfil actualizado exitosamente");
        this.password = "";
        this.confirmPassword = "";
        this.acceptChanges = false;
      } catch (error) {
        console.error("Error al actualizar el perfil:", error.response?.data || error.message);
        this.errorMessage =
          error.response?.data?.message || "Error al actualizar el perfil.";
      } finally {
        this.isUpdating = false;
      }
    },
    goBack() {
      this.$router.push("/dashboard");
    },
  },
};
</script>

<style scoped>
.profile-page {
  max-width: 500px;
  margin: 50px auto;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  font-family: "Playfair Display", serif;
  font-size: 24px;
  color: #6a0dad;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  font-size: 14px;
}

input:focus {
  border-color: #2e8b57;
  outline: none;
}

.align-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn {
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 4px;
}

.alert {
  margin-top: 20px;
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px;
  border-radius: 5px;
}
</style>
