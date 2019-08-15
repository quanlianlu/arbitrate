const state = {
  urgeSearchParameters: {}
};

// getters
const getters = {
  getUrgeSearchParameters: state => {
    return state.urgeSearchParameters;
  }
};

// actions
const actions = {
  setUrgeSearchParameters: ({commit}, params) => {
    commit('setUrgeSearchParameters', params);
  }
};

// mutations
const mutations = {
  setUrgeSearchParameters: (state, params) => {
    state.urgeSearchParameters = params;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
