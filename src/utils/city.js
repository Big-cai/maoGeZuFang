// 使用常量（全大写字母）来存储当前城市的键
const CITY_KEY = 'hkzf_city'

// 获取当前定位城市：
export const getCity = () => JSON.parse(localStorage.getItem(CITY_KEY))

// 设置当前定位城市：
export const setCity = value =>
  localStorage.setItem(CITY_KEY, JSON.stringify(value))
