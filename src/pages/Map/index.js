import React from 'react'

// 导入axios
// import axios from 'axios'

import { Toast } from 'antd-mobile'

// 导入NavHeader组件
import NavHeader from '../../components/NavHeader'
import HouseItem from '../../components/HouseItem'

// 导入utils
import { getCurrentCity, API } from '../../utils'

// 导入样式
import './index.scss'

import styles from './index.module.css'

// 注意：在 react脚手架 中，访问全局变量，需要使用 window 来访问
// 参考文档：https://facebook.github.io/create-react-app/docs/using-global-variables
const BMap = window.BMap

// 覆盖物样式
const labelStyle = {
  cursor: 'pointer',
  border: '0px solid rgb(255, 0, 0)',
  padding: '0px',
  whiteSpace: 'nowrap',
  fontSize: '12px',
  color: 'rgb(255, 255, 255)',
  textAlign: 'center'
}

export default class Map extends React.Component {
  state = {
    // 小区数据列表
    list: [],
    // 控制小区列表的展示和隐藏
    loaded: false
  }

  componentDidMount() {
    this.initMap()
  }

  // 初始化地图
  async initMap() {
    /* 
      1. 获取当前定位城市。
      2. 使用地址解析器解析当前城市坐标。
      3. 调用 centerAndZoom() 方法在地图中展示当前城市，并设置缩放级别为11。
      4. 在地图中添加比例尺和平移缩放控件。
    */
    const { label, value } = await getCurrentCity()

    const map = new BMap.Map('container')

    // 存储到this中
    this.map = map

    // 创建地址解析器实例
    const myGeo = new BMap.Geocoder()
    // 将地址解析结果显示在地图上,并调整地图视野
    // 第一个参数：用来设置一个详细的地址
    // 第二个参数：是一个回调函数，通过回调函数的参数，就可以获取到当前坐标
    // 第三个参数：城市名称
    myGeo.getPoint(
      label,
      async point => {
        map.centerAndZoom(point, 11)

        // 给地图添加控件
        map.addControl(new BMap.NavigationControl())
        map.addControl(new BMap.ScaleControl())

        // 调用渲染覆盖物的方法
        this.renderOverlays(value)

        /* 
          ① 获取房源数据。
          ② 遍历数据，创建覆盖物，给每个覆盖物添加唯一标识（后面要用）。
          ③ 给覆盖物添加单击事件。
          ④ 在单击事件中，获取到当前单击项的唯一标识。
          ⑤ 放大地图（级别为13），调用 clearOverlays() 方法清除当前覆盖物。
        */

        /* const res = await API.get('/area/map', {
          params: {
            id: value
          }
        })

        res.data.body.forEach(item => {
          const {
            coord: { longitude, latitude },
            label: areaName,
            count,
            value
          } = item
          // 创建百度地图的坐标对象
          const point = new BMap.Point(longitude, latitude)

          // 创建文本覆盖物
          const opts = {
            // 坐标
            position: point,
            // 偏移
            offset: new BMap.Size(-35, -35)
          }
          // 第一个参数：表示文本覆盖物的文字（调用 setContent 方法后，该参数内容就不再生效了，直接设置为 空字符串 即可）
          // 第二个参数：配置对象
          const label = new BMap.Label('', opts) // 创建文本标注对象

          // 设置 HTML 内容：
          label.setContent(`
            <div class="${styles.bubble}">
              <p class="${styles.name}">${areaName}</p>
              <p>${count}套</p>
            </div>
          `)

          // 设置样式
          label.setStyle(labelStyle)

          // 给 label 标签绑定单击事件
          label.addEventListener('click', () => {
            console.log('覆盖物被点击了', value)

            // 放大地图
            map.centerAndZoom(point, 13)
            // 通过定时器延迟执行清除覆盖物，可以避免报错问题
            setTimeout(() => {
              // 清除当前地图中的所有覆盖物
              map.clearOverlays()
            }, 0)
          })

          // 将创建好的覆盖物添加到地图中
          map.addOverlay(label)
        }) */
      },
      label
    )

    // 给地图绑定移动事件
    map.addEventListener('movestart', () => {
      this.setState({
        // 隐藏房源列表
        loaded: false
      })
    })
  }

  // 作用：
  // 提供地图缩放级别和覆盖物类型
  getTypeAndZoom() {
    // 计算要绘制的覆盖物类型和下一个缩放级别
    // 区   -> 11 ，范围：>=10 <12
    // 镇   -> 13 ，范围：>=12 <14
    // 小区 -> 15 ，范围：>=14 <16
    // 获取当前的缩放级别
    const curZoom = this.map.getZoom()

    let type, nextLevel

    // 假设当前地图缩放级别为 11，此时，type 为 circle（圆形覆盖物）
    // 假设当前地图缩放级别为 13，此时，type 为 circle（圆形覆盖物）
    // 假设当前地图缩放级别为 15，此时，type 为 rect（矩形覆盖物）

    if (curZoom >= 10 && curZoom < 12) {
      // 区
      type = 'circle'
      // 当前为 11， 下级为：13
      nextLevel = 13
    } else if (curZoom >= 12 && curZoom < 14) {
      // 镇
      type = 'circle'
      // 当前为 13， 下级为：15
      nextLevel = 15
    } else if (curZoom >= 14 && curZoom < 16) {
      // 小区
      type = 'rect'
    }

    return {
      type,
      nextLevel
    }
  }

