import React from 'react'

import { Carousel, Flex, Grid, WingBlank } from 'antd-mobile'

import { getCurrentCity, BASE_URL, API } from '../../utils'

// 导入SearchHeader组件
import SearchHeader from '../../components/SearchHeader'

// import './index.css'
// 导入 SASS 文件
import './index.scss'

// 导入图片
import nav1 from '../../assets/images/nav-1.png'
import nav2 from '../../assets/images/nav-2.png'
import nav3 from '../../assets/images/nav-3.png'
import nav4 from '../../assets/images/nav-4.png'

// 导航菜单的数据
const menus = [
  { name: '整租', imgSrc: nav1, path: '/home/list?rent=1' },
  { name: '合租', imgSrc: nav2, path: '/home/list' },
  { name: '地图找房', imgSrc: nav3, path: '/map' },
  { name: '去出租', imgSrc: nav4, path: '/rent/add' }
]

export default class Index extends React.Component {
  state = {
    // 图片高度
    imgHeight: 212,

    // 轮播图数据
    swipers: [],
    // 轮播图数据是否加载完成
    isSwiperLoaded: false,

    // 租房小组数据
    groups: [],

    // 最新资讯
    news: [],

    // 当前定位城市名称
    curCityName: '上海'
  }

  async componentDidMount() {
    // 调用获取轮播图数据方法
    this.getSwipers()
    this.getGroups()
    this.getNews()

    // 调用封装好的获取当前定位城市的方法
    const { label } = await getCurrentCity()
    this.setState({
      curCityName: label
    })
  }

  // 获取租房小组数据
  async getGroups() {
    const res = await API.get('/home/groups?area=AREA%7C88cff55c-aaa4-e2e0')

    // console.log('租房小组数据：', res)
    this.setState({
      groups: res.data.body
    })
  }

  // 获取轮播图数据
  async getSwipers() {
    const res = await API.get('/home/swiper')

    // console.log('轮播图数据为：', res)
    this.setState({
      swipers: res.data.body,
      // 设置为true，表示轮播图数据已经加载完成
      isSwiperLoaded: true
    })
  }

  // 获取最新资讯
  async getNews() {
    const res = await API.get('/home/news?area=AREA%7C88cff55c-aaa4-e2e0')

    this.setState({
      news: res.data.body
    })
  }

  // 渲染轮播图数据
  renderSwipers() {
    return this.state.swipers.map(item => (
      <a
        key={item.id}
        href="http://itcast.cn"
        style={{
          display: 'inline-block',
          width: '100%',
          height: 212
        }}
      >
        <img
          src={`${BASE_URL}${item.imgSrc}`}
          alt=""
          style={{ width: '100%', verticalAlign: 'top' }}
          onLoad={() => {
            window.dispatchEvent(new Event('resize'))
            this.setState({ imgHeight: 'auto' })
          }}
        />
      </a>
    ))
  }

  // 渲染导航菜单
  renderMenus() {
    return menus.map(item => (
      <Flex.Item
        key={item.name}
        onClick={() => this.props.history.push(item.path)}
      >
        <img src={item.imgSrc} alt="" />
        <p>{item.name}</p>
      </Flex.Item>
    ))
  }

  // 渲染最新资讯
  renderNews() {
    return this.state.news.map(item => (
      <div className="news-item" key={item.id}>
        <div className="imgwrap">
          <img
            className="img"
            src={`${BASE_URL}${item.imgSrc}`}
            alt=""
          />
        </div>
        <Flex className="content" direction="column" justify="between">
          <h3 className="title">{item.title}</h3>
          <Flex className="info" justify="between">
            <span>{item.from}</span>
            <span>{item.date}</span>
          </Flex>
        </Flex>
      </div>
    ))
  }

  render() {
    return (
      <div className="index">
        {/* 轮播图： */}
        <div className="swiper">
          {/* 搜索导航栏组件 */}
          <SearchHeader cityName={this.state.curCityName} />

          {/* 通过 isSwiperLoaded 这个数据，来决定是否渲染轮播图。也就是在轮播图数据加载完成后，再渲染 轮播图组件，此时，因为已经有轮播图数据了，所以，此时，渲染的轮播图就可以自动播放了 */}
          {this.state.isSwiperLoaded && (
            <Carousel autoplay={true} infinite>
              {this.renderSwipers()}
            </Carousel>
          )}
        </div>

        {/* 导航菜单 */}
        <Flex className="nav">{this.renderMenus()}</Flex>

        {/* 租房小组 */}
        <div className="groups">
          <Flex className="groups-title" justify="between">
            <h3>租房小组</h3>
            <span>更多</span>
          </Flex>

          {/* 
            rendeItem 属性：用来 自定义 每一个单元格中的结构
          */}
          <Grid
            data={this.state.groups}
            columnNum={2}
            square={false}
            activeStyle
            hasLine={false}
            renderItem={item => (
              <Flex className="grid-item" justify="between">
                <div className="desc">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
                <img src={`${BASE_URL}${item.imgSrc}`} alt="" />
              </Flex>
            )}
          />
        </div>

        {/* 最新资讯 */}
        <div className="news">
          <h3 className="group-title">最新资讯</h3>
          <WingBlank size="md">{this.renderNews()}</WingBlank>
        </div>
      </div>
    )
  }
}
