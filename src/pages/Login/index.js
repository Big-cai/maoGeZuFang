import React from 'react'
import { Flex, WingBlank, WhiteSpace, Toast } from 'antd-mobile'

import { Link } from 'react-router-dom'

import { withFormik, Form, Field, ErrorMessage } from 'formik'

import * as Yup from 'yup'

import { API } from '../../utils'

import NavHeader from '../../components/NavHeader'

import styles from './index.module.css'

// 验证规则：
const REG_UNAME = /^[a-zA-Z_\d]{5,8}$/
const REG_PWD = /^[a-zA-Z_\d]{5,12}$/

let Login = props => {

  return (
    <div className={styles.root}>
      {/* 顶部导航 */}
      <NavHeader className={styles.navHeader}>账号登录</NavHeader>
      <WhiteSpace size="xl" />

      {/* 登录表单 */}
      <WingBlank>
        <Form>
          <div className={styles.formItem}>
            <Field
              name="username"
              className={styles.input}
              placeholder="请输入账号"
            />
          </div>
          {/* 长度为5到8位，只能出现数字、字母、下划线 */}
          <ErrorMessage
            name="username"
            component="div"
            className={styles.error}
          />
          <div className={styles.formItem}>
            <Field
              className={styles.input}
              name="password"
              type="password"
              placeholder="请输入密码"
            />
          </div>
          {/* 长度为5到12位，只能出现数字、字母、下划线 */}
          <ErrorMessage
            name="password"
            component="div"
            className={styles.error}
          />
          <div className={styles.formSubmit}>
            <button className={styles.submit} type="submit">
              登 录
            </button>
          </div>
        </Form>
        <Flex className={styles.backHome}>
          <Flex.Item>
            <Link to="/registe">还没有账号，去注册~</Link>
          </Flex.Item>
        </Flex>
      </WingBlank>
    </div>
  )
}

// 使用 withFormik 高阶组件包装Login组件
Login = withFormik({
  // 为被包装组件 Login 提供表单元素的状态值，相当于原来在 state 中添加的状态
  mapPropsToValues: () => ({ username: 'admin', password: 'admin' }),

  // 表单校验规则
  validationSchema: Yup.object().shape({
    // string() 表示：是字符串类型
    // required() 表示：必填项
    // matches() 表示：使用正则表达式来校验
    username: Yup.string()
      .required('账号为必填项')
      .matches(REG_UNAME, '长度为5到8位，只能出现数字、字母、下划线'),
    password: Yup.string()
      .required('密码为必填项')
      .matches(REG_PWD, '长度为5到12位，只能出现数字、字母、下划线')
  }),

  // 表单的提交事件
  handleSubmit: async (values, { props }) => {
    const { username, password } = values

    const res = await API.post('/user/login', {
      username,
      password
    })

    const { status, body, description } = res.data
    if (status === 200) {
      // 登录成功
      localStorage.setItem('hkzf_token', body.token)

      // 因为有两种情况都会进入到登录页面，所以，需要针对不同情况作出不同处理：
      // 1 如果 props.loaction.state 没有值，说明是直接进入到 登录页面，此时，只需要 go(-1) 返回上个页面即可
      // 2 如果 props.loaction.state 有值，说明是重定向到 登录页面的，此时，需要根据 state 中的 from 来返回即可

      // 访问页面的顺序：['/home', '/login', '/rent']
      if (!props.location.state) {
        // 没有
        props.history.go(-1)
      } else {
        // 有
        // 现有的浏览器历史记录：['/home', '/login']
        // 1 调用 push 方法跳转页面的时候，实际上就是往浏览器历史记录中添加了一条新的记录
        //  也就是：['/home', '/login', '/rent']
        // props.history.push(props.location.state.from.pathname)
        // 2 可以使用 replace 方法跳转页面，replace 不会往历史记录中添加新的记录，
        //  而是将当前的历史记录替换掉
        //  也就是：['/home', '/rent']
        props.history.replace(props.location.state.from.pathname)
      }
    } else {
      // 登录失败
      Toast.info(description, 2)
    }
  }
})(Login)

// 注意：返回的是高阶组件包装后的组件
export default Login
