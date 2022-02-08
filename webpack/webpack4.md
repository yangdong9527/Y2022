# 基础

总结一下把, 总是忘记

`webpack`是什么? 它是一个用于现代`JavaScript`应用程序的静态模块打包工具

## 安装

```shell
# webpack 安装在项目中
npm install webpack webpack-cli -D
```



其实学习`webpack`就是学习常用的`loader`和`plugin`, 常见的一些有

+ **url-loader**
+ file-loader



## 常见的Loader

[官网资料](https://webpack.docschina.org/guides/asset-management/)

 ### 打包图片等资源

打包这种资源,主要使用的是`url-loader`和`file-loader`, 两者都是用来打包静态资源的, 其中`url-loader`比`file-loader`多了一个`limit`参数, 小于这个参数的文件会被转换成`base64`的资源, 大于这个参数的文件会被打包输出

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|webp)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 2048,
            name: '[name].[hash:8].[ext]',
            outputPath: 'images/'
          }
        }
      }
    ]
  }
}
```

注意打包字体文件的时候,使用的就是`file-loader`

```
module.exports = {
	module: {
		rules: [
			{
				test: /\.(eot|ttf|svg)$/,
				use: ['file-loader']
			}
		]
	}
}
```



### 打包样式资源

使用的插件有

+ **style-loader** : 将打包的css挂载到页面中

+ **css-loader**: 打包css文件

+ **sass-loader**: 打包scss文件

+ **postcss-loader**

  这个插件是帮助我们给一些样式自动添加厂商前缀用的, 需要配置一个`postcss.config.js`文件,在文件内配置`plugin`使用`autoprefixer`插件

```js
// webpack.config.js
moduel.exports = {
    module: {
        rules: [
		  {
              test: /\.scss$/,
              use: [
                  'style-loader',
                  {
                      loader: 'css-loader',
                      options: {
                          importLoadaers: 2, // 注释1
                          modules: true // 注释2
                      }
                  },
                  'sass-loader',
                  'process-loader'
              ]
          }
        ]
    }
}
```

`注释1`: 当打包到的scss文件中又@import其他的文件的时候, 这个引入的文件也要从`process-loader`开始打包后才往下走

```shell
npm install --save-dev autoprefixer
```

创建`postcss.config.js` 文件在根目录

```js
module.exports = {
  plugins: [
      require('autoprefixer')
  ]
}
```

`注释2`: 是否开启css模块化,不开启,打包的css是全局的,不太好





## 常见插件

`plugin`的作用就是, 在webpack运行的某一个时刻,帮你做一些事情

### HtmlWebpackPlugin

会在打包结束后,生成html文件,并将打包的文件引入到html中

```js
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    plugins: [
        new HtmlWebpackPlugin({
            template: 'public/index.html',
            title: '标题'
        })
    ]
}
```

[指南 > 管理输出](https://webpack.docschina.org/guides/output-management/)

### Clean-webpack-plugin

用来每次打包之前,清除之前的dist文件下的东西, webpack4中可以在`output`中开启`clean`属性

## SourceMap

`sourcemap`是一个位置信息文件,记录的是打包后的文件和打包前的文件之间的位置映射关系

```js
// 推荐
{
    devtool: 'cheap-module-eval-source-map' // development
	devtool: 'cheap-module-source-map' // production
}
```

[指南 > 开发环境 > sourcemap](https://webpack.docschina.org/guides/development/#using-source-maps)

## WebpackDevServer使用

[指南 > 开发环境 > 开发工具](https://webpack.docschina.org/guides/development/#choosing-a-development-tool)

提高开发效率的三种做法

+ `webpack --watch` 添加命令, 代码变动自动打包
+ 使用`WebpackDevServer`, 配置config文件中的`devServe`
+ 使用`webpack-dev-middleware`, 这个是用来自己写一个开发环境,以前的`WebpackDevServer`不太好用的时候有人就自己写



## Hot Module Replacement(HMR)

使用的`HotModuleReplacement`插件, 当修改某个模块中的代码,只修改这个模块改变的地方不会影响其他的已经渲染的模块

在`devServe`中修改`hot`属性开启HMR

[指南 > 热模块替换](https://webpack.docschina.org/guides/hot-module-replacement/)

其他相关连接

[指南 > 模块热替换](https://webpack.docschina.org/concepts/hot-module-replacement/) HMR 原理



## Babel

###  业务代码Babel

`Babel`的作用是用来解决 低版本的浏览器, 无法识别ES6之类的新语法, 进行转换和补充新语法的作用

```shell
# 安装loader 和 babel 核心库
npm i --save-dev babel-loader @babel/core
# 安装 @babel/preset-env 模块 包含了所有的es6转es5 的方法
npm install @babel/preset-env --save-dev
```

相关配置

```js
module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/perset-env']
                }
            }
        ]
    }
}
```

配置到上面这一步后, 就会帮我们把ES6的一些语法转换成ES5的写法, 比如像箭头函数这种就会被转换回来, 但是像ES6新增的一些变量和函数还是需要借助`polyfill`补充这些方法

```shell
npm i -S @babel/ployfill
# 全局引入 在主文件开头
@import "@babel/polyfill"
# 这样不好 文件太大了
```

解决办法 给`@babel/perset-env`添加参数

```js
module.exports = {
    ...
    options: {
        presets: [['@babel/perset-env', {
            useBuiltIns: 'usage' // 设置了这个 不需要 @import 了
        }]]
    }
}
// 设置该属性 按需加载
```

### 打包类库时

打包类库时不能使用上面的方法全局的引入, 因为这样会**造成全局的污染**

```shell
npm install -D @babel/plugin-transform-runtime
npm install -S @babel/runtime
# corejs: 2 
npm install -S @babel/runtime-corejs2
```

配置`plugins`而不是配置`presets`

```js
module.exports = {
    ...
    options: {
        plugins: [['@babel/plugin-transform-runtime', {
            corejs: 2,
            helpers: true,
            regenerator: true,
            useESModules: false
        }]]
    }
}
```

### .babelrc文件

因为`babel`的`options`太多了可以将`options`中的所有的配置卸载`.babelrc`文件中

如果像打包Vue或者React这些需要用到`@babel/preset-vue`或者 `@babel/preset-react`这种转换一下

就以React打包为例, `.babelrc`文件中

> babel 也是 从 后往前 转换的

```.babelrc
{
	presets: [
		[
			"@babel/preset-env", {
				useBuiltIns: 'usage'
			}
		],
		"@babel/preset-react"
	]
}
```



## 小结

到这里就已经熟悉的`webapck`中的一些基本配置了, 主要还是 一些 `loader`和 `plugin`的使用 以及 `babel` 的使用

总结一下这一块主要的东西有哪些

+ 静态文件的打包, 包括 图片 , 字体

  学习`url-loader` 和 `file-loader` 的使用

+ 样式的打包

  学习了 `style-loader` `css-loader` `sass-loader` `postcss-loader` 的使用

  需要注意的是 `postcss-loader` 的配置 `autoprefixed` 自动添加厂商

+ 插件的使用

  这里暂时说了 `HtmlWebpackPlugin` 和 `HotModuleReplacement` 两个插件的使用

  常考题 `HMR` 热更新的原理

+ SourceMap

  SourceMap 的原理

+ 使用开发工具

  `WebpackDevServer`使用

+ Babel

  + 打包业务代码时,Babel配置
  + 打包类库时,Babel配置
  + 打包Vue, React 这种框架时, Babel配置

  

# 升级

## Tree Shaking

`Tree Shaking` (摇树) 作用是 将一个模块里 没有用到的代码去除掉, 但是注意, 它 `只支持ES Module`, 因为 `ES Moudle` 的引入是一种静态的引入方式, 像`common.js`的引入方式其实是动态的引入, 而 `Tree Shaking`只支持静态引入

在`development`环境下

配置 `webpack.config.js` 中的 

```js
...
optimization: {
    usedExports: true
}
```

然后配置 `package.json`文件中的

```json
sideEffects: ['*.css']
```

这个**属性是用来配置 哪些文件不需要**做 `Tree Shaking`, 比如引入 `.css` 文件 没有返回值 会被直接给去除掉, 所有需要配置

在 `production` 环境下 已经做了配置不需要配置



### vue3 Tree Shaking 思考

在Vue2中,全局的API都是绑定在实例上的, 而 Vue3 将他们独立分块出来, 就可以满足 Tree Shaking了



## Model 环境



## 代码分割(code splitting)

代码分割使用的场景, 比如 使用第三方库时, 在某个文件中引入了 第三方库, 那么这个文件就会变得特别大, 加载缓慢,  然后 当我们 修改了 业务代码 , 再次打包, 文件发生改变, 浏览器又需要重新加载一次 这个文件

代码分割的方式有两种, 分别对应两种情况

+ **同步代码** : 直接引入的, 需要在 `config.js` 文件中 配置 `optimization`配置

  ```js
  optimization: {
      splitChunks: {
          chunks: 'all'
      }
  }
  ```

+ **异步代码** : 通过 `import()`异步引入的第三方库, 无需配置, 自动会被分割到一个单独的文件中

  注释 `/* webpackChunkName: "lodash" */`  可以设置分割文件的名字

  ```js
  () => import (/* webpackChunkName: 'Home' */ '@/views/Home.vue')
  ```

### SplitChunksPlugin插件

默认的配置

```js
{
    splitChunks: {
      chunks: 'async', // 注解1
      minSize: 20000, // 大于 20 kb 进行代码分割
      minRemainingSize: 0,
      minChunks: 1, // 当一个文件最少被用了几次的时候 进行代码分割
      maxAsyncRequests: 30, // 最多分割几个类库, 比如同时引入了31个库, 它只对前30个进行代码分割
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: { // 注解2
          test: /[\\/]node_modules[\\/]/,
          priority: -10, // 注解4
          reuseExistingChunk: true,
          filename: 'vendors.js'
        },
        default: { // 注释3
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true, // 如果某个模块已经被打包了就不再重新打包,直接使用之前的那个
          filename: 'common.js'
        },
      },
}
```

**注解1 : ** 参数有 `initial`, `async`, `all` 表示, 那种代码需要做代码分割, 比如 `async` 表示只有异步的代码进行代码分割, 同步的代码不进行代码分割 , `all` 表示两种都进行代码分割

**注解2 : ** 当我们在打包同步的代码时, 会执行到分组地方, 这里表示, 将满足`test`的第三方的库 , 打包到一个叫`defaultVendors`名字的分组中,  `chunks` 和 `cacheGroups` 是配合着来使用的

**注解3 : ** 比如当进行同步代码分割的时候, 但是不满足`defaultVendors`这个组的条件的时候, 就会分割到这个默认的分组

**注解4 : ** 组的优先级, 当同时满足多个分组的条件的时候, 优先级大 , 就用 那个组



## 打包分析

[官方工具](https://github.com/webpack/analyse)

```shell
# 在命令行添加命令 得到一个 json 文件
scripts: {
	"build": "webpack --profile --json > stats.json"
}

