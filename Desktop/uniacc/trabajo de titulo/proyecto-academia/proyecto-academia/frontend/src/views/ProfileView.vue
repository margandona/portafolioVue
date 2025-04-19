<template>
  <div class="profile-view">
    <div class="container">
      <ProfileComponent
        @updateProfile="handleProfileUpdate"
        @deleteUser="handleUserDeletion"
      />
    </div>
  </div>
</template>

<script>
import ProfileComponent from "../components/ProfileComponent.vue";
import axios from "axios";

export default {
  name: "ProfileView",
  components: {
    ProfileComponent,
  },
  methods: {
    /**
     * Maneja la actualización del perfil.
     * @param {Object} updatedData - Datos actualizados del perfil.
     */
    async handleProfileUpdate(updatedData) {
      try {
        // Validar que las contraseñas coincidan si se proporcionan
        if (
          updatedData.password &&
          updatedData.confirmPassword &&
          updatedData.password !== updatedData.confirmPassword
        ) {
          alert("Las contraseñas no coinciden. Por favor, verifica e intenta nuevamente.");
          return;
        }

        await axios.put(`/api/users/${updatedData.id}`, updatedData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        alert("Perfil actualizado correctamente.");
      } catch (error) {
        console.error("Error al actualizar el perfil:", error.response?.data || error.message);
        alert("Hubo un error al actualizar el perfil. Intenta nuevamente.");
      }
    },
    /**
     * Maneja la eliminación del usuario (solo para administradores).
     * @param {Number} userId - ID del usuario a eliminar.
     */
    async handleUserDeletion(userId) {
      if (confirm("¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.")) {
        try {
          await axios.delete(`/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          alert("Usuario eliminado correctamente.");
          this.$router.push("/"); // Redirigir al inicio después de la eliminación
        } catch (error) {
          console.error("Error al eliminar usuario:", error.response?.data || error.message);
          alert("No se pudo eliminar el usuario. Intenta nuevamente.");
        }
      }
    },
  },
};
</script>

<style scoped>
.profile-view {
  background-color: #f9f9f9;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  max-width: 800px;
  width: 100%;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
