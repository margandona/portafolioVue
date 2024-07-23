<template>
    <div class="clientes">
      <h1>Clientes</h1>
      <button @click="showAddClientModal" class="btn btn-success mb-3">Agregar Cliente</button>
      <div v-for="client in clients" :key="client.id" class="card mb-2">
        <div class="card-body">
          <h5 class="card-title">{{ client.nombre }}</h5>
          <p class="card-text">Email: {{ client.email }}</p>
          <p class="card-text">Teléfono: {{ client.telefono }}</p>
          <p class="card-text">Dirección: {{ client.direccion }}</p>
          <button @click="editClient(client)" class="btn btn-primary">Editar</button>
          <button @click="deleteClient(client.id)" class="btn btn-danger">Eliminar</button>
        </div>
      </div>
      <add-client-modal v-if="showModal" @close="showModal = false" @save="handleAddClient"></add-client-modal>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex';
  import AddClientModal from '../components/AddClientModal.vue';
  
  export default {
    components: { AddClientModal },
    data() {
      return {
        showModal: false
      };
    },
    computed: {
      ...mapState(['clients'])
    },
    methods: {
      ...mapActions(['fetchClients', 'addClient', 'editClient', 'deleteClient']),
      showAddClientModal() {
        this.showModal = true;
      },
      handleAddClient(client) {
        this.addClient(client);
        this.showModal = false;
      }
    },
    created() {
      this.fetchClients();
    }
  };
  </script>
  
  <style scoped>
  .clientes {
    padding: 20px;
  }
  </style>
  