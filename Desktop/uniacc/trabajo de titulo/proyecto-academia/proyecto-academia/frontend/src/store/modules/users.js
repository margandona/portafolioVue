import userService from '@/services/api/userService';

export default {
  namespaced: true,
  
  state: {
    usersList: [],
    loadingUsers: false,
    userError: null,
    searchResults: []
  },
  
  getters: {
    getUsersList: state => state.usersList,
    isLoadingUsers: state => state.loadingUsers,
    getUserError: state => state.userError,
    getSearchResults: state => state.searchResults
  },
  
  mutations: {
    SET_USERS(state, users) {
      state.usersList = users;
    },
    SET_SEARCH_RESULTS(state, users) {
      state.searchResults = users;
    },
    SET_LOADING_USERS(state, status) {
      state.loadingUsers = status;
    },
    SET_USER_ERROR(state, error) {
      state.userError = error;
    },
    CLEAR_USER_ERROR(state) {
      state.userError = null;
    },
    ADD_USER(state, user) {
      state.usersList.push(user);
    },
    UPDATE_USER(state, updatedUser) {
      const index = state.usersList.findIndex(user => user.id === updatedUser.id);
      if (index !== -1) {
        state.usersList.splice(index, 1, updatedUser);
      }
    },
    DELETE_USER(state, userId) {
      state.usersList = state.usersList.filter(user => user.id !== userId);
      state.searchResults = state.searchResults.filter(user => user.id !== userId);
    }
  },
  
  actions: {
    async fetchUsers({ commit }) {
      commit('SET_LOADING_USERS', true);
      commit('CLEAR_USER_ERROR');
      try {
        const response = await userService.getAllUsers();
        commit('SET_USERS', response.data);
        return response.data;
      } catch (error) {
        commit('SET_USER_ERROR', error.response?.data?.message || 'Error al obtener usuarios');
        throw error;
      } finally {
        commit('SET_LOADING_USERS', false);
      }
    },
    
    async searchUsers({ commit }, searchParams) {
      commit('SET_LOADING_USERS', true);
      commit('CLEAR_USER_ERROR');
      try {
        const response = await userService.searchUsers(searchParams);
        commit('SET_SEARCH_RESULTS', response.data);
        return response.data;
      } catch (error) {
        commit('SET_USER_ERROR', error.response?.data?.message || 'Error al buscar usuarios');
        throw error;
      } finally {
        commit('SET_LOADING_USERS', false);
      }
    },
    
    async createUser({ commit }, userData) {
      commit('SET_LOADING_USERS', true);
      commit('CLEAR_USER_ERROR');
      try {
        const response = await userService.createUser(userData);
        console.log('Respuesta de API al crear usuario:', response.data);
        
        // Determinar estructura de usuario para la mutación
        const user = response.data.user || response.data;
        commit('ADD_USER', user);
        
        return response.data;
      } catch (error) {
        console.error('Error detallado al crear usuario:', error);
        commit('SET_USER_ERROR', error.response?.data?.message || 'Error al crear usuario');
        throw error;
      } finally {
        commit('SET_LOADING_USERS', false);
      }
    },
    
    async updateUser({ commit }, { userId, userData }) {
      commit('SET_LOADING_USERS', true);
      commit('CLEAR_USER_ERROR');
      try {
        const response = await userService.updateUser(userId, userData);
        commit('UPDATE_USER', response.data.user);
        return response.data;
      } catch (error) {
        commit('SET_USER_ERROR', error.response?.data?.message || 'Error al actualizar usuario');
        throw error;
      } finally {
        commit('SET_LOADING_USERS', false);
      }
    },
    
    async deleteUser({ commit }, userId) {
      commit('SET_LOADING_USERS', true);
      commit('CLEAR_USER_ERROR');
      try {
        await userService.deleteUser(userId);
        commit('DELETE_USER', userId);
        return true;
      } catch (error) {
        commit('SET_USER_ERROR', error.response?.data?.message || 'Error al eliminar usuario');
        throw error;
      } finally {
        commit('SET_LOADING_USERS', false);
      }
    }
  }
};
