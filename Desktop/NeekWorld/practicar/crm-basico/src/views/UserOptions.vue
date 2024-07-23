<template>
  <div class="user-options">
    <h1>Opciones de Usuario</h1>
    <form @submit.prevent="updateUser">
      <div class="form-group">
        <label for="nombre">Nombre</label>
        <input type="text" v-model="nombre" class="form-control" id="nombre">
      </div>
      <div class="form-group">
        <label for="email">Correo Electrónico</label>
        <input type="email" v-model="email" class="form-control" id="email">
      </div>
      <div class="form-group">
        <label for="password">Nueva Contraseña</label>
        <input type="password" v-model="password" class="form-control" id="password">
      </div>
      <button type="submit" class="btn btn-primary">Actualizar</button>
    </form>
    <button @click="handleLogout" class="btn btn-danger mt-3">Cerrar Sesión</button>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  data() {
    return {
      nombre: this.user ? this.user.nombre : '',
      email: this.user ? this.user.email : '',
      password: ''
    };
  },
  computed: {
    ...mapState(['user'])
  },
  methods: {
    ...mapActions(['updateUser', 'logout']),
    async updateUser() {
      const updatedUser = {
        nombre: this.nombre,
        email: this.email,
        ...(this.password && { password: this.password })
      };
      await this.updateUser(updatedUser);
    },
    handleLogout() {
      this.logout();
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.user-options {
  padding: 20px;
}
</style>
