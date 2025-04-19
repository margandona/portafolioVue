import { createStore } from "vuex";
import axios from "axios";

const store = createStore({
  state: {
    user: {
      id: null,
      name: "",
      role: "",
      token: localStorage.getItem("token") || null,
    },
    courses: [],
    enrolledCourses: [],
    evaluations: [],
    students: [],
    users: [],
    isLoading: false,
    errorMessage: null,
  },
  getters: {
    isAuthenticated: (state) => !!state.user.token,
    userRole: (state) => state.user.role,
    getUser: (state) => state.user,
    getToken: (state) => state.user.token, // Getter centralizado para el token
    getCourses: (state) => state.courses,
    getEnrolledCourses: (state) => state.enrolledCourses,
    getEvaluations: (state) => state.evaluations,
    getStudents: (state) => state.students,
    getUsers: (state) => state.users,
    isLoading: (state) => state.isLoading,
    getErrorMessage: (state) => state.errorMessage,
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_TOKEN(state, token) {
      state.user.token = token;
      localStorage.setItem("token", token);
    },
    CLEAR_USER(state) {
      state.user = { id: null, name: "", role: "", token: null };
      localStorage.removeItem("token");
    },
    SET_COURSES(state, courses) {
      state.courses = courses;
    },
    SET_ENROLLED_COURSES(state, enrolledCourses) {
      state.enrolledCourses = enrolledCourses;
    },
    SET_EVALUATIONS(state, evaluations) {
      state.evaluations = evaluations;
    },
    SET_STUDENTS(state, students) {
      state.students = students;
    },
    SET_USERS(state, users) {
      state.users = users;
    },
    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading;
    },
    SET_ERROR(state, errorMessage) {
      state.errorMessage = errorMessage;
    },
    CLEAR_ERROR(state) {
      state.errorMessage = null;
    },
  },
  actions: {
    async apiRequest({ commit, getters }, { method, url, data = null }) {
      try {
        commit("SET_LOADING", true);
        const response = await axios({
          method,
          url,
          data,
          headers: { Authorization: `Bearer ${getters.getToken}` },
        });
        return response.data;
      } catch (error) {
        const message =
          error.response?.data?.message || "Error en la solicitud.";
        commit("SET_ERROR", message);
        throw new Error(message);
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async login({ commit }, credentials) {
      try {
        const data = await this.dispatch("apiRequest", {
          method: "post",
          url: "/api/auth/login",
          data: credentials,
        });
        commit("SET_TOKEN", data.token);
        commit("SET_USER", data.user);
      } catch (error) {
        console.error("Error en el inicio de sesión:", error);
      }
    },
    async logout({ commit }) {
      commit("CLEAR_USER");
    },
    async fetchCourses({ commit }) {
      try {
        const data = await this.dispatch("apiRequest", {
          method: "get",
          url: "/api/courses",
        });
        commit("SET_COURSES", data);
      } catch (error) {
        console.error("Error al cargar cursos:", error);
      }
    },
    async fetchEnrolledCourses({ commit }) {
      try {
        const data = await this.dispatch("apiRequest", {
          method: "get",
          url: "/api/courses/enrolled",
        });
        commit("SET_ENROLLED_COURSES", data);
      } catch (error) {
        console.error("Error al cargar cursos inscritos:", error);
      }
    },
    async fetchEvaluations({ commit }, courseId) {
      try {
        const data = await this.dispatch("apiRequest", {
          method: "get",
          url: `/api/evaluations/course/${courseId}`,
        });
        commit("SET_EVALUATIONS", data.data || []);
      } catch (error) {
        console.error("Error al cargar evaluaciones:", error);
      }
    },
    async fetchStudents({ commit }, courseId) {
      try {
        const data = await this.dispatch("apiRequest", {
          method: "get",
          url: `/api/courses/${courseId}/students`,
        });
        commit("SET_STUDENTS", data || []);
      } catch (error) {
        console.error("Error al cargar estudiantes:", error);
      }
    },
    async fetchUsers({ commit }) {
      try {
        const data = await this.dispatch("apiRequest", {
          method: "get",
          url: "/api/users",
        });
        commit("SET_USERS", data);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    },
    async deleteUser({ dispatch }, userId) {
      try {
        await this.dispatch("apiRequest", {
          method: "delete",
          url: `/api/users/${userId}`,
        });
        await dispatch("fetchUsers");
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
      }
    },
  },
});

export default store;
