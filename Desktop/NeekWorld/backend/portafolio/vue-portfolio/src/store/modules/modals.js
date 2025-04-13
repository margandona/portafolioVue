export const namespaced = true;

export const state = {
  educationReflection: null
};

export const mutations = {
  SET_EDUCATION_REFLECTION(state, reflectionKey) {
    state.educationReflection = reflectionKey;
  }
};

export const actions = {
  showEducationReflection({ commit }, reflectionKey) {
    commit('SET_EDUCATION_REFLECTION', reflectionKey);
  }
};

export const getters = {
  educationReflection: state => state.educationReflection
};
