<template>
  <div>
    <div class="d-flex align-center mb-4">
      <v-text-field
        v-model="tableSearch"
        append-icon="mdi-magnify"
        label="Filtrar resultados"
        hide-details
        variant="outlined"
        density="compact"
        class="mx-4"
      ></v-text-field>
    </div>
    
    <v-data-table
      :headers="headers"
      :items="users"
      :search="tableSearch"
      :loading="loading"
      class="elevation-1"
    >
      <!-- eslint-disable-next-line vue/valid-v-slot -->
      <template #item.role="{ item }">
        <v-chip :color="getRoleColor(item.role)" small>
          {{ getRoleText(item.role) }}
        </v-chip>
      </template>

      <!-- eslint-disable-next-line vue/valid-v-slot -->
      <template #item.actions="{ item }">
        <v-menu>
          <template #activator="{ props }">
            <v-btn icon v-bind="props" size="small">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          
          <v-list>
            <v-list-item @click="$emit('change-role', item)">
              <v-list-item-title>
                <v-icon start>mdi-account-convert</v-icon>
                Cambiar Rol
              </v-list-item-title>
            </v-list-item>
            
            <v-list-item @click="$emit('delete-user', item)">
              <v-list-item-title class="text-error">
                <v-icon start color="error">mdi-delete</v-icon>
                Eliminar Usuario
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      
      <template #no-data>
        <div class="text-center pa-4">
          <p class="text-subtitle-1">No se encontraron usuarios</p>
          <v-btn color="primary" @click="$emit('reload')">
            Cargar Usuarios
          </v-btn>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { getRoleText, getRoleColor } from '@/composables/useUserHelpers';

export default {
  name: "UsersTable",
  
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
  
  data() {
    return {
      tableSearch: "",
      headers: [
        { title: 'ID', key: 'id', sortable: true },
        { title: 'Nombre', key: 'name', sortable: true },
        { title: 'Correo', key: 'email', sortable: true },
        { title: 'Rol', key: 'role', sortable: true },
        { title: 'Acciones', key: 'actions', sortable: false }
      ]
    };
  },
  
  methods: {
    getRoleText,
    getRoleColor
  }
};
</script>
