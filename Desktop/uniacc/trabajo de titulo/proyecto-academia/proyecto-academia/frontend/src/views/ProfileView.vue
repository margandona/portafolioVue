<template>
  <div class="profile-page">
    <v-container>
      <v-card class="profile-card mx-auto">
        <!-- Card Title -->
        <v-card-title class="d-flex align-center">
          <v-icon size="large" start color="primary" class="me-2">
            mdi-account-circle
          </v-icon>
          <h1 class="text-h4">Mi Perfil</h1>
        </v-card-title>
        
        <!-- Loading state -->
        <div v-if="isLoading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-body-1">Cargando información...</p>
        </div>
        
        <!-- Error message -->
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          closable
          class="mx-4 mt-4"
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>
        
        <!-- Success message -->
        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
          closable
          class="mx-4 mt-4"
          @click:close="successMessage = ''"
        >
          {{ successMessage }}
        </v-alert>
        
        <!-- Profile Content -->
        <v-card-text v-if="user && !isLoading">
          <!-- User Info Section -->
          <v-row>
            <v-col cols="12" md="4" class="text-center">
              <v-avatar color="primary" size="120" class="mb-4">
                <span class="text-h3 text-white">{{ userInitials }}</span>
              </v-avatar>
              <h2 class="text-h5">{{ user.name }}</h2>
              <v-chip color="primary" class="mt-2">{{ userRoleDisplay }}</v-chip>
              <p class="text-body-1 mt-2">{{ user.email }}</p>
            </v-col>
            
            <v-col cols="12" md="8">
              <!-- Profile Edit Form -->
              <v-form @submit.prevent="updateUserProfile" ref="profileForm" v-model="isFormValid">
                <div class="form-section mb-6">
                  <h3 class="text-h6 mb-4">Información Personal</h3>
                  
                  <v-text-field
                    v-model="form.name"
                    label="Nombre Completo"
                    variant="outlined"
                    :rules="[v => !!v || 'El nombre es obligatorio']"
                    required
                  ></v-text-field>
                  
                  <v-text-field
                    v-model="form.email"
                    label="Correo Electrónico"
                    variant="outlined"
                    disabled
                    hint="El correo electrónico no puede ser cambiado"
                    persistent-hint
                  ></v-text-field>
                </div>
                
                <v-divider></v-divider>
                
                <div class="form-section mt-6">
                  <h3 class="text-h6 mb-2">Cambiar Contraseña</h3>
                  <p class="text-caption mb-4">Deja estos campos en blanco si no deseas cambiar tu contraseña</p>
                  
                  <v-text-field
                    v-model="form.currentPassword"
                    label="Contraseña Actual"
                    variant="outlined"
                    type="password"
                    :error-messages="formErrors.currentPassword"
                  ></v-text-field>
                  
                  <v-text-field
                    v-model="form.newPassword"
                    label="Nueva Contraseña"
                    variant="outlined"
                    type="password"
                    :error-messages="formErrors.newPassword"
                    :hint="form.newPassword ? 'La contraseña debe tener al menos 6 caracteres, una mayúscula, un número y un carácter especial' : ''"
                    persistent-hint
                  ></v-text-field>
                  
                  <v-text-field
                    v-model="form.confirmPassword"
                    label="Confirmar Nueva Contraseña"
                    variant="outlined"
                    type="password"
                    :error-messages="formErrors.confirmPassword"
                  ></v-text-field>
                </div>
                
                <div class="d-flex justify-end mt-6">
                  <v-btn
                    color="primary"
                    type="submit"
                    size="large"
                    :loading="isLoading"
                    :disabled="!isFormValid && !isPasswordChange"
                  >
                    <v-icon start>mdi-content-save</v-icon>
                    Guardar Cambios
                  </v-btn>
                </div>
              </v-form>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'ProfileView',
  data() {
    return {
      form: {
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      formErrors: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      errorMessage: '',
      successMessage: '',
      isFormValid: true
    };
  },
  computed: {
    ...mapGetters([
      'isLoading',
      'getUser',
      'userRole',
      'getError'
    ]),
    
    user() {
      return this.getUser;
    },
    
    userInitials() {
      if (!this.user || !this.user.name) return 'U';
      
      return this.user.name.split(' ')
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
      return roles[this.userRole] || 'Usuario';
    },
    
    isPasswordChange() {
      return this.form.currentPassword || this.form.newPassword || this.form.confirmPassword;
    }
  },
  methods: {
    ...mapActions(['fetchUserProfile', 'updateProfile']),
    
    loadUserData() {
      this.errorMessage = '';
      
      if (this.user) {
        this.form.name = this.user.name || '';
        this.form.email = this.user.email || '';
      }
    },
    
    validatePasswordForm() {
      let isValid = true;
      this.formErrors = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      
      // Solo validar si se está intentando cambiar contraseña
      if (this.form.newPassword || this.form.confirmPassword || this.form.currentPassword) {
        if (!this.form.currentPassword) {
          this.formErrors.currentPassword = 'Debes ingresar tu contraseña actual';
          isValid = false;
        }
        
        if (this.form.newPassword) {
          // Validar complejidad de contraseña
          const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
          if (!passwordRegex.test(this.form.newPassword)) {
            this.formErrors.newPassword = 'La contraseña debe cumplir los requisitos de seguridad';
            isValid = false;
          }
          
          // Validar coincidencia
          if (this.form.newPassword !== this.form.confirmPassword) {
            this.formErrors.confirmPassword = 'Las contraseñas no coinciden';
            isValid = false;
          }
        } else if (this.form.confirmPassword) {
          this.formErrors.newPassword = 'Debes ingresar una nueva contraseña';
          isValid = false;
        }
      }
      
      return isValid;
    },
    
    async updateUserProfile() {
      this.errorMessage = '';
      this.successMessage = '';
      
      // Validar cambios de contraseña si los hay
      if (this.isPasswordChange && !this.validatePasswordForm()) {
        return;
      }
      
      try {
        // Preparar datos para la actualización
        const updateData = {
          name: this.form.name
        };
        
        // Incluir datos de cambio de contraseña si se proporcionaron
        if (this.form.newPassword && this.form.currentPassword) {
          updateData.currentPassword = this.form.currentPassword;
          updateData.newPassword = this.form.newPassword;
        }
        
        // Llamar a la acción de Vuex
        await this.updateProfile(updateData);
        
        // Limpiar campos de contraseña
        this.form.currentPassword = '';
        this.form.newPassword = '';
        this.form.confirmPassword = '';
        
        // Mostrar mensaje de éxito
        this.successMessage = 'Perfil actualizado correctamente';
        
        // Volver a cargar datos de usuario
        await this.fetchUserProfile();
        this.loadUserData();
      } catch (error) {
        console.error('Error al actualizar perfil:', error);
        this.errorMessage = this.getError || 'Error al actualizar perfil';
      }
    }
  },
  created() {
    // Cargar datos de usuario
    this.fetchUserProfile()
      .then(() => this.loadUserData())
      .catch(error => {
        console.error('Error al cargar datos de usuario:', error);
        this.errorMessage = this.getError || 'Error al cargar datos de usuario';
      });
  }
};
</script>

<style scoped>
.profile-page {
  background-color: #f5f5f5;
  min-height: calc(100vh - 80px);
  padding: 40px 0;
}

.profile-card {
  max-width: 1000px;
  border-radius: 12px;
}

.form-section {
  margin-bottom: 30px;
}

/* Fix for Vuetify components */
:deep(.v-field__field) {
  height: auto !important;
}

:deep(.v-input .v-label) {
  margin-bottom: 0 !important;
}
</style>
