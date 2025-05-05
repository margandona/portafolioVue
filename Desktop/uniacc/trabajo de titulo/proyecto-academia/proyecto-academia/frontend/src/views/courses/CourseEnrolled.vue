<template>
  <div class="enrolled-courses">
    <v-container>
      <!-- Header -->
      <v-row class="mb-4">
        <v-col cols="12" md="8">
          <h1 class="text-h4">Mis Cursos</h1>
          <p class="text-subtitle-1 text-grey">
            Administra tus cursos y continúa tu aprendizaje
          </p>
        </v-col>
      </v-row>
      
      <!-- Loader -->
      <div v-if="isLoading" class="d-flex justify-center my-8">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
      </div>
      
      <!-- Error message -->
      <v-alert
        v-else-if="error"
        type="error"
        class="mb-4"
      >
        {{ error }}
      </v-alert>
      
      <!-- No enrolled courses -->
      <v-alert
        v-else-if="enrolledCourses.length === 0"
        type="info"
        class="mb-4"
      >
        No estás inscrito en ningún curso. 
        <router-link to="/courses">Explorar cursos disponibles</router-link>
      </v-alert>
      
      <!-- Enrolled courses -->
      <template v-else>
        <!-- Tabs for filtering -->
        <v-tabs v-model="activeTab" class="mb-6">
          <v-tab value="active">Cursos en progreso</v-tab>
          <v-tab value="completed">Cursos completados</v-tab>
          <v-tab value="all">Todos mis cursos</v-tab>
        </v-tabs>
        
        <!-- Courses grid -->
        <v-row>
          <v-col
            v-for="course in filteredCourses"
            :key="course.id"
            cols="12"
            sm="6"
            lg="4"
          >
            <v-card class="h-100">
              <v-img
                :src="course.imageUrl || defaultImage"
                height="180"
                cover
              ></v-img>
              
              <v-card-title class="text-h6">{{ course.title }}</v-card-title>
              
              <v-card-text>
                <v-row no-gutters>
                  <v-col cols="12">
                    <div class="text-caption text-grey mb-2">Progreso del curso</div>
                    <v-progress-linear
                      :model-value="course.enrollment.progress || 0"
                      color="primary"
                      height="8"
                      rounded
                    ></v-progress-linear>
                    <div class="d-flex justify-space-between mt-1">
                      <span class="text-caption">{{ course.enrollment.progress || 0 }}% completado</span>
                      <span class="text-caption">
                        {{ formatDate(course.lastAccessDate) }}
                      </span>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
              
              <v-divider></v-divider>
              
              <v-card-actions>
                <v-btn
                  color="primary"
                  variant="text"
                  :to="`/courses/${course.id}/content`"
                >
                  Continuar curso
                </v-btn>
                <v-spacer></v-spacer>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon
                      v-bind="props"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item :to="`/courses/${course.id}`">
                      <template v-slot:prepend>
                        <v-icon>mdi-information</v-icon>
                      </template>
                      <v-list-item-title>Ver detalles</v-list-item-title>
                    </v-list-item>
                    
                    <v-list-item :to="`/courses/${course.id}/notes`">
                      <template v-slot:prepend>
                        <v-icon>mdi-notebook</v-icon>
                      </template>
                      <v-list-item-title>Mis notas</v-list-item-title>
                    </v-list-item>
                    
                    <v-list-item v-if="course.enrollment.progress === 100" :to="`/certificates/${course.enrollment.id}`">
                      <template v-slot:prepend>
                        <v-icon>mdi-certificate</v-icon>
                      </template>
                      <v-list-item-title>Ver certificado</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { formatDate } from '@/utils/dateUtils';
import { coursePlaceholder } from '@/assets/placeholders';

export default {
  name: 'CourseEnrolled',
  
  data() {
    return {
      activeTab: 'active',
      defaultImage: coursePlaceholder
    };
  },
  
  computed: {
    ...mapState('courses', ['enrolledCourses', 'loading', 'error']),
    ...mapGetters('courses', ['isLoading']),
    
    filteredCourses() {
      if (!this.enrolledCourses || this.enrolledCourses.length === 0) {
        return [];
      }
      
      if (this.activeTab === 'all') {
        return this.enrolledCourses;
      }
      
      if (this.activeTab === 'completed') {
        return this.enrolledCourses.filter(course => 
          course.enrollment && course.enrollment.progress === 100
        );
      }
      
      // Active tab (in progress)
      return this.enrolledCourses.filter(course => 
        course.enrollment && course.enrollment.progress < 100
      );
    }
  },
  
  created() {
    this.fetchEnrolledCourses();
  },
  
  methods: {
    ...mapActions('courses', ['fetchEnrolledCourses']),
    
    formatDate(dateValue) {
      if (!dateValue) return 'N/A';
      return formatDate(dateValue);
    }
  }
};
</script>

<style scoped>
.enrolled-courses {
  min-height: calc(100vh - 64px);
  background-color: #f8f9fa;
  padding-bottom: 2rem;
}
</style>
