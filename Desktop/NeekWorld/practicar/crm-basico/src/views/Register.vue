<template>
    <div class="register">
      <h1>Registro</h1>
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="nombre">Nombre</label>
          <input type="text" v-model="nombre" class="form-control" id="nombre">
        </div>
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input type="email" v-model="email" class="form-control" id="email">
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" v-model="password" class="form-control" id="password">
        </div>
        <div class="form-group">
          <label for="role">Rol</label>
          <select v-model="role" class="form-control" id="role">
            <option value="admin">Administrador</option>
            <option value="client">Cliente</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Registrar</button>
        <button @click="registerWithGoogle" type="button" class="btn btn-secondary">Registrar con Google</button>
      </form>
      <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { auth, db, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, doc, setDoc, getDoc } from '../firebase';
  import { useRouter } from 'vue-router';
  
  export default {
    setup() {
      const nombre = ref('');
      const email = ref('');
      const password = ref('');
      const role = ref('client');
      const errorMessage = ref('');
      const router = useRouter();
  
      const register = async () => {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
          const user = userCredential.user;
          await setDoc(doc(db, 'users', user.uid), {
            nombre: nombre.value,
            email: email.value,
            role: role.value
          });
          router.push('/dashboard');
        } catch (error) {
          if (error.code === 'auth/email-already-in-use') {
            errorMessage.value = 'El correo electrónico ya está en uso. Por favor, usa otro correo.';
          } else {
            console.error("Error en el registro: ", error);
          }
        }
      };
  
      const registerWithGoogle = async () => {
        try {
          const provider = new GoogleAuthProvider();
          const userCredential = await signInWithPopup(auth, provider);
          const user = userCredential.user;
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
              nombre: user.displayName,
              email: user.email,
              role: 'client' // Default role for Google sign up
            });
          }
          router.push('/dashboard');
        } catch (error) {
          console.error("Error en el registro con Google: ", error);
        }
      };
  
      return {
        nombre,
        email,
        password,
        role,
        errorMessage,
        register,
        registerWithGoogle
      };
    }
  };
  </script>
  
  <style scoped>
  .register {
    padding: 20px;
  }
  .text-danger {
    margin-top: 10px;
  }
  </style>
  