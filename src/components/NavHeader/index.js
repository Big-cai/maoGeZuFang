import React from 'react'

import { NavBar } from 'antd-mobile'

import { withRouter } from 'react-router-dom'

// 添加属性校验
import PropTypes from 'prop-types'

// 导入样式
import styles from './index.module.scss'

const NavHeader = ({ children, history, className, rightContent }) => {
  return (
    <NavBar
      className={[styles.navBar, className].join(' ')}
      mode="light"
      icon={<i className="iconfont icon-back" />}
      onLeftClick={() => history.go(-1)}
      rightContent={rightContent}
    >
      {children}
    </NavBar>
  )
}

// 添加属性校验
NavHeader.propTypes = {
  // 约定 children 是字符串类型，并且为必填项
  children: PropTypes.string.isRequired,
  className: PropTypes.string,
  rightContent: PropTypes.array
}

export default withRouter(NavHeader)
