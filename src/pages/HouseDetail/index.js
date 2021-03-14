import React, { Component } from 'react'

import { Carousel, Flex, Modal, Toast } from 'antd-mobile'

import NavHeader from '../../components/NavHeader'
import HouseItem from '../../components/HouseItem'
import HousePackage from '../../components/HousePackage'

import { BASE_URL, isAuth, API } from '../../utils'

import styles from './index.module.css'

// 猜你喜欢
const recommendHouses = [
  {
    id: 1,
    src: '/img/message/1.png',
    desc: '72.32㎡/南 北/低楼层',
    title: '安贞西里 3室1厅',
    price: 4500,
    tags: ['随时看房']
  },
  {
    id: 2,
    src: '/img/message/2.png',
    desc: '83㎡/南/高楼层',
    title: '天居园 2室1厅',
    price: 7200,
    tags: ['近地铁']
  },
  {
    id: 3,
    src: '/img/message/3.png',
    desc: '52㎡/西南/低楼层',
    title: '角门甲4号院 1室1厅',
    price: 4300,
    tags: ['集中供暖']
  }
]

// 百度地图
const BMap = window.BMap

const labelStyle = {
  position: 'absolute',
  zIndex: -7982820,
  backgroundColor: 'rgb(238, 93, 91)',
  color: 'rgb(255, 255, 255)',
  height: 25,
  padding: '5px 10px',
  lineHeight: '14px',
  borderRadius: 3,
  boxShadow: 'rgb(204, 204, 204) 2px 2px 2px',
  whiteSpace: 'nowrap',
  fontSize: 12,
  userSelect: 'none'
}

export default class HouseDetail extends Component {
  state = {
    isLoading: false,

    houseInfo: {
      // 房屋图片
      slides: [],
      // 标题
      title: '',
      // 标签
      tags: [],
      // 租金
      price: 0,
      // 房型
      roomType: '两室一厅',
      // 房屋面积
      size: 89,
      // 装修类型
      renovation: '精装',
      // 朝向
      oriented: [],
      // 楼层
      floor: '',
      // 小区名称
      community: '',
      // 地理位置
      coord: {
        latitude: '39.928033',
        longitude: '116.529466'
      },
      // 房屋配套
      supporting: [],
      // 房屋标识
      houseCode: '',
      // 房屋描述
      description: ''
    },

    // 判断房源是否收藏
    // false 表示没有收藏
    isFavorite: false
  }

  componentDidMount() {
    // 获取路由参数：
    // console.log('路由参数：', this.props, this.props.match.params)
    const { id } = this.props.match.params
    this.id = id

    this.renderMap('天山星城', {
      latitude: '31.219228',
      longitude: '121.391768'
    })

    // 调用检查房源是否收藏的方法
    this.checkFavorite()
  }

  // 检查房源是否收藏
  async checkFavorite() {
    if (!isAuth()) {
      // 没有登录
      return
    }

    // 已登录
    const res = await API.get(`/user/favorites/${this.id}`)
    // console.log('房源收藏：', res)

    const { status, body } = res.data

    if (status === 200) {
      // 请求成功
      this.setState({
        isFavorite: body.isFavorite
      })
    }
  }

  /* 
    1. 给收藏按钮绑定单击事件，创建方法 handleFavorite 作为事件处理程序。
    2. 调用 isAuth 方法，判断是否登录。
    3. 如果未登录，则使用 Modal.alert 提示用户是否去登录。
    4. 如果点击取消，则不做任何操作。
    5. 如果点击去登录，就跳转到登录页面，同时传递 state（登录后，再回到房源收藏页面）。
    6. 根据 isFavorite 判断，当前房源是否收藏。
    7. 如果未收藏，就调用添加收藏接口，添加收藏。
    8. 如果已收藏，就调用删除收藏接口，删除收藏。

    两种情况：
    1 未登录： 就直接跳转到登录页面去登录
    2 已登录：
      2.1 已收藏：应该删除收藏
        2.1.1 登录状态正常，直接删除收藏，也就是让 isFavorate: false
        2.1.2 登录状态超时，直接去掉收藏效果，也就是让 isFavorate: false

      2.2 未收藏：应该添加收藏
        2.2.1 登录状态正常，就直接添加收藏，也就是让 isFavorate: true
        2.2.2 登录状态超时，就提醒用户登录状态超时，不改变收藏状态
  */
  handleFavorite = async () => {
    if (!isAuth()) {
      // 没有登录
      return Modal.alert('提示', '登录后才能收藏房源，是否去登录?', [
        { text: '取消' },
        {
          text: '去登录',
          onPress: async () => {
            this.props.history.push('/login', {
              from: this.props.location
            })
          }
        }
      ])
    }

    // 已登录
    const { isFavorite } = this.state
    if (isFavorite) {
      // 已收藏，删除收藏
      const res = await API.delete(`/user/favorites/${this.id}`)
      // console.log('删除收藏：', res)
      const { status } = res.data
      if (status === 200) {
        Toast.info('已取消收藏', 1, null, false)
      } else {
        // 登录超时
        Toast.info('登录超时，请重新登录', 2, null, false)
      }

      this.setState({
        isFavorite: false
      })
    } else {
      // 未收藏，添加收藏
      const res = await API.post(`/user/favorites/${this.id}`)
      // console.log('添加收藏：', res)

      const { status } = res.data
      if (status === 200) {
        Toast.info('已收藏', 1, null, false)
        this.setState({
          isFavorite: true
        })
      } else {
        // token超时
        Toast.info('登录超时，请重新登录', 2, null, false)
      }
    }
  }

