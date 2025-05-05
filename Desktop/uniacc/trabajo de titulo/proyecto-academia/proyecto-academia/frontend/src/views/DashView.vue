<template>
  <v-container class="dashboard pa-4">
    <!-- Encabezado del Dashboard -->
    <h1 class="text-h3 text-center mb-4">Dashboard</h1>
    <p class="text-body-1 text-center mb-6">{{ welcomeMessage }}</p>
    
    <!-- Loading state -->
    <v-row v-if="isLoading" justify="center" align="center">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4">Cargando tu información...</p>
      </v-col>
    </v-row>

    <!-- Error state -->
    <v-row v-else-if="errorMessage" justify="center">
      <v-col cols="12" md="6" class="text-center">
        <v-alert type="error" class="mb-4">{{ errorMessage }}</v-alert>
        <v-btn color="primary" @click="fetchData">Reintentar</v-btn>
      </v-col>
    </v-row>

    <!-- Dashboard content -->
    <template v-else>
      <!-- Navigation Buttons - Using the updated component -->
      <DashboardNavigationButtons :userRole="userRole" />
      
      <v-row>
        <!-- Common components for all users -->
        <v-col cols="12" md="4">
          <DashboardProfileCard :user="user" :role="userRole" />
        </v-col>
        <v-col cols="12" md="4">
          <DashboardActivityCard :activities="recentActivity" />
        </v-col>
        <v-col cols="12" md="4">
          <DashboardQuickActionsCard :actions="quickActions" />
        </v-col>
      </v-row>
        
      <!-- Role-specific components in separate rows -->
      <!-- Student components -->
      <v-row v-if="userRole === 'student'">
        <v-col cols="12">
          <DashboardStudentCourses 
            :inProgressCourses="inProgressCourses"
            :enrolledCourses="enrolledCourses"
          />
        </v-col>
        <v-col cols="12" md="6">
          <DashboardStudentMetrics 
            :completedCoursesCount="completedCoursesCount"
            :completedCoursesPercentage="completedCoursesPercentage"
            :passedEvaluationsCount="passedEvaluationsCount"
            :passedEvaluationsPercentage="passedEvaluationsPercentage"
            :certificatesCount="certificatesCount"
          />
        </v-col>
        <v-col cols="12" md="6" v-if="recommendedCourses.length > 0">
          <DashboardRecommendedCourses :courses="recommendedCourses" />
        </v-col>
      </v-row>
      
      <!-- Teacher components -->
      <v-row v-else-if="userRole === 'teacher'">
        <v-col cols="12" md="4">
          <DashboardTeacherStats 
            :teacherCourses="teacherCourses"
            :totalStudentsCount="totalStudentsCount"
            :pendingEvaluationsCount="pendingEvaluationsCount"
          />
        </v-col>
        <v-col cols="12" md="8">
          <DashboardTeacherCourses :courses="teacherCourses" />
        </v-col>
        <v-col cols="12">
          <DashboardStudentActivity :activities="recentStudentActivity" />
        </v-col>
      </v-row>
      
      <!-- Admin components -->
      <v-row v-else-if="userRole === 'admin'">
        <v-col cols="12">
          <DashboardAdminMetrics :stats="adminStats" />
        </v-col>
        <v-col cols="12" md="8">
          <DashboardSalesSummary :stats="adminStats" :formatPrice="formatPrice" />
        </v-col>
        <v-col cols="12" md="4">
          <DashboardCampaigns :campaigns="adminStats.activeCampaigns" :formatDate="formatDate" />
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { formatPrice } from '@/utils/courseUtils';
import DashboardProfileCard from '@/components/dashboard/DashboardProfileCard.vue';
import DashboardActivityCard from '@/components/dashboard/DashboardActivityCard.vue';
import DashboardQuickActionsCard from '@/components/dashboard/DashboardQuickActionsCard.vue';
import DashboardStudentCourses from '@/components/dashboard/DashboardStudentCourses.vue';
import DashboardStudentMetrics from '@/components/dashboard/DashboardStudentMetrics.vue';
import DashboardRecommendedCourses from '@/components/dashboard/DashboardRecommendedCourses.vue';
import DashboardTeacherStats from '@/components/dashboard/DashboardTeacherStats.vue';
import DashboardTeacherCourses from '@/components/dashboard/DashboardTeacherCourses.vue';
import DashboardStudentActivity from '@/components/dashboard/DashboardStudentActivity.vue';
import DashboardAdminMetrics from '@/components/dashboard/DashboardAdminMetrics.vue';
import DashboardSalesSummary from '@/components/dashboard/DashboardSalesSummary.vue';
import DashboardCampaigns from '@/components/dashboard/DashboardCampaigns.vue';
import DashboardNavigationButtons from '@/components/dashboard/DashboardNavigationButtons.vue';

