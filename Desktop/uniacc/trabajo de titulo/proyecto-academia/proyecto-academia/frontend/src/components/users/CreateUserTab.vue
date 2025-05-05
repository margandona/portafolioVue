<template>
  <v-card flat>
    <v-card-title>Crear Nuevo Usuario</v-card-title>
    <v-card-text>
      <UserCreateForm 
        ref="createForm" 
        :loading="loading" 
        @create="handleCreate"
      />
    </v-card-text>
  </v-card>
</template>

<script>
import UserCreateForm from '@/components/users/UserCreateForm.vue';

export default {
  name: 'CreateUserTab',
  
  components: {
    UserCreateForm
  },
  
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  methods: {
    handleCreate(userData) {
      this.$emit('create', userData);
    },
    
    resetForm() {
      this.$refs.createForm.resetForm();
    }
  }
};
</script>
