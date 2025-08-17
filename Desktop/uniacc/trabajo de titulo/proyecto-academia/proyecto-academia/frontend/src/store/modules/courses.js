import courseService from '@/services/api/courseService';
import { extractCategories } from '@/utils/courseUtils';

// Estado inicial
const state = {
  courses: [],
  enrolledCourses: [],
  availableCourses: [],
  teacherCourses: [],
  currentCourse: null,
  loading: false,
  error: null,
  courseCategories: []
};

// Getters
const getters = {
  allCourses: state => state.courses,
  courseById: state => id => state.courses.find(course => course.id === id),
  enrolledCourses: state => state.enrolledCourses,
  availableCourses: state => state.availableCourses,
  teacherCourses: state => state.teacherCourses,
  currentCourse: state => state.currentCourse,
  isLoading: state => state.loading,
  error: state => state.error,
  courseCategories: state => state.courseCategories,
  
  // Filtrar cursos por categoría
  coursesByCategory: state => category => {
    if (!category || category === 'Todas') return state.courses;
    return state.courses.filter(course => course.category === category);
  },
  
  // Filtrar cursos disponibles por categoría
  availableCoursesByCategory: state => category => {
    if (!category || category === 'Todas') return state.availableCourses;
    return state.availableCourses.filter(course => course.category === category);
  },
  
  // Filtrar cursos gratuitos
  freeCourses: state => {
    return state.courses.filter(course => course.isFree);
  },
  
  // Filtrar cursos con descuento
  discountedCourses: state => {
    return state.courses.filter(course => course.hasActiveDiscount);
  }
};

// Mutaciones
const mutations = {
  SET_COURSES(state, courses) {
    state.courses = courses;
    state.courseCategories = extractCategories(courses);
  },
  
  SET_ENROLLED_COURSES(state, courses) {
    state.enrolledCourses = courses;
  },
  
  SET_AVAILABLE_COURSES(state, courses) {
    state.availableCourses = courses;
  },
  
  SET_TEACHER_COURSES(state, courses) {
    state.teacherCourses = courses;
  },
  
  SET_CURRENT_COURSE(state, course) {
    state.currentCourse = course;
  },
  
  SET_LOADING(state, isLoading) {
    state.loading = isLoading;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  },
  
  ADD_COURSE(state, course) {
    state.courses.unshift(course);
    state.teacherCourses.unshift(course);
    // Actualizar categorías
    state.courseCategories = extractCategories(state.courses);
  },
  
  UPDATE_COURSE(state, updatedCourse) {
    // Actualizar en la lista general
    const courseIndex = state.courses.findIndex(c => c.id === updatedCourse.id);
    if (courseIndex !== -1) {
      state.courses.splice(courseIndex, 1, updatedCourse);
    }
    
    // Actualizar en la lista de cursos del profesor
    const teacherCourseIndex = state.teacherCourses.findIndex(c => c.id === updatedCourse.id);
    if (teacherCourseIndex !== -1) {
      state.teacherCourses.splice(teacherCourseIndex, 1, updatedCourse);
    }
    
    // Actualizar el curso actual si es el mismo
    if (state.currentCourse && state.currentCourse.id === updatedCourse.id) {
      state.currentCourse = updatedCourse;
    }
    
    // Actualizar categorías
    state.courseCategories = extractCategories(state.courses);
  },
  
  DELETE_COURSE(state, courseId) {
    state.courses = state.courses.filter(c => c.id !== courseId);
    state.teacherCourses = state.teacherCourses.filter(c => c.id !== courseId);
    
    // Si el curso actual es el eliminado, resetearlo
    if (state.currentCourse && state.currentCourse.id === courseId) {
      state.currentCourse = null;
    }
    
    // Actualizar categorías
    state.courseCategories = extractCategories(state.courses);
  },
  
  RESET_STATE(state) {
    state.courses = [];
    state.enrolledCourses = [];
    state.availableCourses = [];
    state.teacherCourses = [];
    state.currentCourse = null;
    state.loading = false;
    state.error = null;
    state.courseCategories = [];
  }
};

