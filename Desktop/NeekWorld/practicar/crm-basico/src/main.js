// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { db, auth } from './firebase'; // Asegúrate de que Firebase esté importado

createApp(App)
  .use(router)
  .use(store)
  .mount('#app');
