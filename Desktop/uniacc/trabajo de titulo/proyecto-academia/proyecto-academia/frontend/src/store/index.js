import { createStore } from 'vuex';
import { authService, userService } from '@/api';
import coursesModule from './modules/courses';
import usersModule from './modules/users';

export default createStore({
  state: {
    // Estado de autenticación
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    
    // Información de usuario
    user: null,
    
    // Estado de carga y errores
    loading: false,
    error: null
  },
  
  getters: {
    // Autenticación
    isAuthenticated: (state) => state.isAuthenticated,
    getToken: (state) => state.token,
    
    // Usuario
    getUser: (state) => state.user,
    userRole: (state) => state.user ? state.user.role : null,
    
    // Estados de UI
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  },
  
  mutations: {
    // Autenticación
    SET_AUTH(state, { token, user }) {
      state.token = token;
      state.user = user;
      state.isAuthenticated = !!token;
      
      if (token) {
        localStorage.setItem('token', token);
        if (user && user.name) {
          localStorage.setItem('name', user.name);
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('name');
      }
    },
    
    // Usuario
    SET_USER(state, user) {
      state.user = user;
    },
    
    // Estados de UI
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    }
  },
  
  actions: {
    // Autenticación
    async login({ commit }, credentials) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      try {
        const response = await authService.login(credentials);
        commit('SET_AUTH', {
          token: response.data.token,
          user: response.data.user
        });
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al iniciar sesión');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async register({ commit }, userData) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      try {
        const response = await authService.register(userData);
        commit('SET_AUTH', {
          token: response.data.token,
          user: response.data.user
        });
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al registrarse');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async logout({ commit, dispatch }) {
      commit('SET_AUTH', { token: null, user: null });
      // Restablecer el estado de cursos al cerrar sesión
      dispatch('courses/resetCourseState');
      return true;
    },
    
    // Usuario
    async fetchUserProfile({ commit }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      try {
        const response = await userService.getProfile();
        commit('SET_USER', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al cargar perfil');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async updateProfile({ commit }, userData) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      try {
        const response = await userService.updateProfile(userData);
        commit('SET_USER', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al actualizar perfil');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },
  
  modules: {
    courses: coursesModule,
    users: usersModule
  }
});