# 然后打开http://webpack.github.com/analyse  选择json文件就可以
```



[webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)

在`Vue`中使用

```shell
npm install --save-dev webpack-bundle-analyzer
```

`vue.config.js`

```js
chainWebpack(config) {
    if (process.env.analyzer) {
        config.plugin('webpack-bundle-analyzer')
        	.use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    }
}
```

`package.json`

```json
"scripts": {
    "analyzer": "cross-env NODE_ENV=production analyzer=true npm run build"
}
```

> window环境需要全局安装 `cross-env`

[webpack官网打包分析](https://webpack.docschina.org/guides/code-splitting/#bundle-analysis)



## Prefetch 和 Preload

**相比较与利用缓存进行性能优化,提高页面加载的代码的利用率变得更高**

对于一些将来要使用的代码,使用懒加载, 然后 结合`prefetch`或者`preload` 来提高使用时的加载速度

```js
import(/* WebpackPrefetch: true */ './1.js')
```

**解释 :** 使用懒加载`1.js`文件, 然后使用`prefetch`, 在界面主文件加载完成,浏览器空闲的时候,加载当前这个文件,当使用到这个文件的时候就会直接使用

**Vue中的使用**

在Vue中, 默认会将为所有的`asnyc chunk` 添加 `prefetch`操作

在Vue中, 默认会为所有的初始化渲染需要的文件 添加 `preload`操作

当移动端对流量比较敏感的就不要使用这个`prefetch`,移动端你可能使用的只有几个页面, 这时候使用

```js
// vue.config.js
module.epxorts = {
    chainWebpack(config) {
        // 移除prefetch 插件
        config.plugins.delete('prefetch')
    }
}
```



**Vue-Cli中的Prefetch**

[Vue-Cli](https://cli.vuejs.org/zh/guide/html-and-static-assets.html#prefetch)

Vue-CLI创建的项目,会为所有作为async chunk生成的文件(通过 import() 按需 code splitting 的产物), 自动生成prefetch

## CSS代码分割

### chunkFileName

`output`中的`chunkFileName`除了入口主文件,其他的打包出来的文件的名称



### MiniCssExtractPlugin插件

`MiniCssExtractPlugin`需要配合`loader`使用, 除了引入插件,还需要配置`loader`, 配置完成就会进行代码分割



#### optimize-css-assets-webpack-plugin插件

对css文件进行压缩

```js
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
module.exports = {
    optmization: {
        minimizer: [
            new OptimizeCssAssetsPlugin({})
        ]
    }
}
```

### 扩展

可以使用`splitChunks`对Css文件进行分组,甚至可以将不同入口文件中的css进行区分分割开来



## 浏览器缓存

### 添加Hash值

```js
module.exports = {
    output: {
        fileName: '[name].[contenthash].js',
        chunkFileName: '[name].[contenthash].js'
    }
}
```

只有修改了这个hash值才会发生改变,

### mainifest 介绍

注意在老版本中可能你没有修改但是每次打包生成的hash值会不一样,那是因为, 你每次打包生成的`mainifest`可能不一样, `mainifest`记录的是每次打包各个包之间的依赖关系,可能每次打包发生了一些变化,`manifest`可能记录在各个包中间,

解决办法就是将各个包`mainifest`关联关系抽离出来, 这样各个包里面也就没有了关联的关系,也就不会发生改变了

```js
module.exports = {
    output: {
        fileName: '[name].[contenthash].js',
        chunkFileName: '[name].[contenthash],js'
    },
    optimization: {
        runtimeChunk: {
            name: 'runtime'
        }
    }
}
```

配置了这个 不管是新版本还是老版本 都可以 当然现在都是新版本 就不会发生这种事情了



## Shimming预置依赖

### Simming预置全局变量

[官网](https://webpack.docschina.org/guides/shimming/#shimming-globals)



# 实战

## Library 打包

[官网Library](https://webpack.docschina.org/guides/author-libraries/)

### 打包输出

打包非业务代码的时候,考虑到要给其他人使用,需要对打包输出格式进行配置

```js
const path = require('path')
module.exports = {
  model: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'library.js',
    library: 'root', // 注释1
    libraryTarget: 'umd' // 注释2
  }
}
```

**注释1 : ** 当通过`<script>`方式引入的时候,在全局添加一个`root`变量, 可以通过`root.fn`来调用打包方法

**注释2 : ** 打包的格式支持`ESModule` `Common.js`的引入



### 内部依赖

当我们内部引入了第三方库的时候, 我们不要把第三方库打包进来, 防止用户的代码中也引入了这个库,我们再打包进来就会让用户引入两次这个库

```js
const path = require('path')
module.exports = {
  model: 'production',
  entry: './src/index.js',
  externals: ['lodash'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'library.js',
    library: 'root', // 注释1
    libraryTarget: 'umd' // 注释2
  }
}
```

配置完成后, 需要在业务代码中引入我们依赖的库

`externals`的配置的可以数组 可以是 对象, 这里表示的是我们不把`lodash`打包到项目中去, 除此之外它的配置也规定了在业务代码中引入这个库的名字



## PWA 了解

**PWA**可以将你的的项目缓存到浏览器中,当你的服务器挂掉了,用户还是可以访问

有兴趣可以了解下`PWA的原理` 好像是使用了serviceWorker

简单的实现和配置

```js
const WorkboxPlugin = require('workbox-webpack-plugin')

