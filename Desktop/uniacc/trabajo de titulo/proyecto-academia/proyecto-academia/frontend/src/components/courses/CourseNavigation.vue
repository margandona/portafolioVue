<template>
  <div class="course-navigation">
    <v-card class="mb-4">
      <v-card-text class="pa-2">
        <v-tabs
          v-model="activeTab"
          center-active
          show-arrows
        >
          <!-- Vista general del curso (para todos) -->
          <v-tab :value="'overview'" :to="`/courses/${courseId}`">
            <v-icon start>mdi-information</v-icon>
            Vista general
          </v-tab>
          
          <!-- Contenido del curso (para todos) -->
          <v-tab :value="'content'" :to="`/courses/${courseId}/content`">
            <v-icon start>mdi-book-open-variant</v-icon>
            Contenido
          </v-tab>
          
          <!-- Secciones para estudiantes inscritos -->
          <template v-if="isStudent">
            <v-tab :value="'notes'" :to="`/courses/${courseId}/notes`">
              <v-icon start>mdi-notebook</v-icon>
              Mis notas
            </v-tab>
            
            <v-tab :value="'quizzes'" :to="`/courses/${courseId}/quizzes`">
              <v-icon start>mdi-help-circle</v-icon>
              Evaluaciones
            </v-tab>
          </template>
          
          <!-- Secciones para profesores -->
          <template v-if="isTeacherOrAdmin">
            <v-tab :value="'edit'" :to="`/courses/${courseId}/edit`">
              <v-icon start>mdi-pencil</v-icon>
              Editar
            </v-tab>
            
            <v-tab :value="'modules'" :to="`/courses/${courseId}/modules`">
              <v-icon start>mdi-folder-multiple</v-icon>
              Módulos
            </v-tab>
            
            <v-tab :value="'students'" :to="`/courses/${courseId}/students`">
              <v-icon start>mdi-account-group</v-icon>
              Estudiantes
            </v-tab>
            
            <v-tab :value="'evaluations'" :to="`/courses/${courseId}/evaluations`">
              <v-icon start>mdi-clipboard-text</v-icon>
              Evaluaciones
            </v-tab>
            
            <v-tab :value="'stats'" :to="`/courses/${courseId}/stats`">
              <v-icon start>mdi-chart-bar</v-icon>
              Estadísticas
            </v-tab>
            
            <v-tab v-if="isAdmin" :value="'settings'" :to="`/courses/${courseId}/settings`">
              <v-icon start>mdi-cog</v-icon>
              Configuración
            </v-tab>
          </template>
        </v-tabs>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'CourseNavigation',
  
  props: {
    courseId: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'student'
    }
  },
  
  data() {
    return {
      activeTab: 'overview'
    };
  },
  
  computed: {
    isStudent() {
      return this.role === 'student';
    },
    
    isTeacher() {
      return this.role === 'teacher';
    },
    
    isAdmin() {
      return this.role === 'admin';
    },
    
    isTeacherOrAdmin() {
      return this.isTeacher || this.isAdmin;
    }
  },
  
  created() {
    // Establecer la tab activa según la ruta actual
    const path = this.$route.path;
    
    if (path.includes('/edit')) {
      this.activeTab = 'edit';
    } else if (path.includes('/content')) {
      this.activeTab = 'content';
    } else if (path.includes('/modules')) {
      this.activeTab = 'modules';
    } else if (path.includes('/students')) {
      this.activeTab = 'students';
    } else if (path.includes('/evaluations')) {
      this.activeTab = 'evaluations';
    } else if (path.includes('/stats')) {
      this.activeTab = 'stats';
    } else if (path.includes('/notes')) {
      this.activeTab = 'notes';
    } else if (path.includes('/quizzes')) {
      this.activeTab = 'quizzes';
    } else if (path.includes('/settings')) {
      this.activeTab = 'settings';
    } else {
      this.activeTab = 'overview';
    }
  }
};
</script>

<style scoped>
.course-navigation {
  background-color: #fff;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .v-tabs {
    height: auto;
  }
}
</style>
