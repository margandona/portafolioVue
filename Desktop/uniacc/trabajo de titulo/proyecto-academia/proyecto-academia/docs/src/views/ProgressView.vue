<template>
  <div class="progress-view">
    <h1 class="title">Progreso en Cursos</h1>
    <p class="description">
      Visualiza tu progreso en los cursos en los que estás inscrito y revisa las evaluaciones realizadas y pendientes.
    </p>

    <!-- Indicador de carga -->
    <div v-if="isLoading" class="loading-spinner">Cargando datos...</div>

    <!-- Lista de cursos con progreso -->
    <div v-else-if="filteredEnrollments.length > 0" class="progress-list">
      <div
        v-for="enrollment in filteredEnrollments"
        :key="enrollment.id"
        class="progress-card"
      >
        <h2 class="course-title">{{ enrollment.Course?.title || "Curso no disponible" }}</h2>
        <p class="course-category">{{ enrollment.Course?.category || "Sin categoría" }}</p>
        <ProgressBar :progress="enrollment.progress || 0" />
        <div class="evaluation-list" v-if="userRole === 'student'">
          <h3>Evaluaciones:</h3>
          <ul>
            <li
              v-for="evaluation in enrollment.Course?.evaluations || []"
              :key="evaluation.id"
              :class="{ completed: completedEvaluations.includes(evaluation.id) }"
            >
              <span>{{ evaluation.title }}</span>
              <button
                v-if="!completedEvaluations.includes(evaluation.id)"
                class="btn btn-primary"
                @click="completeEvaluation(evaluation.id, enrollment.id)"
              >
                Realizar
              </button>
            </li>
          </ul>
        </div>
        <div class="teacher-actions" v-if="userRole === 'teacher'">
          <button class="btn btn-warning" @click="goToCourseEvaluations(enrollment.Course.id)">
            Ver Evaluaciones
          </button>
        </div>
      </div>
    </div>

    <!-- Sin inscripciones -->
    <div v-else class="no-enrollments">
      <p>No estás inscrito en ningún curso aún.</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ProgressBar from "@/components/ProgressBarComponent.vue";

export default {
  name: "ProgressView",
  components: {
    ProgressBar,
  },
  data() {
    return {
      enrollments: [],
      completedEvaluations: [],
      userRole: "",
      userId: "",
      isLoading: false,
    };
  },
  computed: {
    filteredEnrollments() {
      if (this.userRole === "student") {
        return this.enrollments;
      }
      if (this.userRole === "teacher") {
        return this.enrollments.filter(
          (enrollment) => enrollment.Course?.teacher_id === this.userId
        );
      }
      return this.enrollments;
    },
  },
  async created() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        this.$router.push("/login");
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      this.userRole = payload.role || "";
      this.userId = payload.id || "";

      this.isLoading = true;

      // Obtener inscripciones
      const { data: enrollments } = await axios.get("/api/enrollments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      this.enrollments = enrollments;

      // Obtener evaluaciones completadas si es estudiante
      if (this.userRole === "student") {
        const { data: completedEvaluations } = await axios.get(
          "/api/evaluations/completed",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.completedEvaluations = Array.isArray(completedEvaluations)
          ? completedEvaluations.map((e) => e.id)
          : [];
      }
    } catch (error) {
      console.error("Error al cargar los datos de progreso:", error);
      alert("No se pudieron cargar los datos.");
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    async completeEvaluation(evaluationId, enrollmentId) {
      try {
        await axios.post(
          "/api/evaluations/complete",
          { evaluation_id: evaluationId, enrollment_id: enrollmentId },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        this.completedEvaluations.push(evaluationId);
        alert("Evaluación completada con éxito.");
      } catch (error) {
        console.error("Error al completar la evaluación:", error);
        alert("No se pudo completar la evaluación.");
      }
    },
    goToCourseEvaluations(courseId) {
      this.$router.push(`/courses/${courseId}/evaluations`);
    },
  },
};
</script>

<style scoped>
.progress-view {
  padding: 20px;
  background-color: #f9f9f9;
  min-height: 100vh;
}

.title {
  font-family: "Playfair Display", serif;
  font-size: 28px;
  color: #2a3b5f;
  text-align: center;
  margin-bottom: 10px;
}

.description {
  font-family: "Roboto", sans-serif;
  font-size: 16px;
  color: #6c757d;
  text-align: center;
  margin-bottom: 20px;
}

.progress-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.progress-card {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.course-title {
  font-size: 18px;
  color: #2a3b5f;
  margin-bottom: 10px;
  font-weight: bold;
}

.course-category {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 15px;
}

.evaluation-list ul {
  list-style: none;
  padding: 0;
}

.evaluation-list li.completed span {
  text-decoration: line-through;
  color: #999;
}

.loading-spinner {
  text-align: center;
  font-size: 18px;
  color: #2e8b57;
}
</style>