  // 渲染轮播图结构
  renderSwipers() {
    const {
      houseInfo: { slides }
    } = this.state

    return slides.map(item => (
      <a
        key={item.id}
        href="http://itcast.cn"
        style={{
          display: 'inline-block',
          width: '100%',
          height: 252
        }}
      >
        <img
          src={BASE_URL + item.imgSrc}
          alt=""
          style={{ width: '100%', verticalAlign: 'top' }}
        />
      </a>
    ))
  }

  // 渲染地图
  renderMap(community, coord) {
    const { latitude, longitude } = coord

    const map = new BMap.Map('map')
    const point = new BMap.Point(longitude, latitude)
    map.centerAndZoom(point, 17)

    const label = new BMap.Label('', {
      position: point,
      offset: new BMap.Size(0, -36)
    })

    label.setStyle(labelStyle)
    label.setContent(`
      <span>${community}</span>
      <div class="${styles.mapArrow}"></div>
    `)
    map.addOverlay(label)
  }

  render() {
    const { isLoading, isFavorite } = this.state
    return (
      <div className={styles.root}>
        {/* 导航栏 */}
        <NavHeader
          className={styles.navHeader}
          rightContent={[<i key="share" className="iconfont icon-share" />]}
        >
          天山星城
        </NavHeader>

        {/* 轮播图 */}
        <div className={styles.slides}>
          {!isLoading ? (
            <Carousel autoplay infinite autoplayInterval={5000}>
              {this.renderSwipers()}
            </Carousel>
          ) : (
            ''
          )}
        </div>

        {/* 房屋基础信息 */}
        <div className={styles.info}>
          <h3 className={styles.infoTitle}>
            整租 · 精装修，拎包入住，配套齐Q，价格优惠
          </h3>
          <Flex className={styles.tags}>
            <Flex.Item>
              <span className={[styles.tag, styles.tag1].join(' ')}>
                随时看房
              </span>
            </Flex.Item>
          </Flex>

          <Flex className={styles.infoPrice}>
            <Flex.Item className={styles.infoPriceItem}>
              <div>
                8500
                <span className={styles.month}>/月</span>
              </div>
              <div>租金</div>
            </Flex.Item>
            <Flex.Item className={styles.infoPriceItem}>
              <div>1室1厅1卫</div>
              <div>房型</div>
            </Flex.Item>
            <Flex.Item className={styles.infoPriceItem}>
              <div>78平米</div>
              <div>面积</div>
            </Flex.Item>
          </Flex>

          <Flex className={styles.infoBasic} align="start">
            <Flex.Item>
              <div>
                <span className={styles.title}>装修：</span>
                精装
              </div>
              <div>
                <span className={styles.title}>楼层：</span>
                低楼层
              </div>
            </Flex.Item>
            <Flex.Item>
              <div>
                <span className={styles.title}>朝向：</span>南
              </div>
              <div>
                <span className={styles.title}>类型：</span>普通住宅
              </div>
            </Flex.Item>
          </Flex>
        </div>

        {/* 地图位置 */}
        <div className={styles.map}>
          <div className={styles.mapTitle}>
            小区：
            <span>天山星城</span>
          </div>
          <div className={styles.mapContainer} id="map">
            地图
          </div>
        </div>

        {/* 房屋配套 */}
        <div className={styles.about}>
          <div className={styles.houseTitle}>房屋配套</div>
          <HousePackage
            list={[
              '电视',
              '冰箱',
              '洗衣机',
              '热水器',
              '沙发',
              '衣柜',
              '天然气'
            ]}
          />
          {/* <div className="title-empty">暂无数据</div> */}
        </div>

        {/* 房屋概况 */}
        <div className={styles.set}>
          <div className={styles.houseTitle}>房源概况</div>
          <div>
            <div className={styles.contact}>
              <div className={styles.user}>
                <img src={BASE_URL + '/img/avatar.png'} alt="头像" />
                <div className={styles.useInfo}>
                  <div>王女士</div>
                  <div className={styles.userAuth}>
                    <i className="iconfont icon-auth" />
                    已认证房主
                  </div>
                </div>
              </div>
              <span className={styles.userMsg}>发消息</span>
            </div>

            <div className={styles.descText}>
              {/* {description || '暂无房屋描述'} */}
              1.周边配套齐全，地铁四号线陶然亭站，交通便利，公交云集，距离北京南站、西站都很近距离。
              2.小区规模大，配套全年，幼儿园，体育场，游泳馆，养老院，小学。
              3.人车分流，环境优美。
              4.精装两居室，居家生活方便，还有一个小书房，看房随时联系。
            </div>
          </div>
        </div>

        {/* 推荐 */}
        <div className={styles.recommend}>
          <div className={styles.houseTitle}>猜你喜欢</div>
          <div className={styles.items}>
            {recommendHouses.map(item => {
              return <HouseItem {...item} houseImg={item.src} key={item.id} />
            })}
          </div>
        </div>

        {/* 底部收藏按钮 */}
        <Flex className={styles.fixedBottom}>
          <Flex.Item onClick={this.handleFavorite}>
            {isFavorite ? (
              <>
                <img
                  src={BASE_URL + '/img/star.png'}
                  className={styles.favoriteImg}
                  alt="收藏"
                />
                <span className={styles.favorite}>已收藏</span>
              </>
            ) : (
              <>
                <img
                  src={BASE_URL + '/img/unstar.png'}
                  className={styles.favoriteImg}
                  alt="收藏"
                />
                <span className={styles.favorite}>收藏</span>
              </>
            )}
          </Flex.Item>
          <Flex.Item>在线咨询</Flex.Item>
          <Flex.Item>
            <a href="tel:400-618-4000" className={styles.telephone}>
              电话预约
            </a>
          </Flex.Item>
        </Flex>
      </div>
    )
  }
}
