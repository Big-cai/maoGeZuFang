import React from 'react'

// import axios from 'axios'

import { Toast } from 'antd-mobile'

// 导入 react-virtualized 组件库中的 List 组件
// import { List, AutoSizer } from 'react-virtualized'
import List from 'react-virtualized/dist/commonjs/List'
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer'

// 导入顶部导航栏组件
import NavHeader from '../../components/NavHeader'

// 导入获取当前定位城市的方法
import { getCurrentCity, setCity, API } from '../../utils'
// import { setCity } from '../../utils/city'

import './index.scss'

// 封装一个方法，格式化城市列表数据
// list => [{}, {}, {}, ...]
const formatCityList = list => {
  const cityList = {}
  // const cityIndex = []

  // 1 遍历 list 数组
  // 2 拿到每一个城市的首字母
  // 3 判断 cityList 对象中，是否包含该字母索引
  // 4 如果没有，就给 cityList 添加键（当前字母索引），值是一个数组，并且要把当前城市信息添加到该数组中
  // 5 如果有，直接添加到该索引对应的数组中即可
  list.forEach(item => {
    // 2 拿到每一个城市的首字母
    const first = item.short.substr(0, 1)

    // 3 判断 cityList 对象中，是否包含该字母索引
    // if (cityList[first])
    // 只要 cityList 对象中，能够访问到 first 属性，结果就为：true
    if (first in cityList) {
      // 5 如果有，直接添加到该索引对应的数组中即可
      cityList[first].push(item)
    } else {
      // 4 如果没有，就给 cityList 添加键（当前字母索引），值是一个数组，并且要把当前城市信息添加到该数组中
      cityList[first] = [item]
    }
  })

  // 根据 cityList 对象，获取到所有的城市列表索引：
  // cityList: { a: [], b: [], c: [], ... } ===> ['a', 'b', 'c', ...]
  // Object.keys() 作用：获取对象中所有的键，返回一个数组
  const cityIndex = Object.keys(cityList).sort()

  return {
    cityList,
    cityIndex
  }
}

// 封装格式化城市列表中每一行索引
const formatCity = letter => {
  switch (letter) {
    case '#':
      return '当前定位'
    case 'hot':
      return '热门城市'
    default:
      return letter.toUpperCase()
  }
}

// 城市列表索引高度
const CITY_INDEX_HEIGHT = 36
// 城市列表中每一个城市名称的高度
const CITY_NAME_HEIGHT = 50
// 有房源城市列表：
const CITY_WITH_HOUSES = ['北京', '上海', '广州', '深圳']

export default class CityList extends React.Component {
  state = {
    // 城市按首字母分类后的列表
    cityList: {},
    // 城市首字母索引列表
    cityIndex: [],
    // 高亮索引
    activeIndex: 0
  }

  // 创建ref对象
  listRef = React.createRef()

  /* async componentDidMount() {
    await this.getCityList()

    // 手动计算 List 组件中所有行的高度
    this.listRef.current.measureAllRows()
  } */
  componentDidMount() {
    this.getCityList()
  }

  // 获取城市列表数据
  async getCityList() {
    const res = await API.get('/area/city?level=1')

    // cityList -> 城市列表： { a: [], b: [], ... }
    // cityIndex -> 城市索引：['a', 'b', ...]
    const { cityList, cityIndex } = formatCityList(res.data.body)

    // 获取热门城市数据，并添加到列表中
    const hotRes = await API.get('/area/hot')
    // hot 是我们约定的标志，将来再替换成对应的展示的名称即可
    cityIndex.unshift('hot')
    cityList['hot'] = hotRes.data.body

    // 获取当前定位城市数据
    // curCity: { label: '', value: '' }
    // 因为 getCurrentCity() 方法返回的是一个 Promise，所以，此处，直接使用 await 来等待这个异步操作的结果接口。也就是说：curCity 拿到的就是 .then() 中获取到的结果
    const curCity = await getCurrentCity()
    cityIndex.unshift('#')
    cityList['#'] = [curCity]

    // console.log('城市列表数据：', cityList, cityIndex)
    this.setState(
      {
        cityList,
        cityIndex
      },
      // 这个回调函数，会在 state 更新完成后，立即执行
      () => {
        // 手动计算 List 组件中所有行的高度
        this.listRef.current.measureAllRows()
      }
    )
  }

