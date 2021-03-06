import { asyncRouterMap, constantRouterMap } from '@/router'

/**
 * 通过meta.privilege判断是否与当前用户权限匹配
 * @param privileges
 * @param route
 */
function hasPermission(privileges, route) {
  if (route.meta && route.meta.privileges) {
    return privileges.some(privilege => route.meta.privileges.includes(privilege))
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param routes asyncRouterMap
 * @param privileges
 */
function filterAsyncRouter(routes, privileges) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(privileges, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRouter(tmp.children, privileges)
      }
      res.push(tmp)
    }
  })

  return res
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateRoutes({ commit }, data) {
      return new Promise(resolve => {
        const { privileges } = data
        let accessedRouters
        if (privileges.includes('admin')) {
          accessedRouters = asyncRouterMap
        } else {
          accessedRouters = filterAsyncRouter(asyncRouterMap, privileges)
        }
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    }
  }
}

export default permission
