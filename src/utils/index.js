// import axios from 'axios'

// 导入当前城市的本地存储操作
import { getCity, setCity } from './city'

import { API } from './api'

// 获取当前定位城市数据
// 返回值的当前定位城市数据格式为： { label: '', value: '' }
/* 
  1. 判断 localStorage 中是否有定位城市
  2. 如果没有，就使用首页中获取定位城市的代码来获取，并且存储到本地存储中，然后返回该城市数据
  3. 如果有，直接返回本地存储中的城市数据
*/
const getCurrentCity = () => {
  // 1. 判断 localStorage 中是否有定位城市
  // const curCity = JSON.parse(localStorage.getItem('hkzf_city'))
  const curCity = getCity()

  if (!curCity) {
    // 没有
    return new Promise(resolve => {
      const myCity = new window.BMap.LocalCity()
      myCity.get(async result => {
        const res = await API.get('/area/info', {
          params: {
            name: result.name
          }
        })
        const { label, value } = res.data.body

        // 保存到本地缓存中
        // localStorage.setItem('hkzf_city', JSON.stringify({ label, value }))
        setCity({ label, value })

        // 异步操作成功，调用 resolve
        resolve({ label, value })
      })
    })
  } else {
    // 有
    return Promise.resolve(curCity)
  }
}

export { getCurrentCity, getCity, setCity }

// 为了更方便的获取 BASE_URL，在当前代码中导入后，再导出
// import {} ...
// export ...
export { BASE_URL } from './url'

// 导入并导出 API
export { API } from './api'

// 导入并导出所有 token 操作
export * from './token'
