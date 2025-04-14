export const namespaced = true;

export const state = {
    isColorblindMode: false,
    isVisualRestMode: false,
    isNightMode: false,
    fontSizeAdjustment: 0,
    isHighContrastMode: false,
    isLineSpacingMode: false,
    isLinkHighlightMode: false,
    isCursorLargeMode: false,
    isNoAnimationsMode: false,
    isDyslexiaFriendlyMode: false
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
    INCREASE_FONT_SIZE(state) {
        state.fontSizeAdjustment += 1;
        document.body.style.fontSize = `${16 + state.fontSizeAdjustment}px`;
    },
    DECREASE_FONT_SIZE(state) {
        state.fontSizeAdjustment -= 1;
        document.body.style.fontSize = `${16 + state.fontSizeAdjustment}px`;
    },
    
    TOGGLE_HIGH_CONTRAST_MODE(state) {
        state.isHighContrastMode = !state.isHighContrastMode;
        // Para evitar conflictos, desactivar otros modos visuales si se activa alto contraste
        if (state.isHighContrastMode) {
            state.isColorblindMode = false;
            state.isVisualRestMode = false;
            state.isNightMode = false;
        }
    },
    TOGGLE_LINE_SPACING_MODE(state) {
        state.isLineSpacingMode = !state.isLineSpacingMode;
    },
    TOGGLE_LINK_HIGHLIGHT_MODE(state) {
        state.isLinkHighlightMode = !state.isLinkHighlightMode;
    },
    TOGGLE_CURSOR_LARGE_MODE(state) {
        state.isCursorLargeMode = !state.isCursorLargeMode;
        if (state.isCursorLargeMode) {
            document.body.classList.add('large-cursor');
        } else {
            document.body.classList.remove('large-cursor');
        }
    },
    TOGGLE_NO_ANIMATIONS_MODE(state) {
        state.isNoAnimationsMode = !state.isNoAnimationsMode;
    },
    TOGGLE_DYSLEXIA_FRIENDLY_MODE(state) {
        state.isDyslexiaFriendlyMode = !state.isDyslexiaFriendlyMode;
    },

    RESET_ACCESSIBILITY(state) {
        state.isColorblindMode = false;
        state.isVisualRestMode = false;
        state.isNightMode = false;
        state.isHighContrastMode = false;
        state.isLineSpacingMode = false;
        state.isLinkHighlightMode = false;
        state.isCursorLargeMode = false;
        state.isNoAnimationsMode = false;
        state.isDyslexiaFriendlyMode = false;
        state.fontSizeAdjustment = 0;
        document.body.style.fontSize = '16px';
        document.body.classList.remove('large-cursor');
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
    increaseFontSize({ commit }) {
        commit('INCREASE_FONT_SIZE');
    },
    decreaseFontSize({ commit }) {
        commit('DECREASE_FONT_SIZE');
    },
    
    toggleHighContrastMode({ commit }) {
        commit('TOGGLE_HIGH_CONTRAST_MODE');
    },
    toggleLineSpacingMode({ commit }) {
        commit('TOGGLE_LINE_SPACING_MODE');
    },
    toggleLinkHighlightMode({ commit }) {
        commit('TOGGLE_LINK_HIGHLIGHT_MODE');
    },
    toggleCursorLargeMode({ commit }) {
        commit('TOGGLE_CURSOR_LARGE_MODE');
    },
    toggleNoAnimationsMode({ commit }) {
        commit('TOGGLE_NO_ANIMATIONS_MODE');
    },
    toggleDyslexiaFriendlyMode({ commit }) {
        commit('TOGGLE_DYSLEXIA_FRIENDLY_MODE');
    },
    
    resetAccessibility({ commit }) {
        commit('RESET_ACCESSIBILITY');
    }
};

export const getters = {
    isColorblindMode: (state) => state.isColorblindMode,
    isVisualRestMode: (state) => state.isVisualRestMode,
    isNightMode: (state) => state.isNightMode,
    fontSizeAdjustment: (state) => state.fontSizeAdjustment,
    isHighContrastMode: (state) => state.isHighContrastMode,
    isLineSpacingMode: (state) => state.isLineSpacingMode,
    isLinkHighlightMode: (state) => state.isLinkHighlightMode,
    isCursorLargeMode: (state) => state.isCursorLargeMode,
    isNoAnimationsMode: (state) => state.isNoAnimationsMode,
    isDyslexiaFriendlyMode: (state) => state.isDyslexiaFriendlyMode,
    
    currentMode: (state) => {
        if (state.isColorblindMode) return 'daltonismo';
        if (state.isVisualRestMode) return 'descanso-visual';
        if (state.isNightMode) return 'modo-nocturno';
        return '';
    }
};