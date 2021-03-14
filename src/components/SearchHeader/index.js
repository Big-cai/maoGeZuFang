import React from 'react'

import { Flex } from 'antd-mobile'

// 导入路由高阶组件
import { withRouter } from 'react-router-dom'

// 导入属性校验的包
import PropTypes from 'prop-types'

// 导入组件样式
import styles from './index.module.scss'

const SearchHeader = ({ history, cityName, className }) => {
  return (
    <Flex className={[styles.searchBox, className].join(' ')}>
      <Flex className={styles.searchLeft}>
        <div
          className={styles.location}
          onClick={() => history.push('/citylist')}
        >
          <span>{cityName}</span>
          <i className="iconfont icon-arrow" />
        </div>
        <div
          className={styles.searchForm}
          onClick={() => history.push('/rent/search')}
        >
          <i className="iconfont icon-seach" />
          <span>请输入小区或地址</span>
        </div>
      </Flex>
      <i className="iconfont icon-map" onClick={() => history.push('/map')} />
    </Flex>
  )
}

// 添加属性校验
SearchHeader.propTypes = {
  cityName: PropTypes.string.isRequired,
  className: PropTypes.string
}

export default withRouter(SearchHeader)
