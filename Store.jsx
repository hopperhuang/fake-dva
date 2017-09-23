import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import createSagaMiddleware from 'redux-saga';
// 引入root reducer, 跟models.js的rootReducer保持一致
import reducer from '../Reducer';
// 有时候你不需要引入rootsaga
import rootSaga from '../sagas';
// 从models引入history
import { history } from '../models';
    // eslint-disable-next-line
 const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// redux-saga的配置方式在下面
// 更多配置方式请查看官方文档：https://github.com/redux-saga/redux-saga

const sagaMiddleware = createSagaMiddleware();
const routerReduxMiddleware = routerMiddleware(history);
const store = createStore(
    combineReducers(reducer),
    composeEnhancers(applyMiddleware(sagaMiddleware, routerReduxMiddleware),
  ),
);

store.runSaga = sagaMiddleware.run;

sagaMiddleware.run(rootSaga);


// store输出给 provider和router.js使用
export default store;
