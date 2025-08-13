import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  // Rutas adicionales como fallback para enlaces directos
  {
    path: '/work',
    name: 'work',
    component: HomeView
  },
  {
    path: '/playground',
    name: 'playground',
    component: HomeView
  },
  {
    path: '/education',
    name: 'education',
    component: HomeView
  },
  {
    path: '/educacion',
    name: 'educacion',
    component: HomeView
  },
  {
    path: '/security',
    name: 'security',
    component: HomeView
  },
  {
    path: '/communications',
    name: 'communications',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: HomeView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
