<template>
    <div class="register">
      <h2>Registro</h2>
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input type="email" v-model="email" class="form-control" required />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" v-model="password" class="form-control" required />
        </div>
        <button type="submit" class="btn btn-primary">Registrarse</button>
      </form>
    </div>
  </template>
  
  <script>
  import { createUserWithEmailAndPassword } from "firebase/auth";
  import { auth } from "../firebase-config";
  
  export default {
    data() {
      return {
        email: '',
        password: ''
      };
    },
    methods: {
      async register() {
        try {
          await createUserWithEmailAndPassword(auth, this.email, this.password);
          this.$router.push('/');
        } catch (error) {
          console.error("Error en el registro:", error.message);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .register {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
  }
  </style>
  