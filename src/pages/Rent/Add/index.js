import React, { Component } from 'react'

import {
  Flex,
  List,
  InputItem,
  Picker,
  ImagePicker,
  TextareaItem,
  Modal,
  Toast
} from 'antd-mobile'

import { API } from '../../../utils'

import NavHeader from '../../../components/NavHeader'
import HousePackge from '../../../components/HousePackage'

import styles from './index.module.css'

const alert = Modal.alert

// 房屋类型
const roomTypeData = [
  { label: '一室', value: 'ROOM|d4a692e4-a177-37fd' },
  { label: '二室', value: 'ROOM|d1a00384-5801-d5cd' },
  { label: '三室', value: 'ROOM|20903ae0-c7bc-f2e2' },
  { label: '四室', value: 'ROOM|ce2a5daa-811d-2f49' },
  { label: '四室+', value: 'ROOM|2731c38c-5b19-ff7f' }
]

// 朝向：
const orientedData = [
  { label: '东', value: 'ORIEN|141b98bf-1ad0-11e3' },
  { label: '西', value: 'ORIEN|103fb3aa-e8b4-de0e' },
  { label: '南', value: 'ORIEN|61e99445-e95e-7f37' },
  { label: '北', value: 'ORIEN|caa6f80b-b764-c2df' },
  { label: '东南', value: 'ORIEN|dfb1b36b-e0d1-0977' },
  { label: '东北', value: 'ORIEN|67ac2205-7e0f-c057' },
  { label: '西南', value: 'ORIEN|2354e89e-3918-9cef' },
  { label: '西北', value: 'ORIEN|80795f1a-e32f-feb9' }
]

// 楼层
const floorData = [
  { label: '高楼层', value: 'FLOOR|1' },
  { label: '中楼层', value: 'FLOOR|2' },
  { label: '低楼层', value: 'FLOOR|3' }
]

export default class RentAdd extends Component {
  constructor(props) {
    super(props)

    console.log('发布房源页面：', props)
    const community = {
      name: '',
      id: ''
    }
    // 从 关键词搜索页面 获取到传递过来的小区信息
    const { state } = props.location
    if (state) {
      community.name = state.name
      community.id = state.id
    }

    this.state = {
      // 临时图片集合
      tempSlides: [],

      // 小区的名称和id
      community,
      // 价格
      price: '',
      // 面积
      size: '',
      // 房屋类型
      roomType: '',
      // 楼层
      floor: '',
      // 朝向：
      oriented: '',
      // 房屋标题
      title: '',
      // 房屋图片
      houseImg: '',
      // 房屋配套：
      supporting: '',
      // 房屋描述
      description: ''
    }
  }

  // 取消编辑，返回上一页
  onCancel = () => {
    alert('提示', '放弃发布房源?', [
      {
        text: '放弃',
        onPress: async () => this.props.history.go(-1)
      },
      {
        text: '继续编辑'
      }
    ])
  }

  // 获取表单元素的值
  getValue = (name, value) => {
    // name 表示要更新的状态
    // value 表示当前表单元素的值
    this.setState({
      [name]: value
    })
  }

  // 获取到选中图片
  handleImage = (files, type, index) => {
    // console.log(files, type, index)

    this.setState({
      tempSlides: files
    })
  }

