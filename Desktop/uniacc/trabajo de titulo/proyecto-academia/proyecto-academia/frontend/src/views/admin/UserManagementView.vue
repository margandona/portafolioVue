<template>
  <div class="user-management">
    <v-container>
      <h1 class="text-h4 mb-6">Gestión de Usuarios</h1>
      
      <v-alert
        v-if="userError"
        type="error"
        closable
        class="mb-4"
        @click:close="clearError"
      >
        {{ userError }}
      </v-alert>
      
      <!-- Sistema de pestañas mejorado con tab para volver al dashboard -->
      <v-card class="tab-card">
        <v-tabs
          v-model="activeTab"
          bg-color="primary"
          align-tabs="center"
          show-arrows
          slider-color="yellow"
          class="elevated-tabs"
        >
          <v-tab @click="goToDashboard" class="tab-item py-3 text-subtitle-1 font-weight-medium">
            <v-icon start size="large" class="mr-2">mdi-view-dashboard</v-icon>
            Volver al Dashboard
          </v-tab>
          
          <v-tab value="manage" class="tab-item py-3 text-subtitle-1 font-weight-medium">
            <v-icon start size="large" class="mr-2">mdi-account-group</v-icon>
            Administrar Usuarios
          </v-tab>
          
          <v-tab value="create" class="tab-item py-3 text-subtitle-1 font-weight-medium">
            <v-icon start size="large" class="mr-2">mdi-account-plus</v-icon>
            Crear Usuario
          </v-tab>
        </v-tabs>
        
        <v-card-text class="pa-6">
          <v-window v-model="activeTab">
            <!-- Pestaña de administración de usuarios -->
            <v-window-item value="manage">
              <ManageUsersTab
                :users="getUsersList"
                :loading="isLoadingUsers"
                @search="searchUsers"
                @reload="fetchAllUsers"
                @error="setError"
                @delete-user="showDeleteDialog"
                @change-role="showRoleDialog"
              />
            </v-window-item>
            
            <!-- Pestaña de creación de usuarios -->
            <v-window-item value="create">
              <CreateUserTab
                ref="createUserTab"
                :loading="isLoadingUsers"
                @create="createNewUser"
              />
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
      
      <!-- Diálogos -->
      <DeleteConfirmDialog
        :show="deleteDialogOpen"
        :user="selectedUser"
        :loading="isLoadingUsers"
        @update:show="deleteDialogOpen = $event"
        @confirm="confirmDelete"
      />
      
      <RoleChangeDialog
        :show="roleDialogOpen"
        :user="selectedUser"
        :loading="isLoadingUsers"
        @update:show="roleDialogOpen = $event"
        @update="updateUserRole"
      />
    </v-container>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import ManageUsersTab from '@/components/users/ManageUsersTab.vue';
import CreateUserTab from '@/components/users/CreateUserTab.vue';
import DeleteConfirmDialog from '@/components/users/DeleteConfirmDialog.vue';
import RoleChangeDialog from '@/components/users/RoleChangeDialog.vue';

export default {
  name: 'UserManagementView',
  
  components: {
    ManageUsersTab,
    CreateUserTab,
    DeleteConfirmDialog,
    RoleChangeDialog
  },
  
  data() {
    return {
      deleteDialogOpen: false,
      roleDialogOpen: false,
      selectedUser: null,
      activeTab: 'manage'
    };
  },
  
  computed: {
    ...mapGetters({
      getUsersList: 'users/getUsersList',
      isLoadingUsers: 'users/isLoadingUsers',
      userError: 'users/getUserError'
    })
  },
  
  methods: {
    ...mapActions({
      fetchUsers: 'users/fetchUsers',
      searchUsersAction: 'users/searchUsers',
      createUser: 'users/createUser',
      updateUser: 'users/updateUser',
      deleteUser: 'users/deleteUser'
    }),
    
    ...mapMutations({
      clearUserError: 'users/CLEAR_USER_ERROR',
      setUserError: 'users/SET_USER_ERROR'
    }),
    
    clearError() {
      this.clearUserError();
    },
    
    setError(message) {
      this.setUserError(message);
    },
    
    async fetchAllUsers() {
      try {
        await this.fetchUsers();
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    },
    
    async searchUsers(params) {
      try {
        await this.searchUsersAction(params);
      } catch (error) {
        console.error('Error al buscar usuarios:', error);
      }
    },
    
    async createNewUser(userData) {
      try {
        await this.createUser(userData);
        this.$refs.createUserTab.resetForm();
        this.activeTab = 'manage';
        await this.fetchAllUsers();
        this.$nextTick(() => {
          this.setSuccessMessage('Usuario creado exitosamente');
        });
      } catch (error) {
        console.error('Error al crear usuario:', error);
      }
    },
    
    setSuccessMessage(message) {
      // Implementar lógica para mostrar mensaje de éxito (opcional)
      console.log(message);
    },
    
    showDeleteDialog(user) {
      this.selectedUser = user;
      this.deleteDialogOpen = true;
    },
    
    showRoleDialog(user) {
      this.selectedUser = user;
      this.roleDialogOpen = true;
    },
    
    async confirmDelete(userId) {
      try {
        await this.deleteUser(userId);
        this.deleteDialogOpen = false;
        this.selectedUser = null;
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    },
    
    async updateUserRole({ userId, role }) {
      try {
        await this.updateUser({ userId, userData: { role } });
        this.roleDialogOpen = false;
        this.selectedUser = null;
      } catch (error) {
        console.error('Error al actualizar rol:', error);
      }
    },
    
    goToDashboard() {
      this.$router.push('/dashboard');
    }
  },
  
  created() {
    this.fetchAllUsers();
  }
};
</script>

<style scoped>
.user-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* Estilos mejorados para los tabs */
.elevated-tabs {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tab-card {
  overflow: hidden;
  border-radius: 8px;
}

.tab-item {
  min-width: 180px;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.tab-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Efecto de transición para el cambio entre tabs */
.v-window-item {
  transition: all 0.3s ease-in-out;
}
</style>
