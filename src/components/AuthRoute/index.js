import React from 'react'

import { Route, Redirect } from 'react-router-dom'

import { isAuth } from '../../utils'

/* 
  ① 在 components 目录中创建 AuthRoute/index.js 文件。
  ② 创建组件 AuthRoute 并导出。
  ③ 在 AuthRoute 组件中返回 Route 组件（在 Route 基础上做了一层包装，用于实现自定义功能）。
  ④ 给 Route 组件，添加 render 方法，指定该组件要渲染的内容（类似于 component 属性）。
  ⑤ 在 render 方法中，调用 isAuth() 判断是否登录。
  ⑥ 如果登录了，就渲染当前组件（通过参数 component 获取到要渲染的组件，需要重命名）。
  ⑦ 如果没有登录，就重定向到登录页面，并且指定登录成功后要跳转到的页面路径。
  ⑧ 将 AuthRoute 组件接收到的 props 原样传递给 Route 组件（保证与 Route 组件使用方式相同）。
  ⑨ 使用 AuthRoute 组件配置路由规则，验证能否实现页面的登录访问控制。

  使用：
  <AuthRoute path="/rent" component={Rent} />
*/
const AuthRoute = ({ component: Component, ...rest }) => {
  // ...rest 表示剩余参数，也就是除了 component 以外，所有传递给 AuthRoute 的属性
  return (
    <Route
      {...rest}
      render={props => {
        // props 表示当前路由信息
        // console.log('AuthRoute 组件：', props)

        if (isAuth()) {
          // 登录
          return <Component {...props} />
        } else {
          // 没有登录
          return (
            <Redirect
              to={{
                // 指定要重定向的页面路径，也就是登录页面
                pathname: '/login',
                // state 表示：用来指定在路由跳转时额外传递的一些数据
                state: { from: props.location }
              }}
            />
          )
        }
      }}
    />
  )
}

export default AuthRoute