  // 作用：
  // 1 获取指定区域下的房源数据
  // 2 获取地图缩放级别和覆盖物类型
  async renderOverlays(id) {
    // 开启loading
    Toast.loading('加载中...', 0, null, false)
    const res = await API.get('/area/map', {
      params: {
        id
      }
    })

    // 关闭loading
    Toast.hide()

    // 调用该方法获取到 地图缩放级别和覆盖物类型
    const { type, nextLevel } = this.getTypeAndZoom()
    res.data.body.forEach(item => {
      this.createOverlays(type, nextLevel, item)
    })
  }

  // 根据当前覆盖物类型，决定调用哪个方法创建对应覆盖物
  createOverlays(type, nextLevel, item) {
    const {
      coord: { longitude, latitude },
      label,
      count,
      value
    } = item
    // 创建百度地图的坐标对象
    const point = new BMap.Point(longitude, latitude)

    if (type === 'rect') {
      // 小区
      this.createRect(point, label, count, value)
    } else {
      // 区 或 镇
      this.createCircle(point, label, count, value, nextLevel)
    }
  }

  // 创建区、镇的覆盖物
  createCircle(point, areaName, count, id, level) {
    // 创建文本覆盖物
    const opts = {
      // 坐标
      position: point,
      // 偏移
      offset: new BMap.Size(-35, -35)
    }
    // 第一个参数：表示文本覆盖物的文字（调用 setContent 方法后，该参数内容就不再生效了，直接设置为 空字符串 即可）
    // 第二个参数：配置对象
    const label = new BMap.Label('', opts) // 创建文本标注对象

    // 设置 HTML 内容：
    label.setContent(`
      <div class="${styles.bubble}">
        <p class="${styles.name}">${areaName}</p>
        <p>${count}套</p>
      </div>
    `)

    // 设置样式
    label.setStyle(labelStyle)

    // 给 label 标签绑定单击事件
    label.addEventListener('click', () => {
      // 获取该覆盖物的下级数据
      this.renderOverlays(id)
      // 放大地图
      this.map.centerAndZoom(point, level)
      // 通过定时器延迟执行清除覆盖物，可以避免报错问题
      setTimeout(() => {
        // 清除当前地图中的所有覆盖物
        this.map.clearOverlays()
      }, 0)
    })

    // 将创建好的覆盖物添加到地图中
    this.map.addOverlay(label)
  }

  // 创建小区的覆盖物
  createRect(point, areaName, count, id) {
    // 创建文本覆盖物
    const opts = {
      // 坐标
      position: point,
      // 偏移
      offset: new BMap.Size(-50, -28)
    }
    // 第一个参数：表示文本覆盖物的文字（调用 setContent 方法后，该参数内容就不再生效了，直接设置为 空字符串 即可）
    // 第二个参数：配置对象
    const label = new BMap.Label('', opts) // 创建文本标注对象

    // 设置 HTML 内容：
    label.setContent(`
      <div class="${styles.rect}">
        <span class="${styles.housename}">${areaName}</span>
        <span class="${styles.housenum}">${count}套</span>
        <i class="${styles.arrow}"></i>
      </div>
    `)

    // 设置样式
    label.setStyle(labelStyle)

    // 用来调试，将来代码在执行的时候，就会停在当前位置。相当于在这一行打断点
    // debugger
    // 给 label 标签绑定单击事件
    // 注意：百度地图的源码中，会对我们传入的第二个参数进行类型判断，判断其类型是否为 [object Function]，如果是就调用该函数；如果不是，就不会调用该函数。
    // 此处，我们传递的是一个 async 函数，它的类型为：[object AsyncFunction] 与 [object Function] 类型不同，所以，导致整个函数没有被调用。
    // 所以，此处，不能使用 async 函数！！！
    // label.addEventListener('click', async () => {
    label.addEventListener('click', e => {
      // console.log('小区被点击了：', id, e)
      const { clientX, clientY } = e.changedTouches[0]

      // 移动距离：
      // 中心点的Y坐标 - 当前点的Y坐标
      // 中心点的X坐标 - 当前点的X坐标
      //
      // Y：(window.innerHeight - 330) / 2 - 当前点的Y坐标
      // X：window.innerWidth / 2 - 当前点的X坐标
      const x = (window.innerHeight - 330) / 2 - clientX
      const y = window.innerWidth / 2 - clientY

      this.map.panBy(x, y)

      // 获取该小区下的房源数据
      this.getCommunityHouses(id)
    })

    // 将创建好的覆盖物添加到地图中
    this.map.addOverlay(label)
  }

  // 单独封装一个方法，用来获取小区下的房源数据
  async getCommunityHouses(cityId) {
    // 开启loading
    Toast.loading('加载中...', 0, null, false)

    // 获取该小区下的房源数据
    const res = await API.get('/houses', {
      params: {
        cityId
      }
    })

    // 关闭loading
    Toast.hide()

    this.setState({
      list: res.data.body.list,
      // 数据加载完成
      loaded: true
    })
  }

  // 渲染小区的房源列表数据
  renderHouseList() {
    // 注意：添加 key 的原则是 使用 map 遍历谁，就给谁添加 key
    return this.state.list.map(item => (
      <HouseItem key={item.houseCode} {...item} />
    ))
  }

  render() {
    const { loaded } = this.state

    return (
      <div className="map">
        {/* 顶部导航栏组件 */}
        <NavHeader>地图找房</NavHeader>

        {/* 百度地图容器 */}
        <div id="container" />

        {/* 小区房源列表结构 */}
        <div
          className={[styles.houseList, loaded ? styles.show : ''].join(' ')}
        >
          <div className={styles.titleWrap}>
            <h1 className={styles.listTitle}>房屋列表</h1>
            <a className={styles.titleMore} href="/house/list">
              更多房源
            </a>
          </div>
          <div className={styles.houseItems}>{this.renderHouseList()}</div>
        </div>
      </div>
    )
  }
}
