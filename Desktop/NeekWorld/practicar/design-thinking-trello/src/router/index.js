import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import BoardList from '../components/BoardList.vue';
import Board from '../components/Board.vue';
import Register from '../components/Register.vue';
import Login from '../components/Login.vue';

Vue.use(VueRouter);

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/boards', name: 'BoardList', component: BoardList },
  { path: '/board/:id', name: 'Board', component: Board },
  { path: '/register', name: 'Register', component: Register },
  { path: '/login', name: 'Login', component: Login }
];

const router = new VueRouter({
  mode: 'history',
  routes
});

export default router;
