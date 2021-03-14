/* 
  配置路由
*/

import React, { lazy, Suspense } from 'react'

// 导入路由的三个组件
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'

// 导入页面组件
import Home from './pages/Home'

const Map = lazy(() => import('./pages/Map'))
const HouseDetail = lazy(() => import('./pages/HouseDetail'))
const Login = lazy(() => import('./pages/Login'))
const Rent = lazy(() => import('./pages/Rent'))
const RentAdd = lazy(() => import('./pages/Rent/Add'))
const RentSearch = lazy(() => import('./pages/Rent/Search'))
const AuthRoute = lazy(() => import('./components/AuthRoute'))

const CityList = lazy(() => import('./pages/CityList'))

/* import CityList from './pages/CityList'
import Map from './pages/Map'

// 房屋详情页面
import HouseDetail from './pages/HouseDetail'
import Login from './pages/Login'

// 导入房源发布组件
import Rent from './pages/Rent'
import RentAdd from './pages/Rent/Add'
import RentSearch from './pages/Rent/Search'

// 测试AuthRoute组件
import AuthRoute from './components/AuthRoute' */

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div className="loading">loading...</div>}>
        <div className="App">
          {/* 配置路由 */}
          {/* render 属性，实际上就是 render-props 模式，可以通过 props 属性，来拿到 Route 组件内部暴露出来的 路由信息 */}
          <Route
            exact
            path="/"
            render={props => {
              // console.log('render-props模式：', props)
              // Redirect 组件：是路由的重定向组件，通过 to 属性，来指定要重定向到的路由地址
              return <Redirect to="/home" />
            }}
          />

          {/* 
          /home 路由规则：能够匹配所有以 /home 开头的 pathname
            比如：/home/profile
        */}
          <Route path="/home" component={Home} />
          <Route path="/citylist" component={CityList} />
          <Route path="/map" component={Map} />
          <Route path="/details/:id" component={HouseDetail} />
          <Route path="/login" component={Login} />

          {/* AuthRoute 组件 */}
          <AuthRoute exact path="/rent" component={Rent} />
          <AuthRoute path="/rent/add" component={RentAdd} />
          <AuthRoute path="/rent/search" component={RentSearch} />
        </div>
      </Suspense>
    </Router>
  )
}

export default App
