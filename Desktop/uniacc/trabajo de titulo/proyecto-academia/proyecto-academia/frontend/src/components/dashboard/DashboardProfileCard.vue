<template>
  <v-card class="dashboard-card profile-card">
    <v-card-title class="text-h6">
      <v-icon class="me-2">mdi-account-circle</v-icon>
      Perfil
    </v-card-title>
    <v-card-text>
      <div class="d-flex align-center mb-4">
        <v-avatar color="primary" size="64" class="me-3">
          <span class="text-h5 text-white">{{ userInitials }}</span>
        </v-avatar>
        <div>
          <div class="text-h6">{{ user.name }}</div>
          <div class="text-body-2 text-grey">{{ user.email }}</div>
          <v-chip color="primary" size="small" class="mt-1">{{ userRoleDisplay }}</v-chip>
        </div>
      </div>
      <v-btn block to="/profile" variant="outlined" color="primary">
        <v-icon start>mdi-account-edit</v-icon>
        Editar Perfil
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'DashboardProfileCard',
  
  props: {
    user: {
      type: Object,
      required: true
    },
    role: {
      type: String,
      default: ''
    }
  },
  
  computed: {
    userInitials() {
      const name = this.user?.name || 'Usuario';
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    },
    
    userRoleDisplay() {
      const roles = {
        'student': 'Estudiante',
        'teacher': 'Profesor',
        'admin': 'Administrador'
      };
      return roles[this.role] || 'Usuario';
    }
  }
}
</script>

<style scoped>
.profile-card {
  height: 100%;
}
</style>
