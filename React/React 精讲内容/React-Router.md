### React-Router

#### 安装

```powershell
npm install react-router-dom -S
npm install @types/react-router-dom -D
```



#### 路由配置

`BrowserRouter`和`Route`组件直接使用,默认会产生页面堆叠,所以需要配合`Switch`组件一起使用,`Switer`组件只会渲染一条路径消除页面堆叠效果

```jsx
function App () {
    return (
    	<BrowserRouter>
            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route path="/signIn" render={() => <h1>登录页面</h1>} />
              <Route render={() => <h1>404 not found 页面去火星了 ！</h1>} />
            </Switch>
          </BrowserRouter>
    )
}
```

配合`exact`属性更加精准

#### RouteProps

TS中可以通过`RouteComponentProps`获取基础

```tsx
import { RouteComponentProps } from 'react-router-dom'
interface PropsType extends RouteComponentProps {
    id: string
}

export const HomePage: React:FC<PropsType> = (props) => {}
```

`RouteProps`中的三个参数`history, location,match`, `history`中有路由跳转方法, `match`中有路由的基本信息

#### 跨组件获取Route

##### HOC组件 withRouter

```tsx
import { withRouter, RouteComponentProps } from 'react-router-dom'

interface PropsType extends RouteComponentProps {
    id: string
}

const ProductComponent: React.FC<PropsType> = ({id, history,location, metch}) => {
    return (
    	<div onClick={() => history.push('home')}></div>
    )
}

export const Product = withRouter(ProductComponent)
```



##### Hooks

使用Hooks钩子函数, `useHistory, useLocation,useParams, useProuteMatch`



#### Link 组件

使用`Link`组件代替 `history`的push





### Redux

#### 安装

```powershell
npm i redux -S
```

#### 基础使用

##### 创建store

```ts
// reducer
export interface LanguageState {
  language: "en" | "zh";
  languageList: { name: string; code: string }[];
}

const defaultState: LanguageState = {
  language: "zh",
  languageList: [
    { name: "中文", code: "zh" },
    { name: "English", code: "en" },
  ],
};

export default (state = defaultState, action) => {
    if (action.type === 'change_language') {
        const newState = {...state, language: action.payload}
        return newState
    }
    return state
}
```

`reducer函数`是一个纯函数，是没有副作用发生的

```ts
import { createStore } from 'redux'
import { languageReducer } from './languageReducer'

const store = createStore(languateReducer)

export default store
```

##### 获取state

```ts
import store from '../redux'

const state = store.getState()
```

##### 更新state

```ts
import store from '../redux'

const action = {type: 'change_language', payload: 'zh'}
store.dispatch(action)
```

##### 订阅state

```ts
import store from '../redux'

store.subscribe(() => {
    const storeate = store.getStaate()
    this.setState({
        langauge: storeate.language
    })
})
```



#### 多个reducer

使用到 `combineReducers`

```tsx
import { createStore, combineReducers } form 'redux'
import languageReducer from './language/languageReucer'
import recommendProductsReducer from './recommendProduc/adfa'

const rootReducer = combineReducers({
    language: languageReducer,
    recommendProducts： recomendProductsReducer
})
const sore = createStore(rootReducer)
export type RootState = ReturnType<typeof store.getState>
export default store
```







#### redux重构

`Action工厂函数创建Action`

```ts
// redux/language/languageActions.ts
export const CHANGE_LANGUAGE = 'change_language'

interface ChangeLanguageAction {
    type: typeof CHANGE_LANGUAGE;
    payload: 'zh' | 'en'
}

export type LanguageActionTypes = ChangeLanguageAction | ...

export const changeLangagaeActionCreator = (languageCode: 'zh' | 'en'): ChangeLanguageAction => {
    return {
        type: CHANGE_LANGUAGE,
        payload: languageCode
    }
}
```

`reducer`

```ts
// redux/langauge/languageReducer.ts
import { CHANGE_LANGUAGE, LanguageActionTypes } from "./languageActions";
export interface LanguageState {
  language: "en" | "zh";
  languageList: { name: string; code: string }[];
}

const defaultState: LanguageState = {
  language: "zh",
  languageList: [
    { name: "中文", code: "zh" },
    { name: "English", code: "en" },
  ],
};

export default (state = defaultState, action: LanguageActionTypes) => {
  switch (action.type) {
    case CHANGE_LANGUAGE:
      i18n.changeLanguage(action.payload); // 这样处理是不标准的，有副作用
      return { ...state, language: action.payload };
    default:
      return state;
  }
};

```

`使用`

```tsx
import { changeLangagaeActionCreator } from '../../redux/langauage/languageAction'

const action = changeLangagaeActionCreator('zh')
store.dispatch(action)
```



