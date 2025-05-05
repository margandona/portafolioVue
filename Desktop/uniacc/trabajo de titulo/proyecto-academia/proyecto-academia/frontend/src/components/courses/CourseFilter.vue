<template>
  <div class="course-filter">
    <v-card class="pa-4" variant="outlined">
      <v-card-title class="d-flex justify-space-between align-center">
        Filtros
        <v-btn
          variant="text"
          size="small"
          color="primary"
          @click="resetFilters"
        >
          Limpiar
        </v-btn>
      </v-card-title>
      
      <v-card-text>
        <!-- Búsqueda por texto -->
        <v-text-field
          v-model="filters.search"
          label="Buscar cursos"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          class="mb-4"
          density="compact"
        ></v-text-field>
        
        <!-- Filtro por categoría -->
        <v-select
          v-model="filters.category"
          :items="['Todas'].concat(categories)"
          label="Categoría"
          variant="outlined"
          hide-details
          class="mb-4"
          density="compact"
        ></v-select>
        
        <!-- Filtro por precio -->
        <v-checkbox
          v-model="filters.showFree"
          label="Mostrar solo cursos gratuitos"
          hide-details
          class="mb-2"
          color="primary"
        ></v-checkbox>
        
        <v-checkbox
          v-model="filters.showDiscounted"
          label="Mostrar solo cursos con descuento"
          hide-details
          class="mb-4"
          color="primary"
        ></v-checkbox>
        
        <!-- Filtro por modalidad -->
        <v-select
          v-model="filters.modality"
          :items="modalityOptions"
          label="Modalidad"
          variant="outlined"
          hide-details
          class="mb-4"
          density="compact"
        ></v-select>
        
        <!-- Ordenación -->
        <v-select
          v-model="filters.sort"
          :items="sortOptions"
          label="Ordenar por"
          variant="outlined"
          hide-details
          density="compact"
          class="mb-2"
        ></v-select>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'CourseFilter',
  
  data() {
    return {
      filters: {
        search: '',
        category: 'Todas',
        showFree: false,
        showDiscounted: false,
        modality: 'all',
        sort: 'recent'
      },
      
      modalityOptions: [
        { title: 'Todos', value: 'all' },
        { title: 'Sincrónicos', value: 'synchronized' },
        { title: 'Asincrónicos', value: 'asynchronized' }
      ],
      
      sortOptions: [
        { title: 'Más recientes', value: 'recent' },
        { title: 'Precio: menor a mayor', value: 'price_asc' },
        { title: 'Precio: mayor a menor', value: 'price_desc' },
        { title: 'Nombre (A-Z)', value: 'name_asc' },
        { title: 'Nombre (Z-A)', value: 'name_desc' }
      ]
    }
  },
  
  computed: {
    ...mapGetters('courses', ['courseCategories']),
    
    categories() {
      return this.courseCategories;
    }
  },
  
  watch: {
    filters: {
      handler(newFilters) {
        this.$emit('filter-changed', { ...newFilters });
      },
      deep: true
    }
  },
  
  methods: {
    resetFilters() {
      this.filters = {
        search: '',
        category: 'Todas',
        showFree: false,
        showDiscounted: false,
        modality: 'all',
        sort: 'recent'
      };
      
      this.$emit('filter-changed', { ...this.filters });
    }
  },
  
  emits: ['filter-changed']
}
</script>
