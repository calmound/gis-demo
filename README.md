# Cesium 抛物线演示

这是一个使用 Cesium.js 创建抛物线路径的演示项目。项目使用 Vite 作为构建工具，展示了如何在 Cesium 中创建和自定义抛物线路径，包括颜色渐变和流动线效果。

## 功能特点

- 生成平滑的抛物线路径
- 支持自定义高度和点数量
- 支持颜色渐变效果
- 支持流动线动画效果
- 可配置的参数和样式

## 环境设置

1. 克隆项目后，复制 `.env.example` 文件并重命名为 `.env`：

```bash
cp .env.example .env
```

2. 在 [Cesium Ion](https://ion.cesium.com/tokens) 获取您的访问令牌，并在 `.env` 文件中设置：

```
VITE_CESIUM_ION_TOKEN="your_cesium_ion_access_token_here"
```

## 安装依赖

```bash
npm install
# 或者
pnpm install
```

## 运行开发服务器

```bash
npm run dev
# 或者
pnpm dev
```

## 构建生产版本

```bash
npm run build
# 或者
pnpm build
```

## API 文档

### 抛物线函数

```javascript
// 创建抛物线
const parabola = addParabolaToScene(
  viewer,           // Cesium 查看器实例
  [113.17, 23.8],   // 起点 [经度, 纬度]
  [114.0, 22.5],    // 终点 [经度, 纬度]
  {
    height: 50000,  // 抛物线最高点高度（米）
    pointsCount: 100, // 曲线上的点数量
    // 自定义高度函数（可选）
    // heightFunc: (ratio) => 50000 * Math.sin(ratio * Math.PI)
  }
);
```

### 配置选项

可以通过修改 `CONFIG` 对象来自定义默认配置：

```javascript
const CONFIG = {
  // 抛物线配置
  parabola: {
    pointsCount: 100,    // 曲线上的点数量
    defaultHeight: 50000, // 默认最高点高度（米）
    colorStart: new Cesium.Color(0.0, 0.0, 1.0, 1.0), // 起点颜色（蓝色）
    colorEnd: new Cesium.Color(1.0, 0.0, 0.0, 1.0),   // 终点颜色（红色）
  },
  // 流动线配置
  flowingLine: {
    width: 20.0,         // 线宽
    color: new Cesium.Color(0.0, 1.0, 0.0, 0.5), // 颜色
    speed: 1.5,          // 流动速度
    headsize: 0.05,      // 头部大小
    tailsize: 0.5,       // 尾部大小
    widthoffset: 0.1,    // 宽度偏移
    coresize: 0.05,      // 核心大小
  }
};
```
