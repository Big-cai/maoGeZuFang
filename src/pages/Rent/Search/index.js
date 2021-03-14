import React, { Component } from 'react'

import { SearchBar } from 'antd-mobile'

import debounce from 'lodash/debounce'

import { getCity, API } from '../../../utils'

import styles from './index.module.css'

export default class Search extends Component {
  // 当前城市id
  cityId = getCity().value


  // 定时器id
  timerId = null

  state = {
    // 搜索框的值
    searchTxt: '',
    tipsList: []
  }

  // 渲染搜索结果列表
  renderTips = () => {
    const { tipsList } = this.state

    return tipsList.map(item => (
      <li
        key={item.community}
        className={styles.tip}
        onClick={() => {
          // console.log('单击了', item)
          this.props.history.replace('/rent/add', {
            id: item.community,
            name: item.communityName
          })
        }}
      >
        {item.communityName}
      </li>
    ))
  }

  // 创建防抖函数，并且赋值给 search 方法
  // 调用： this.search( val )，也就是说传递给 search 方法的参数，最终，就会传递给该回调函数
  search = debounce(async val => {
    const res = await API.get('/area/community', {
      params: {
        name: val,
        id: this.cityId
      }
    })

    // console.log('关键词搜索小区信息：', res)
    this.setState({
      tipsList: res.data.body
    })
  }, 500)

  // 关键词搜索
  handleChange = val => {
    // console.log('当前输入内容为：', val)
    if (val.trim() === '') {
      // 如果搜索框中的内容为空，就将 文本框 中的值 和 列表 数据都清空
      return this.setState({
        tipsList: [],
        searchTxt: ''
      })
    }

    // 不为空，发送请求，获取该关键词对应的小区数据
    this.setState({
      searchTxt: val
    })

    // 调用 _.debounce 方法创建的防抖函数，来减少请求次数，提升性能
    this.search(val)

    // 注意：_.debouncd() 方法的作用是用来创建防抖函数的，如果直接把代码放在此处，
    // 会在每次输入内容时，创建一个防抖函数，输入几次，就会创建几个防抖函数。并且多个防抖函数之间没有任何联系
    // 所以，这样，也就无法实现防抖的功能了
    /* const fn = _.debounce(async () => {
      const res = await API.get('/area/community', {
        params: {
          name: val,
          id: this.cityId
        }
      })

      // console.log('关键词搜索小区信息：', res)
      this.setState({
        tipsList: res.data.body
      })
    }, 500)

    fn() */

    /* 
    // 每次发送请求之前，先清除上一次的定时器
    // 清除掉上一次的定时器后，定时器中的代码也就不再执行了
    clearTimeout(this.timerId)
    this.timerId = setTimeout(async () => {
      const res = await API.get('/area/community', {
        params: {
          name: val,
          id: this.cityId
        }
      })

      // console.log('关键词搜索小区信息：', res)
      this.setState({
        tipsList: res.data.body
      })
    }, 500) */
  }

  render() {
    const { history } = this.props
    const { searchTxt } = this.state

    return (
      <div className={styles.root}>
        {/* 搜索框 */}
        <SearchBar
          placeholder="请输入小区或地址"
          value={searchTxt}
          onChange={this.handleChange}
          showCancelButton={true}
          onCancel={() => history.goBack()}
        />

        {/* 搜索提示列表 */}
        <ul className={styles.tips}>{this.renderTips()}</ul>
      </div>
    )
  }
}
