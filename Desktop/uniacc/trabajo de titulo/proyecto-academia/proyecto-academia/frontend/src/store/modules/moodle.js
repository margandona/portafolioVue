import { moodleService } from '@/api/moodleService';

export default {
  namespaced: true,
  
  state: () => ({
    moodleCourses: [],
    userMoodleCourses: [],
    loading: false,
    error: null
  }),
  
  mutations: {
    SET_MOODLE_COURSES(state, courses) {
      state.moodleCourses = courses;
    },
    SET_USER_MOODLE_COURSES(state, courses) {
      state.userMoodleCourses = courses;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  
  actions: {
    /**
     * Cargar cursos públicos desde Moodle
     */
    async fetchMoodleCourses({ commit }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const courses = await moodleService.getCourses();
        commit('SET_MOODLE_COURSES', courses);
        return courses;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Error al cargar cursos de Moodle');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    /**
     * Cargar cursos del usuario actual desde Moodle
     */
    async fetchUserMoodleCourses({ commit }, userId) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const courses = await moodleService.getUserCourses(userId);
        commit('SET_USER_MOODLE_COURSES', courses);
        return courses;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Error al cargar cursos de usuario de Moodle');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },
  
  getters: {
    getMoodleCourses: state => state.moodleCourses,
    getUserMoodleCourses: state => state.userMoodleCourses,
    isMoodleLoading: state => state.loading,
    moodleError: state => state.error
  }
};
