import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue';
import './plugins/bootstrap-vue'
import App from './App.vue';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.min.js'; // Asegúrate de la ruta correcta
import '@fortawesome/fontawesome-free/css/all.min.css'; // Asegúrate de la ruta correcta

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
