import { db } from '../../firebase-config';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const state = {
  tasks: []
};

const mutations = {
  setTasks(state, tasks) {
    state.tasks = tasks;
  },
  addTask(state, task) {
    state.tasks.push(task);
  },
  removeTask(state, taskId) {
    state.tasks = state.tasks.filter(task => task.id !== taskId);
  }
};

const actions = {
  async fetchTasks({ commit }) {
    const querySnapshot = await getDocs(collection(db, 'tasks'));
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    commit('setTasks', tasks);
  },
  async addTask({ commit }, task) {
    const docRef = await addDoc(collection(db, 'tasks'), task);
    commit('addTask', { id: docRef.id, ...task });
  },
  async removeTask({ commit }, taskId) {
    await deleteDoc(doc(db, 'tasks', taskId));
    commit('removeTask', taskId);
  }
};

const getters = {
  allTasks: (state) => state.tasks
};

export default {
  state,
  mutations,
  actions,
  getters
};
