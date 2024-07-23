import Vue from 'vue';
import Vuex from 'vuex';
import boards from './modules/boards';
import lists from './modules/lists';
import cards from './modules/cards';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    boards,
    lists,
    cards
  }
});