#### React-redux 插件的使用

##### 安装

```powershell
npm i react-redux -S
npm i @types/react-redux -D
```

然后需要使用到`Provide`组件

```tsx
// index.tsx
import store from './redux/store'
import { Provider } from 'react-redux'

ReactDom.render(
	<React.StrictMode>
    	<Provider store={store}>
        	<App />
        </Provider>
    </React.StrictMode>
)
```



##### 在类组件中使用 react-redux

★★★★★

> 如何获取store的类型  ReturnType<typeof fn>

```ts
// store.ts

export type RootState = ReturnType<typeof store.getState>
```

`然后使用 connect 组件` 他其实就是一个HOC组件,只是没有用到 with

```tsx
// header.tsx
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

const mapStateToProps = (state: RootState) => {
    return {
        language: state.language,
        languageList: state.languageList
    }
}
const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        changeLanguage: (code: 'zh' | 'en') => {
            const action = changeLangauageActionCreator(code)
            dispatch(action)
        }
    }
}

type PropsType = RouteComponentProps & RetrunType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

class HeaderComponent extends React.Component<PropType> {
    
    render () {
        const { history, language } = this.props
    }
}

export const Header = connect(mapStateToProps, mapDispatchToProps)(withRouter(HeaderComponent))
```

使用了`connect`后将 state 和 dispatch 方法都映射到了 props 属性上了， 使用`connect`后边的十分复杂，推荐使用 hooks

##### 在函数式组件中使用 react-redux

使用`useSelector  useDispatch()`

``` tsx
import { useSelector } from "react-redux"
import { RootState } from '../../store'
export const Header: React.FC = () => {
    const language = useSelector((state: RootState) => state.language)
    const languageList = useSelector((state: RootState) => state.languageList)
    const dispatch = useDispatch()
    return ()
}
```

> 扩展 ： 重新定义 useSelector,  解决在组件中使用 RootState 的耦合性

```ts
// reudx/hooks.ts

import { useSelector as useReduxSelector， TypedUseSelectorHook } from 'react-redux'
import { RootState } from './store'

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector
```



### Redux-thunk 中间间的使用

可以让我们生成 `异步的 action`, 运行 我们的 action 工厂函数 一个函数 ， 而不是一个对象

为什么要使用 异步的 action, 在 action 中调用API 呢？

场景： 比如 在 A 页面 中调用API  获取数据， B 页面中也需要， 但是如果你没有进入A页面， 而是直接进入到了B 

页面， 你就需要在 B 中再写一遍 A 中的逻辑



#### 安装

```po
npm i redux-thunk -S
```



#### 中间件的使用

```ts
import { createStore, combineReducers， applyMiddleware } form 'redux'
import languageReducer from './language/languageReucer'
import recommendProductsReducer from './recommendProduc/adfa'
import thunk from 'redux-thunk'

const rootReducer = combineReducers({
    language: languageReducer,
    recommendProducts： recomendProductsReducer
})
const sore = createStore(rootReducer, applyMidleware(thunk))
export type RootState = ReturnType<typeof store.getState>
export default store
```



#### 定义ThunkAction

```js
// redux/recommendProducts/reconmmendProductsActions.ts
import { ThunkAction } from 'reudx-thunk'
import { RootState } from '../store.ts'
export type RecommendProductAction = FetchRecommendProductStartAction | xxxAction
export const giteMeDataActionCreator = (): ThunkAction<void， RootState, unknow, RecommendProductAction> => (dispatch, getState) => {
    dispatch(startActionCreator())
    // axios 请求
    ...
    dispatch(successActionCreator(data))
}
// thunk 可以返回一个函数，而不一定是js对象
// 在一个thunk action中可以完成一些列连续的action操作
// 并且可以处理异步逻辑
// 业务逻辑可以从ui层面挪到这里，代码分层会更清晰

//使用
// HomePage.tsx

const mapDispatchToProps = (dispatch) => {
    return {
        giveMeData: () => {
            dispatch(giveMeDataActionCreator())
        }
    }
}
```

`ThunkAction`接受四个类型， 第一个为 函数的返回值，  第二个 为 store 的 state ， 第三个为额外参数， 第四个为 ActionType

`react-thunk`的主要功能就是 允许返回一个函数的 action, 而且 我们可以在 action 中 直接 dispatch 其他多个 action

> ​	在没有引入 	redux-thunk 之前， 我们 dispatch(action) 的 action 只能是对象， 现在可以是一个函数



#### 中间件的原理



#### 自定义中间件

```ts
const middleware = (store) => (next) => (action) => {
  console.log(store.getState())
  next(action)

}
```





