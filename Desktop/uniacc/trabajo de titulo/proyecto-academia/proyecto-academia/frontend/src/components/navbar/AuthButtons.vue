<template>
  <div class="auth-buttons">
    <router-link to="/login" class="auth-btn login">Iniciar Sesión</router-link>
    <router-link to="/register" class="auth-btn register">Registrarse</router-link>
  </div>
</template>

<script>
export default {
  name: 'AuthButtons'
}
</script>

<style scoped>
.auth-buttons {
  display: flex;
  gap: 10px;
}

.auth-btn {
  padding: 8px 15px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s, color 0.3s;
}

.login {
  color: #2E8B57;
  border: 1px solid #2E8B57;
  background-color: white;
}

.login:hover {
  background-color: rgba(46, 139, 87, 0.1);
}

.register {
  background-color: #2E8B57;
  color: white;
  border: 1px solid #2E8B57;
}

.register:hover {
  background-color: #3aa870;
}

@media (max-width: 768px) {
  .auth-buttons {
    display: none;
  }
}
</style>
