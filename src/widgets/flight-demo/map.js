import * as mars3d from "mars3d"

export let map // mars3d.Map三维地图对象
let graphicLayer
// 需要覆盖config.json中地图属性参数（当前示例框架中自动处理合并）
export const mapOptions = {
  scene: {
    center: { lat: 29.785027, lng: 113.909418, alt: 465.5, heading: 340.9, pitch: -34 }
  },
  control: {
    clockAnimate: true, // 时钟动画控制(左下角)
    timeline: true, // 是否显示时间线控件
    compass: { style: { bottom: "380px", left: "5px" } }
  }
}

export const eventTarget = new mars3d.BaseClass() // 事件对象，用于抛出事件到组件中

// 航线路径
const positions = [
  [113.908869, 29.790335, 120],
  [113.9088, 29.7901, 120],
  [113.908644, 29.789877, 120],
  [113.908033, 29.78964, 120],
  [113.906848, 29.789695, 120],
  [113.906372, 29.790028, 120],
  [113.905873, 29.790888, 120],
  [113.904768, 29.791604, 120]
]

// 初始化地图业务，生命周期钩子函数（必须）,框架在地图初始化完成后自动调用该函数
export function onMounted(mapInstance) {
  map = mapInstance // 记录map
  // map.control.toolbar.container.style.bottom = "55px" // 修改toolbar控件的样式

  addGraphicLayer()
}

// 释放当前地图业务的生命周期函数,具体项目中时必须写onMounted的反向操作（如解绑事件、对象销毁、变量置空）
export function onUnmounted() {
  hideIndexNumPoint() // 清理数字点位标识
  hideGroundLine() // 清理连接地面线
  map = null
}

export let fixedRoute

function addGraphicLayer() {
  // 创建矢量数据图层
  graphicLayer = new mars3d.layer.GraphicLayer()
  map.addLayer(graphicLayer)

  fixedRoute = new mars3d.graphic.FixedRoute({
    name: "飞机航线",
    position: {
      type: "time", // 时序动态坐标
      speed: 100, // 飞行速度
      startTime: "2025-07-31 09:00:00",
      list: positions
    },
    // "clockLoop": true,      //是否循环播放
    clockRange: mars3d.Cesium.ClockRange.CLAMPED, // CLAMPED 到达终止时间后停止
    camera: {
      type: "gs"
      // heading: -84,
      // radius: 500
    },
    label: {
      text: "大疆无人机",
      font_size: 30,
      scale: 0.5,
      font_family: "宋体",
      color: "#ffffff",
      background: true,
      backgroundColor: "rgba(0,0,0,0.5)",
      pixelOffsetY: -35,
      distanceDisplayCondition: true,
      distanceDisplayCondition_far: 100000,
      visibleDepth: false
    },
    model: {
      url: "/model/dajiang.gltf",
      scale: 1,
      // heading: 0,
      minimumPixelSize: 100
    },
    path: {
      color: "rgba(255,255,0,0.5)",
      width: 1
      // leadTime: 0 ,//不显示未飞行过的
    },
    wall: {
      color: "rgba(0,255,255,0.5)",
      surface: true
    }
  })
  graphicLayer.addGraphic(fixedRoute)

  // 绑定popup
  bindPopup(fixedRoute)

  // ui面板信息展示
  fixedRoute.on(
    mars3d.EventType.change,
    mars3d.Util.funThrottle((event) => {
      // 取实时信息，可以通过  fixedRoute.info
      eventTarget.fire("roamLineChange", event)
    }, 500)
  )

  // fixedRoute.start()
  // fixedRoute.openPopup()

  // 修改控件对应的时间
  map.clock.currentTime = fixedRoute.startTime
  if (map.control.timeline) {
    map.control.timeline.zoomTo(fixedRoute.startTime, fixedRoute.stopTime)
  }
}

// 显示连接地面线
export function showGroundLine() {
  // 如果已经显示了，先清除
  hideGroundLine()

  groundPoint = new mars3d.graphic.PointPrimitive({
    position: fixedRoute.position,
    style: {
      color: "#ff0000",
      pixelSize: 6
    }
  })
  graphicLayer.addGraphic(groundPoint)

  const linePositions = []
  groundLine = new mars3d.graphic.PolylineEntity({
    positions: new mars3d.Cesium.CallbackProperty(function (time) {
      return linePositions
    }, false),
    style: {
      width: 1,
      materialType: mars3d.MaterialType.PolylineDash,
      materialOptions: {
        color: mars3d.Cesium.Color.WHITE,
        dashLength: 20
      }
    }
  })
  graphicLayer.addGraphic(groundLine)

  fixedRoute.on(mars3d.EventType.change, function (event) {
    if (!groundPoint || !groundLine) {
      return // 如果连接地面线已被清除，不再更新
    }

    const wrjPt = fixedRoute.position
    const wrjCarto = mars3d.Cesium.Cartographic.fromCartesian(wrjPt)
    const dmHeight = mars3d.PointUtil.getHeight(map?.scene, wrjCarto, { max: wrjCarto.height })
    const pt2 = mars3d.Cesium.Cartesian3.fromRadians(wrjCarto.longitude, wrjCarto.latitude, dmHeight)

    // 更新竖直线坐标
    linePositions[0] = wrjPt
    linePositions[1] = pt2

    // 更新其他矢量对象
    groundPoint.position = pt2

    // const wrjHeight = wrjCarto.height - dmHeight // 相对地面高度（AGL）‌: 飞行海拔-地面海拔
    // fixedRoute.label.text = `火星无人机\nAGL:${mars3d.Util.formatNum(wrjHeight, 2)}m`

    // 绝对高度（ASL）‌: 飞行海拔
    fixedRoute.label.text = `大疆无人机\n飞行高度:${mars3d.Util.formatNum(wrjCarto.height, 2)}m`
  })
}

