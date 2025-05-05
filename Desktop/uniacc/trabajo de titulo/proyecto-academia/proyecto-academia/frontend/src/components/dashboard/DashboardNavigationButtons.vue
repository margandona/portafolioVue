<template>
  <v-card class="mb-4">
    <v-card-title>
      <v-icon icon="mdi-navigation" class="me-2"></v-icon>
      Navegación Rápida
    </v-card-title>
    
    <v-card-text>
      <!-- Admin Navigation -->
      <v-row v-if="userRole === 'admin'" class="button-grid">
        <v-col v-for="(button, i) in adminButtons" :key="`admin-btn-${i}`" cols="6" sm="4" md="2">
          <v-btn
            :to="button.to"
            color="primary"
            variant="tonal"
            block
            class="text-none mb-2"
          >
            <template v-slot:prepend>
              <v-icon :icon="button.icon"></v-icon>
            </template>
            {{ button.text }}
          </v-btn>
        </v-col>
      </v-row>

      <!-- Teacher Navigation -->
      <v-row v-else-if="userRole === 'teacher'" class="button-grid">
        <v-col v-for="(button, i) in teacherButtons" :key="`teacher-btn-${i}`" cols="6" sm="4" md="2">
          <v-btn
            :to="button.to"
            color="primary"
            variant="tonal"
            block
            class="text-none mb-2"
          >
            <template v-slot:prepend>
              <v-icon :icon="button.icon"></v-icon>
            </template>
            {{ button.text }}
          </v-btn>
        </v-col>
      </v-row>

      <!-- Student Navigation -->
      <v-row v-else class="button-grid">
        <v-col v-for="(button, i) in studentButtons" :key="`student-btn-${i}`" cols="6" sm="4" md="2">
          <v-btn
            :to="button.to"
            color="primary"
            variant="tonal"
            block
            class="text-none mb-2"
          >
            <template v-slot:prepend>
              <v-icon :icon="button.icon"></v-icon>
            </template>
            {{ button.text }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'DashboardNavigationButtons',
  
  props: {
    userRole: {
      type: String,
      default: 'student'
    }
  },
  
  data() {
    return {
      adminButtons: [
        { icon: 'mdi-account-group', text: 'Usuarios', to: '/admin/users' },
        { icon: 'mdi-book-multiple', text: 'Cursos', to: '/admin/courses' },
        { icon: 'mdi-currency-usd', text: 'Ventas', to: '/admin/sales' },
        { icon: 'mdi-tag-multiple', text: 'Campañas', to: '/admin/campaigns' },
        { icon: 'mdi-file-chart', text: 'Reportes', to: '/admin/reports' },
        { icon: 'mdi-cog', text: 'Ajustes', to: '/admin/settings' }
      ],
      teacherButtons: [
        { icon: 'mdi-book-edit', text: 'Mis cursos', to: '/teacher/courses' },
        { icon: 'mdi-plus-circle', text: 'Crear curso', to: '/courses/create' },
        { icon: 'mdi-clipboard-text', text: 'Evaluaciones', to: '/teacher/evaluations' },
        { icon: 'mdi-account-multiple', text: 'Estudiantes', to: '/teacher/students' },
        { icon: 'mdi-chart-bar', text: 'Estadísticas', to: '/teacher/stats' },
        { icon: 'mdi-account-edit', text: 'Mi perfil', to: '/profile' }
      ],
      studentButtons: [
        { icon: 'mdi-book-open-page-variant', text: 'Mis cursos', to: '/courses/enrolled' },
        { icon: 'mdi-magnify', text: 'Explorar', to: '/courses' },
        { icon: 'mdi-certificate', text: 'Certificados', to: '/certificates' },
        { icon: 'mdi-chart-line', text: 'Progreso', to: '/progress' },
        { icon: 'mdi-history', text: 'Historial', to: '/history' },
        { icon: 'mdi-account-edit', text: 'Mi perfil', to: '/profile' }
      ]
    }
  }
}
</script>

<style scoped>
.button-grid {
  display: flex;
  flex-wrap: wrap;
}

.v-card-title {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

/* Fix for icon alignment in buttons */
.v-btn :deep(.v-btn__prepend) {
  margin-right: 4px;
}

/* Ensure the text doesn't get transformed */
.text-none {
  text-transform: none !important;
}
</style>