  /* 
    ① 给提交按钮，绑定单击事件。
    ② 在事件处理程序中，判断是否有房屋图片。
    ③ 如果没有，不做任何处理。
    ④ 如果有，就创建 FormData 的实例对象（form）。
    ⑤ 遍历 tempSlides 数组，分别将每一个图片对象，添加到 form 中（键为： file，根据接口文档获得）。
    ⑥ 调用图片上传接口，传递form参数，并设置请求头 Content-Type 为 multipart/form-data。
    ⑦ 通过接口返回值获取到的图片路径。
  */
  addHouse = async () => {
    // 上传图片
    const {
      tempSlides,
      title,
      description,
      oriented,
      supporting,
      price,
      roomType,
      size,
      floor,
      community
    } = this.state

    if (tempSlides.length <= 0) return

    const form = new FormData()
    tempSlides.forEach(item => {
      form.append('file', item.file)
    })

    const res = await API.post('/houses/image', form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // 获取到上传图片的地址
    let houseImg = res.data.body.join('|')

    // 发布房源
    const houseRes = await API.post('/user/houses', {
      houseImg,
      title,
      description,
      oriented,
      supporting,
      price,
      roomType,
      size,
      floor,
      community: community.id
    })

    // console.log('发布房源结果：', houseRes)
    const { status } = houseRes.data
    if (status === 400) {
      // 登录超时，提醒用户重新登录
      Toast.info(
        '登录超时，请重新登录',
        2,
        () => {
          this.props.history.push('/login', {
            from: this.props.location
          })
        },
        false
      )
    } else {
      Toast.info(
        '发布成功',
        1,
        () => {
          this.props.history.push('/rent')
        },
        false
      )
    }
  }

  render() {
    const Item = List.Item
    const { history } = this.props
    const {
      community,
      price,
      roomType,
      floor,
      oriented,
      description,
      tempSlides,
      title,
      size
    } = this.state

    return (
      <div className={styles.root}>
        <NavHeader className={styles.rentHeader} onLeftClick={this.onCancel}>
          发布房源
        </NavHeader>

        <List
          className={styles.header}
          renderHeader={() => '房源信息'}
          data-role="rent-list"
        >
          {/* 选择所在小区 */}
          <Item
            extra={community.name || '请输入小区名称'}
            arrow="horizontal"
            onClick={() => history.replace('/rent/search')}
          >
            小区名称
          </Item>
          <InputItem
            placeholder="请输入租金/月"
            extra="￥/月"
            value={price}
            onChange={val => this.getValue('price', val)}
          >
            租&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;金
          </InputItem>
          <InputItem
            placeholder="请输入建筑面积"
            extra="㎡"
            value={size}
            onChange={val => this.getValue('size', val)}
          >
            建筑面积
          </InputItem>
          <Picker
            data={roomTypeData}
            value={[roomType]}
            cols={1}
            onChange={val => this.getValue('roomType', val[0])}
          >
            <Item arrow="horizontal">
              户&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;型
            </Item>
          </Picker>

          <Picker
            data={floorData}
            value={[floor]}
            cols={1}
            onChange={val => this.getValue('floor', val[0])}
          >
            <Item arrow="horizontal">所在楼层</Item>
          </Picker>
          <Picker
            data={orientedData}
            value={[oriented]}
            cols={1}
            onChange={val => this.getValue('oriented', val[0])}
          >
            <Item arrow="horizontal">
              朝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;向
            </Item>
          </Picker>
        </List>

        <List
          className={styles.title}
          renderHeader={() => '房屋标题'}
          data-role="rent-list"
        >
          <InputItem
            placeholder="请输入标题（例如：整租 小区名 2室 5000元）"
            value={title}
            onChange={val => this.getValue('title', val)}
          />
        </List>

        <List
          className={styles.pics}
          renderHeader={() => '房屋图像'}
          data-role="rent-list"
        >
          <ImagePicker
            files={tempSlides}
            onChange={this.handleImage}
            multiple={true}
            className={styles.imgpicker}
          />
        </List>

        <List
          className={styles.supporting}
          renderHeader={() => '房屋配置'}
          data-role="rent-list"
        >
          <HousePackge
            select
            onSelect={selectedValues => {
              // console.log('房屋配套：', selectedValues)
              this.setState({
                supporting: selectedValues.join('|')
              })
            }}
          />
        </List>

        <List
          className={styles.desc}
          renderHeader={() => '房屋描述'}
          data-role="rent-list"
        >
          <TextareaItem
            rows={5}
            placeholder="请输入房屋描述信息"
            autoHeight
            value={description}
            onChange={val => this.getValue('description', val)}
          />
        </List>

        <Flex className={styles.bottom}>
          <Flex.Item className={styles.cancel} onClick={this.onCancel}>
            取消
          </Flex.Item>
          <Flex.Item className={styles.confirm} onClick={this.addHouse}>
            提交
          </Flex.Item>
        </Flex>
      </div>
    )
  }
}
