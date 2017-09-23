fake-dva

patch-code, 为想在旧项目使用dva方式，优雅书写redux，又不想引入dva的同学,提供的一份patch-code。
对redux-saga和redux的简单封装。
如果喜欢这种方式，我们建议使用在新项目使用dva。
dva书写方式可见dva官方教程：https://github.com/dvajs/dva
主要依赖库参考文档：
1. redux-saga [https://github.com/redux-saga/redux-saga] 用于数据流处理
2. webpack-buddle-loader [https://github.com/webpack-contrib/bundle-loader] 用于动态加载组件
3. react-router-redux@next [https://github.com/reactjs/react-router-redux] 用于将路由信息同步到redux
4. history [https://github.com/ReactTraining/history] 用于将history信息提供给路由组件

文件说明:
1. Bundle 用于生成动态组件
2. model.js 用于加载model
3. store.js 生成redux的store并配置好相关的中间件
4. Route.js 生成路由组件。

提示：
路由配置的方式，可以根据自身项目路由的版本来配置。本例子基于v4的路由来配置。
v4路由 --> react-router-redux@next --> history@4
v2,v3路由 --> react-router-redux@4 --> history@??? (v2, v3路由怎么配置react-router-redux请使用者自行解决)


更多具体的配置和要注意的点，在文件注释中可以看到，根据注释提示进行配置即可。

本resposity只提供一份patch-code，复制粘贴到你的项目，并进行相关配置即可用。因此不提供示例。


与dva略有不同之处: effects接受的第一个参数是sagaHelper, 第二个参数是action。dva则相反。
```
// dva写法
effects: {
  * firstload(action, { put }) {
    yield put({ type: 'ggg' });
    yield put(push('/society'));
  },
},

// fake-dva patch 写法
effects: {
  * firstload({ put }, action) {
    yield put({ type: 'ggg' });
    yield put(push('/society'));
  },
},
```
