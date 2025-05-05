<template>
  <v-dialog v-model="showDialog" max-width="500px" @update:model-value="onDialogChange">
    <v-card>
      <v-card-title>Cambiar Rol de Usuario</v-card-title>
      <v-card-text>
        <p class="mb-2">Cambiar rol de <strong>{{ user?.name }}</strong></p>
        <v-select
          v-model="selectedRole"
          label="Nuevo Rol"
          variant="outlined"
          :items="roleOptions"
        ></v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="showDialog = false">
          Cancelar
        </v-btn>
        <v-btn color="primary" @click="updateRole" :loading="loading">
          Guardar Cambios
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { roleOptions } from '@/composables/useUserHelpers';

export default {
  name: "RoleChangeDialog",
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      showDialog: this.show,
      selectedRole: this.user?.role || '',
      roleOptions
    };
  },
  
  watch: {
    show(newValue) {
      this.showDialog = newValue;
    },
    user(newUser) {
      if (newUser) {
        this.selectedRole = newUser.role;
      }
    }
  },
  
  methods: {
    updateRole() {
      if (this.selectedRole === this.user?.role) {
        this.showDialog = false;
        return;
      }
      
      this.$emit('update', {
        userId: this.user.id,
        role: this.selectedRole
      });
    },
    
    onDialogChange(value) {
      this.$emit('update:show', value);
    }
  }
};
</script>
