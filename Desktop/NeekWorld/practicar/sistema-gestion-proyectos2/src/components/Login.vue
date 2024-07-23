<template>
    <div class="login">
      <h2>Iniciar Sesión</h2>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input type="email" v-model="email" class="form-control" required />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" v-model="password" class="form-control" required />
        </div>
        <button type="submit" class="btn btn-primary">Iniciar Sesión</button>
      </form>
    </div>
  </template>
  
  <script>
  import { signInWithEmailAndPassword } from "firebase/auth";
  import { auth } from "../firebase-config";
  
  export default {
    data() {
      return {
        email: '',
        password: ''
      };
    },
    methods: {
      async login() {
        try {
          await signInWithEmailAndPassword(auth, this.email, this.password);
          this.$router.push('/');
        } catch (error) {
          console.error("Error en el inicio de sesión:", error.message);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .login {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
  }
  </style>
  