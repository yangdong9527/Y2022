## React 官方文档

### 核心概念

#### 事件处理

```jsx
class Demo extends React.Component {
  render() {
    return <button onClick={() => this.handleClick()}>xx</button>
  }
}
```

通过箭头函数调用回调函数,需要注意如果是作为prop传入子组件时，子组件可能会进行额外的渲染



### 高级指引

#### 代码分割

`React.lazy() 和 Suspense`组合异步加载实现代码分割

```jsx
import React, { Suspense } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

const Home = lazy(() => import('./routes/Home'))
const About = lazy(() => import('./routes/About'))
const App = () => (
	<Router>
  	<Suspense fallback={<div>loading...</div>}>
      <Switch>
      	<Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
      </Switch>
    </Suspense>
  </Router>
)
```

#### Context

使用的 API

`React.createContext(defaultValue)`

创建一个上下问对象，只有当 value 值为 空的时候 才会使用到这个 defaultValue 值

```jsx
const MyContext = React.CreateContext('abc')
```

`Context.Provider`

```jsx
<MyContext.Provider value={'def'}>
	<MyClass />
</MyContext.Provider>
```

`Class.contextType`

```jsx
class MyClass extends React.Component {}
MyClass.contextType = MyContext
```

设置`contextType`可以 在生命周期中使用`this.context`

`Context.Consumer`

```jsx
<MyContext.Consumer>
	{value => /*...*/}
</MyContext.Consumer>
```

使用`MyContext.Consumner`可以在JSX中拿到值

#### 错误边界

主要使用`getDerivedStateFromError 和 componentDidCatch`来捕获渲染子组件的错误



#### Refs转发

通过`React.forwardRef`进行转发

```jsx
const FancyButton = React.forwardRef((props, ref) => (
	<Button ref={ref}>
  	{props.children}
  </Button>
))
const ref = React.createRef()
<FancyButton ref={ref}>x</FancyButton>
```

对于HOC组件很有用，因为默认 ref 是组件的根结点，使用了`React.forwardRef`就可以跟好的传递到我们想要的节点上



