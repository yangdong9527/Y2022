export function initShader(gl, vsSource, frSource) {
  // 创建程序对象
  const program = gl.createProgram()
  // 生成着色器
  const vsShader = loaderShader(gl, gl.VERTEX_SHADER, vsSource)
  const frShader = loaderShader(gl, gl.FRAGMENT_SHADER, frSource)
  // 给程序对象装上着色器对象
  gl.attachShader(program, vsShader)
  gl.attachShader(program, frShader)
  // 将上下文对象和程序对象进行关联
  gl.linkProgram(program)
  // 启用程序对象
  gl.useProgram(program)
  gl.program = program
  return true
}
function loaderShader(gl, type, source) {
  // 创建某个类型的着色器
  const shader = gl.createShader(type)
  // 设置源码
  gl.shaderSource(shader, source)
  // 编译
  gl.compileShader(shader)
  return shader
}