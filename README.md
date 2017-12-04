# LoadMore
> 下拉刷新&上拉加载组件

## API

| 参数       | 说明             |  类型       | 默认值 |
| :---------: | :----------------: | :---------: | :----: |
| needDragLoading | 是否开启下拉刷新功能 | boolean    | false |
| needSrcollLoading | 是否开启上拉加载功能 | boolean    | false |
| onDragRefresh | 下拉刷新回调 | function    | () => {} |
| onScrollLoad | 上拉加载回调 | function    | () => {} |
| isOver | 数据是否加载完成的标志 | boolean    | () => {} |
| prefixCls | 样式前缀，如：`cefc-tabs`，可用于自定义样式 | string   | `cefc-tabs` |