// Acciones
const actions = {
  // Obtener todos los cursos
  async fetchAllCourses({ commit }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await courseService.getAllCourses();
      commit('SET_COURSES', response.data.courses || []);
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al obtener los cursos');
      console.error('Error al cargar cursos:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Obtener cursos disponibles para inscripción
  async fetchAvailableCourses({ commit }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await courseService.getAvailableCourses();
      commit('SET_AVAILABLE_COURSES', response.data || []);
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al obtener cursos disponibles');
      console.error('Error al cargar cursos disponibles:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Obtener cursos en los que está inscrito el usuario
  async fetchEnrolledCourses({ commit }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await courseService.getEnrolledCourses();
      commit('SET_ENROLLED_COURSES', response.data || []);
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al obtener cursos inscritos');
      console.error('Error al cargar cursos inscritos:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Obtener cursos creados por el profesor
  async fetchTeacherCourses({ commit, rootState }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      // Obtener todos los cursos y filtrar por profesor
      const response = await courseService.getAllCourses();
      const courses = response.data.courses || [];
      const userId = rootState.auth?.user?.uid;
      
      // Filtrar cursos donde el usuario es el profesor
      const teacherCourses = courses.filter(course => 
        course.teacherId === userId || course.instructor_id === userId
      );
      
      commit('SET_TEACHER_COURSES', teacherCourses);
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al obtener tus cursos');
      console.error('Error al cargar cursos del profesor:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Obtener un curso por su ID
  async fetchCourse({ commit }, courseId) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await courseService.getCourse(courseId);
      commit('SET_CURRENT_COURSE', response.data);
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al obtener el curso');
      console.error('Error al cargar el curso:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Crear un nuevo curso
  async createCourse({ commit }, courseData) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await courseService.createCourse(courseData);
      commit('ADD_COURSE', response.data.course);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.details || error.message || 'Error al crear el curso');
      console.error('Error al crear el curso:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Actualizar un curso existente
  async updateCourse({ commit }, { courseId, courseData }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      // Log the data being sent to the API for debugging
      console.log(`Updating course ${courseId} with data:`, courseData);
      
      const response = await courseService.updateCourse(courseId, courseData);
      commit('UPDATE_COURSE', response.data.course);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.details || 
                          error.response?.data?.message || 
                          error.message || 
                          'Error al actualizar el curso';
                          
      console.error('Error al actualizar el curso:', error.response?.data || error);
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Eliminar un curso
  async deleteCourse({ commit }, courseId) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      await courseService.deleteCourse(courseId);
      commit('DELETE_COURSE', courseId);
      return true;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error al eliminar el curso');
      console.error('Error al eliminar el curso:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Inscribirse en un curso
  async enrollInCourse({ commit, dispatch }, courseId) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await courseService.enrollInCourse(courseId);
      // Actualizar listas de cursos después de la inscripción
      dispatch('fetchEnrolledCourses');
      dispatch('fetchAvailableCourses');
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || error.message || 'Error al inscribirse en el curso');
      console.error('Error al inscribirse en el curso:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Iniciar compra de un curso
  async initiatePurchase({ commit }, courseId) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await courseService.initiatePurchase(courseId);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || error.message || 'Error al iniciar la compra del curso');
      console.error('Error al iniciar compra:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Procesar pago de un curso
  async processPayment({ commit }, { saleId, paymentData }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await courseService.processPayment(saleId, paymentData);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || error.message || 'Error al procesar el pago');
      console.error('Error al procesar pago:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Confirmar pago de un curso
  async confirmPayment({ commit }, { saleId, confirmationData }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await courseService.confirmPayment(saleId, confirmationData);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || error.message || 'Error al confirmar el pago');
      console.error('Error al confirmar pago:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Obtener información de una venta
  async getSale({ commit }, saleId) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await courseService.getSale(saleId);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || error.message || 'Error al obtener información de la venta');
      console.error('Error al obtener venta:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Aplicar descuento a un curso
  async applyCourseDiscount({ commit }, { courseId, discountData }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await courseService.applyCourseDiscount(courseId, discountData);
      commit('UPDATE_COURSE', response.data.course);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || error.message || 'Error al aplicar descuento');
      console.error('Error al aplicar descuento:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Eliminar descuento de un curso
  async removeCourseDiscount({ commit }, courseId) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await courseService.removeCourseDiscount(courseId);
      commit('UPDATE_COURSE', response.data.course);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || error.message || 'Error al eliminar descuento');
      console.error('Error al eliminar descuento:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Asignar acceso gratuito a un curso
  async assignFreeCourseAccess({ commit }, { courseId, userId, reason }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await courseService.assignFreeCourseAccess(courseId, { userId, reason });
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || error.message || 'Error al asignar acceso gratuito');
      console.error('Error al asignar acceso gratuito:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Obtener estadísticas de un curso
  async fetchCourseStats({ commit }, courseId) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await courseService.getCourseStats(courseId);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || error.message || 'Error al obtener estadísticas del curso');
      console.error('Error al obtener estadísticas del curso:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Obtener estudiantes de un curso
  async fetchCourseStudents({ commit }, courseId) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await courseService.getCourseStudents(courseId);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || error.message || 'Error al obtener estudiantes del curso');
      console.error('Error al obtener estudiantes del curso:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Limpiar estado
  resetCourseState({ commit }) {
    commit('RESET_STATE');
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};