module.exports = {
    plugins: [
        new WorkboxPlugin.gennerateSW({
            clientsClaim: true,
            skipWaiting: true
        })
    ]
}
```

配置完成后会生成一个`service-worker.js`文件,然后在业务代码中添加

```js
if ('serviceWorker' in navigator) {
    naviagtor.serviceWorker.register('/service-worker.js)
    	.then(registration => {
        	console.log('success')
    	}).catch(err => {
        	console.log('err')
    	})
}
```



## 性能优化

如何提升打包速度

+ 更新本地包版本
+ 尽可能减少Loader覆盖范围
+ plugin尽可能精简并确保可靠
+ resolve参数的合理配置

```js
module.exports = {
    resolve: {
        extensions: ['.js', '.vue'], //知道那个查找文件后缀
        mainFiles: ['index'], // 自动查找文件夹下的 文件
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
}
```

+ 使用DellPlugin提高打包速度

单独将所有的第三方库以库的方式单独打包并且使用`DellPlugin`生成打包后文件和源码的manifest文件, 配置通过`AddAssetHtmlWebpackPlugin`将打包后的文件引入到html中,再配置`DllReferencePlugin`插件通过生成的`manifest`文件, 在打包的时候不重新打包第三方库而是直接使用

+ 控制包文件大小(tree shaking)
+ 合理使用shourceMap



# 问句

## HMR原理?

## webpack工作原理?



# 补充扩展



## style-resources-loader使用

### 安装

```shell
npm i style-resources-loader vue-cli-plugin-style-resources-loader -D

# 或者

vue add style-resources-loader
```



### 配置

```js
// vue.config.js
module.exports = {
    pluginOptions: {
    'style-resources-loader': {
          preProcessor: 'scss',
          patterns: [
              path.resolve(__dirname, './src/style/variable.scss')
          ]
        }
      }
}
```

