import request from '@/utils/request'


/*
登陆
*/
export function login({ username, password }) {
  return request({
    url: '/admin/acl/index/login',
    method: 'post',
    data: { username, password }
  })
}

/*
获取用户信息(根据token)
*/
export function getInfo() {
  return request({
    url: '/admin/acl/index/info',
    method: 'get'
  })
}

/*
登出
*/
export function logout() {
  return request({
    url: '/admin/acl/index/logout',
    method: 'post'
  })
}

