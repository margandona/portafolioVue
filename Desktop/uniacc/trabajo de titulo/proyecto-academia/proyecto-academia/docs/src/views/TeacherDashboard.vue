<template>
  <div class="teacher-dashboard">
    <h1>Dashboard del Profesor</h1>
    
    <div class="dashboard-summary">
      <div class="summary-card">
        <div class="summary-icon">
          <i class="fas fa-chalkboard-teacher"></i>
        </div>
        <div class="summary-content">
          <h3>{{ totalCourses }}</h3>
          <p>Cursos Creados</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="summary-content">
          <h3>{{ totalStudents }}</h3>
          <p>Estudiantes Totales</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="summary-content">
          <h3>{{ averageProgress }}%</h3>
          <p>Progreso Promedio</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">
          <i class="fas fa-certificate"></i>
        </div>
        <div class="summary-content">
          <h3>{{ completedCourses }}</h3>
          <p>Cursos Completados</p>
        </div>
      </div>
    </div>

    <div class="dashboard-sections">
      <div class="section">
        <div class="section-header">
          <h2>Mis Cursos</h2>
          <router-link to="/teacher/courses" class="view-all">Ver Todos</router-link>
        </div>
        <CoursesList 
          :isLoading="isLoading" 
          :courses="teacherCourses" 
          @edit="editCourse"
          @view-details="viewCourseDetails" 
        />
        <div class="section-actions">
          <button class="btn btn-primary" @click="$router.push('/courses/create')">
            <i class="fas fa-plus"></i> Crear Nuevo Curso
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2>Inscripciones Recientes</h2>
          <router-link to="/teacher/enrollments" class="view-all">Ver Todas</router-link>
        </div>
        <EnrollmentsList 
          :isLoading="isLoading" 
          :enrollments="recentEnrollments" 
          @view-student="viewStudentDetails"
          @grade="gradeStudent" 
        />
      </div>
    </div>
  </div>
</template>

<script>
import CoursesList from '@/components/CoursesList.vue';
import EnrollmentsList from '@/components/EnrollmentsList.vue';
import api from '@/utils/api';

export default {
  name: 'TeacherDashboard',
  components: {
    CoursesList,
    EnrollmentsList
  },
  data() {
    return {
      isLoading: true,
      teacherCourses: [],
      recentEnrollments: [],
      totalStudents: 0,
      error: null,
      averageProgress: 0,
      completedCourses: 0
    };
  },
  computed: {
    totalCourses() {
      return this.teacherCourses.length;
    }
  },
  async created() {
    await this.loadDashboardData();
  },
  methods: {
    async loadDashboardData() {
      this.isLoading = true;
      try {
        // Cargar cursos del profesor
        const coursesResponse = await api.courses.getByTeacher();
        this.teacherCourses = coursesResponse.data || [];
        
        // Cargar inscripciones recientes
        let allEnrollments = [];
        this.completedCourses = 0;
        let totalProgress = 0;
        let progressCount = 0;
        
        // Para cada curso, obtener sus inscripciones
        for (const course of this.teacherCourses) {
          try {
            const enrollmentsResponse = await api.enrollments.getByCourse(course.id);
            const courseEnrollments = enrollmentsResponse.data || [];
            
            // Contar estudiantes completados
            this.completedCourses += courseEnrollments.filter(e => e.status === 'completed').length;
            
            // Acumular progreso para calcular promedio
            courseEnrollments.forEach(enrollment => {
              if (enrollment.progress !== undefined) {
                totalProgress += enrollment.progress;
                progressCount++;
              }
            });
            
            allEnrollments = [...allEnrollments, ...courseEnrollments];
          } catch (error) {
            console.error(`Error obteniendo inscripciones para el curso ${course.id}:`, error);
          }
        }
        
        // Ordenar por fecha de inscripción más reciente
        this.recentEnrollments = allEnrollments
          .sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0))
          .slice(0, 10); // Mostrar solo las 10 más recientes
        
        // Calcular total de estudiantes (eliminar duplicados)
        const uniqueStudentIds = new Set(allEnrollments.map(e => e.userId));
        this.totalStudents = uniqueStudentIds.size;
        
        // Calcular progreso promedio
        this.averageProgress = progressCount > 0 
          ? Math.round(totalProgress / progressCount) 
          : 0;
        
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        this.error = error.response?.data?.message || 'Error al cargar los datos del dashboard';
      } finally {
        this.isLoading = false;
      }
    },
    
    editCourse(courseId) {
      this.$router.push(`/courses/edit/${courseId}`);
    },
    
    viewCourseDetails(courseId) {
      this.$router.push(`/courses/${courseId}`);
    },
    
    viewStudentDetails(enrollmentId, studentId) {
      this.$router.push(`/students/${studentId}?enrollmentId=${enrollmentId}`);
    },
    
    gradeStudent(enrollmentId) {
      this.$router.push(`/enrollments/${enrollmentId}/grade`);
    }
  }
};
</script>

<style scoped>
.teacher-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2A3B5F;
  font-family: "Playfair Display", serif;
  margin-bottom: 30px;
  text-align: center;
}

.dashboard-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  display: flex;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.summary-icon {
  width: 50px;
  height: 50px;
  background-color: rgba(46, 139, 87, 0.1);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.summary-icon i {
  font-size: 22px;
  color: #2E8B57;
}

.summary-content h3 {
  font-size: 24px;
  font-weight: 700;
  color: #2A3B5F;
  margin: 0;
}

.summary-content p {
  margin: 5px 0 0;
  color: #6c757d;
  font-size: 14px;
}

.dashboard-sections {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

@media (min-width: 992px) {
  .dashboard-sections {
    grid-template-columns: 1fr 1fr;
  }
}

.section {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eaeaea;
}

.section-header h2 {
  font-family: "Playfair Display", serif;
  color: #2A3B5F;
  margin: 0;
  font-size: 18px;
}

.view-all {
  color: #2E8B57;
  text-decoration: none;
  font-size: 14px;
}

.section-actions {
  display: flex;
  justify-content: center;
  padding: 15px;
  border-top: 1px solid #eaeaea;
}

.btn {
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #2E8B57;
  color: white;
}

.btn-primary:hover {
  background-color: #3AA870;
}

.btn i {
  margin-right: 5px;
}
</style>
