---
typora-root-url: ./images
---

## webgl精简版

### 绘制一个点案例

#### 知识点

+ 什么是着色器，程序对象？
+ GLSL语法初尝试，以及初始化着色器

#### 代码

着色器代码

```html
<script id="vertexShader" type="x-shader/x-vertex">
    void main() {
      gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
      gl_PointSize = 50.0;
    }
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
    void main() {
      gl_FragColor = vec4(1, 1, 0, 1);
    }
</script>
```

主代码

```html
<script type="module">
  import { initShaders } from './lib/cuon-utils.js'
  const canvas = document.querySelector('#canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // 获取上下文对象
  const gl = canvas.getContext('webgl')

  // 获取着色器源码
  const vertexSource = document.getElementById('vertexShader').innerText
  const fragmentSource = document.getElementById('fragmentShader').innerText

  // 初始化着色器
  initShaders(gl, vertexSource, fragmentSource)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.drawArrays(gl.POINTS, 0, 1)

</script>
```

### 通过点击绘制多个点

#### 知识点

+ JS与着色器之间的通信
+ Webgl 坐标系统

#### 代码

着色器部分代码， 定义了 attribute 变量 和 uniform 变量

```html
<script id="vertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = 10.0;
  }
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
    if(dist < 0.5) {
      gl_FragColor = u_FragColor;
    } else {
      discard;
    }
  }
</script>
```

主代码

```html
<script type="module">
  import { initShaders } from './lib/cuon-utils.js'

  const canvas = document.getElementById('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  // 获取上下文对象
  const gl = canvas.getContext('webgl')
  // 初始化着色器
  const vertexShaderSource = document.getElementById('vertexShader').innerText
  const fragmentShaderSource = document.getElementById('fragmentShader').innerText
  initShaders(gl, vertexShaderSource, fragmentShaderSource)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // 获取着色器中的变量
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor')
  const points = []

  render()

  // 点击事件
  canvas.addEventListener('click', (e) => {
    const { top, left, width, height } = canvas.getBoundingClientRect()
    let x = e.clientX - left
    let y = e.clientY - top
    const [halfWidth, halfHeight] = [width / 2, height / 2]
    x = (x - halfWidth) / halfWidth
    y = (y - halfHeight) / halfHeight
    y = -y // 反转坐标系
    points.push({
      pos: [x, y],
      color: [1.0, 0.0, 0.0, 1.0]
    })
    render()
  })

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT)
    points.forEach(({pos, color}) => {
      gl.vertexAttrib3f(a_Position, pos[0], pos[1], 0)
      gl.uniform4f(u_FragColor, ...color)
      gl.drawArrays(gl.POINTS, 0, 1)
    })
  }
</script>
```

#### JS与GLSL之间的通信

由于webgl使用的glsl语法，而我们使用的是js语法，两者之间是不能够直接通信的，这时候我们就需要一个翻译，webgl程序对象，在我们初始化着色器的时候，就创建了一个**webgl程序对象**

##### attribute 变量通信

attribute 变量常用来存储与顶点相关的变量, 使用步骤主要分下面这几步：

1. 着色器中 => attribute 变量在着色器中的声明

```glsl
attribute vec4 a_Position;
void main() { ... }
```

2. 在js中 => 获取attribute变量在着色器中的存储位置

```js
const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
```

`gl.getAttribLocation(program, name)`方法传入 webgl程序对象， 和变量名称，得到变量的存储位置

3. 在js中 => 设置attribute变量的值

```
gl.vertexAttrib3f(a_Position， 0.0, 0.0, 0.0)
```

`gl.vertexAttrib3f(location, x, y, z)`传入变量的存储位置，设置变量的值

> 扩展：同族函数
>
> gl.vertexAttrib1f(loation, x)
>
> gl.vertexAttrib2f(loation, x, y)
>
> gl.vertexAttrib3f(loation, x, y, z)
>
> gl.vertexAttrib4f(loation, x, y ,z, w)
>
> 这种的就是同族函数， 后面的还有好几个同族函数就不一一介绍了

##### uniform 变量通信

