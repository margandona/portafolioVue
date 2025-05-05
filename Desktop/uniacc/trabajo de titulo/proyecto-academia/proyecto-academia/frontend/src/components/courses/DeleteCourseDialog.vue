<template>
  <v-dialog v-model="dialogVisible" width="500">
    <v-card>
      <v-card-title class="text-h5">
        Confirmar eliminación
      </v-card-title>
      
      <v-card-text>
        <template v-if="course">
          ¿Estás seguro de que deseas eliminar el curso <strong>{{ course.title }}</strong>? Esta acción no se puede deshacer.
          
          <v-alert
            type="warning"
            density="compact"
            class="mt-3"
          >
            Se eliminarán todas las inscripciones y contenidos asociados al curso.
          </v-alert>
        </template>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="close">
          Cancelar
        </v-btn>
        <v-btn color="error" variant="flat" @click="confirmDelete" :loading="loading">
          Eliminar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'DeleteCourseDialog',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    course: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  computed: {
    dialogVisible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  },
  
  methods: {
    close() {
      this.dialogVisible = false;
    },
    
    confirmDelete() {
      this.$emit('confirm');
    }
  }
};
</script>
