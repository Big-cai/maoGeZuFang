import React, { lazy } from 'react'

import { Route } from 'react-router-dom'

// 导入 antd 组件
import { TabBar } from 'antd-mobile'
// 导入样式文件
import './index.css'

import Index from '../Index'
const HouseList = lazy(() => import('../HouesList'))
// const News = lazy(() => import('../News'))
const Profile = lazy(() => import('../Profile'))
/* import HouseList from '../HouesList'
import News from '../News'
import Profile from '../Profile' */

// 抽象TabBar菜单的数据
const tabItems = [
  {
    title: '首页',
    icon: 'icon-ind',
    path: '/home'
  },
  {
    title: '找房',
    icon: 'icon-findHouse',
    path: '/home/list'
  },
  // {
  //   title: '资讯',
  //   icon: 'icon-infom',
  //   path: '/home/news'
  // },
  {
    title: '我的',
    icon: 'icon-my',
    path: '/home/profile'
  }
]

// state 状态初始化：只发生在挂载阶段
// 切换的路由：触发的是 更新阶段，也就是不会执行 挂载阶段 的钩子函数
export default class Home extends React.Component {
  state = {
    // 设置被选中的菜单项
    selectedTab: this.props.location.pathname,
    // 控制 TabBar 是否隐藏
    hidden: false,
    // 控制是否占满整个屏幕（全屏）
    fullScreen: false
  }

  // 在组件的更新阶段，获取到当前最新的 pathname ，然后，更新状态 selectedTab 即可
  // 注意：在该钩子函数中，不能直接调用 setState()，但是，可以放在一个条件判断中，只有在满足条件的情况下，再 setState() 即可
  componentDidUpdate(prevProps) {
    // console.log('最新状态 this.props：', this.props)
    // console.log('更新前的props prevProps：', prevProps)
    const pathName = this.props.location.pathname
    const prevPathName = prevProps.location.pathname

    // 对比更新前后的两个 pathname ，只有在不同的情况下，更新状态即可
    if (pathName !== prevPathName) {
      this.setState({
        // 更新为当前路由的最新值
        selectedTab: pathName
      })
    }
  }

  // 渲染 TabBar 菜单项的方法
  renderTabBars() {
    return tabItems.map(item => (
      <TabBar.Item
        title={item.title}
        key={item.path}
        icon={<i className={`iconfont ${item.icon}`} />}
        selectedIcon={<i className={`iconfont ${item.icon}`} />}
        selected={this.state.selectedTab === item.path}
        onPress={() => {
          // 切换路由
          this.props.history.push(item.path)

          // 去掉此处的状态更新。
          // 因为 只要路由发生切换，就会触发该组件的 更新阶段，也就是会触发 componentDidUpdate，而在该钩子函数中，已经处理过状态更新了
          // this.setState({
          //   selectedTab: item.path
          // })
        }}
      />
    ))
  }

  render() {
    return (
      <div className="home">
        {/* 子路由： */}
        {/* 去掉 Index 组件路由规则中的 /index，但是，要添加 exact，否则，在切换到其他菜单的时候，也会展示该组件的内容 */}
        <Route exact path="/home" component={Index} />
        <Route path="/home/list" component={HouseList} />
        {/* <Route path="/home/news" component={News} /> */}
        <Route path="/home/profile" component={Profile} />

        {/* 底部 TabBar 菜单 */}
        <div className="tabbar">
          <TabBar tintColor="#21B97A" noRenderContent={true}>
            {this.renderTabBars()}
          </TabBar>
        </div>
      </div>
    )
  }
}
