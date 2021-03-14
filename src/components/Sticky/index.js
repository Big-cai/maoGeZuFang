import React, { Component, createRef } from 'react'

/* 
  ① 封装 Sticky 组件。
  ② 在 HouseList 页面中，导入 Sticky 组件。
  ③ 使用 Sticky 组件包裹要实现吸顶功能的 Filter 组件。
  ④ 在 Sticky 组件中，创建两个 ref 对象（placeholder、content），分别指向占位元素和内容元素。
  ⑤ 组件中，监听浏览器的 scroll 事件（注意销毁事件）。
  ⑥ 在 scroll 事件中，通过 getBoundingClientRect() 方法得到筛选栏占位元素当前位置（top）。
  ⑦ 判断 top 是否小于 0（是否在可视区内）。
  ⑧ 如果小于，就添加需要吸顶样式（fixed），同时设置占位元素高度（与条件筛选栏高度相同）。
  ⑨ 否则，就移除吸顶样式，同时让占位元素高度为 0
*/

import PropTypes from 'prop-types'

import styles from './index.module.scss'

// 创建吸顶组件
class Sticky extends Component {
  // 内容ref对象
  contentRef = createRef()
  // 占位符ref对象
  placeholderRef = createRef()

  // 滚动事件的事件处理程序
  handleScroll = () => {
    const { height } = this.props
    // console.log('页面滚动了')
    // 占位符DOM对象
    const placeholderEl = this.placeholderRef.current
    // 内容DOM对象
    const contentEl = this.contentRef.current

    const { top } = placeholderEl.getBoundingClientRect()
    // console.log('距离页面顶部的位置：', top)
    if (top <= 0) {
      // 固定在页面顶部，添加固定定位
      // classList 是 H5 中为 DOM 对象提供的对象，用来操作DOM对象的样式
      // classList.add() 表示添加类名
      // classList.remove() 移除类名
      contentEl.classList.add(styles.fixed)
      // placeholderEl.style.height = '100px'
      placeholderEl.style.height = `${height}px`
    } else {
      // 取消固定定位
      contentEl.classList.remove(styles.fixed)
      placeholderEl.style.height = '0px'
    }
  }

  // 监听浏览器的滚动事件
  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll)
  }

  // 在组件卸载时，解绑事件
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  render() {
    return (
      <>
        {/* 占位符 */}
        <div ref={this.placeholderRef} />
        {/*
          内容

            通过 children 属性，获取到了 Sticky 组件子节点
          <Sticky>
            <Filter />
          </Sticky>
        */}
        <div ref={this.contentRef}>{this.props.children}</div>
      </>
    )
  }
}

Sticky.propTypes = {
  height: PropTypes.number.isRequired
}

export default Sticky
