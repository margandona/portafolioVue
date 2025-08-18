import { createRouter, createWebHistory } from 'vue-router';

// Placeholder component for routes that haven't been created yet
const PlaceholderView = {
  template: `
    <div class="placeholder-view">
      <div class="container py-5 text-center">
        <h2>Page Under Construction</h2>
        <p>This page is currently being developed and will be available soon.</p>
        <router-link to="/" class="btn btn-primary">Return to Home</router-link>
      </div>
    </div>
  `
};

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashView.vue'),
    meta: { requiresAuth: true }
  },
  // Rutas protegidas
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  // Rutas de cursos
  {
    path: '/courses',
    name: 'CourseList',
    component: () => import('../views/courses/CourseList.vue')
  },
  {
    path: '/courses/:id',
    name: 'CourseDetail',
    component: () => import('../views/courses/CourseDetail.vue'),
    props: true
  },
  // Actualizar rutas de gestión de cursos para usar componentes reales
  {
    path: '/courses/create',
    name: 'CreateCourse',
    component: () => import('../views/courses/CourseCreate.vue'),
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] }
  },
  {
    path: '/courses/:id/edit',
    name: 'EditCourse',
    component: () => import('../views/courses/CourseEdit.vue'),
    props: true,
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] }
  },
  {
    path: '/courses/manage',
    name: 'ManageCourses',
    component: () => import('../views/courses/CourseManage.vue'),
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] }
  },
  // Rutas de cursos del usuario
  {
    path: '/courses/enrolled',
    name: 'EnrolledCourses',
    component: () => import('../views/courses/CourseEnrolled.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/courses/completed',
    name: 'CompletedCourses',
    component: PlaceholderView,
    meta: { requiresAuth: true }
  },
  // Rutas de pago y checkout
  {
    path: '/courses/:id/checkout',
    name: 'Checkout',
    component: () => import('../views/CheckoutView.vue'),
    meta: { requiresAuth: true, roles: ['student'] },
    props: route => ({ courseId: route.params.id })
  },
  {
    path: '/payment/success',
    name: 'PaymentSuccess',
    component: () => import('../views/PaymentSuccessView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payment/cancel',
    name: 'PaymentCancel',
    component: PlaceholderView,
    meta: { requiresAuth: true }
  },
  {
    path: '/payment/error',
    name: 'PaymentError',
    component: PlaceholderView,
    meta: { requiresAuth: true }
  },
  
  // Transbank Routes
  {
    path: '/payment/transbank/return',
    name: 'TransbankReturn',
    component: () => import('@/views/TransbankReturnView.vue'),
    meta: { requiresAuth: true }
  },
  
  // Stripe Routes
  {
    path: '/payment/stripe/checkout',
    name: 'StripeCheckout',
    component: () => import('@/views/StripeCheckoutView.vue'),
    meta: { requiresAuth: true }
  },
  
  {
    path: '/payment/stripe/success',
    name: 'StripeSuccess',
    component: () => import('@/views/PaymentSuccessView.vue'),
    meta: { requiresAuth: true }
  },
  
  // Khipu Routes
  {
    path: '/payment/khipu/return',
    name: 'KhipuReturn',
    component: () => import('@/views/KhipuReturnView.vue'),
    meta: { requiresAuth: true }
  },
  
  {
    path: '/payment/khipu/cancel',
    name: 'KhipuCancel',
    component: () => import('@/views/PaymentCancelView.vue'),
    meta: { requiresAuth: true }
  },
  
  // Certificados - usando componente placeholder
  {
    path: '/certificates',
    name: 'Certificates',
    component: PlaceholderView,
    meta: { requiresAuth: true }
  },

  // Rutas de evaluaciones
  {
    path: '/evaluations/:id/take',
    name: 'ExamInterface',
    component: () => import('../views/ExamInterfaceView.vue'),
    meta: { requiresAuth: true, roles: ['student'] },
    props: true
  },
  {
    path: '/evaluations/results/:responseId',
    name: 'ExamResults',
    component: () => import('../views/ExamResultsView.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/evaluations/reports',
    name: 'EvaluationReports',
    component: () => import('../views/EvaluationReportsView.vue'),
    meta: { requiresAuth: true, roles: ['instructor', 'admin'] }
  },

  // Configuración de cuenta - usando componente placeholder
  {
    path: '/account',
    name: 'Account',
    component: PlaceholderView,
    meta: { requiresAuth: true }
  },
  // Panel de administración - usando componente placeholder
  {
    path: '/admin',
    name: 'AdminPanel',
    component: () => import('../views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: () => import('../views/admin/UserManagementView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  // Add the Moodle Courses route
  {
    path: '/moodle-courses',
    name: 'MoodleCourses',
    component: () => import('../views/MoodleCoursesView.vue')
  },
  // Contact route
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/ContactView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // Siempre vuelve al inicio cuando se cambia de página
    return { top: 0 };
  }
});

// Navegación guard para rutas protegidas
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRoles = to.meta.roles;
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // Asumimos que guardamos el rol en localStorage

  if (requiresAuth && !isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else if (requiredRoles && (!userRole || !requiredRoles.includes(userRole))) {
    next({ path: '/dashboard' }); // Redirigir si el usuario no tiene el rol adecuado
  } else {
    next();
  }
});

export default router;
