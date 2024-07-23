<template>
    <div class="login">
      <h1>Iniciar Sesión</h1>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input type="email" v-model="email" class="form-control" id="email">
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" v-model="password" class="form-control" id="password">
        </div>
        <button type="submit" class="btn btn-primary">Iniciar Sesión</button>
        <button @click="loginWithGoogle" type="button" class="btn btn-secondary">Iniciar Sesión con Google</button>
      </form>
      <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { auth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from '../firebase';
  import { useRouter } from 'vue-router';
  
  export default {
    setup() {
      const email = ref('');
      const password = ref('');
      const errorMessage = ref('');
      const router = useRouter();
  
      const login = async () => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
          router.push('/dashboard');
        } catch (error) {
          errorMessage.value = 'Error en el inicio de sesión: ' + error.message;
        }
      };
  
      const loginWithGoogle = async () => {
        try {
          const provider = new GoogleAuthProvider();
          const userCredential = await signInWithPopup(auth, provider);
          router.push('/dashboard');
        } catch (error) {
          errorMessage.value = 'Error en el inicio de sesión con Google: ' + error.message;
        }
      };
  
      return {
        email,
        password,
        errorMessage,
        login,
        loginWithGoogle
      };
    }
  };
  </script>
  
  <style scoped>
  .login {
    padding: 20px;
  }
  .text-danger {
    margin-top: 10px;
  }
  </style>
  