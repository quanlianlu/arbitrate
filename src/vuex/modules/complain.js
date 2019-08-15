const state = {
  searchParmas: {}
};

// getters
const getters = {
  getSearchParmas: state => {
    return state.searchParmas;
  }
};

// actions
const actions = {
  setSearchParmas: ({commit}, params) => {
    commit('setSearchParmas', params);
  }
};

// mutations
const mutations = {
  setSearchParmas: (state, params) => {
    state.searchParmas = params;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
