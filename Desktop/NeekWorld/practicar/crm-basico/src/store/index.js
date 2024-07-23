import { createStore } from 'vuex';
import { auth, db, doc, getDoc, collection, addDoc, updateDoc, deleteDoc, getDocs, query, where, signInWithEmailAndPassword } from '../firebase';

const store = createStore({
  state: {
    user: null,
    clients: [],
    sales: [],
    compras: [],
    productos: [],
    users: []
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setClients(state, clients) {
      state.clients = clients;
    },
    setSales(state, sales) {
      state.sales = sales;
    },
    setCompras(state, compras) {
      state.compras = compras;
    },
    setProductos(state, productos) {
      state.productos = productos;
    },
    setUsers(state, users) {
      state.users = users;
    },
    clearState(state) {
      state.user = null;
      state.clients = [];
      state.sales = [];
      state.compras = [];
      state.productos = [];
      state.users = [];
    },
    addClient(state, client) {
      state.clients.push(client);
    },
    addSale(state, sale) {
      state.sales.push(sale);
    },
    addCompra(state, compra) {
      state.compras.push(compra);
    },
    addProduct(state, producto) {
      state.productos.push(producto);
    },
    updateClient(state, updatedClient) {
      const index = state.clients.findIndex(client => client.id === updatedClient.id);
      if (index !== -1) {
        state.clients.splice(index, 1, updatedClient);
      }
    },
    updateSale(state, updatedSale) {
      const index = state.sales.findIndex(sale => sale.id === updatedSale.id);
      if (index !== -1) {
        state.sales.splice(index, 1, updatedSale);
      }
    },
    updateProduct(state, updatedProduct) {
      const index = state.productos.findIndex(producto => producto.id === updatedProduct.id);
      if (index !== -1) {
        state.productos.splice(index, 1, updatedProduct);
      }
    },
    removeClient(state, clientId) {
      state.clients = state.clients.filter(client => client.id !== clientId);
    },
    removeSale(state, saleId) {
      state.sales = state.sales.filter(sale => sale.id !== saleId);
    },
    removeProduct(state, productId) {
      state.productos = state.productos.filter(producto => producto.id !== productId);
    }
  },
  actions: {
    async setUser({ commit }, user) {
      commit('setUser', user);
    },
    async login({ commit }, { email, password }) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      commit('setUser', { ...user, ...userData });
    },
    async logout({ commit }) {
      await auth.signOut();
      commit('clearState');
    },
    async fetchClients({ commit }) {
      const clientsSnapshot = await getDocs(collection(db, 'clients'));
      commit('setClients', clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    },
    async fetchSales({ commit }) {
      const salesSnapshot = await getDocs(collection(db, 'sales'));
      commit('setSales', salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    },
    async fetchCompras({ commit }) {
      const user = auth.currentUser;
      const comprasSnapshot = await getDocs(query(collection(db, 'compras'), where('userId', '==', user.uid)));
      commit('setCompras', comprasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    },
    async fetchProductos({ commit }) {
      const productosSnapshot = await getDocs(collection(db, 'productos'));
      commit('setProductos', productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    },
    async fetchUsers({ commit }) {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      commit('setUsers', usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    },
    async addClient({ commit }, client) {
      const docRef = await addDoc(collection(db, 'clients'), client);
      commit('addClient', { id: docRef.id, ...client });
    },
    async addSale({ commit }, sale) {
      const docRef = await addDoc(collection(db, 'sales'), sale);
      commit('addSale', { id: docRef.id, ...sale });
    },
    async addCompra({ commit }, compra) {
      const user = auth.currentUser;
      const docRef = await addDoc(collection(db, 'compras'), { ...compra, userId: user.uid });
      commit('addCompra', { id: docRef.id, ...compra });
    },
    async addProduct({ commit }, producto) {
      const docRef = await addDoc(collection(db, 'productos'), producto);
      commit('addProduct', { id: docRef.id, ...producto });
    },
    async editClient({ commit }, client) {
      await updateDoc(doc(db, 'clients', client.id), client);
      commit('updateClient', client);
    },
    async editSale({ commit }, sale) {
      await updateDoc(doc(db, 'sales', sale.id), sale);
      commit('updateSale', sale);
    },
    async editProduct({ commit }, producto) {
      await updateDoc(doc(db, 'productos', producto.id), producto);
      commit('updateProduct', producto);
    },
    async deleteClient({ commit }, clientId) {
      await deleteDoc(doc(db, 'clients', clientId));
      commit('removeClient', clientId);
    },
    async deleteSale({ commit }, saleId) {
      await deleteDoc(doc(db, 'sales', saleId));
      commit('removeSale', saleId);
    },
    async deleteProduct({ commit }, productId) {
      await deleteDoc(doc(db, 'productos', productId));
      commit('removeProduct', productId);
    },
    async updateUser({ commit }, user) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, user);
      commit('setUser', { ...auth.currentUser, ...user });
    }
  }
});

export default store;