export default {
  name: 'DashView',
  
  components: {
    DashboardProfileCard,
    DashboardActivityCard,
    DashboardQuickActionsCard,
    DashboardStudentCourses,
    DashboardStudentMetrics,
    DashboardRecommendedCourses,
    DashboardTeacherStats,
    DashboardTeacherCourses,
    DashboardStudentActivity,
    DashboardAdminMetrics,
    DashboardSalesSummary,
    DashboardCampaigns,
    DashboardNavigationButtons
  },
  
  data() {
    return {
      errorMessage: '',
      recentActivity: [
        { title: 'Iniciaste sesión', icon: 'mdi-login', time: 'Ahora', color: 'primary' },
        { title: 'Visitaste el curso de Python', icon: 'mdi-book-open-variant', time: 'Ayer', color: 'grey' },
        { title: 'Completaste una lección', icon: 'mdi-check-circle', time: '3 días', color: 'grey' }
      ],
      adminStats: {
        usersCount: 256,
        coursesCount: 42,
        enrollmentsCount: 318,
        pendingSalesCount: 8,
        totalRevenue: 1658000,
        salesThisMonth: 24,
        salesByStatus: {
          pending: 8,
          paid: 5,
          completed: 178,
          refunded: 2
        },
        activeCampaigns: [
          { id: 'camp1', name: 'Descuento Primavera', discount: 25, endDate: '2023-12-20' },
          { id: 'camp2', name: 'Navidad 2023', discount: 30, endDate: '2023-12-26' }
        ]
      }
    }
  },
  
  computed: {
    ...mapState({
      user: state => state.user,
      loading: state => state.loading,
    }),
    
    ...mapGetters([
      'isAuthenticated',
      'isLoading',
      'userRole',
    ]),
    
    ...mapGetters('courses', [
      'enrolledCourses',
      'teacherCourses',
    ]),
    
    welcomeMessage() {
      const hour = new Date().getHours();
      let greeting = 'Buenos días';
      
      if (hour >= 12 && hour < 18) {
        greeting = 'Buenas tardes';
      } else if (hour >= 18) {
        greeting = 'Buenas noches';
      }
      
      return `${greeting}, ${this.userName}. Bienvenido/a a tu panel de control.`;
    },
    
    userName() {
      return this.user?.name || 'Usuario';
    },
    
    quickActions() {
      // Acciones basadas en el rol del usuario
      if (this.userRole === 'student') {
        return [
          { title: 'Ver mis cursos', icon: 'mdi-book-open-page-variant', to: '/courses/enrolled', color: 'primary' },
          { title: 'Explorar cursos', icon: 'mdi-magnify', to: '/courses', color: 'secondary' },
          { title: 'Mis certificados', icon: 'mdi-certificate', to: '/certificates', color: 'success' }
        ];
      } else if (this.userRole === 'teacher') {
        return [
          { title: 'Mis cursos', icon: 'mdi-book-edit', to: '/courses/manage', color: 'primary' },
          { title: 'Crear curso', icon: 'mdi-plus-circle', to: '/courses/create', color: 'success' },
          { title: 'Evaluar estudiantes', icon: 'mdi-clipboard-text', to: '/teacher/evaluations', color: 'info' }
        ];
      } else if (this.userRole === 'admin') {
        return [
          { title: 'Gestionar usuarios', icon: 'mdi-account-group', to: '/admin/users', color: 'primary' },
          { title: 'Gestionar cursos', icon: 'mdi-book-multiple', to: '/courses/manage', color: 'secondary' },
          { title: 'Gestionar ventas', icon: 'mdi-currency-usd', to: '/admin/sales', color: 'success' }
        ];
      }
      
      return [
        { title: 'Completar perfil', icon: 'mdi-account-edit', to: '/profile', color: 'primary' },
        { title: 'Explorar cursos', icon: 'mdi-magnify', to: '/courses', color: 'secondary' }
      ];
    },
    
    // Student-specific computed properties
    inProgressCourses() {
      if (!this.enrolledCourses) return [];
      
      return this.enrolledCourses
        .filter(course => course.progress < 100)
        .sort((a, b) => b.progress - a.progress);
    },
    
    completedCoursesCount() {
      if (!this.enrolledCourses) return 0;
      return this.enrolledCourses.filter(course => course.progress === 100).length;
    },
    
    completedCoursesPercentage() {
      if (!this.enrolledCourses || this.enrolledCourses.length === 0) return 0;
      return (this.completedCoursesCount / this.enrolledCourses.length) * 100;
    },
    
    passedEvaluationsCount() {
      if (!this.enrolledCourses) return 0;
      
      return this.enrolledCourses.reduce((count, course) => {
        return count + (course.passedEvaluations?.length || 0);
      }, 0);
    },
    
    passedEvaluationsPercentage() {
      if (!this.totalEvaluationsCount) return 0;
      return (this.passedEvaluationsCount / this.totalEvaluationsCount) * 100;
    },
    
    totalEvaluationsCount() {
      if (!this.enrolledCourses) return 0;
      
      return this.enrolledCourses.reduce((count, course) => {
        return count + (course.totalEvaluations || 0);
      }, 0);
    },
    
    certificatesCount() {
      if (!this.enrolledCourses) return 0;
      return this.enrolledCourses.filter(course => course.certificateIssued).length;
    },
    
    recommendedCourses() {
      return []; // Esto debería venir de una API basada en intereses del usuario
    },
    
    // Teacher-specific computed properties
    totalStudentsCount() {
      if (!this.teacherCourses) return 0;
      
      return this.teacherCourses.reduce((count, course) => {
        return count + (course.enrollmentCount || 0);
      }, 0);
    },
    
    pendingEvaluationsCount() {
      return 0; // Esto debería venir de una API
    },
    
    recentStudentActivity() {
      return []; // Esto debería venir de una API
    }
  },
  
  methods: {
    ...mapActions('courses', ['fetchEnrolledCourses', 'fetchTeacherCourses']),
    
    formatPrice(value) {
      return formatPrice(value);
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CL');
    },
    
    fetchData() {
      this.errorMessage = '';
      
      // Si el usuario está autenticado, cargar sus datos
      if (this.isAuthenticated) {
        if (this.userRole === 'student') {
          // eslint-disable-next-line no-unused-vars
          this.fetchEnrolledCourses().catch(_err => {
            this.errorMessage = 'No pudimos cargar tus cursos. Inténtalo de nuevo más tarde.';
          });
        } else if (this.userRole === 'teacher') {
          // eslint-disable-next-line no-unused-vars
          this.fetchTeacherCourses().catch(_err => {
            this.errorMessage = 'No pudimos cargar tus cursos. Inténtalo de nuevo más tarde.';
          });
        }
      }
    }
  },
  
  created() {
    this.fetchData();
  }
}
</script>

<style>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  color: #2A3B5F;
  font-family: "Playfair Display", serif;
}
</style>
