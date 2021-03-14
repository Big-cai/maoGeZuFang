import React from 'react'

import { Flex, Toast } from 'antd-mobile'

// import {
//   List,
//   AutoSizer,
//   WindowScroller,
//   InfiniteLoader
// } from 'react-virtualized'

import List from 'react-virtualized/dist/commonjs/List'
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer'
import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller'
import InfiniteLoader from 'react-virtualized/dist/commonjs/InfiniteLoader'

// 导入获取当前定位城市的方法
import { getCurrentCity, API } from '../../utils'

// 导入顶部搜索导航栏组件
import SearchHeader from '../../components/SearchHeader'
import HouseItem from '../../components/HouseItem'
import Sticky from '../../components/Sticky'
import NoHouse from '../../components/NoHouse'

// 导入 条件筛选栏组件
import Filter from './components/Filter'

// 导入样式
import styles from './index.module.scss'

export default class HouseList extends React.Component {
  state = {
    label: '',
    // 房源列表数据
    list: [],
    // 房源数量
    count: 0,
    // 数据是否加载完成
    isLoaded: false
  }

  componentWillMount () {

    this.filters.rentType = false

    const rentType = !!this.props.location.search

    if(rentType) this.filters.rentType = rentType
  }

  // 初始化 filters 数据
  filters = {}

  async componentDidMount() {
    // 当前定位城市名称
    const { label, value } = await getCurrentCity()
    this.value = value

    this.searchHouseList()

    this.setState({
      label
    })
  }

  // 获取 Filter 组件中组装好的筛选条件数据
  // 注意：这个方法就是在 条件筛选栏组件 中点击确定按钮的时候执行的
  onFilter = filters => {
    // console.log('此时应该回到页面顶部')
    // 回到页面顶部
    window.scrollTo(0, 0)

    this.filters = filters

    this.searchHouseList()
  }

  // 根据条件获取房源列表数据
  async searchHouseList(props) {
    // 开启loading
    Toast.loading('加载中...', 0, null, false)

    // 因为该方法在每次修改搜索条件的时候，都会重新调用，所以，应该在每次调用前，都要将 isLoaded 设置为false
    // 表示本次查询，数据还没有加载完成！
    this.setState({
      isLoaded: false
    })

    const res = await API.get('/houses', {
      params: {
        cityId: this.value,
        ...this.filters,
        start: 1,
        end: 20
      }
    })

    // 关闭loading
    Toast.hide()

    const { list, count } = res.data.body

    // 提示找到的房源数量
    if (count !== 0) {
      Toast.info(`共找到 ${count} 套房源`, 2, null, false)
    }

    this.setState({
      list,
      count,
      // 数据加载完成
      isLoaded: true
    })
  }

  // 渲染房源列表
  renderHouseItems = ({ key, index, style }) => {
    // console.log('当前渲染的索引号为：', index)

    const { list } = this.state
    const item = list[index]

    // 处理 item 不存在时，导致 组件内部数据加载报错的bug：
    if (!item) {
      // 此时，说明 item 项还没有加载完成，我们加载 loading
      return (
        <div key={key} style={style}>
          <p className={styles.loading} />
        </div>
      )
    }

    // key 表示唯一标识
    // style 注意：一定要传递给组件，并且组件中一定要接收并使用！！！
    return <HouseItem key={key} style={style} {...item} />
  }

  // 无限滚动列表数据是否加载完成
  isRowLoaded = ({ index }) => {
    return !!this.state.list[index]
  }

  // 无限滚动列表用来加载更多数据的方法
  loadMoreRows = ({ startIndex, stopIndex }) => {
    // console.log('起始索引号：', startIndex, '结束索引号：', stopIndex)

    return new Promise(async resolve => {
      // 这个方法用来加载更多数据，是由 InfiniteLoader 组件自己主动调用的
      // 我们需要在此处发送请求，根据 startIndex 和 stopIndex 来加载更多数据
      const res = await API.get('/houses', {
        params: {
          cityId: this.value,
          ...this.filters,
          start: startIndex,
          end: stopIndex
        }
      })

      // 数据加载完成时，让当前 Promise 完成
      resolve()
      // 注意：拿到下一页的数据应该是追加数据，而不是替换 list 数据！！
      // console.log('加载了更多数据：', res)
      this.setState({
        list: [...this.state.list, ...res.data.body.list]
      })
    })
  }

  // 渲染房源列表
  renderHouseList() {
    const { count, isLoaded } = this.state

    // 注意：因为 count 默认值为 0 ，所以，进入页面时，就会展示 没有房源 的提示！
    // 需求：进入页面时，先不要展示 没有房源 的提示。而是等到，数据加载完成后，如果 count 为0，再展示 没有房源 的提示
    // 解决：添加 数据加载完成的状态，使用该状态 和 !count 一起来决定是否展示 没有房源的提示
    if (isLoaded && !count) {
      // 没有房源
      return <NoHouse>没有找到房源，请您换个搜索条件吧~</NoHouse>
    }

    return (
      <InfiniteLoader
        isRowLoaded={this.isRowLoaded}
        loadMoreRows={this.loadMoreRows}
        rowCount={count}
      >
        {({ onRowsRendered, registerChild }) => (
          <WindowScroller>
            {({ height, isScrolling, scrollTop }) => {
              // console.log('WindowScroller：', height, scrollTop)
              return (
                <AutoSizer>
                  {({ width }) => (
                    <List
                      autoHeight
                      height={height}
                      isScrolling={isScrolling}
                      scrollTop={scrollTop}
                      width={width}
                      rowCount={count}
                      rowHeight={120}
                      rowRenderer={this.renderHouseItems}
                      onRowsRendered={onRowsRendered}
                      ref={registerChild}
                    />
                  )}
                </AutoSizer>
              )
            }}
          </WindowScroller>
        )}
      </InfiniteLoader>
    )
  }

  render() {

    const { history } = this.props

    return (
      <div className={styles.root}>
        {/* 顶部搜索导航栏 */}
        <Flex className={styles.searchHeader}>
          <i className="iconfont icon-back" onClick={history.goBack} />
          <SearchHeader
            cityName={this.state.label}
            className={styles.houseSearchHeader}
          />
        </Flex>

        {/* 条件筛选栏组件 */}
        {/* 使用 Sticky 组件包裹 Filter 组件，那么，Filter组件就会实现吸顶效果了 */}
        <Sticky height={40}>
          <Filter onFilter={this.onFilter} />
        </Sticky>

        {/* 房源列表 */}
        <div className="abc">{this.renderHouseList()}</div>
      </div>
    )
  }
}
