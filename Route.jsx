import React from 'react';
import PropTypes from 'prop-types';
import { ConnectedRouter } from 'react-router-redux';
import { Route, Switch } from 'react-router-dom';
// bundle模型用来异步加载组件
// bundle组件的用法可以看v4官方文档： 文档地址：https://reacttraining.com/react-router/web/guides/code-splitting
import Bundle from '../Bundle';
// 从Model引入history
import { history } from '../models';
// 引入store
import store from './Store'; // 引入Store

// 异步加载组件的引入方式：文档地址：https://reacttraining.com/react-router/web/guides/code-splitting

// 引入需要异步加载的组件
import firstAsyncComponent from 'bundle-loader?lazy!yourAsynComponent';// 公会入口
import secondAsyncComponent from 'bundle-loader?lazy!yourAsynComponent';// 具体公会
// code...  组件加载写在这上边
/////////////////////
/////////////////////

// 引入model
import entryModel from '../Model/entry';
import societyModel from '../Model/society';


function RouteConfigWithStore(store, history) {
  /* eslint-enable */
  const createComponent = (function createComponentMaker(_store) {
    return (component, model) => props => (
      <Bundle model={model} store={_store} load={component}>
        {Component => <Component {...props} />}
      </Bundle>
    );
  }(store));

  const AsyncComp_A = createComponent(firstAsyncComponent, entryModel);
  const AsyncComp_B = createComponent(secondAsyncComponent, societyModel);

  const RouteConfig = (props) => {
    const { islogin } = props.login;
    return (
      <ConnectedRouter history={history}>
        <Switch>


          {/* 这里是公会入口部分 */}
          <Route
            exact path="/firstPath"
            render={routeProps => (<AsyncComp_A
              {...routeProps}
            />)}
          />
          <Route path="/secondPath" component={AsyncComp_B} />
        </Switch>
      </ConnectedRouter>
    );
  };

  RouteConfig.propTypes = {
    login: PropTypes.object.isRequired,
  };
  return RouteConfig;
}

const app = RouteConfigWithStore(store, history);
// 导出
export default app;
