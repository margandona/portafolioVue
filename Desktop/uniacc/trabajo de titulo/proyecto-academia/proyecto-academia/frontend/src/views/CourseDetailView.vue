<template>
  <div class="course-detail-page">
    <h1 class="course-title">{{ course.title }}</h1>
    <p class="course-description">{{ course.description }}</p>
    <p><strong>Categoría:</strong> {{ course.category }}</p>
    <p><strong>Modalidad:</strong> {{ course.modality }}</p>
    <p v-if="course.duration_days"><strong>Duración:</strong> {{ course.duration_days }} días</p>
    <p v-if="course.start_date && course.end_date">
      <strong>Inicio:</strong> {{ formatDate(course.start_date) }} <br />
      <strong>Fin:</strong> {{ formatDate(course.end_date) }}
    </p>

    <!-- Progreso del usuario -->
    <div v-if="enrollment">
      <h3>Progreso</h3>
      <ProgressBar :progress="enrollment.progress" />
      <p>{{ enrollment.progress }}% completado</p>
    </div>

    <!-- Evaluaciones -->
    <div v-if="evaluations.length > 0">
      <h3>Evaluaciones</h3>
      <ul class="evaluation-list">
        <li v-for="evaluation in evaluations" :key="evaluation.id">
          <p><strong>{{ evaluation.title }}</strong></p>
          <button
            v-if="!completedEvaluations.includes(evaluation.id)"
            class="btn btn-primary"
            @click="startEvaluation(evaluation.id)"
          >
            Comenzar Evaluación
          </button>
          <span v-else class="completed-label">Completado</span>
        </li>
      </ul>
    </div>
    <p v-else>No hay evaluaciones disponibles para este curso.</p>

    <!-- Estudiantes inscritos -->
    <div v-if="isTeacherOrAdmin && enrolledStudents.length > 0">
      <h3>Estudiantes Inscritos</h3>
      <table class="students-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Progreso</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in enrolledStudents" :key="student.id">
            <td>{{ student.name }}</td>
            <td>{{ student.email }}</td>
            <td>{{ student.progress }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="isTeacherOrAdmin && enrolledStudents.length === 0">
      No hay estudiantes inscritos en este curso.
    </p>

    <div class="action-buttons">
      <button class="btn btn-secondary" @click="goBack">Volver a Mis Cursos</button>
      <button
        v-if="isTeacherOrAdmin"
        class="btn btn-primary"
        @click="editCourse"
      >
        Editar Curso
      </button>
      <button
        v-if="isTeacherOrAdmin"
        class="btn btn-danger"
        @click="deleteCourse"
      >
        Eliminar Curso
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ProgressBar from "@/components/ProgressBarComponent.vue";

export default {
  name: "CourseDetailView",
  components: {
    ProgressBar,
  },
  data() {
    return {
      course: {},
      enrollment: null,
      evaluations: [],
      completedEvaluations: [],
      enrolledStudents: [],
      isTeacherOrAdmin: false,
      isLoading: true,
      error: null,
    };
  },
  async created() {
    const courseId = this.$route.params.id;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No estás autenticado.");
      this.$router.push("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      this.isLoading = true;

      const [courseResponse, enrollmentsResponse, evaluationsResponse] = await Promise.all([
        axios.get(`/api/courses/${courseId}`, { headers }),
        axios.get(`/api/enrollments`, { headers }),
        axios.get(`/api/evaluations/course/${courseId}`, { headers }),
      ]);

      this.course = courseResponse.data;
      this.enrollment = enrollmentsResponse.data.find(
        (e) => e.course_id === parseInt(courseId)
      );
      this.evaluations = evaluationsResponse.data.data || [];

      this.isTeacherOrAdmin =
        this.course.teacher_id === localStorage.getItem("user_id") ||
        localStorage.getItem("role") === "admin";

      if (this.isTeacherOrAdmin) {
        const { data: students } = await axios.get(`/api/courses/${courseId}/students`, {
          headers,
        });
        this.enrolledStudents = students;
      }

      this.completedEvaluations = this.enrollment?.completed_evaluations || [];
    } catch (error) {
      this.error = error.response?.data?.message || error.message;
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    goBack() {
      this.$router.push("/courses");
    },
    editCourse() {
      this.$router.push(`/courses/edit/${this.course.id}`);
    },
    async deleteCourse() {
      if (confirm("¿Estás seguro de eliminar este curso?")) {
        try {
          await axios.delete(`/api/courses/${this.course.id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          alert("Curso eliminado exitosamente.");
          this.$router.push("/courses");
        } catch (error) {
          alert("No se pudo eliminar el curso.");
        }
      }
    },
    startEvaluation(evaluationId) {
      alert(`Comenzando evaluación con ID: ${evaluationId}`);
    },
    formatDate(date) {
      if (!date) return "Fecha no disponible";
      return new Date(date).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
};
</script>

<style scoped>
.course-detail-page {
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.course-title {
  font-family: "Playfair Display", serif;
  font-size: 28px;
  color: #2a3b5f;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.students-table th,
.students-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.students-table th {
  background-color: #2e8b57;
  color: white;
}

.students-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.students-table tr:hover {
  background-color: #f1f1f1;
}
</style>
