<template>
    <div class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Agregar Producto</h5>
            <button type="button" class="close" @click="$emit('close')">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveProduct">
              <div class="form-group">
                <label for="nombre">Nombre</label>
                <input type="text" v-model="nombre" class="form-control" id="nombre">
              </div>
              <div class="form-group">
                <label for="descripcion">Descripción</label>
                <input type="text" v-model="descripcion" class="form-control" id="descripcion">
              </div>
              <div class="form-group">
                <label for="precio">Precio</label>
                <input type="number" v-model="precio" class="form-control" id="precio">
              </div>
              <div class="form-group">
                <label for="stock">Stock</label>
                <input type="number" v-model="stock" class="form-control" id="stock">
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
        descripcion: '',
        precio: 0,
        stock: 0
      };
    },
    methods: {
      saveProduct() {
        this.$emit('save', {
          nombre: this.nombre,
          descripcion: this.descripcion,
          precio: this.precio,
          stock: this.stock
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
  