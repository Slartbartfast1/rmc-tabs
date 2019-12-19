import React from 'react'
import { StickyContainer } from 'react-sticky'
import { TabsPropsType } from './PropsType'
import { TabPane } from './TabPane'
import { TabBar } from './TabBar'
import { TabContent } from './TabContent'
import { getIndex } from './util'

class TabsStateType {
  currentIndex: number
  current?: number | string
}

export class Tabs extends React.Component<TabsPropsType, TabsStateType> {
  static TabPane = TabPane
  state: TabsStateType
  rate: number
  vertical: boolean
  tabBarRef: React.RefObject<TabBar>

  static defaultProps = {
    prefixCls: 'rmc-tabs',
    position: 'top',
    animated: true,
    swipeable: false,
    tabHeight: 32,
    pageSize: 5,
    sticky: false
  }

  constructor(props: TabsPropsType) {
    super(props)
    const {
      children,
      position,
      pageSize,
      current,
      defaultActiveKey
    } = this.props
    this.tabBarRef = React.createRef<TabBar>()

    let rate = 100
    if (Array.isArray(children)) {
      rate = rate / Math.min(pageSize as number, children.length)
    }
    this.rate = rate
    this.vertical = position === 'left' || position === 'right'
    this.state = {
      current,
      currentIndex: getIndex(children, current || defaultActiveKey)
    }
  }

  static getDerivedStateFromProps(
    nextProps: TabsPropsType,
    prevState: TabsStateType
  ) {
    // 处理受控 current
    if (nextProps.current !== prevState.current) {
      const index = getIndex(nextProps.children, nextProps.current)
      return {
        current: nextProps.current,
        currentIndex: index
      }
    }
    return null
  }

  componentDidUpdate(prevProps: TabsPropsType, prevState: TabsStateType) {
    // 处理 onChange 事件
    const prevIndex = prevState.currentIndex
    const currentIndex = this.state.currentIndex
    if (prevIndex !== currentIndex) {
      if (this.props.onChange) {
        this.props.onChange(
          this.props.children[currentIndex],
          this.props.children[prevIndex],
          currentIndex
        )
      }
    }
  }

  gotoTab = (key: number | string) => {
    this.setIndex(getIndex(this.props.children, key))
  }

  setIndex = (index: number) => {
    // 只处理非受控
    if (this.props.current === undefined) {
      const { currentIndex } = this.state
      const { children, pageSize } = this.props
      const len = children.length - 1
      index = Math.min(Math.max(0, index), len)
      if (currentIndex !== index) {
        // tab bar 位置处理
        if (pageSize) {
          if (len > pageSize) {
            let delta = index - pageSize + 2
            // 保证不能偏移过头
            if (delta < 0) {
              delta = 0
            }
            if (len < delta + pageSize) {
              delta = len - pageSize + 1
            }
            if (!this.vertical) {
              // @ts-ignore
              const ref = this.tabBarRef.current.tabBar.current
              if (ref) {
                ref.style.left = `-${delta * this.rate}%`
                ref.style.position = 'relative'
              }
            }
          }
        }

        this.setState({
          currentIndex: index
        })
      }
    }
  }

  render() {
    const { prefixCls, position, sticky } = this.props

    const pane = [
      <TabBar
        {...this.props}
        currentIndex={this.state.currentIndex}
        setIndex={this.setIndex}
        vertical={this.vertical}
        rate={this.rate}
        key="tab-bar"
        ref={this.tabBarRef}
      />,
      <TabContent
        {...this.props}
        currentIndex={this.state.currentIndex}
        setIndex={this.setIndex}
        vertical={this.vertical}
        rate={this.rate}
        key="tab-content"
      />
    ]
    if (position === 'bottom' || position === 'right') {
      pane.reverse()
    }

    const tabs = (
      <div
        className={`${prefixCls} ${prefixCls}-${position}${
          this.vertical ? ` ${prefixCls}-vertical` : ` ${prefixCls}-horizontal`
        }`}
      >
        {pane}
      </div>
    )

    if (sticky) {
      return <StickyContainer>{tabs}</StickyContainer>
    }
    return tabs
  }
}
