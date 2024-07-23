import { db } from '../../firebase-config';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const state = {
  boards: []
};

const mutations = {
  setBoards(state, boards) {
    state.boards = boards;
  },
  addBoard(state, board) {
    state.boards.push(board);
  },
  updateBoard(state, updatedBoard) {
    const index = state.boards.findIndex(board => board.id === updatedBoard.id);
    if (index !== -1) {
      state.boards.splice(index, 1, updatedBoard);
    }
  },
  removeBoard(state, boardId) {
    state.boards = state.boards.filter(board => board.id !== boardId);
  }
};

const actions = {
  async fetchBoards({ commit }) {
    const querySnapshot = await getDocs(collection(db, 'boards'));
    const boards = [];
    querySnapshot.forEach(doc => {
      boards.push({ id: doc.id, ...doc.data() });
    });
    commit('setBoards', boards);
  },
  async addBoard({ commit }, board) {
    const docRef = await addDoc(collection(db, 'boards'), board);
    commit('addBoard', { id: docRef.id, ...board });
  },
  async updateBoard({ commit }, board) {
    const docRef = doc(db, 'boards', board.id);
    await updateDoc(docRef, board);
    commit('updateBoard', board);
  },
  async removeBoard({ commit }, boardId) {
    const docRef = doc(db, 'boards', boardId);
    await deleteDoc(docRef);
    commit('removeBoard', boardId);
  }
};

const getters = {
  allBoards: state => state.boards,
  getBoardById: state => id => state.boards.find(board => board.id === id)
};

export default {
  state,
  mutations,
  actions,
  getters
};
