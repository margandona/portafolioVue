<template>
  <div>
    <v-card flat>
      <v-card-title>Buscar Usuarios</v-card-title>
      <v-card-text>
        <UserSearchPanel 
          :loading="loading" 
          @search="$emit('search', $event)" 
          @reload="$emit('reload')"
          @error="$emit('error', $event)"
        />
      </v-card-text>
    </v-card>
    
    <v-divider class="my-4"></v-divider>
    
    <v-card flat>
      <v-card-title>Lista de Usuarios</v-card-title>
      <UsersTable 
        :users="users" 
        :loading="loading"
        @delete-user="$emit('delete-user', $event)"
        @change-role="$emit('change-role', $event)"
        @reload="$emit('reload')"
      />
    </v-card>
  </div>
</template>

<script>
import UserSearchPanel from '@/components/users/UserSearchPanel.vue';
import UsersTable from '@/components/users/UsersTable.vue';

export default {
  name: 'ManageUsersTab',
  
  components: {
    UserSearchPanel,
    UsersTable
  },
  
  props: {
    users: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['search', 'reload', 'error', 'delete-user', 'change-role']
};
</script>
