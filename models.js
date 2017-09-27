import * as _sagaEffects from 'redux-saga/effects';
import { combineReducers } from 'redux';
import createBrowserHistory from 'history/createBrowserHistory';
//  引入rootReducer, rootReducer必须给store.js里面的rootReducer一致
import basicReducer from './Reducer/Index';

const browserHistory = createBrowserHistory();

const { fork } = _sagaEffects;
const cache = {};

export const history = (function hackHistory(hist) {
  const hackhistory = hist;
  const { listen } = hackhistory;
  hackhistory.listen = (callback) => {
    callback(history.location);
    listen(callback);
  };
  return hackhistory;
}(browserHistory));


function getAsyncReducer(reducers, namespace, defaultState) {
  const reducerKeys = Object.keys(reducers);
  const perFixReducer = {};
  for (let index = 0; index < reducerKeys.length; index++) {
    const reducerKey = reducerKeys[index];
    perFixReducer[`${namespace}-${reducerKey}`] = reducers[reducerKey];
  }
  const asyncReducers = (state = defaultState, action) => {
    const { type } = action;
    if (perFixReducer[type]) {
      return perFixReducer[type](state, action);
    }
    return state;
  };
  return asyncReducers;
}

function makeWatcher(takeValue, effect, namespace) {
  // 改写Put方法
  const put = (_action) => {
    const action = _action;
    const oldMethod = _sagaEffects.put;
    const { type } = action;
    // router直接转发
    if (type.indexOf('router') >= 0) {
      return oldMethod(action);
    }
    // 非router,而且没有前缀的情况下加namespace最为前缀
    if (type.indexOf('-') < 0) {
      action.type = `${namespace}-${type}`;
    }
    // 返回一个put包裹过的对象给yield
    return oldMethod(action);
  };
  const sagaEffects = { ..._sagaEffects, put };
  if (Array.isArray(effect)) {
    const helperType = effect[1].type;
    const ms = effect[1].ms;
    if (helperType === 'throttle') {
      return function* throttleWatcher() {
        yield sagaEffects[helperType](ms, takeValue, effect[0], sagaEffects);
      };
    }
    if (helperType === 'takeLatest') {
      return function* takeLastWatcher() {
        yield sagaEffects[helperType](takeValue, effect[0], sagaEffects);
      };
    }
  }
  return function* takeEveryWatcher() {
    yield sagaEffects.takeEvery(takeValue, effect, sagaEffects);
  };
}

function getWatcher(key, effect, namespace) {
  const takeValue = `${namespace}-${key}`;
  return makeWatcher(takeValue, effect, namespace);
}


// rootsaga
function* getEffects(effects, namespace) {
  const effectsKeys = Object.keys(effects);
  for (let index = 0; index < effectsKeys.length; index++) {
    const key = effectsKeys[index];
    const effect = effects[key];
    const watcher = getWatcher(key, effect, namespace);
    yield fork(watcher);
  }
}


function createReducer(asyncReducers) {
  return combineReducers({
    ...basicReducer,
    ...asyncReducers,
  });
}

const asyncReducer = {};

// 注册model
export default function registerModel(model, store) {
  const { namespace } = model;
   // 加入缓存机制
  if (!cache[namespace]) {
    // 加载reudcer
    const { reducers, effects, subscriptions } = model;
    const defaultState = model.state;
    if (reducers) {
      const newAsyncReducer = getAsyncReducer(reducers, namespace, defaultState);
      asyncReducer[namespace] = newAsyncReducer;
      store.replaceReducer(createReducer(asyncReducer));
    }
    if (effects) {
      // // 加载saga
      store.runSaga(getEffects, effects, namespace);
    }
    if (subscriptions) {
      const subscriptionsKeys = Object.keys(subscriptions);
      const hackDispatch = store.dispatch;
      const dispatch = (act) => {
        const action = act;
        const { type } = action;
        if (type.indexOf('-') < 0) {
          action.type = `${namespace}-${type}`;
        }
        hackDispatch(action);
      };
      subscriptionsKeys.forEach(key => subscriptions[key]({ dispatch, history }));
    }
    cache[namespace] = true;
  }
}


// model 扩展器， 引用自dva-model-extend
export function modelExtend(...models) {
  const base = {
    state: {},
    subscriptions: {},
    effects: {},
    reducers: {},
  };
  return models.reduce((acc, extend) => {
    acc.namespace = extend.namespace;
    if (typeof extend.state === 'object' && !Array.isArray(extend.state)) {
      Object.assign(acc.state, extend.state);
    } else if ('state' in extend) {
      acc.state = extend.state;
    }
    Object.assign(acc.subscriptions, extend.subscriptions);
    Object.assign(acc.effects, extend.effects);
    Object.assign(acc.reducers, extend.reducers);
    return acc;
  }, base);
}
