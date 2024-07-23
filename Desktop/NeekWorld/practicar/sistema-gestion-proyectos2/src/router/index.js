import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Projects from '../views/Projects.vue';
import Tasks from '../views/Tasks.vue';
import Register from '../components/Register.vue';
import Login from '../components/Login.vue';

Vue.use(VueRouter);

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/projects', name: 'Projects', component: Projects },
  { path: '/tasks', name: 'Tasks', component: Tasks },
  { path: '/register', name: 'Register', component: Register },
  { path: '/login', name: 'Login', component: Login }
];

const router = new VueRouter({
  mode: 'history',
  routes
});

export default router;
