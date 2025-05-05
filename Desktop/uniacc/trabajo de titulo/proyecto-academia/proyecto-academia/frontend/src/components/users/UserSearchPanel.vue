<template>
  <v-form @submit.prevent="handleSearch" class="d-flex align-center flex-wrap gap-2">
    <v-text-field
      v-model="query"
      label="Buscar por ID, correo o nombre"
      variant="outlined"
      hide-details
      class="flex-grow-1"
      :disabled="loading"
    ></v-text-field>
    
    <div>
      <v-btn 
        color="primary" 
        type="submit" 
        class="mr-2"
        :disabled="loading"
      >
        <v-icon start>mdi-magnify</v-icon>
        Buscar
      </v-btn>
      
      <v-btn 
        color="secondary" 
        @click="$emit('reload')" 
        :disabled="loading"
      >
        <v-icon start>mdi-refresh</v-icon>
        Recargar Usuarios
      </v-btn>
    </div>
  </v-form>
</template>

<script>
export default {
  name: "UserSearchPanel",
  
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      query: ""
    };
  },
  
  methods: {
    handleSearch() {
      if (!this.query.trim()) {
        this.$emit('error', "Por favor, ingrese un término de búsqueda.");
        return;
      }
      
      const searchParams = {};
      
      // Determinar si es ID, email o nombre
      if (!isNaN(this.query.trim())) {
        searchParams.id = this.query.trim();
      } else if (this.query.includes('@')) {
        searchParams.email = this.query.trim();
      } else {
        searchParams.name = this.query.trim();
      }
      
      this.$emit('search', searchParams);
    }
  }
};
</script>
