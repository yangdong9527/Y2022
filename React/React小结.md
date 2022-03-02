### React小结

#### react-router篇

##### 1.安装以及基础使用

安装

```shell
npm install react-router-dom@5 -S
npm install @types/router-router-dom -D
```

基础的使用

```react
import React form  'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/test">Test</Link>
          </li>
        </ul>
      </div>

      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/test" component={Test} />
      </Switch>
    </BrowserRouter>
  );
};

function Home() {
  return <h1>home</h1>;
}
function Test() {
  return <h1>test</h1>;
}
```

##### 2.Route参数获取

默认情况下`<Route />`组件会将`history, match, location`传递给子组件的`props`中

在TS下定义接口

```react
import { RouteComponentProps } from 'react-router-dom'
interface PropsType extends RouteComponentProps {
  id: string
}

const Home: React.FC<PropsType> = ({id, history, location, metch}) => {
  return (...)
}
```

**跨组件的Route的获取**

+ 高阶组件

使用`withRouter`高阶组件来包裹组件

```react
import { withRouter, RouteCompoentPorps } from 'react-router-dom'
interface PropsType extends RouteComponentProps {
  id: string
}

const HomeComponent: React.FC<PropsType> = ({ id, history, location, match }) => {
  return (...)
}

export const HomePageComponent = withRouter(HomeComponent)
```

+ Hooks

在函数式组件中，直接使用`useHistory, useLocation, useParams, useRouteMatch`

##### 3.嵌套路由以及路由鉴权

###### 实现鉴权类似路由拦截的效果

主要用到的就是`<Route />`组件的`render`属性中进行判断，配合着`<Redirect />`组件重定向

```react
import React from 'react'
import { connect } from 'react-redux'
import { getUserInfo } from '@/store/actions'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'

function PrivateRoute(props) {
  const { token, role, getUserInfo } = props
  return (
  	<BrowserRouter>
    	<Switch>
      	<Route exact path="/login" component={Login} />
        <Route
         	path="/"
					render={() => {
            if (!token) {
              return <Redirect to="/login" />
            } else {
              if (role) {
                return <Layout />
              } else {
                getUserInfo(token).then(() => <Layout></Layou>)
              }
            }
          }}
         />
      </Switch>
    </BrowserRouter>
  )
}

export default connect((state) => state.user, {getUserInfo})(PrivateRoute)
```

###### 嵌套路由

其实就是在组件内部再次使用`Switch`组件

```react
// Layout.tsx

function Layout() {
  return (
  	<Header />
		<Sider />
		<div className='main-container'>
    	<Switch>
      	{routeList.map(route => {
          return (
          	handleFilter(route) && (
							<Route compoent={route.component} key={route.path} path={route.path} />
            )
          )
        })}
      </Switch>
    </div>
  )
}
```

这一块 应该还有最优解， 待完善



#### React-redux篇

##### 1. 安装及基础使用

安装

```shell
npm i redux -S
```

**理解Redux**

Reducer是什么， reducer是一个纯函数，没有副作用发生, Reducer 中可以理解成执行mutations

```ts
// appReducer.ts
// actions
import { CHANGE_OPEN, AppActionTypes } from './appAction'

interface AppState {
  open: boolean
}
const defaultAppState: AppState = {
  open: false
}

const appReducer = (state = defaultAppState, action: AppActionTypes) => {
  switch (action.type) {
    case CHANGE_OPEN:
      return {
        ...state,
        open: action.payload
      }
    default:
      return state
  }
}

export default appReducer
```

Action 返回一个个 生成 action 的工厂函数

```ts
// appActions.ts
export const CHANGE_OPEN = 'change_open'

interface ChangeOpenAction {
  type: typeof CAHNGE_OPEN,
  payload: boolean
}
export type AppActionTypes = ChangeOpenAction //... |...

// 导出生成 action 的 工厂函数
export function changeOpenActionCreator (open: boolean): ChangeOpenAction {
  return {
    type: CHANGE_OPEN,
    payload: open
  }
}
```

Store 生成一个 store

```ts
import { createStore, combineReducers } from 'redux'
import app from './app/appReducers'
import user from './user/userReducers'

const rootState = combineReducers({
  app,
  user
})
const store = creeateStore(rootState)
export type RootState = ReturnType<typeof store.getState>
export default store
```

基础的使用, 后面引入 react-redux 后会更加的方便

```ts
import store from '@/redux/store'
import { changeOpenActionCreator } from '@/redux/app/appAction'
// 获取参数
const state = soter.getState()
// 更新
const action = changeOpenActionCreator(true)
store.dispatch(action)
// 订阅state
store.subscribe(() => {
  const state = store.getState()
  this.setState({
    ...
  })
})
```

##### 2. React-redux 插件的使用

安装

```shell
npm i react-redux -S
npm i @types/react-redux -D
```

使用`Provider`组件全局注入 `store`

```tsx
import store from '@/redux/store'
import { Provider } from 'react-redux'

ReactDom.render(
	<React.StrictMode>
  	<Provider store={store}>
    	<App />
    </Provider>
  </React.StrictMode>
)
```

###### 类组件中使用

引入 `connect`组件， 他其实就是高价组件，只是不是 with 开头而已，通过它可以将 state，和 生成 action 函数 注入到 props 中去

```tsx
import { connect } from 'react-redux'
import { changeOpenActionCreator } from '@/redux/app/appAction'
import { RootState } from '@/redux/store'
import { Dispatch } from 'redux'

type PropsType = ReturnType<typeof mapStatetoProps> & Return<typeof mapDispatchToProps>
class HeaderComponent extends React.Component<PropsType> {
  render () {
    const { open } = this.props
  }
}
const mapStateToProps = (state: RootState) => {
  return {
    open: state.app.open
  }
}
const mapDiapatchToProps = (dispatch:Dispatch) => {
  return {
    changeOpen(open: boolean) {
  		const action = changeOpenActionCreator(open)
      dispatch(action)
    }
  }
}
export const Header = conncet(mapStateToProps, mapDispatchToProps)(HeaderComponent)
```



###### 函数式组件中

可以使用提供的`useSelector 和 useDispatch`来获取参数和 获取 dispatch

```tsx
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store'

export const Header: React.FC = () => {
  const open = useSelect((state: RootState) => state.app.open)
  const dispatch = useDispatch()
  return (...)
}
```

##### 3. Redux-thunk插件的使用

安装

```shell
npm i redux-thunk -S
```

给store添加中间间

```ts
import { createStore, combineReducers } from 'redux'
import app from './app/appReducers'
import user from './user/userReducers'
import thunk from 'redux-thunk'

const rootState = combineReducers({
  app,
  user
})
const store = creeateStore(rootState)
export type RootState = ReturnType<typeof store.getState>
export default store
```

`redux-thunk`的使用其实是提供给`action`可以是一个函数的功能， 然后在这个函数中你可以出发多次的`dsipatch`

```ts
// userAction.ts ts下的使用
import { ThunkAction } from 'react-thunk'

export const loginActionCreator = (): ThunkAction<void, RootState, unknow, UserActionceTypes> => (dispatch, getStte) => {
  dispatch(...)
}
```

> ​	ThunkAction 接受四个类型



##### 4. 中间件的扩展

