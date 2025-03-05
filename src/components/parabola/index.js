// 引入必要的库
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

// 设置 Cesium Ion 访问令牌
Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN || "";

// 初始化 Cesium Viewer
const viewer = new Cesium.Viewer("cesiumContainer", {});

/**
 * 生成抛物线路径数据
 */
const setPathData = (pointStart, pointEnd, options = {}) => {
  // 合并默认选项
  const height = options.height || 50000;
  const pointsCount = options.pointsCount || 100;

  // 提取起点和终点的经纬度
  const startLon = pointStart[0];
  const startLat = pointStart[1];
  const endLon = pointEnd[0];
  const endLat = pointEnd[1];

  // 预分配数组
  const positionsArray = new Array(pointsCount * 3);

  // 生成抛物线点集
  for (let i = 0; i < pointsCount; i++) {
    // 计算当前点在起点到终点连线上的比例位置
    const ratio = i / (pointsCount - 1);

    // 线性插值计算当前经纬度
    const lon = startLon + ratio * (endLon - startLon);
    const lat = startLat + ratio * (endLat - startLat);

    // 计算高度 - 抛物线公式: y = 4 * h * x * (1 - x)
    const curHeight = 4 * height * ratio * (1 - ratio);

    // 写入数组
    const idx = i * 3;
    positionsArray[idx] = lon;
    positionsArray[idx + 1] = lat;
    positionsArray[idx + 2] = curHeight;
  }

  // 返回Cesium坐标数组
  return Cesium.Cartesian3.fromDegreesArrayHeights(positionsArray);
};

/**
 * 创建流动线材质
 */
const createFlowingLineMaterial = () => {
  // GLSL代码
  const flowingLineGLSL = `
    float SPEED_STEP = 0.01; // 增加速度步长，使光线移动更快
    
    vec4 drawLight(float xPos, vec2 st, float headOffset, float tailOffset, float widthOffset) {
      float lineLength = smoothstep(xPos + headOffset, xPos, st.x) - smoothstep(xPos, xPos - tailOffset, st.x);
      float lineWidth = smoothstep(widthOffset, 0.5, st.y) - smoothstep(0.5, 1.0 - widthOffset, st.y);
      return vec4(lineLength * lineWidth);
    }
    
    czm_material czm_getMaterial(czm_materialInput materialInput) {
      czm_material m = czm_getDefaultMaterial(materialInput);
      
      float sinTime = sin(czm_frameNumber * SPEED_STEP * speed);
      float xPos = 0.0;
      
      if (sinTime < 0.0) {
        xPos = cos(czm_frameNumber * SPEED_STEP * speed) + 1.0 - tailsize;
      } else {
        xPos = -cos(czm_frameNumber * SPEED_STEP * speed) + 1.0 - tailsize;
      }
      
      vec4 v4_color = drawLight(xPos, materialInput.st, headsize, tailsize, widthoffset);
      vec4 v4_core = drawLight(xPos, materialInput.st, coresize, coresize * 2.0, widthoffset * 2.0);
      
      m.diffuse = color.xyz + v4_core.xyz * v4_core.w * 0.8;
      m.alpha = pow(v4_color.w, 3.0);
      
      return m;
    }
  `;

  // 创建材质
  return new Cesium.Material({
    fabric: {
      type: "FlowingLineMaterial",
      uniforms: {
        color: new Cesium.Color(0.0, 1.0, 0.0, 0.5),
        speed: 2,
        headsize: 0.05,
        tailsize: 0.5,
        widthoffset: 0.1,
        coresize: 0.05,
      },
      source: flowingLineGLSL,
    },
  });
};

/**
 * 添加抛物线到场景
 */
const addParabolaToScene = (viewer, startPoint, endPoint, options = {}) => {
  // 获取路径坐标
  const cartesianPositions = setPathData(startPoint, endPoint, options);
  const pointsCount = options.pointsCount || 100;

  // 创建颜色数组
  const colors = new Array(pointsCount);
  for (let i = 0; i < pointsCount; i++) {
    const ratio = i / (pointsCount - 1);
    colors[i] = Cesium.Color.lerp(
      new Cesium.Color(0.0, 0.0, 1.0, 1.0), // 蓝色
      new Cesium.Color(1.0, 0.0, 0.0, 1.0), // 红色
      ratio,
      new Cesium.Color()
    );
  }

  // 添加普通线条
  const solidLine = viewer.scene.primitives.add(
    new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineGeometry({
          positions: cartesianPositions,
          width: 2.0,
          vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
          colors: colors,
          colorsPerVertex: true,
        }),
      }),
      appearance: new Cesium.PolylineColorAppearance(),
    })
  );

  // 创建流动线材质
  const flowingMaterial = createFlowingLineMaterial();

  // 添加流动线效果
  const flowingLine = viewer.scene.primitives.add(
    new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineGeometry({
          positions: cartesianPositions,
          width: 20.0,
          vertexFormat: Cesium.VertexFormat.ALL,
        }),
      }),
      appearance: new Cesium.PolylineMaterialAppearance({
        material: flowingMaterial,
      }),
    })
  );
};

// 示例：添加一条抛物线
addParabolaToScene(
  viewer,
  [113.17, 23.8], // 起点
  [114.0, 22.5], // 终点
  { height: 50000 }
);

// 设置相机位置
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(112, 20.8, 300000),
  orientation: {
    heading: Cesium.Math.toRadians(30),
    pitch: Cesium.Math.toRadians(-45),
    roll: 0.0,
  },
  duration: 2,
});
