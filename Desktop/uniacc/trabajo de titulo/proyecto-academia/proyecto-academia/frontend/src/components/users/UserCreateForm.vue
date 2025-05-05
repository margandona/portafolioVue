<template>
  <v-form @submit.prevent="handleSubmit" ref="form" v-model="isValid">
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="userData.name"
          label="Nombre Completo"
          variant="outlined"
          :rules="[v => !!v || 'El nombre es obligatorio']"
          required
        ></v-text-field>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-text-field
          v-model="userData.email"
          label="Correo Electrónico"
          variant="outlined"
          type="email"
          :rules="[
            v => !!v || 'El correo es obligatorio',
            v => /.+@.+\..+/.test(v) || 'El correo debe ser válido'
          ]"
          required
        ></v-text-field>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-text-field
          v-model="userData.password"
          label="Contraseña"
          variant="outlined"
          type="password"
          :rules="[
            v => !!v || 'La contraseña es obligatoria',
            v => v?.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
          ]"
          required
        ></v-text-field>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-select
          v-model="userData.role"
          label="Rol"
          variant="outlined"
          :items="roleOptions"
          required
        ></v-select>
      </v-col>
    </v-row>
    
    <div class="d-flex justify-end">
      <v-btn 
        color="success" 
        type="submit" 
        :disabled="!isValid || loading"
      >
        <v-icon start>mdi-account-plus</v-icon>
        Crear Usuario
      </v-btn>
    </div>
  </v-form>
</template>

<script>
import { roleOptions } from '@/composables/useUserHelpers';

export default {
  name: "UserCreateForm",
  
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      userData: {
        name: "",
        email: "",
        password: "",
        role: "student",
      },
      isValid: false,
      roleOptions
    };
  },
  
  methods: {
    handleSubmit() {
      this.$emit('create', { ...this.userData });
    },
    
    resetForm() {
      this.$refs.form.reset();
      this.userData = {
        name: "",
        email: "",
        password: "",
        role: "student",
      };
    }
  }
};
</script>