// 隐藏连接地面线
export function hideGroundLine() {
  if (groundPoint) {
    graphicLayer.removeGraphic(groundPoint)
    groundPoint = null
  }
  if (groundLine) {
    graphicLayer.removeGraphic(groundLine)
    groundLine = null
  }
}

// 存储数字点位标识
let indexNumPoints = []

// 存储连接地面线的图形对象
let groundPoint = null
let groundLine = null

// 添加路线的数字点位标识
export async function showIndexNumPoint() {
  // 如果已经显示了，先清除
  hideIndexNumPoint()

  for (let i = 0; i < positions.length; i++) {
    const idx = i + 1
    const graphic = new mars3d.graphic.BillboardPrimitive({
      position: positions[i],
      style: {
        image: await getMarkerImg(idx),
        horizontalOrigin: mars3d.Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: mars3d.Cesium.VerticalOrigin.BOTTOM
      },
      attr: { index: idx }
    })
    graphicLayer.addGraphic(graphic)
    indexNumPoints.push(graphic)
  }
}

// 隐藏路线的数字点位标识
export function hideIndexNumPoint() {
  indexNumPoints.forEach((graphic) => {
    graphicLayer.removeGraphic(graphic)
  })
  indexNumPoints = []
}

// 获取数字标识图标
let indexMark
async function getMarkerImg(num) {
  if (!indexMark) {
    indexMark = await mars3d.Cesium.Resource.fetchImage({ url: "/img/marker/bg/poi-num.png" })
  }

  const canvas = document.createElement("canvas")
  canvas.width = 19
  canvas.height = 25
  const ctx = canvas.getContext("2d")
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(indexMark, 0, 0) // 绘制图片

  // 绘制文字
  ctx.fillStyle = "#ffffff"
  ctx.font = "12px 楷体"
  ctx.textBaseline = "middle"
  ctx.fillText(num, num < 10 ? 6 : 3, 10)

  return canvas.toDataURL("image/png")
}

// 改变视角模式
export function updateCameraSetting(data) {
  const cameraType = data.select
  const followedX = data.followedX
  const followedZ = data.followedZ
  const offsetZ = data.offsetZ
  const offsetY = data.offsetY
  const offsetX = data.offsetX

  fixedRoute.setCameraOptions({
    type: cameraType,
    radius: cameraType === "gs" ? followedX : 0,
    followedX,
    followedZ,
    offsetZ,
    offsetY,
    offsetX
  })
}

function bindPopup(fixedRoute) {
  fixedRoute.bindPopup(
    `<div style="width: 200px">
      <div>总 距 离：<span id="lblAllLen"> </span></div>
      <div>总 时 间：<span id="lblAllTime"> </span></div>
      <div>开始时间：<span id="lblStartTime"> </span></div>
      <div>剩余时间：<span id="lblRemainTime"> </span></div>
      <div>剩余距离：<span id="lblRemainLen"> </span></div>
    </div>`,
    { closeOnClick: false }
  )

  // 刷新局部DOM,不影响popup面板的其他控件操作
  fixedRoute.on(mars3d.EventType.popupRender, function (event) {
    const container = event.container // popup对应的DOM

    const params = fixedRoute?.info
    if (!params) {
      return
    }

    const lblAllLen = container.querySelector("#lblAllLen")
    if (lblAllLen) {
      lblAllLen.innerHTML = mars3d.MeasureUtil.formatDistance(params.distance_all)
    }

    const lblAllTime = container.querySelector("#lblAllTime")
    if (lblAllTime) {
      lblAllTime.innerHTML = mars3d.Util.formatTime(params.second_all / map.clock.multiplier)
    }

    const lblStartTime = container.querySelector("#lblStartTime")
    if (lblStartTime) {
      lblStartTime.innerHTML = mars3d.Util.formatDate(mars3d.Cesium.JulianDate.toDate(fixedRoute.startTime), "yyyy-M-d HH:mm:ss")
    }

    const lblRemainTime = container.querySelector("#lblRemainTime")
    if (lblRemainTime) {
      lblRemainTime.innerHTML = mars3d.Util.formatTime((params.second_all - params.second) / map.clock.multiplier)
    }

    const lblRemainLen = container.querySelector("#lblRemainLen")
    if (lblRemainLen) {
      lblRemainLen.innerHTML = mars3d.MeasureUtil.formatDistance(params.distance_all - params.distance) || "完成"
    }
  })
}

// ui层使用
export const formatDistance = mars3d.MeasureUtil.formatDistance
export const formatTime = mars3d.Util.formatTime
