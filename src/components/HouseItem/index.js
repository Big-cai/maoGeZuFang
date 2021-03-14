import React from 'react'

import { withRouter } from 'react-router-dom'

import PropTypes from 'prop-types'

import { BASE_URL } from '../../utils'

import styles from './index.module.scss'

const HouseItem = ({
  houseCode,
  houseImg,
  title,
  desc,
  tags,
  price,
  history,
  style
}) => (
  <div
    className={styles.house}
    style={style}
    onClick={() => history.push(`/details/${houseCode}`)}
  >
    <div className={styles.imgWrap}>
      <img className={styles.img} src={`${BASE_URL}${houseImg}`} alt="" />
    </div>
    <div className={styles.content}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.desc}>{desc}</div>
      <div>
        {tags.map((tag, index) => {
          if(index >= 2) return null
          // 索引号：   0 1 2 3
          // 对应类：tag1 2 3
          // tagClass => tag1 / tag2 / tag3
          const tagClass = index <= 2 ? `tag${index + 1}` : 'tag3'

          return (
            <span
              key={index}
              className={[styles.tag, styles[tagClass]].join(' ')}
            >
              {tag}
            </span>
          )
        })}
      </div>
      <div className={styles.price}>
        <span className={styles.priceNum}>{price}</span> 元/月
      </div>
    </div>
  </div>
)

HouseItem.propTypes = {
  houseImg: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  tags: PropTypes.array.isRequired,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  style: PropTypes.object
}

export default withRouter(HouseItem)
