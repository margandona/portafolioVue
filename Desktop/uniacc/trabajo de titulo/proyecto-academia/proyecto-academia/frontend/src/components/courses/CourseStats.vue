<template>
  <div class="course-stats">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">mdi-chart-box</v-icon>
        Estadísticas del Curso
        <v-spacer></v-spacer>
        <v-btn size="small" icon @click="refreshData">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-divider></v-divider>
      
      <v-card-text>
        <v-row>
          <!-- Estudiantes -->
          <v-col cols="12" md="6" lg="3">
            <div class="stat-card pa-3 rounded">
              <div class="d-flex flex-column align-center">
                <div class="text-overline text-grey">Estudiantes</div>
                <div class="text-h4">{{ stats.totalEnrollments || 0 }}</div>
                <div class="d-flex justify-center mt-2">
                  <v-chip color="success" size="small">
                    <span>Activos: {{ stats.activeEnrollments || 0 }}</span>
                  </v-chip>
                  <v-chip color="primary" size="small" class="ml-2">
                    <span>Completados: {{ stats.completedEnrollments || 0 }}</span>
                  </v-chip>
                </div>
              </div>
            </div>
          </v-col>
          
          <!-- Progreso promedio -->
          <v-col cols="12" md="6" lg="3">
            <div class="stat-card pa-3 rounded">
              <div class="d-flex flex-column align-center">
                <div class="text-overline text-grey">Progreso promedio</div>
                <div class="text-h4">{{ stats.averageProgress || 0 }}%</div>
                <v-progress-linear
                  :model-value="stats.averageProgress || 0"
                  height="8"
                  rounded
                  color="primary"
                  class="mt-2 w-100"
                ></v-progress-linear>
              </div>
            </div>
          </v-col>
          
          <!-- Calificación promedio -->
          <v-col cols="12" md="6" lg="3">
            <div class="stat-card pa-3 rounded">
              <div class="d-flex flex-column align-center">
                <div class="text-overline text-grey">Calificación promedio</div>
                <div class="text-h4">{{ stats.averageGrade || 0 }}</div>
                <div class="rating-stars mt-2">
                  <v-icon
                    v-for="n in 5"
                    :key="n"
                    :color="n <= Math.round(stats.averageGrade / 20) ? 'amber' : 'grey'"
                    size="small"
                  >
                    mdi-star
                  </v-icon>
                </div>
              </div>
            </div>
          </v-col>
          
          <!-- Certificados emitidos -->
          <v-col cols="12" md="6" lg="3">
            <div class="stat-card pa-3 rounded">
              <div class="d-flex flex-column align-center">
                <div class="text-overline text-grey">Certificados emitidos</div>
                <div class="text-h4">{{ stats.certificatesIssued || 0 }}</div>
                <v-chip color="info" size="small" class="mt-2">
                  <span>{{ certificatePercentage }}% de estudiantes</span>
                </v-chip>
              </div>
            </div>
          </v-col>
        </v-row>
        
        <v-divider class="my-4"></v-divider>
        
        <v-row>
          <!-- Gráfico de tipos de inscripción -->
          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">Tipos de inscripciones</h3>
            <div class="chart-container">
              <div v-if="stats.byEnrollmentType" class="pa-3">
                <v-progress-linear
                  v-for="(value, key) in stats.byEnrollmentType"
                  :key="key"
                  :model-value="calculatePercentage(value, stats.totalEnrollments)"
                  height="20"
                  :color="getEnrollmentTypeColor(key)"
                  class="mb-2"
                  rounded
                >
                  <template v-slot:default="{ value }">
                    <span class="font-weight-bold">{{ formatEnrollmentType(key) }}: {{ value.toFixed(0) }}%</span>
                  </template>
                </v-progress-linear>
                
                <div class="text-caption text-grey mt-2">
                  <div><span class="dot free-dot"></span> Gratis: {{ stats.byEnrollmentType.free || 0 }}</div>
                  <div><span class="dot paid-dot"></span> Pagos: {{ stats.byEnrollmentType.paid || 0 }}</div>
                  <div><span class="dot assigned-dot"></span> Asignados: {{ stats.byEnrollmentType.assigned || 0 }}</div>
                </div>
              </div>
              
              <div v-else class="text-center py-4">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <div class="mt-2">Cargando datos...</div>
              </div>
            </div>
          </v-col>
          
          <!-- Gráfico de estado de inscripciones -->
          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">Estado de inscripciones</h3>
            <div class="chart-container">
              <div v-if="stats.totalEnrollments" class="pa-3">
                <v-progress-linear
                  :model-value="calculatePercentage(stats.activeEnrollments, stats.totalEnrollments)"
                  height="20"
                  color="success"
                  class="mb-2"
                  rounded
                >
                  <template v-slot:default="{ value }">
                    <span class="font-weight-bold">Activo: {{ value.toFixed(0) }}%</span>
                  </template>
                </v-progress-linear>
                
                <v-progress-linear
                  :model-value="calculatePercentage(stats.completedEnrollments, stats.totalEnrollments)"
                  height="20"
                  color="primary"
                  class="mb-2"
                  rounded
                >
                  <template v-slot:default="{ value }">
                    <span class="font-weight-bold">Completado: {{ value.toFixed(0) }}%</span>
                  </template>
                </v-progress-linear>
                
                <v-progress-linear
                  :model-value="calculatePercentage(stats.droppedEnrollments, stats.totalEnrollments)"
                  height="20"
                  color="grey"
                  class="mb-2"
                  rounded
                >
                  <template v-slot:default="{ value }">
                    <span class="font-weight-bold">Abandonado: {{ value.toFixed(0) }}%</span>
                  </template>
                </v-progress-linear>
                
                <div class="text-caption text-grey mt-2">
                  <div><span class="dot active-dot"></span> Activos: {{ stats.activeEnrollments || 0 }}</div>
                  <div><span class="dot completed-dot"></span> Completados: {{ stats.completedEnrollments || 0 }}</div>
                  <div><span class="dot dropped-dot"></span> Abandonados: {{ stats.droppedEnrollments || 0 }}</div>
                </div>
              </div>
              
              <div v-else class="text-center py-4">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <div class="mt-2">Cargando datos...</div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'CourseStats',
  
  props: {
    courseId: {
      type: String,
      required: true
    }
  },
  
  data() {
    return {
      stats: {
        totalEnrollments: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        droppedEnrollments: 0,
        averageProgress: 0,
        averageGrade: 0,
        certificatesIssued: 0,
        byEnrollmentType: {
          free: 0,
          paid: 0,
          assigned: 0
        }
      },
      loading: false
    };
  },
  
  computed: {
    certificatePercentage() {
      if (!this.stats.totalEnrollments) return 0;
      return Math.round((this.stats.certificatesIssued / this.stats.totalEnrollments) * 100);
    }
  },
  
  mounted() {
    this.fetchStats();
  },
  
  methods: {
    ...mapActions('courses', ['fetchCourseStats']),
    
    async fetchStats() {
      this.loading = true;
      
      try {
        const response = await this.fetchCourseStats(this.courseId);
        this.stats = {
          ...this.stats,
          ...response
        };
      } catch (error) {
        console.error('Error al obtener estadísticas del curso:', error);
      } finally {
        this.loading = false;
      }
    },
    
    refreshData() {
      this.fetchStats();
    },
    
    calculatePercentage(value, total) {
      if (!total) return 0;
      return (value / total) * 100;
    },
    
    getEnrollmentTypeColor(type) {
      const colors = {
        free: 'success',
        paid: 'primary',
        assigned: 'warning'
      };
      return colors[type] || 'grey';
    },
    
    formatEnrollmentType(type) {
      const labels = {
        free: 'Inscripción gratuita',
        paid: 'Inscripción pagada',
        assigned: 'Acceso asignado'
      };
      return labels[type] || type;
    }
  }
};
</script>

<style scoped>
.course-stats {
  margin-bottom: 2rem;
}

.stat-card {
  background-color: #f5f5f5;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  height: 200px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.free-dot {
  background-color: green;
}

.paid-dot {
  background-color: blue;
}

.assigned-dot {
  background-color: orange;
}

.active-dot {
  background-color: green;
}

.completed-dot {
  background-color: blue;
}

.dropped-dot {
  background-color: grey;
}

.w-100 {
  width: 100%;
}
</style>