  // 该函数，用来渲染List列表中的每一行内容
  rowRenderer = ({ key, index, style }) => {
    // 注意：一定要给每一行添加 style 样式！！！
    const { cityIndex, cityList } = this.state
    const letter = cityIndex[index]

    return (
      <div key={key} style={style} className="city">
        <div className="title">{formatCity(letter)}</div>
        {cityList[letter].map(item => (
          <div
            key={item.value}
            className="name"
            onClick={() => {
              if (CITY_WITH_HOUSES.indexOf(item.label) > -1) {
                // console.log('有房源')
                // 保存当前定位城市数据
                setCity({ label: item.label, value: item.value })
                // 返回上一页
                this.props.history.go(-1)
              } else {
                // console.log('没有')
                Toast.info('该城市暂无房源数据', 1, null, false)
              }
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    )
  }

  // 计算每一行的高度
  calcRowHeight = ({ index }) => {
    const { cityIndex, cityList } = this.state
    // # / a / b ...
    const letter = cityIndex[index]
    // console.log(index)
    // 计算每一行高度的公式：
    // const letter = cityIndex[index] => # / a / b ...
    // 城市索引高度 + 每个城市名称的高度 * 城市数量
    // 36 + 50 * cityList[letter].length
    // return 36 + 50 * cityList[letter].length
    return CITY_INDEX_HEIGHT + CITY_NAME_HEIGHT * cityList[letter].length
  }

  // 渲染右侧城市索引列表
  renderCityIndex() {
    const { cityIndex, activeIndex } = this.state

    return cityIndex.map((item, index) => (
      <li
        key={item}
        className="city-index-item"
        onClick={() => {
          // console.log('当前索引：', index, this.listRef)

          // 在此处，要手动调用 List 组件的 scrollToRow 方法。
          // 应该使用 ref 来调用组件的方法！
          this.listRef.current.scrollToRow(index)
        }}
      >
        <span className={activeIndex === index ? 'index-active' : ''}>
          {item === 'hot' ? '热' : item.toUpperCase()}
        </span>
      </li>
    ))
  }

  // 滚动列表时让后侧城市索引高亮
  onRowsRendered = ({ startIndex }) => {
    // console.log('当前可视区最顶的索引号为：', startIndex)
    if (startIndex !== this.state.activeIndex) {
      this.setState({
        activeIndex: startIndex
      })
    }
  }

  render() {
    return (
      <div className="citylist">
        {/* 顶部导航栏 */}
        <NavHeader>城市选择</NavHeader>
        {/* 城市列表： */}
        {/* 
          注意：列表中，我们将每一组分类看做一行数据（比如：索引为A，索引为B）

          width 和 height： 表示视口（可见）的高度
          rowCount 表示：列表的长度，也就是一共有多少行数据
          rowHeight 表示：每一行的高度
          rowRenderer 表示：指定每一行要渲染什么内容的函数
        */}
        <AutoSizer>
          {({ height, width }) => (
            <List
              ref={this.listRef}
              width={width}
              height={height}
              rowCount={this.state.cityIndex.length}
              rowHeight={this.calcRowHeight}
              rowRenderer={this.rowRenderer}
              onRowsRendered={this.onRowsRendered}
              scrollToAlignment="start"
            />
          )}
        </AutoSizer>

        {/* 右侧城市索引列表结构 */}
        <ul className="city-index">{this.renderCityIndex()}</ul>
      </div>
    )
  }
}
