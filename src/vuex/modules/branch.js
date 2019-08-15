const state = {
  eyeOpen: true,
  searchTime: ''
};

// getters
const getters = {
  eyeOpen: state => {
    return state.eyeOpen;
  },
  searchTime: state => {
    return state.searchTime;
  }
};

// actions
const actions = {
};

// mutations
const mutations = {
  SetEyeOpen: (state) => {
    console.log(state.eyeOpen);
    state.eyeOpen = !state.eyeOpen;
    console.log(state.eyeOpen);
  },
  SetSearchTime: (state, data) => {
    if (state.searchTime === '' || state.searchTime === undefined) {
      let iToday = new Date();
      let iY = iToday.getFullYear();
      let iM = iToday.getMonth() > 8 ? iToday.getMonth() + 1 : '0' + (iToday.getMonth() + 1);
      state.searchTime = iY + '-' + iM;
    } else {
      state.searchTime = data;
    }
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
