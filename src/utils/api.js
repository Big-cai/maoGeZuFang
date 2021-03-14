import axios from 'axios'
import { BASE_URL } from './url'
import { getToken, removeToken } from './token'

// 创建 axios 实例
const API = axios.create({
  baseURL: BASE_URL
})

// 配置 axios 拦截器。。。

/* 
  ① 在 api.js 中，添加请求拦截器。
  ② 获取到当前请求的接口路径（url）。
  ③ 判断接口路径，是否是以 /user 开头，并且不是登录或注册接口（只给需要的接口添加请求头）。
  ④ 如果是，就添加请求头 Authorization。
  ⑤ 添加响应拦截器。
  ⑥ 判断返回值中的状态码。
  ⑦ 如果是 400，表示 token 超时或异常，直接移除 token。
*/

// 请求拦截器
API.interceptors.request.use(config => {
  const { url } = config

  // /user/login?redirect=/home
  if (
    url.startsWith('/user') &&
    !url.startsWith('/user/registered') &&
    !url.startsWith('/user/login')
  ) {
    // 要添加请求头
    config.headers.authorization = getToken()
  }

  return config
})

// 响应拦截器
API.interceptors.response.use(res => {
  if (res.data.status === 400) {
    // 移除 token
    removeToken()
  }
  return res
})

// 导出
export { API }
