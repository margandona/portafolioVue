<template>
    <v-container v-if="loading" class="text-center my-8">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <div class="text-h6 mt-4">Cargando curso...</div>
    </v-container>
  
    <v-container v-else-if="error" class="text-center my-8">
      <v-alert type="error" title="Error" variant="tonal">
        {{ error }}
      </v-alert>
      <v-btn color="primary" class="mt-4" @click="fetchCourseData">Reintentar</v-btn>
    </v-container>
  
    <v-container v-else-if="course" class="course-detail pb-8">
      <!-- Cabecera del curso -->
      <v-row>
        <v-col cols="12">
          <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
        </v-col>
      </v-row>

      <v-row v-if="isEnrolled || canManageCourse">
        <v-col cols="12">
          <CourseNavigation :courseId="courseId" :role="userRole" />
        </v-col>
      </v-row>
  
      <!-- Información principal -->
      <v-row>
        <!-- Imagen e información principal -->
        <v-col cols="12" md="8">
          <v-card class="mb-4">
            <v-img
              :src="course.imageUrl || defaultImage"
              height="300"
              cover
            ></v-img>
  
            <v-card-title class="text-h4">{{ course.title }}</v-card-title>
            
            <v-card-subtitle class="d-flex align-center text-body-1">
              <v-icon size="small" class="me-1">mdi-tag</v-icon>
              {{ course.category }}
              <v-divider vertical class="mx-2"></v-divider>
              <v-icon size="small" class="me-1">mdi-calendar</v-icon>
              {{ courseDuration }}
              <v-divider vertical class="mx-2" v-if="course.level"></v-divider>
              <span v-if="course.level">
                <v-icon size="small" class="me-1">mdi-stairs</v-icon>
                {{ course.level }}
              </span>
            </v-card-subtitle>
  
            <v-card-text>
              <div class="d-flex align-center mb-4">
                <v-avatar size="40" class="me-2">
                  <v-img 
                    :src="course.teacher?.avatar || defaultAvatar" 
                    alt="Instructor"
                  ></v-img>
                </v-avatar>
                <div>
                  <div class="text-body-1 font-weight-medium">
                    {{ course.teacher?.name || 'Instructor' }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ course.teacher?.role || 'Profesor' }}
                  </div>
                </div>
              </div>
  
              <v-divider class="mb-4"></v-divider>
  
              <div class="text-h6 mb-2">Descripción</div>
              <div class="text-body-1 mb-4">{{ course.description }}</div>
  
              <div v-if="course.learningObjectives?.length" class="mb-4">
                <div class="text-h6 mb-2">Lo que aprenderás</div>
                <v-list>
                  <v-list-item 
                    v-for="(objective, i) in course.learningObjectives" 
                    :key="`obj-${i}`"
                    density="compact"
                  >
                    <template v-slot:prepend>
                      <v-icon color="primary" size="small">mdi-check-circle</v-icon>
                    </template>
                    <v-list-item-title>{{ objective }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </div>
  
              <div v-if="course.requirements?.length" class="mb-4">
                <div class="text-h6 mb-2">Requisitos</div>
                <v-list>
                  <v-list-item 
                    v-for="(req, i) in course.requirements" 
                    :key="`req-${i}`"
                    density="compact"
                  >
                    <template v-slot:prepend>
                      <v-icon color="grey" size="small">mdi-circle-small</v-icon>
                    </template>
                    <v-list-item-title>{{ req }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </div>
            </v-card-text>
          </v-card>
  
          <!-- Contenido del curso -->
          <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
              Contenido del curso
              <v-chip class="ms-2">{{ totalLessons }} lecciones</v-chip>
            </v-card-title>
            
            <v-card-text v-if="course.modules?.length">
              <v-expansion-panels>
                <v-expansion-panel
                  v-for="(module, i) in course.modules"
                  :key="`module-${i}`"
                >
                  <v-expansion-panel-title>
                    <div class="d-flex align-center justify-space-between w-100">
                      <div>
                        <span class="font-weight-bold">{{ module.title }}</span>
                      </div>
                      <div class="text-caption">
                        {{ module.lessons?.length || 0 }} lecciones
                      </div>
                    </div>
                  </v-expansion-panel-title>
                  
                  <v-expansion-panel-text>
                    <v-list density="compact">
                      <v-list-item
                        v-for="(lesson, j) in module.lessons"
                        :key="`lesson-${i}-${j}`"
                        :disabled="!isEnrolled"
                        :to="isEnrolled ? `/courses/${course.id}/lesson/${lesson.id}` : undefined"
                      >
                        <template v-slot:prepend>
                          <v-icon size="small">
                            {{ getLessonIcon(lesson) }}
                          </v-icon>
                        </template>
                        <v-list-item-title>{{ lesson.title }}</v-list-item-title>
                        <template v-slot:append>
                          <v-icon v-if="lessonIsCompleted(lesson.id)" color="success" size="small">
                            mdi-check-circle
                          </v-icon>
                          <span v-if="lesson.duration" class="text-caption text-grey">
                            {{ lesson.duration }}
                          </span>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
            
            <v-card-text v-else class="text-center text-medium-emphasis">
              No hay contenido disponible para este curso.
            </v-card-text>
          </v-card>
        </v-col>
  
        <!-- Sidebar -->
        <v-col cols="12" md="4">
          <!-- Tarjeta de inscripción o progreso -->
          <v-card class="mb-4 sticky-card" elevation="3">
            <v-card-text v-if="isEnrolled">
              <CourseProgress 
                :enrollment="enrollment"
                :course="course"
                :total-lessons="totalLessons"
                :completed-lessons="completedLessons"
                :total-evaluations="totalEvaluations"
              />
            </v-card-text>
  
            <v-card-text v-else>
              <div v-if="!course.isFree" class="price-section mb-4">
                <div v-if="course.hasActiveDiscount" class="d-flex align-center">
                  <div class="text-h5 text-primary font-weight-bold">
                    {{ formattedDiscountedPrice }}
                  </div>
                  <div class="text-decoration-line-through text-caption text-grey ms-2">
                    {{ formattedOriginalPrice }}
                  </div>
                  <v-chip color="error" class="ms-2" size="small">
                    -{{ discountPercentage }}%
                  </v-chip>
                </div>
                <div v-else class="text-h4 text-primary font-weight-bold">
                  {{ formattedOriginalPrice }}
                </div>
              </div>
              <div v-else class="text-h4 text-success font-weight-bold mb-4">
                Gratis
              </div>
  
              <v-btn
                color="primary"
                block
                size="large"
                :loading="enrolling"
                @click="handleEnrollment"
                class="text-capitalize text-weight-bold"
              >
                {{ enrollButtonText }}
              </v-btn>
  
              <div class="mt-4 text-center text-caption">
                <v-icon size="small">mdi-shield-check</v-icon>
                Acceso completo de por vida
              </div>
            </v-card-text>
          </v-card>
  
          <!-- Detalles adicionales -->
          <v-card class="mb-4">
            <v-card-title>Detalles</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title>Fecha de creación</v-list-item-title>
                  <template v-slot:append>
                    {{ formatDate(course.createdAt) }}
                  </template>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-update</v-icon>
                  </template>
                  <v-list-item-title>Última actualización</v-list-item-title>
                  <template v-slot:append>
                    {{ formatDate(course.updatedAt) }}
                  </template>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-account-group</v-icon>
                  </template>
                  <v-list-item-title>Estudiantes inscritos</v-list-item-title>
                  <template v-slot:append>
                    {{ course.enrollmentCount || 0 }}
                  </template>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-translate</v-icon>
                  </template>
                  <v-list-item-title>Idioma</v-list-item-title>
                  <template v-slot:append>
                    {{ course.language || 'Español' }}
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  
    <v-container v-else class="text-center my-8">
      <div class="text-h6">No se encontró el curso.</div>
      <v-btn color="primary" class="mt-4" to="/courses">Ver todos los cursos</v-btn>
    </v-container>
  </template>
  
  <script>
  import { mapState, mapGetters, mapActions } from 'vuex';
  import { formatPrice, formatCourseDuration } from '@/utils/courseUtils';
  import CourseProgress from '@/components/courses/CourseProgress.vue';
  import CourseNavigation from '@/components/courses/CourseNavigation.vue';
  import { coursePlaceholder, avatarPlaceholder } from '@/assets/placeholders';
  
  export default {
    name: 'CourseDetail',
    
    components: {
      CourseProgress,
      CourseNavigation
    },
    
    data() {
      return {
        courseId: this.$route.params.id,
        enrolling: false,
        defaultImage: coursePlaceholder,
        defaultAvatar: avatarPlaceholder
      };
    },
    
    computed: {
      ...mapState({
        loading: state => state.courses.loading,
        error: state => state.courses.error,
        user: state => state.user
      }),
      
      ...mapGetters({
        isAuthenticated: 'isAuthenticated'
      }),
      
      course() {
        return this.$store.getters['courses/currentCourse'];
      },
      
      isEnrolled() {
        if (!this.isAuthenticated || !this.user) return false;
        
        // Verificar si el curso está en la lista de inscripciones del usuario
        const enrolledCourses = this.$store.getters['courses/enrolledCourses'];
        return enrolledCourses.some(course => course.id === this.courseId);
      },
      
      enrollment() {
        if (!this.isAuthenticated || !this.user) return null;
        
        const enrolledCourses = this.$store.getters['courses/enrolledCourses'];
        return enrolledCourses.find(course => course.id === this.courseId) || {};
      },
      
      breadcrumbs() {
        return [
          {
            title: 'Inicio',
            disabled: false,
            to: '/'
          },
          {
            title: 'Cursos',
            disabled: false,
            to: '/courses'
          },
          {
            title: this.course?.title || 'Detalle de curso',
            disabled: true
          }
        ];
      },
      
      courseDuration() {
        return formatCourseDuration(this.course);
      },
      
      formattedOriginalPrice() {
        return formatPrice(this.course?.totalPrice);
      },
      
      formattedDiscountedPrice() {
        return formatPrice(this.course?.discountedTotalPrice);
      },
      
      discountPercentage() {
        if (!this.course || !this.course.hasActiveDiscount) return 0;
        const original = this.course.totalPrice;
        const discounted = this.course.discountedTotalPrice;
        return Math.round(((original - discounted) / original) * 100);
      },
      
      enrollButtonText() {
        if (!this.isAuthenticated) return 'Inicia sesión para inscribirte';
        if (this.course?.isFree) return 'Inscribirse gratis';
        return 'Comprar ahora';
      },
      
      totalLessons() {
        if (!this.course?.modules) return 0;
        return this.course.modules.reduce((count, module) => {
          return count + (module.lessons?.length || 0);
        }, 0);
      },
      
      totalEvaluations() {
        if (!this.course?.modules) return 0;
        return this.course.modules.reduce((count, module) => {
          if (!module.lessons) return count;
          return count + module.lessons.filter(lesson => 
            lesson.type === 'quiz' || lesson.type === 'assignment'
          ).length;
        }, 0);
      },
      
      completedLessons() {
        if (!this.enrollment || !this.enrollment.completedLessons) return 0;
        return this.enrollment.completedLessons.length;
      }
    },
    
    created() {
      this.fetchCourseData();
      
      // Si el usuario está autenticado, cargar los cursos inscritos
      if (this.isAuthenticated) {
        this.$store.dispatch('courses/fetchEnrolledCourses');
      }
    },
    
    methods: {
      ...mapActions('courses', ['fetchCourse', 'enrollInCourse', 'initiatePurchase']),
      
      async fetchCourseData() {
        try {
          await this.fetchCourse(this.courseId);
        } catch (error) {
          console.error('Error al cargar el curso:', error);
        }
      },
      
      async handleEnrollment() {
        if (!this.isAuthenticated) {
          // Redirigir al login con redirect de vuelta a esta página
          this.$router.push({
            path: '/login',
            query: { redirect: this.$route.fullPath }
          });
          return;
        }
        
        this.enrolling = true;
        
        try {
          if (this.course.isFree) {
            await this.enrollInCourse(this.courseId);
            this.$router.push(`/courses/${this.courseId}/content`);
          } else {
            // Iniciar proceso de compra
            const result = await this.initiatePurchase(this.courseId);
            
            // Redirigir a la página de pago o procesar según la respuesta
            if (result && result.paymentUrl) {
              window.location.href = result.paymentUrl;
            }
          }
        } catch (error) {
          console.error('Error al inscribirse:', error);
        } finally {
          this.enrolling = false;
        }
      },
      
      formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
      },
      
      getLessonIcon(lesson) {
        const type = lesson.type || 'video';
        
        switch (type) {
          case 'video':
            return 'mdi-play-circle';
          case 'reading':
            return 'mdi-file-document';
          case 'quiz':
            return 'mdi-clipboard-list';
          case 'assignment':
            return 'mdi-pencil-box';
          default:
            return 'mdi-bookmark';
        }
      },
      
      lessonIsCompleted(lessonId) {
        if (!this.enrollment || !this.enrollment.completedLessons) return false;
        return this.enrollment.completedLessons.includes(lessonId);
      }
    }
  };
  </script>
  
  <style scoped>
  .sticky-card {
    position: sticky;
    top: 80px;
  }
  
  @media (max-width: 960px) {
    .sticky-card {
      position: static;
    }
  }
  
  .price-section {
    font-size: 1.5rem;
  }
  </style>