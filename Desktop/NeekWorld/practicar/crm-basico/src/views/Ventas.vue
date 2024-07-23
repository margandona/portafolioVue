<template>
    <div class="ventas">
      <h1>Ventas</h1>
      <button @click="showAddSaleModal" class="btn btn-success mb-3">Agregar Venta</button>
      <div v-for="sale in sales" :key="sale.id" class="card mb-2">
        <div class="card-body">
          <h5 class="card-title">{{ sale.cliente }}</h5>
          <p class="card-text">Monto: ${{ sale.monto }}</p>
          <button @click="editSale(sale)" class="btn btn-primary">Editar</button>
          <button @click="deleteSale(sale.id)" class="btn btn-danger">Eliminar</button>
        </div>
      </div>
      <add-sale-modal v-if="showModal" @close="showModal = false" @save="handleAddSale"></add-sale-modal>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex';
  import AddSaleModal from '../components/AddSaleModal.vue';
  
  export default {
    components: { AddSaleModal },
    data() {
      return {
        showModal: false
      };
    },
    computed: {
      ...mapState(['sales'])
    },
    methods: {
      ...mapActions(['fetchSales', 'addSale', 'editSale', 'deleteSale']),
      showAddSaleModal() {
        this.showModal = true;
      },
      handleAddSale(sale) {
        this.addSale(sale);
        this.showModal = false;
      }
    },
    created() {
      this.fetchSales();
    }
  };
  </script>
  
  <style scoped>
  .ventas {
    padding: 20px;
  }
  </style>
  