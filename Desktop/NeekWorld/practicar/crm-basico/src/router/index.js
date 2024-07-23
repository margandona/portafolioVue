import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import Clientes from '../views/Clientes.vue';
import Ventas from '../views/Ventas.vue';
import Compras from '../views/Compras.vue';
import Productos from '../views/Productos.vue';
import UserOptions from '../views/UserOptions.vue';
import { auth, db, getDoc, doc } from '../firebase';

const routes = [
  { path: '/', component: Login },
  { path: '/register', component: Register },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
    children: [
      { path: 'clientes', component: Clientes, meta: { requiresRole: 'admin' } },
      { path: 'ventas', component: Ventas, meta: { requiresRole: 'admin' } },
      { path: 'compras', component: Compras, meta: { requiresRole: 'client' } },
      { path: 'productos', component: Productos, meta: { requiresRole: 'admin' } },
      { path: 'opciones', component: UserOptions }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresRole = to.meta.requiresRole;
  const isAuthenticated = auth.currentUser;

  if (requiresAuth && !isAuthenticated) {
    next('/');
  } else if (requiresAuth && isAuthenticated) {
    const userDoc = await getDoc(doc(db, 'users', isAuthenticated.uid));
    const userData = userDoc.data();
    if (requiresRole && userData.role !== requiresRole) {
      next('/dashboard');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
