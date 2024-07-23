import { db } from '../../firebase-config';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const state = {
  cards: []
};

const mutations = {
  setCards(state, cards) {
    state.cards = cards;
  },
  addCard(state, card) {
    state.cards.push(card);
  },
  updateCard(state, updatedCard) {
    const index = state.cards.findIndex(card => card.id === updatedCard.id);
    if (index !== -1) {
      state.cards.splice(index, 1, updatedCard);
    }
  },
  removeCard(state, cardId) {
    state.cards = state.cards.filter(card => card.id !== cardId);
  }
};

const actions = {
  async fetchCards({ commit }) {
    const querySnapshot = await getDocs(collection(db, 'cards'));
    const cards = [];
    querySnapshot.forEach(doc => {
      cards.push({ id: doc.id, ...doc.data() });
    });
    commit('setCards', cards);
  },
  async addCard({ commit }, card) {
    const docRef = await addDoc(collection(db, 'cards'), card);
    commit('addCard', { id: docRef.id, ...card });
  },
  async updateCard({ commit }, card) {
    const docRef = doc(db, 'cards', card.id);
    await updateDoc(docRef, card);
    commit('updateCard', card);
  },
  async removeCard({ commit }, cardId) {
    const docRef = doc(db, 'cards', cardId);
    await deleteDoc(docRef);
    commit('removeCard', cardId);
  }
};

const getters = {
  allCards: state => state.cards,
  getCardById: state => id => state.cards.find(card => card.id === id)
};

export default {
  state,
  mutations,
  actions,
  getters
};
