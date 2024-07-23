import { db } from '../../firebase-config';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const state = {
  projects: []
};

const mutations = {
  setProjects(state, projects) {
    state.projects = projects;
  },
  addProject(state, project) {
    state.projects.push(project);
  },
  removeProject(state, projectId) {
    state.projects = state.projects.filter(project => project.id !== projectId);
  }
};

const actions = {
  async fetchProjects({ commit }) {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    commit('setProjects', projects);
  },
  async addProject({ commit }, project) {
    const docRef = await addDoc(collection(db, 'projects'), project);
    commit('addProject', { id: docRef.id, ...project });
  },
  async removeProject({ commit }, projectId) {
    await deleteDoc(doc(db, 'projects', projectId));
    commit('removeProject', projectId);
  }
};

const getters = {
  allProjects: (state) => state.projects
};

export default {
  state,
  mutations,
  actions,
  getters
};
