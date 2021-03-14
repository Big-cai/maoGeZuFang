const TOKEN = 'hkzf_token'

// 获取token
const getToken = () => localStorage.getItem(TOKEN)

// 设置token
const setToken = val => localStorage.setItem(TOKEN, val)

// 删除token
const removeToken = () => localStorage.removeItem(TOKEN)

// 根据 token 判断是否登录
// 约定：如果有 token，就表示登录了
const isAuth = () => !!getToken()

export { getToken, setToken, removeToken, isAuth }
