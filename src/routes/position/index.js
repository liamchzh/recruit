import React from 'react'
import {connect} from 'dva'
import {Button} from 'antd'
import List from 'components/Common/List'
import * as R from 'ramda'

import styles from './index.less'

@connect(state => ({
  loading: state.loading.models.positions,
}))
export default class PositionList extends React.Component {
  state = {
    data: [],
    remain: 0,
    page: 0,
  }

  componentWillMount() {
    this.refreshData()
  }

  refreshData = () =>
    this.loadData().then(data => {
      this.setState({
        data: data.jobs,
        remain: data.remain,
      })
    })

  appendData = () => {
    this.loadData().then(data => {
      this.setState({
        data: R.uniqBy(R.prop('webjid'), [...this.state.data, ...data.jobs]),
        remain: data.remain,
      })
    })
  }

  loadData = () =>
    this.props.dispatch({
      type: 'positions/fetch',
      payload: {
        page: this.state.page,
        state: 'all',
      },
    })

  loadMore = () => {
    this.setState(
      {
        page: this.state.page + 1,
      },
      this.appendData
    )
  }

  handleRedirectCreate = () => {
    this.props.history.push('/ent/positions/create')
  }

  handleRedirectEdit = id => () => {
    this.props.history.push(`/ent/positions/modify/${id}`)
  }

  handleUpdateState = (webjid, state) => () => {
    this.props
      .dispatch({
        type: 'positions/updateState',
        payload: {
          webjid,
          state,
        },
      })
      .then(this.refreshData)
  }

  renderCard = data => {
    const infoField = ['province', 'worktime', 'sdegree', 'salary']
    const info = Object.values(R.pickAll(infoField, data)).join(`  |  `)
    const cardClass = data.state === 'close' ? styles.cardClosed : ''
    return (
      <div className={`${styles.card} ${cardClass}`} key={data.webjid}>
        <div>
          <p className={styles.title}>{data.position}</p>
          <p>{info}</p>
        </div>
        <div className={styles.opButtons}>
          <Button
            onClick={this.handleRedirectEdit(data.webjid)}
            className={styles.commonButton}
          >
            编辑
          </Button>
          {data.state === 'valid' && (
            <Button
              onClick={this.handleUpdateState(data.webjid, 'close')}
              className={styles.commonButton}
            >
              关闭
            </Button>
          )}
          {data.state === 'close' && (
            <Button
              onClick={this.handleUpdateState(data.webjid, 'valid')}
              className={styles.commonButton}
            >
              打开
            </Button>
          )}
        </div>
      </div>
    )
  }

  renderCards = () => this.state.data.map(this.renderCard)

  renderButton = () => (
    <div className={styles.header} key="button">
      <Button
        className={styles.activeButton}
        onClick={this.handleRedirectCreate}
      >
        发布职位
      </Button>
    </div>
  )

  render() {
    const {loading} = this.props
    const {data, remain} = this.state
    return [
      this.renderButton(),
      <List
        renderList={this.renderCards}
        loadMore={this.loadMore}
        loading={loading}
        dataLength={data.length}
        remain={remain}
        key="list"
        search="all"
      />,
    ]
  }
}