需要注意的是**attribute变量只能在顶点着色器中使用**，这时候我们就可以使用**uniform变量**， 或者 varying变量，这里先介绍 uniform变量的使用步骤

1. 着色器中 定义uniform 变量

```glsl
precision mediump float;
uniform vec4 u_FragColor;
void main() {}
```

2. 在js中 获取uniform变量的存储位置

```js
const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor')
```

3. 在js中 设置uniform变量的值

```js
gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0)
```

#### Webgl坐标系

webgl处理的是三维图形，所以它使用的是 笛卡尔坐标系，默认遵守的是右手坐标系

默认情况下 ： webgl 与 canvas 坐标对应关系

+ canvas 中心点：(0.0, 0.0, 0.0)
+ canvas的上边缘和下边缘：(-1.0, 0.0, 0.0) 和 (1.0，0.0，0.0)
+ canvas的左边缘和右边缘：(0.0, -1.0, 0.0) 和 (0.0，1.0，0.0)



### 绘制多个点

#### 知识点

+ 缓冲区对象的使用
+ gl.drawArrays() 方法的介绍

#### 代码

着色器代码

```html
<script id="vertexShader" type="x-shader/x-vertex">
  attribute vec4 a_Position;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = 10.0;
  }
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
</script>
```

主代码

```js
 import { initShaders } from './lib/cuon-utils.js'

  const canvas = document.getElementById('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  const gl = canvas.getContext('webgl')

  // 初始化着色器
  const vertexShaderSource = document.getElementById('vertexShader').innerText
  const fragmentShaderSource = document.getElementById('fragmentShader').innerText
  initShaders(gl, vertexShaderSource, fragmentShaderSource)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')

  // 顶点数据
  const vertices = new Float32Array([
    0.0, 0.2,
    -0.2, -0.2,
    0.2, -0.2
  ])

  // 创建缓冲区对象
  const vertexBuffer = gl.createBuffer()
  // 绑定缓冲区对象
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  // 向缓冲区对象中写入数据
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  // 将缓冲区对象分配给attribute 变量
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
  // 开启 attribute 访问 缓冲区对象的能力
  gl.enableVertexAttribArray(a_Position)

  gl.drawArrays(gl.POINTS, 0, 3)
```

#### 如何使用缓冲区对象

通过向缓冲区对象中写入多个值，然后**attribute变量**从缓冲区对象中读取数据，再结合`gl.drawArrays()`绘制

> 这里从缓冲区对象中读取用到的是 attribute 变量，attribute 变量只能用在顶点着色器中，如果是片元着色器的数据，可以通过 attribute => varying 获取数据

使用步骤：

1. 创建缓冲区对象

```js
const vertexBuffer = gl.createBuffer()
```

2. 绑定缓冲区对象 到目标上， 目标决定了缓冲区对象的作用

```js
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
```

3. 向缓冲区对象中写入数据,  通过刚才绑定的目标

```js
const vertices = new Float32Array([
  0.2, 0.2,
  -0.2, -0.2
])
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
```

4. 设置 attribute 变量 如何从缓冲区对象中取值

```js
gl.vertexAttribPointer(a_Positon, 2, gl.FLOAT, false, 0, 0)
```

重点介绍一下`gl.vertexAttribPointer(location, size, type, normalized, stride, offset)`

+ location ， 指定待分配 attribute 变量的存储位置
+ size,   指定缓冲区对象中 的 顶点 分量数量
+ type,  指定数据格式
+ normalize  是否归一
+ stride,  单位是字节数量， 两个相邻的顶点之间的字节数量， 默认为 0
+ Offset, 单位是字节数量， 定义偏移数量

> 这里的 stride 和 offset 再后面有介绍， 看  多点异色 

5. 开启 atrribute 变量 访问 缓冲区对象的 权限

```js
gl.enableVertexAttribArray(a_Position)
```

6. 绘制类型

```js
gl.drawArrays(gl.POINTS, 0, 2)
```

`gl.drawArrays(type, first, count)`  规定按照那种类型绘制， 从那个顶点开始 绘制， 绘制几个顶点



### 矩阵旋转

#### 知识点

+ 如何设置和使用矩阵类型数据
+ 动画
+ 矩阵 视图矩阵

