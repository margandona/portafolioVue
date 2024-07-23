<template>
    <div class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Agregar Cliente</h5>
            <button type="button" class="close" @click="$emit('close')">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveClient">
              <div class="form-group">
                <label for="nombre">Nombre</label>
                <input type="text" v-model="nombre" class="form-control" id="nombre">
              </div>
              <div class="form-group">
                <label for="email">Correo Electrónico</label>
                <input type="email" v-model="email" class="form-control" id="email">
              </div>
              <div class="form-group">
                <label for="telefono">Teléfono</label>
                <input type="tel" v-model="telefono" class="form-control" id="telefono">
              </div>
              <div class="form-group">
                <label for="direccion">Dirección</label>
                <input type="text" v-model="direccion" class="form-control" id="direccion">
              </div>
              <button type="submit" class="btn btn-primary">Guardar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        nombre: '',
        email: '',
        telefono: '',
        direccion: ''
      };
    },
    methods: {
      saveClient() {
        this.$emit('save', {
          nombre: this.nombre,
          email: this.email,
          telefono: this.telefono,
          direccion: this.direccion
        });
        this.$emit('close');
      }
    }
  };
  </script>
  
  <style scoped>
  .modal {
    background: rgba(0, 0, 0, 0.5);
  }
  </style>
  