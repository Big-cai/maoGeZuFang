/* 
  项目的入口文件
*/
import React from 'react'
import ReactDOM from 'react-dom'

// 导入antd-mobile的样式
// import 'antd-mobile/dist/antd-mobile.css'

// 导入 react-virtualized 组件库的样式
import 'react-virtualized/styles.css'

// 导入字体图标库的样式
import './assets/fonts/iconfont.css'

// 导入根组件
import App from './App'

// 注意：导入全局样式，注意样式覆盖的问题
import './index.css'

import * as Sentry from '@sentry/browser'
Sentry.init({dsn: "https://bc659920f6444607afa03fe57dd73955@sentry.itheima.net/52"})

// 渲染根组件
ReactDOM.render(<App />, document.getElementById('root'))
