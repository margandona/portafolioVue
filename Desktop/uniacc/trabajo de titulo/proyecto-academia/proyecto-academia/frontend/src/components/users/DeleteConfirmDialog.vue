<template>
  <v-dialog v-model="showDialog" max-width="500px" @update:model-value="onDialogChange">
    <v-card>
      <v-card-title class="text-error">Eliminar Usuario</v-card-title>
      <v-card-text>
        <p>¿Está seguro que desea eliminar al usuario <strong>{{ user?.name }}</strong>?</p>
        <p class="text-error font-weight-bold">Esta acción no se puede deshacer.</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="showDialog = false">
          Cancelar
        </v-btn>
        <v-btn color="error" @click="confirmDelete" :loading="loading">
          Eliminar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "DeleteConfirmDialog",
  
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
      showDialog: this.show
    };
  },
  
  watch: {
    show(newValue) {
      this.showDialog = newValue;
    }
  },
  
  methods: {
    confirmDelete() {
      if (this.user && this.user.id) {
        this.$emit('confirm', this.user.id);
      }
    },
    
    onDialogChange(value) {
      this.$emit('update:show', value);
    }
  }
};
</script>
