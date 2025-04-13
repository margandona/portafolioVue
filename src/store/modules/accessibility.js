export const namespaced = true;

export const state = {
    isColorblindMode: false,
    isVisualRestMode: false,
    isNightMode: false,
    fontSizeAdjustment: 0
};

export const mutations = {
    TOGGLE_COLORBLIND_MODE(state) {
        state.isColorblindMode = !state.isColorblindMode;
    },
    TOGGLE_VISUAL_REST_MODE(state) {
        state.isVisualRestMode = !state.isVisualRestMode;
    },
    TOGGLE_NIGHT_MODE(state) {
        state.isNightMode = !state.isNightMode;
    },
    TOGGLE_DALTONISM(state) {
        state.isColorblindMode = !state.isColorblindMode;
    },
    TOGGLE_VISUAL_ACCESSIBILITY(state) {
        state.isVisualRestMode = !state.isVisualRestMode;
    },
    RESET_ACCESSIBILITY(state) {
        state.isColorblindMode = false;
        state.isVisualRestMode = false;
        state.isNightMode = false;
    },
    INCREASE_FONT_SIZE(state) {
        state.fontSizeAdjustment += 1;
        document.body.style.fontSize = `${16 + state.fontSizeAdjustment}px`;
    },
    DECREASE_FONT_SIZE(state) {
        state.fontSizeAdjustment -= 1;
        document.body.style.fontSize = `${16 + state.fontSizeAdjustment}px`;
    }
};

export const actions = {
    toggleColorblindMode({ commit }) {
        commit('TOGGLE_COLORBLIND_MODE');
    },
    toggleVisualRestMode({ commit }) {
        commit('TOGGLE_VISUAL_REST_MODE');
    },
    toggleNightMode({ commit }) {
        commit('TOGGLE_NIGHT_MODE');
    },
    toggleDaltonism({ commit }) {
        commit('TOGGLE_DALTONISM');
    },
    toggleVisualAccessibility({ commit }) {
        commit('TOGGLE_VISUAL_ACCESSIBILITY');
    },
    resetAccessibility({ commit }) {
        commit('RESET_ACCESSIBILITY');
    },
    increaseFontSize({ commit }) {
        commit('INCREASE_FONT_SIZE');
    },
    decreaseFontSize({ commit }) {
        commit('DECREASE_FONT_SIZE');
    }
};

export const getters = {
    isColorblindMode: (state) => state.isColorblindMode,
    isVisualRestMode: (state) => state.isVisualRestMode,
    isNightMode: (state) => state.isNightMode,
    fontSizeAdjustment: (state) => state.fontSizeAdjustment
};