#### 代码

```html
<script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position;
    uniform mat4 u_xformMatrix;
    void main() {
      gl_Position = u_xformMatrix * a_Position;
    }
  </script>
  <script id="fragmentShader" type="x-shader/x-fragment">
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  </script>
```

```js
import { initShaders } from './lib/cuon-utils.js'

const canvas = document.getElementById('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const gl = canvas.getContext('webgl')

// 初始化着色器
const vertexShaderSource = document.getElementById('vertexShader').innerText
const fragmentShaderSource = document.getElementById('fragmentShader').innerText
initShaders(gl, vertexShaderSource, fragmentShaderSource)

gl.clearColor(0.0, 0.0, 0.0, 1.0)
gl.clear(gl.COLOR_BUFFER_BIT)

// buffer
const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
const vertices = new Float32Array([
  0.0, 0.2,
  -0.2, -0.2,
  0.2, -0.2
])
// 创建缓冲对象
const vertexBuffer = gl.createBuffer()
// 绑定缓冲区对象
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
// 写入数据
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
// 设置 attribute 变量如何从缓冲区对象中 获取对象
gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
// 开启 attribute 获取 缓冲区对象
gl.enableVertexAttribArray(a_Position)

// 旋转矩阵
const u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix')
var curAngle = 0.0 // 当前旋转角度
var g_last = Date.now()

tick()

function animate(angle) {
  const now = Date.now()
  const elapsed = now - g_last // 得到毫秒值
  g_last = now
  const newAngle = angle + 9 * (elapsed / 1000) //每毫米秒添加多少度
  return newAngle % 360
}

// 渲染
function draw(gl, curAngle, u_xformMatrix) {
  gl.clear(gl.COLOR_BUFFER_BIT)
  const radian = curAngle * Math.PI / 180
  const cosB = Math.cos(radian)
  const sinB = Math.sin(radian)
  const xformMatrix = new Float32Array([
    cosB, sinB, 0.0, 0.0,
    -sinB, cosB, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  ])
  gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

function tick() {
  curAngle = animate(curAngle)
  draw(gl, curAngle, u_xformMatrix)
  requestAnimationFrame(tick)
}
```

#### 如何定义和设置举证类型的值

在着色器中定义

```glsl 
uniform met4 u_xformMatrix;
attribute vec4 a_Position;
void main() {
  gl_Position = u_xformMatrix * a_Position;
}
```

在js中使用

```js
const u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix')
gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix)
```



### 复合变换

#### 知识点

+ 矩阵的乘法



#### 弹力球

知识点

+ 理解 视图矩阵 lookAt
+ 物体矩阵 在视图矩阵中 运动 旋转的几何体
+ 弹力运动的原理



### 多点异色

+ 如何将顶点的多个信息 通过一个 缓冲区对象传入
+ vertexAttribPointers() 的最后两个参数的使用



### 纹理的映射

#### 1. 纹理基础

**栅格坐标系**

**UV坐标系**

**采样器**

采样器时按照 UV坐标系，从图像中 获取片元

着色器基于一张图片可以建立 一个 或者多个 采样器， 不同的采样器可以定义不同的规则去获取图像中的片元

采样器的功能就是 从纹理对象中 根据 uv坐标 获取对应的片元

**纹理对象**

着色器使用一个纹理对象， 就可以建立一个采样器

纹理对象的使用

纹理对象的建立需要一个图像源，

然后我们需要设置纹理对象和图钉的数据映射的方式

纹理对象是通过js创建的 我们不能直接给到着色器， 于是

Webgl在底层创建了一个缓冲区，这个缓冲区可以理解为用来存储纹理对象的磁盘空间，这块空间可以将纹理对象翻译成着色器可以读懂的数据

之后我们把空间的索引位置传给着色器 ，让着色器找打这个空间，获取纹理对象，最后通过纹理对象创建采样器

**纹理空间**



#### 2. 方法的使用



#### 3. 纹理容器

纹理容器可以用来处理 

+ 非2次幂的图像显示
+ 纹理的复制
+ 纹理的镜像

#### 分子纹理





