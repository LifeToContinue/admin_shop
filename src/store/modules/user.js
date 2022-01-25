import { login, logout, getInfo } from '@/api/user'
// import router from '@/router'
import { resetRouter } from '@/router'


const state = {
  token: localStorage.getItem('token_key'),
  name: '',
  avatar: ''
}

const mutations = {
  RESET_STATE(state){
    state.token='',
    state.name='',
    state.avatar=''
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USERINFO(state,userInfo){
    state.name=userInfo.name,
    state.avatar=userInfo.avatar
  }
}

const actions = {
  // user login
  /* login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  }, */
  async login({commit},userInfo){
    const {username,password} = userInfo
    const result = await login({ username: username.trim(), password: password })
    if(result.code === 200 || result.code === 20000){
      const { data } = result
      commit('SET_TOKEN', data.token)
      localStorage.setItem('token_key',data.token)
      return 'OK'
    }else{
      return Promise.reject(new Error('failed'))
    }
  },

  
  /* getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { name, avatar } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  }, */
  // get user info
  async getInfo({ commit, state }){
    const result = await getInfo(state.token)
    if(result.code === 200 || result.code === 20000){
      const { data } = result
      commit('SET_USERINFO',data)
      return "OK"
    }else{
      return Promise.reject(new Error('failed'))
    }
  },

  /* logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  }, */
  // user logout
  async logout({ commit,state,dispatch }){
    const result = await logout(state.token)
    if(result.code === 200 || result.code === 20000){
      dispatch('resetToken')
      resetRouter()
      return 'ok'
    }else{
      return Promise.reject(new Error('failed'))
    }
  },

  // remove token
  async resetToken({ commit }) {
    localStorage.removeItem('token_key')
    commit('RESET_STATE')
  }
  /* resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  } */
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

