export const namespaced = true;

export const state = {
  activeSection: null
};

export const mutations = {
  SET_ACTIVE_SECTION(state, sectionId) {
    state.activeSection = sectionId;
  }
};

export const actions = {
  setActiveSection({ commit }, sectionId) {
    commit('SET_ACTIVE_SECTION', sectionId);
  }
};

export const getters = {
  activeSection: state => state.activeSection,
  isActive: state => sectionId => state.activeSection === sectionId
};
