<template>
    <div class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Agregar Venta</h5>
            <button type="button" class="close" @click="$emit('close')">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveSale">
              <div class="form-group">
                <label for="cliente">Cliente</label>
                <input type="text" v-model="cliente" class="form-control" id="cliente">
              </div>
              <div class="form-group">
                <label for="monto">Monto</label>
                <input type="number" v-model="monto" class="form-control" id="monto">
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
        cliente: '',
        monto: 0
      };
    },
    methods: {
      saveSale() {
        this.$emit('save', { cliente: this.cliente, monto: this.monto });
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
  