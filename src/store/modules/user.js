import { login, logout, getInfo } from '@/api/acl/user'
import { resetRouter,constantRoutes,allAsyncRoutes,anyRoute } from '@/router'
import router  from '@/router'
import cloneDeep from 'lodash/cloneDeep'


function filterAsyncRoutes(allAsyncRoutes,routeNames){
  let asyncRoutes = allAsyncRoutes.filter(item=>{
    if(routeNames.indexOf(item.name)!==-1){
      if(item.children && item.children.length){
        item.children = filterAsyncRoutes(item.children,routeNames)
      }
      return true
    }
  })
  return asyncRoutes
}

const state = {
  token: localStorage.getItem('token_key'),
  name: '',
  avatar: '',
  buttons:[],
  roles:[],
  routes:[],//保存的是这个用户对应的路由器当中配置的所有路由组成的数组，这个数组到时候是让侧边栏遍历使用
  asyncRoutes:[]//
}

const mutations = {
  RESET_STATE(state){
    state.token = ''
    state.name = ''
    state.avatar = ''
    state.buttons=[]
    state.roles=[]
    state.routes=[]
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },

  SET_USERINFO(state,userInfo){
    state.name = userInfo.name
    state.avatar = userInfo.avatar
    state.buttons = userInfo.buttons
    state.roles = userInfo.roles
  },
  SET_ROUTES(state,asyncRoutes){
    state.asyncRoutes = asyncRoutes  //把过滤出来自己的异步路由保存起来
    //保存用户所有的路由组成的数组，用于让形成侧边栏菜单的时候，遍历使用的
    state.routes=constantRoutes.concat(asyncRoutes,anyRoute)

    //还要把动态路由和任意路由，动态添加到路由器的配置项当中，形成一个完整的路由配置数组
    router.addRoutes([...asyncRoutes,anyRoute]) //动态的把自己的异步路由和任意路由注册到路由器内部的路由数组
  }
}

const actions = {

  async login({ commit }, userInfo){
    const { username, password } = userInfo
    const result = await login({ username: username.trim(), password: password })
    if(result.code === 200 || result.code === 20000){
      const { data } = result
      commit('SET_TOKEN', data.token)
      localStorage.setItem('token_key',data.token)
      return 'ok'
    }else{
      return Promise.reject(new Error('failed'))
    }
  },


  async getInfo({ commit, state }){
    const result = await getInfo(state.token)
    if(result.code === 200 || result.code === 20000){
      const { data } = result
      commit('SET_USERINFO',data)
      commit('SET_ROUTES',filterAsyncRoutes(cloneDeep(allAsyncRoutes),data.routes))
      return 'ok'
    }else{
      return Promise.reject(new Error('failed'))
    }
  },


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


  async resetToken({ commit }) {
    localStorage.removeItem('token_key')
    commit('RESET_STATE')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

