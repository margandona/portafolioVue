import { createStore } from 'vuex'
import * as accessibility from './modules/accessibility'
import * as navigation from './modules/navigation'
import * as modals from './modules/modals'

export default createStore({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    accessibility,
    navigation,
    modals
  }
})
