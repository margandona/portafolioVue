export const namespaced = true;

export const state = {
  isRadioModalVisible: false,
  isEducationModalVisible: false,
  isFigmaModalVisible: false,
  isDisponibilityModalVisible: false,
  educationReflection: null
};

export const mutations = {
  SHOW_RADIO_MODAL(state) {
    console.log('MUTATION: SHOW_RADIO_MODAL triggered');
    state.isRadioModalVisible = true;
  },
  HIDE_RADIO_MODAL(state) {
    state.isRadioModalVisible = false;
  },
  SHOW_EDUCATION_MODAL(state) {
    state.isEducationModalVisible = true;
  },
  HIDE_EDUCATION_MODAL(state) {
    state.isEducationModalVisible = false;
  },
  SHOW_FIGMA_MODAL(state) {
    state.isFigmaModalVisible = true;
  },
  HIDE_FIGMA_MODAL(state) {
    state.isFigmaModalVisible = false;
  },
  SHOW_DISPONIBILITY_MODAL(state) {
    state.isDisponibilityModalVisible = true;
  },
  HIDE_DISPONIBILITY_MODAL(state) {
    state.isDisponibilityModalVisible = false;
  },
  SET_EDUCATION_REFLECTION(state, reflectionKey) {
    console.log('MUTATION: SET_EDUCATION_REFLECTION', reflectionKey);
    state.educationReflection = reflectionKey;
  }
};

export const actions = {
  showRadioModal({ commit }) {
    console.log('ACTION: showRadioModal dispatched');
    commit('SHOW_RADIO_MODAL');
  },
  hideRadioModal({ commit }) {
    commit('HIDE_RADIO_MODAL');
  },
  showEducationModal({ commit }) {
    commit('SHOW_EDUCATION_MODAL');
  },
  hideEducationModal({ commit }) {
    commit('HIDE_EDUCATION_MODAL');
  },
  showFigmaModal({ commit }) {
    commit('SHOW_FIGMA_MODAL');
  },
  hideFigmaModal({ commit }) {
    commit('HIDE_FIGMA_MODAL');
  },
  showDisponibilityModal({ commit }) {
    commit('SHOW_DISPONIBILITY_MODAL');
  },
  hideDisponibilityModal({ commit }) {
    commit('HIDE_DISPONIBILITY_MODAL');
  },
  showEducationReflection({ commit }, reflectionKey) {
    console.log('ACTION: showEducationReflection', reflectionKey);
    commit('SET_EDUCATION_REFLECTION', reflectionKey);
  }
};

export const getters = {
  isRadioModalVisible: state => {
    console.log('GETTER: isRadioModalVisible called, value:', state.isRadioModalVisible);
    return state.isRadioModalVisible;
  },
  isEducationModalVisible: state => state.isEducationModalVisible,
  isFigmaModalVisible: state => state.isFigmaModalVisible,
  isDisponibilityModalVisible: state => state.isDisponibilityModalVisible,
  educationReflection: state => {
    console.log('GETTER: educationReflection called, value:', state.educationReflection);
    return state.educationReflection;
  }
};
