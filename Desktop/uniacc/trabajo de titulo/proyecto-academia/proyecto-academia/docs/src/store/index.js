import { createStore } from "vuex";
import api from "../utils/api";

const API_BASE_URL = "https://us-central1-casiangelesydemonios.cloudfunctions.net/api";

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
    availableCourses: [],
    currentCourse: null,
    evaluations: [],
    students: [],
    users: [],
    isLoading: false,
    errorMessage: null,
    // Sales related
    sales: [],
    pendingSales: [],
    completedSales: [],
    currentSale: null,
  },
  getters: {
    isAuthenticated: (state) => !!state.user.token,
    userRole: (state) => state.user.role,
    getUser: (state) => state.user,
    getToken: (state) => state.user.token,
    getCourses: (state) => state.courses,
    getEnrolledCourses: (state) => state.enrolledCourses,
    getAvailableCourses: (state) => state.availableCourses,
    getCurrentCourse: (state) => state.currentCourse,
    getEvaluations: (state) => state.evaluations,
    getStudents: (state) => state.students,
    getUsers: (state) => state.users,
    isLoading: (state) => state.isLoading,
    getErrorMessage: (state) => state.errorMessage,
    // Sales getters
    getSales: (state) => state.sales,
    getPendingSales: (state) => state.pendingSales,
    getCompletedSales: (state) => state.completedSales,
    getCurrentSale: (state) => state.currentSale,
    // Computed getters
    freeCourses: (state) => state.availableCourses.filter(c => c.isFree),
    paidCourses: (state) => state.availableCourses.filter(c => !c.isFree),
    discountedCourses: (state) => state.availableCourses.filter(c => !c.isFree && c.hasActiveDiscount),
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
    SET_AVAILABLE_COURSES(state, courses) {
      state.availableCourses = courses;
    },
    SET_CURRENT_COURSE(state, course) {
      state.currentCourse = course;
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
    // Sales mutations
    SET_SALES(state, sales) {
      state.sales = sales;
    },
    SET_PENDING_SALES(state, sales) {
      state.pendingSales = sales;
    },
    SET_COMPLETED_SALES(state, sales) {
      state.completedSales = sales;
    },
    SET_CURRENT_SALE(state, sale) {
      state.currentSale = sale;
    },
    ADD_SALE(state, sale) {
      state.sales.push(sale);
      if (sale.status === 'pending') {
        state.pendingSales.push(sale);
      } else if (sale.status === 'completed') {
        state.completedSales.push(sale);
      }
    },
    UPDATE_SALE(state, updatedSale) {
      // Update in main sales array
      const saleIndex = state.sales.findIndex(s => s.id === updatedSale.id);
      if (saleIndex !== -1) {
        state.sales.splice(saleIndex, 1, updatedSale);
      }
      
      // Update in pending sales if exists
      const pendingIndex = state.pendingSales.findIndex(s => s.id === updatedSale.id);
      if (pendingIndex !== -1) {
        if (updatedSale.status === 'pending') {
          state.pendingSales.splice(pendingIndex, 1, updatedSale);
        } else {
          state.pendingSales.splice(pendingIndex, 1);
        }
      }
      
      // Update in completed sales if exists
      const completedIndex = state.completedSales.findIndex(s => s.id === updatedSale.id);
      if (completedIndex !== -1) {
        if (updatedSale.status === 'completed') {
          state.completedSales.splice(completedIndex, 1, updatedSale);
        } else {
          state.completedSales.splice(completedIndex, 1);
        }
      }
      
      // Add to completed sales if status is completed and not already there
      if (updatedSale.status === 'completed' && completedIndex === -1) {
        state.completedSales.push(updatedSale);
      }
      
      // Add to pending sales if status is pending and not already there
      if (updatedSale.status === 'pending' && pendingIndex === -1) {
        state.pendingSales.push(updatedSale);
      }
    },
    REMOVE_SALE(state, saleId) {
      state.sales = state.sales.filter(s => s.id !== saleId);
      state.pendingSales = state.pendingSales.filter(s => s.id !== saleId);
      state.completedSales = state.completedSales.filter(s => s.id !== saleId);
      
      if (state.currentSale && state.currentSale.id === saleId) {
        state.currentSale = null;
      }
    },
    // Course discount mutations
    APPLY_DISCOUNT(state, { courseId, discountData }) {
      // Update discount in courses array
      const courseIndex = state.courses.findIndex(c => c.id === courseId);
      if (courseIndex !== -1) {
        const course = state.courses[courseIndex];
        course.discount = discountData.discount;
        course.discountType = discountData.discountType;
        course.discountName = discountData.discountName;
        course.discountStartDate = discountData.discountStartDate;
        course.discountEndDate = discountData.discountEndDate;
        course.hasActiveDiscount = true;
        
        // Calculate discounted prices
        if (course.netPrice) {
          const discountMultiplier = (100 - course.discount) / 100;
          course.discountedNetPrice = parseFloat((course.netPrice * discountMultiplier).toFixed(2));
          course.discountedTotalPrice = parseFloat(((course.netPrice * discountMultiplier) * 1.19).toFixed(2));
        }
      }
      
      // Also update in available courses if exists
      const availableIndex = state.availableCourses.findIndex(c => c.id === courseId);
      if (availableIndex !== -1) {
        const course = state.availableCourses[availableIndex];
        course.discount = discountData.discount;
        course.discountType = discountData.discountType;
        course.discountName = discountData.discountName;
        course.discountStartDate = discountData.discountStartDate;
        course.discountEndDate = discountData.discountEndDate;
        course.hasActiveDiscount = true;
        
        if (course.netPrice) {
          const discountMultiplier = (100 - course.discount) / 100;
          course.discountedNetPrice = parseFloat((course.netPrice * discountMultiplier).toFixed(2));
          course.discountedTotalPrice = parseFloat(((course.netPrice * discountMultiplier) * 1.19).toFixed(2));
        }
      }
      
      // Update current course if it matches
      if (state.currentCourse && state.currentCourse.id === courseId) {
        state.currentCourse.discount = discountData.discount;
        state.currentCourse.discountType = discountData.discountType;
        state.currentCourse.discountName = discountData.discountName;
        state.currentCourse.discountStartDate = discountData.discountStartDate;
        state.currentCourse.discountEndDate = discountData.discountEndDate;
        state.currentCourse.hasActiveDiscount = true;
        
        if (state.currentCourse.netPrice) {
          const discountMultiplier = (100 - state.currentCourse.discount) / 100;
          state.currentCourse.discountedNetPrice = parseFloat((state.currentCourse.netPrice * discountMultiplier).toFixed(2));
          state.currentCourse.discountedTotalPrice = parseFloat(((state.currentCourse.netPrice * discountMultiplier) * 1.19).toFixed(2));
        }
      }
    },
    REMOVE_DISCOUNT(state, courseId) {
      // Update in courses array
      const courseIndex = state.courses.findIndex(c => c.id === courseId);
      if (courseIndex !== -1) {
        const course = state.courses[courseIndex];
        course.discount = 0;
        course.discountType = null;
        course.discountName = null;
        course.discountStartDate = null;
        course.discountEndDate = null;
        course.hasActiveDiscount = false;
        course.discountedNetPrice = course.netPrice;
        course.discountedTotalPrice = course.totalPrice;
      }
      
      // Update in available courses
      const availableIndex = state.availableCourses.findIndex(c => c.id === courseId);
      if (availableIndex !== -1) {
        const course = state.availableCourses[availableIndex];
        course.discount = 0;
        course.discountType = null;
        course.discountName = null;
        course.discountStartDate = null;
        course.discountEndDate = null;
        course.hasActiveDiscount = false;
        course.discountedNetPrice = course.netPrice;
        course.discountedTotalPrice = course.totalPrice;
      }
      
      // Update current course if it matches
      if (state.currentCourse && state.currentCourse.id === courseId) {
        state.currentCourse.discount = 0;
        state.currentCourse.discountType = null;
        state.currentCourse.discountName = null;
        state.currentCourse.discountStartDate = null;
        state.currentCourse.discountEndDate = null;
        state.currentCourse.hasActiveDiscount = false;
        state.currentCourse.discountedNetPrice = state.currentCourse.netPrice;
        state.currentCourse.discountedTotalPrice = state.currentCourse.totalPrice;
      }
    }
  },
  actions: {
    async apiRequest({ commit, getters }, { method, url, data = null }) {
      try {
        commit("SET_LOADING", true);
        commit("CLEAR_ERROR");
        // Determine if the URL is absolute or relative
        const requestUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
        
        const response = await api({
          method,
          url: requestUrl,
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
        const response = await api.post("/auth/login", credentials);
        commit("SET_TOKEN", response.data.token);
        commit("SET_USER", response.data.user);
        return response.data;
      } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        throw error;
      }
    },
    async logout({ commit }) {
      commit("CLEAR_USER");
    },
    async fetchCourses({ commit }) {
      try {
        const response = await api.get("/courses");
        commit("SET_COURSES", response.data.courses || response.data);
        return response.data;
      } catch (error) {
        console.error("Error al cargar cursos:", error);
        throw error;
      }
    },
    async fetchEnrolledCourses({ commit }) {
      try {
        const response = await api.get("/courses/enrolled");
        commit("SET_ENROLLED_COURSES", response.data);
        return response.data;
      } catch (error) {
        console.error("Error al cargar cursos inscritos:", error);
        throw error;
      }
    },
    async fetchAvailableCourses({ commit }) {
      try {
        const response = await api.get("/courses/available");
        commit("SET_AVAILABLE_COURSES", response.data);
        return response.data;
      } catch (error) {
        console.error("Error al cargar cursos disponibles:", error);
        throw error;
      }
    },
    async fetchCourseById({ commit }, courseId) {
      try {
        const response = await api.get(`/courses/${courseId}`);
        commit("SET_CURRENT_COURSE", response.data);
        return response.data;
      } catch (error) {
        console.error("Error al cargar el curso:", error);
        throw error;
      }
    },
    async fetchEvaluations({ commit }, courseId) {
      try {
        const response = await api.get(`/evaluations/course/${courseId}`);
        commit("SET_EVALUATIONS", response.data.data || []);
        return response.data;
      } catch (error) {
        console.error("Error al cargar evaluaciones:", error);
        throw error;
      }
    },
    async fetchStudents({ commit }, courseId) {
      try {
        const response = await api.get(`/courses/${courseId}/students`);
        commit("SET_STUDENTS", response.data || []);
        return response.data;
      } catch (error) {
        console.error("Error al cargar estudiantes:", error);
        throw error;
      }
    },
    async fetchUsers({ commit }) {
      try {
        const response = await api.get("/users");
        commit("SET_USERS", response.data);
        return response.data;
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        throw error;
      }
    },
    async deleteUser({ dispatch }, userId) {
      try {
        await api.delete(`/users/${userId}`);
        await dispatch("fetchUsers");
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        throw error;
      }
    },
    // Course actions
    async createCourse({ commit }, courseData) {
      try {
        const response = await api.post("/courses", courseData);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.response?.data?.message || "Error al crear el curso");
        throw error;
      }
    },
    async updateCourse({ commit }, { courseId, courseData }) {
      try {
        const response = await api.put(`/courses/${courseId}`, courseData);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.response?.data?.message || "Error al actualizar el curso");
        throw error;
      }
    },
    async deleteCourse({ commit }, courseId) {
      try {
        await api.delete(`/courses/${courseId}`);
        return true;
      } catch (error) {
        commit("SET_ERROR", error.response?.data?.message || "Error al eliminar el curso");
        throw error;
      }
    },
    // Discount actions
    async applyCourseDiscount({ commit }, { courseId, discountData }) {
      try {
        const response = await api.post(`/courses/${courseId}/discount`, discountData);
        commit("APPLY_DISCOUNT", { courseId, discountData });
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.response?.data?.message || "Error al aplicar el descuento");
        throw error;
      }
    },
    async removeCourseDiscount({ commit }, courseId) {
      try {
        await api.delete(`/courses/${courseId}/discount`);
        commit("REMOVE_DISCOUNT", courseId);
        return true;
      } catch (error) {
        commit("SET_ERROR", error.response?.data?.message || "Error al eliminar el descuento");
        throw error;
      }
    },
    // Sales actions
    async fetchSales({ commit }, params = {}) {
      try {
        const response = await api.get("/sales", { params });
        commit("SET_SALES", response.data);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.response?.data?.message || "Error al cargar ventas");
        throw error;
      }
    },
    async fetchPendingSales({ commit }) {
      try {
        const response = await api.get("/sales", { params: { status: "pending" } });
        commit("SET_PENDING_SALES", response.data);
        return response.data;
      } catch (error) {
        console.error("Error al cargar ventas pendientes:", error);
        // Silent fail for better UX
      }
    },
    async fetchCompletedSales({ commit }) {
      try {
        const response = await api.get("/sales", { params: { status: "completed" } });
        commit("SET_COMPLETED_SALES", response.data);
        return response.data;
      } catch (error) {
        console.error("Error al cargar ventas completadas:", error);
        throw error;
      }
    },
    async initiatePurchase({ dispatch, commit }, courseId) {
      try {
        const response = await api.post(`/courses/${courseId}/purchase`);
        if (response.data.saleId) {
          await dispatch("fetchSaleById", response.data.saleId);
        }
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.response?.data?.message || "Error al iniciar el proceso de compra");
        throw error;
      }
    },
    async fetchSaleById({ commit }, saleId) {
      try {
        const response = await api.get(`/sales/${saleId}`);
        commit("SET_CURRENT_SALE", response.data);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.response?.data?.message || "Error al cargar la información de venta");
        throw error;
      }
    },
    async processPayment({ commit }, { saleId, paymentData }) {
      try {
        const response = await api.post(`/sales/${saleId}/process-payment`, paymentData);
        
        // Update sale in store
        const updatedSale = response.data.sale || response.data;
        commit("UPDATE_SALE", updatedSale);
        
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.response?.data?.message || "Error al procesar el pago");
        throw error;
      }
    },
    async cancelSale({ commit }, saleId) {
      try {
        const response = await api.patch(`/sales/${saleId}/status`, {
          status: "cancelled",
          message: "Cancelado por el usuario"
        });
        
        commit("REMOVE_SALE", saleId);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.response?.data?.message || "Error al cancelar la venta");
        throw error;
      }
    },
    async assignFreeAccess({ commit }, { courseId, userId, reason }) {
      try {
        const response = await api.post(`/courses/${courseId}/assign-free-access`, {
          userId,
          reason
        });
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.response?.data?.message || "Error al asignar acceso gratuito");
        throw error;
      }
    }
  },
});

export default store;
