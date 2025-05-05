<template>
  <v-card class="mb-4">
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filters.searchQuery"
            label="Buscar cursos"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @input="emitFilters"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.status"
            label="Estado"
            :items="statusOptions"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="emitFilters"
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.category"
            label="Categoría"
            :items="categoryOptions"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="emitFilters"
          ></v-select>
        </v-col>
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.sort"
            label="Ordenar por"
            :items="sortOptions"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="emitFilters"
          ></v-select>
        </v-col>
      </v-row>
      <div class="mt-2 d-flex align-center">
        <v-checkbox 
          v-model="filters.onlyDiscounted"
          label="Solo con descuento"
          hide-details
          density="compact"
          @update:model-value="emitFilters"
        ></v-checkbox>
        <v-checkbox 
          v-model="filters.onlyPublished"
          label="Solo publicados"
          hide-details
          density="compact"
          class="ml-4"
          @update:model-value="emitFilters"
        ></v-checkbox>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'CourseManageFilters',
  
  props: {
    categories: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      filters: {
        searchQuery: '',
        status: 'all',
        category: 'all',
        sort: 'recent',
        onlyDiscounted: false,
        onlyPublished: false
      },
      statusOptions: [
        { title: 'Todos', value: 'all' },
        { title: 'Publicados', value: 'published' },
        { title: 'Borrador', value: 'draft' }
      ],
      sortOptions: [
        { title: 'Más recientes', value: 'recent' },
        { title: 'Título A-Z', value: 'name_asc' },
        { title: 'Título Z-A', value: 'name_desc' },
        { title: 'Más estudiantes', value: 'students_desc' }
      ]
    };
  },

  computed: {
    categoryOptions() {
      // Crear opciones a partir de las categorías proporcionadas
      const allOption = { title: 'Todas', value: 'all' };
      const categoryOptions = this.categories.map(cat => ({
        title: cat,
        value: cat
      }));
      return [allOption, ...categoryOptions];
    }
  },
  
  methods: {
    emitFilters() {
      this.$emit('filter-change', { ...this.filters });
    },
    
    resetFilters() {
      this.filters = {
        searchQuery: '',
        status: 'all',
        category: 'all',
        sort: 'recent',
        onlyDiscounted: false,
        onlyPublished: false
      };
      this.emitFilters();
    }
  }
};
</script>
