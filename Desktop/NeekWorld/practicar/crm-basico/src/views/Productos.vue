<template>
    <div class="productos">
      <h1>Productos</h1>
      <button @click="showAddProductModal" class="btn btn-success mb-3">Agregar Producto</button>
      <div v-for="producto in productos" :key="producto.id" class="card mb-2">
        <div class="card-body">
          <h5 class="card-title">{{ producto.nombre }}</h5>
          <p class="card-text">Descripción: {{ producto.descripcion }}</p>
          <p class="card-text">Precio: ${{ producto.precio }}</p>
          <p class="card-text">Stock: {{ producto.stock }}</p>
          <button @click="editProduct(producto)" class="btn btn-primary">Editar</button>
          <button @click="deleteProduct(producto.id)" class="btn btn-danger">Eliminar</button>
        </div>
      </div>
      <add-product-modal v-if="showModal" @close="showModal = false" @save="handleAddProduct"></add-product-modal>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex';
  import AddProductModal from '../components/AddProductModal.vue';
  
  export default {
    components: { AddProductModal },
    data() {
      return {
        showModal: false
      };
    },
    computed: {
      ...mapState(['productos'])
    },
    methods: {
      ...mapActions(['fetchProductos', 'addProduct', 'editProduct', 'deleteProduct']),
      showAddProductModal() {
        this.showModal = true;
      },
      handleAddProduct(producto) {
        this.addProduct(producto);
        this.showModal = false;
      }
    },
    created() {
      this.fetchProductos();
    }
  };
  </script>
  
  <style scoped>
  .productos {
    padding: 20px;
  }
  </style>
  