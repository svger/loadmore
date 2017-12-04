import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cns from 'classnames';
import Icon from 'cefc-ui-icon';

import styles from './style/index.less';

const defaultPrefixCls = 'cefc-loadmore';

const EVENTS_NAME = {
  TOUCH_START: 'touchstart',
  TOUCH_MOVE: 'touchmove',
  TOUCH_END: 'touchend',
  SCROLL: 'scroll'
};

const THROTTLES = {
  DRAG: 50,
  SCROLL: 80
};

const TIPS = {
  SCROLLING: '加载更多...',
  NO_MORE_SCROLLING: '没有更多了',
  DRAGGING: '松开刷新',
  LOADING: '刷新中'
}

class LoadMore extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isScrollLoading: false,
      isDragCompleted: false
    }
  }

  start = 0;                                        // 下拉刷新初始位置
  end = 0;                                          // 下拉刷新结束位置
  canStartDrag = true;
  isDragLoading = false;
  hasReceivedProps = false;

  componentDidMount() {
    const { TOUCH_START, TOUCH_MOVE, TOUCH_END, SCROLL } = EVENTS_NAME;

    if (this.props.needScrollLoading) {
      window.addEventListener(SCROLL, this.scrolling);
    }

    if (this.props.needDragLoading) {
      window.addEventListener(TOUCH_START, this.startDrag);
      window.addEventListener(TOUCH_MOVE, this.keepDrag);
      window.addEventListener(TOUCH_END, this.endDrag);
    }
  }

  componentWillReceiveProps(nextProps) {

    // 已经接受了数据，从加载状态变回默认状态
    if (this.state.isScrollLoading) {
      this.setState({
        isScrollLoading: false
      });
    }

    this.hasReceivedProps = true;
  }

  componentWillUnmount() {
    if (this.props.needScrollLoading) {
      window.removeEventListener(SCROLL, this.scrolling);
    }

    if (this.props.needDragLoading) {
      window.removeEventListener(TOUCH_START, this.startDrag);
      window.removeEventListener(TOUCH_MOVE, this.keepDrag);
      window.removeEventListener(TOUCH_END, this.endDrag);
    }
  }

  startDrag = (e) => {
    if (!this.props.needDragLoading) {
      return;
    }

    const scrollTop = this.getWindowScrollTop();

    if (scrollTop <= 0 && this.canStartDrag) {
      this.canStartDrag = false;
      this.isDragLoading = true;
      this.start = e.touches[0].pageY;

      this.setTransition(0);
    }
  };

  keepDrag = (e) => {
    if (!this.props.needDragLoading) {
      return;
    }

    const scrollTop = this.getWindowScrollTop();

    if (scrollTop <= 0 && this.isDragLoading) {
      this.end = e.touches[0].pageY;

      if (this.start < this.end) {
        e.preventDefault();

        const distance = this.end - this.start;
        let translate = 0;

        if (distance < THROTTLES.DRAG) {
          translate = distance;
        } else if (THROTTLES.DRAG < distance < 2 * THROTTLES.DRAG) {
          translate = 0.5 * (distance + THROTTLES.DRAG);
        } else {
          translate = 0.2 * distance + 1.1 * THROTTLES.DRAG;
        }

        this.setTranslate(translate);
      }
    }
  };

  endDrag = () => {
    if (!this.props.needDragLoading) {
      return;
    }

    if (this.isDragLoading) {
      this.isDragLoading = false;
      const distance = this.end - this.start;

      if (!isNaN(distance) && distance >= THROTTLES.DRAG) {
        this.setState({
          isDragCompleted: true
        });

        this.props.onRefresh();
        this.setTransition(2, 'cubic-bezier(.37,1.29,1,.34)');
      } else {
        this.setTransition(1);
      }

      this.setTranslate(0);

      setTimeout(() => {
        this.canStartDrag = true;
        this.setTransition(0);

        this.setState(() => ({
          isDragCompleted: false
        }));

        this.end = 0;
        this.start = 0;
      }, 2000)
    }
  };

  scrolling = () => {
    if (this.state.isScrollLoading || !this.hasReceivedProps) {
      return;
    }

    const scrollTop = this.getWindowScrollTop();
    const containerHeight = this.refs.container.offsetHeight; //容器总高度
    const windowHeight = window.innerHeight; //页面可见高度

    // 达到滚动加载阀值
    if (containerHeight - scrollTop - windowHeight < THROTTLES.SCROLL) {
      this.setState({
        isScrollLoading: true
      });

      !this.props.isOver && setTimeout(this.props.onLoadMore, 1000)
    }
  };

  getWindowScrollTop() {
    return window.pageYOffset 
    || document.documentElement.scrollTop
    || document.body.scrollTop
    || 0;
  }

  setTransition = (value, func = '') => {
    if (this.refs.container) {
      this.refs.container.style.transition = `all ${value}s ${func}`;
      this.refs.container.style.WebkitTransition = `all ${value}s ${func}`;
    }
  };

  setTranslate = (value) => {
    if (this.refs.container) {
      this.refs.container.style.transform = `translate3d(0, ${value}px, 0)`;
      this.refs.container.style.WebkitTransform = `translate3d(0, ${value}px, 0)`;
    }
  };

  renderScrollLoadingState() {
    const { prefixCls, isOver } = this.props;

    if (!this.hasReceivedProps) {
      return ;
    }

    const tipStyle = cns({
      [`${prefixCls}-loading_desc`]: true,
      [`${prefixCls}-no_scrolling`]: isOver,
    });

    return (
      <div className={`${prefixCls}-scroll_loading`}>
        {!isOver && <Icon type="loading" inline />}
        <span className={tipStyle}>{!isOver ? TIPS.SCROLLING : TIPS.NO_MORE_SCROLLING}</span>
      </div>
    )
  }

  renderDraggingLoadingState() {
    const { isDragCompleted } = this.state;
    const iconCls = cns({
      [`${prefixCls}-loading`]: true,
      [`${prefixCls}-hide`]: !isDragCompleted
    });
    const tip = isDragCompleted ? TIPS.LOADING : TIPS.DRAGGING;

    return (
      <div className={`${prefixCls}-drag_loading`}>
        <Icon type="loading" inline className={iconCls} />
        <span className={`${prefixCls}-loading_desc`}>{tip}</span>
      </div>
    )
  }

  render() {
    const { children, needDragLoading } = this.props;
    const { isScrollLoading } = this.state;

    return (
      <div ref="container" className={`${prefixCls}-container`}>
        {needDragLoading && this.renderDraggingLoadingState()}
        <div>
          {React.Children.map(children, (child) => {
            return child;
          })}
        </div>
        {isScrollLoading && this.renderScrollLoadingState()}
      </div>
    )
  }

}

LoadMore.defaultProps = {
  needDragLoading: false,
  needSrcollLoading: false,
  isOver: false,
  onDragRefresh: () => {},
  onScrollLoad: () => {},
  prefixCls: defaultPrefixCls
};

LoadMore.PropTypes = {
  needDragLoading: PropTypes.bool,
  needSrcollLoading: PropTypes.bool,
  onDragRefresh: PropTypes.func,
  onScrollLoad: PropTypes.func,
  isOver: PropTypes.bool,
  prefixCls: PropTypes.string
};

export default LoadMore;
