<template>
  <div class="dashboard" aria-labelledby="dashboard-title">
    <div class="container">
      <h1 id="dashboard-title">Bienvenido al Dashboard, {{ userName }}</h1>
      <p>Aquí puedes gestionar tus cursos, evaluaciones, perfil y más.</p>

      <div class="dashboard-sections" role="navigation" aria-label="Secciones del Dashboard">
        <!-- Sección de Perfil -->
        <div class="section" role="region" aria-labelledby="profile-section-title">
          <h2 id="profile-section-title">Perfil</h2>
          <button
            class="btn btn-primary"
            @click="navigateTo('/profile')"
            aria-label="Ir al perfil"
          >
            Ver Perfil
          </button>
        </div>

        <!-- Sección de Cursos -->
        <div
          v-if="['student', 'teacher', 'admin'].includes(userRole)"
          class="section"
          role="region"
          aria-labelledby="courses-section-title"
        >
          <h2 id="courses-section-title">Cursos</h2>
          <button
            v-if="userRole === 'student'"
            class="btn btn-info"
            @click="navigateTo('/enroll')"
            aria-label="Inscribirse en cursos"
          >
            Inscribirse a Cursos
          </button>
          <button
            class="btn btn-secondary"
            @click="navigateTo('/courses')"
            aria-label="Ver mis cursos"
          >
            Mis Cursos
          </button>
          <button
            v-if="userRole === 'student'"
            class="btn btn-warning"
            @click="navigateTo('/progress')"
            aria-label="Ver progreso"
          >
            Ver Progreso
          </button>
          <button
            v-if="userRole === 'teacher' || userRole === 'admin'"
            class="btn btn-success"
            @click="navigateTo('/courses/create')"
            aria-label="Crear nuevo curso"
          >
            Crear Cursos
          </button>
          <button
            v-if="userRole === 'teacher'"
            class="btn btn-info"
            @click="navigateTo('/courses/students')"
            aria-label="Gestionar estudiantes inscritos"
          >
            Gestionar Estudiantes
          </button>
        </div>

        <!-- Sección de Evaluaciones -->
        <div
          v-if="['student', 'teacher', 'admin'].includes(userRole)"
          class="section"
          role="region"
          aria-labelledby="evaluations-section-title"
        >
          <h2 id="evaluations-section-title">Evaluaciones</h2>
          <button
            v-if="userRole === 'student'"
            class="btn btn-success"
            @click="navigateTo('/evaluations')"
            aria-label="Realizar evaluaciones"
          >
            Realizar Evaluaciones
          </button>
          <button
            class="btn btn-warning"
            @click="navigateTo('/results')"
            aria-label="Ver resultados de evaluaciones"
          >
            Ver Resultados
          </button>
          <button
            v-if="userRole === 'teacher' || userRole === 'admin'"
            class="btn btn-primary"
            @click="navigateTo('/evaluations/manage')"
            aria-label="Gestionar evaluaciones"
          >
            Gestionar Evaluaciones
          </button>
        </div>

        <!-- Sección de Administración -->
        <div
          v-if="userRole === 'admin'"
          class="section"
          role="region"
          aria-labelledby="admin-section-title"
        >
          <h2 id="admin-section-title">Administración</h2>
          <button
            class="btn btn-danger"
            @click="navigateTo('/admin/users')"
            aria-label="Administrar usuarios"
          >
            Administrar Usuarios
          </button>
          <button
            class="btn btn-info"
            @click="navigateTo('/admin/enrollments')"
            aria-label="Gestionar inscripciones"
          >
            Gestionar Inscripciones
          </button>
        </div>

        <!-- Próximamente -->
        <div class="section" role="region" aria-labelledby="future-section-title">
          <h2 id="future-section-title">Otras Funcionalidades</h2>
          <button
            class="btn btn-success"
            @click="futureFeature"
            aria-label="Funcionalidades futuras"
          >
            Próximamente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardView",
  data() {
    return {
      userName: "Usuario",
      userRole: "",
    };
  },
  created() {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token no encontrado. Redirigiendo al Login.");
      this.$router.push("/login");
    } else {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        this.userName = payload.name || "Usuario";
        this.userRole = payload.role || "";
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        this.$router.push("/login");
      }
    }
  },
  methods: {
    navigateTo(route) {
      this.$router.push(route);
    },
    futureFeature() {
      alert("Esta funcionalidad estará disponible pronto.");
    },
  },
};
</script>

<style scoped>
/* Conserva los estilos previos */
.dashboard {
  text-align: center;
  margin-top: 50px;
}

.dashboard h1 {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  color: #2E8B57;
}

.dashboard p {
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  color: #333333;
  margin-bottom: 30px;
}

.dashboard-sections {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.section {
  text-align: center;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  width: 300px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section h2 {
  font-family: 'Roboto', sans-serif;
  font-size: 20px;
  color: #2A3B5F;
  margin-bottom: 15px;
}

.btn {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  margin-top: 10px;
  display: block;
  width: 100%;
}
</style>
