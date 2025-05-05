import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/HomeView.vue";
import Login from "@/views/LoginView.vue";
import Register from "@/views/RegisterView.vue";
import DashboardView from '@/views/DashboardView.vue'

// Utilidad para obtener el rol del usuario
const getUserRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
};

// Definición de rutas
const routes = [
  // Rutas públicas
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  
  // Rutas protegidas (requieren autenticación)
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: "/progress",
    name: "Progress",
    component: () => import("@/views/ProgressView.vue"),
    meta: { requiresAuth: true, role: ["student"] },
  },
  {
    path: "/enroll",
    name: "Enroll",
    component: () => import("@/views/EnrollView.vue"),
    meta: { requiresAuth: true, role: ["student"] },
  },
  {
    path: "/courses",
    name: "Courses",
    component: () => import("@/views/CourseListView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/courses/create",
    name: "CreateCourse",
    component: () => import("@/views/CreateCourseView.vue"),
    meta: { requiresAuth: true, role: ["teacher", "admin"] },
  },
  {
    path: "/courses/edit/:id",
    name: "EditCourse",
    component: () => import("@/views/EditCourseView.vue"),
    meta: { requiresAuth: true, role: ["teacher", "admin"] },
    props: true,
  },
  {
    path: "/courses/:id",
    name: "CourseDetail",
    component: () => import("@/views/CourseDetailView.vue"),
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: "/courses/students",
    name: "CourseStudents",
    component: () => import("@/views/StudentListModal.vue"),
    meta: { requiresAuth: true, role: ["teacher"] },
  },
  {
    path: "/evaluations",
    name: "EvaluationList",
    component: () => import("@/views/EvaluationListView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/evaluations/manage",
    name: "ManageEvaluations",
    component: () => import("@/views/EvaluationView.vue"),
    meta: { requiresAuth: true, role: ["teacher", "admin"] },
  },
  {
    path: "/evaluations/create",
    name: "CreateEvaluation",
    component: () => import("@/views/EvaluationFormView.vue"),
    meta: { requiresAuth: true, role: ["teacher", "admin"] },
  },
  {
    path: "/evaluations/edit/:id",
    name: "EditEvaluation",
    component: () => import("@/views/EvaluationFormView.vue"),
    meta: { requiresAuth: true, role: ["teacher", "admin"] },
    props: true,
  },
  {
    path: "/evaluations/:id",
    name: "EvaluationDetail",
    component: () => import("@/views/EvaluationDetailView.vue"),
    meta: { requiresAuth: true },
    props: true,
  },
  
  // Rutas de administración
  {
    path: "/admin/enrollments",
    name: "EnrollmentManagement",
    component: () => import("@/views/EnrollmentListView.vue"),
    meta: { requiresAuth: true, role: ["admin"] },
  },
  {
    path: "/admin/users",
    name: "UserManagement",
    component: () => import("@/views/UserManagementView.vue"),
    meta: { requiresAuth: true, role: ["admin"] },
  },

  // Rutas adicionales
  { path: "/results", name: "Results", component: () => import("@/views/ResultsView.vue"), meta: { requiresAuth: true, role: ["student"] }},
  { path: "/profile", name: "Profile", component: () => import("@/views/ProfileView.vue"), meta: { requiresAuth: true }},
  { path: "/about", name: "About", component: () => import("@/views/AboutView.vue") },
  { path: "/forgot-password", name: "ForgotPassword", component: () => import("@/views/ForgotPasswordView.vue") },

  // Ruta para páginas no encontradas
  { path: "/:pathMatch(.*)*", name: "NotFound", component: () => import("@/views/NotFoundView.vue") },

  // Rutas específicas para cada dashboard (para acceder directamente)
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import(/* webpackChunkName: "admin" */ '@/views/AdminDashboard.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/teacher/dashboard',
    name: 'TeacherDashboard',
    component: () => import(/* webpackChunkName: "teacher" */ '@/views/TeacherDashboard.vue'),
    meta: {
      requiresAuth: true,
      requiresTeacher: true
    }
  },
];

// Configuración del router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware de navegación
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const userRole = getUserRole();

  try {
    // Verificar si se requiere autenticación
    if (to.meta.requiresAuth && !token) {
      console.log('Redirigiendo a login: Autenticación requerida');
      next({ name: "Login", query: { redirect: to.fullPath } });
      return;
    }

    // Verificar si se requiere un rol específico
    if (to.meta.role && !to.meta.role.includes(userRole)) {
      console.log(`Acceso denegado para rol ${userRole}. Se requiere: ${to.meta.role}`);
      alert(`No tienes permisos para acceder a esta sección. Se requiere ser ${to.meta.role.join(' o ')}`);
      next({ name: "Home" });
      return;
    }

    // Redirecciones especiales basadas en rol
    if (to.path === '/courses/create' && userRole !== 'teacher' && userRole !== 'admin') {
      console.log('Redirigiendo: Solo profesores y administradores pueden crear cursos');
      next({ name: "Dashboard" });
      return;
    }

    next();
  } catch (error) {
    console.error("Error en la verificación de acceso:", error);
    next({ name: "Home" });
  }
});

export default router;
