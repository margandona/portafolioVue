import { db } from '../../firebase-config';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const state = {
  lists: []
};

const mutations = {
  setLists(state, lists) {
    state.lists = lists;
  },
  addList(state, list) {
    state.lists.push(list);
  },
  updateList(state, updatedList) {
    const index = state.lists.findIndex(list => list.id === updatedList.id);
    if (index !== -1) {
      state.lists.splice(index, 1, updatedList);
    }
  },
  removeList(state, listId) {
    state.lists = state.lists.filter(list => list.id !== listId);
  }
};

const actions = {
  async fetchLists({ commit }) {
    const querySnapshot = await getDocs(collection(db, 'lists'));
    const lists = [];
    querySnapshot.forEach(doc => {
      lists.push({ id: doc.id, ...doc.data() });
    });
    commit('setLists', lists);
  },
  async addList({ commit }, list) {
    const docRef = await addDoc(collection(db, 'lists'), list);
    commit('addList', { id: docRef.id, ...list });
  },
  async updateList({ commit }, list) {
    const docRef = doc(db, 'lists', list.id);
    await updateDoc(docRef, list);
    commit('updateList', list);
  },
  async removeList({ commit }, listId) {
    const docRef = doc(db, 'lists', listId);
    await deleteDoc(docRef);
    commit('removeList', listId);
  }
};

const getters = {
  allLists: state => state.lists,
  getListById: state => id => state.lists.find(list => list.id === id)
};

export default {
  state,
  mutations,
  actions,
  getters
};
