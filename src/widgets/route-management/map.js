import * as mars3d from "mars3d"

export let map // mars3d.Map三维地图对象
let graphicLayer
let previewLayer

// 需要覆盖config.json中地图属性参数（当前示例框架中自动处理合并）
export const mapOptions = {
  scene: {
    center: { lat: 29.785027, lng: 113.909418, alt: 465.5, heading: 340.9, pitch: -34 }
  }
}

export const eventTarget = new mars3d.BaseClass() // 事件对象，用于抛出事件到组件中

// 当前显示的航线相关对象
let currentRouteGraphics = []
let currentSimulation = null

// 初始化地图业务，生命周期钩子函数（必须）,框架在地图初始化完成后自动调用该函数
export function onMounted(mapInstance) {
  map = mapInstance // 记录map

  addGraphicLayers()
}

// 释放当前地图业务的生命周期函数
export function onUnmounted() {
  clearRouteDisplay()
  stopSimulation()
  map = null
}

function addGraphicLayers() {
  // 创建矢量数据图层
  graphicLayer = new mars3d.layer.GraphicLayer()
  map.addLayer(graphicLayer)

  // 创建专门的预览图层
  previewLayer = new mars3d.layer.GraphicLayer()
  map.addLayer(previewLayer)
}

// 显示航线预览
export function showRoutePreview(routeData) {
  // 清除之前的显示
  clearRouteDisplay()

  if (!routeData || !routeData.waypoints || routeData.waypoints.length < 2) {
    console.warn("无效的航线数据")
    return
  }

  const positions = routeData.waypoints

  // 添加航点标记
  positions.forEach((pos, index) => {
    addWaypointMarker(pos, index + 1, routeData.altitude)
  })

  // 添加航线路径
  addRoutePath(positions, routeData)

  // 飞到航线范围
  flyToRoute(positions)

  console.log("显示航线预览:", routeData.name)
}

// 添加航点标记
async function addWaypointMarker(position, index, altitude) {
  const graphic = new mars3d.graphic.BillboardPrimitive({
    position: [position[0], position[1], position[2] || altitude],
    style: {
      image: await getWaypointMarkerImg(index),
      horizontalOrigin: mars3d.Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: mars3d.Cesium.VerticalOrigin.BOTTOM,
      scale: 0.7
    },
    attr: {
      type: "waypoint",
      index: index
    }
  })

  previewLayer.addGraphic(graphic)
  currentRouteGraphics.push(graphic)
}

// 获取航点标记图标
let waypointMark
async function getWaypointMarkerImg(num) {
  if (!waypointMark) {
    waypointMark = await mars3d.Cesium.Resource.fetchImage({ url: "/img/marker/bg/poi-num.png" })
  }

  const canvas = document.createElement("canvas")
  canvas.width = 19
  canvas.height = 25
  const ctx = canvas.getContext("2d")
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(waypointMark, 0, 0) // 绘制图片

  // 绘制文字
  ctx.fillStyle = "#ffffff"
  ctx.font = "12px 楷体"
  ctx.textBaseline = "middle"
  ctx.fillText(num, num < 10 ? 6 : 3, 10)

  return canvas.toDataURL("image/png")
}

// 添加航线路径
function addRoutePath(positions, routeData) {
  const pathGraphic = new mars3d.graphic.PolylineEntity({
    positions: positions,
    style: {
      width: 4,
      color: "#52c41a",
      opacity: 0.8,
      clampToGround: false,
      outline: true,
      outlineColor: "#389e0d",
      outlineWidth: 1
    },
    attr: { type: "route_path" }
  })

  previewLayer.addGraphic(pathGraphic)
  currentRouteGraphics.push(pathGraphic)

  // 添加航线信息标签
  if (positions.length >= 2) {
    const midIndex = Math.floor(positions.length / 2)
    const midPosition = positions[midIndex]

    const labelGraphic = new mars3d.graphic.LabelEntity({
      position: [midPosition[0], midPosition[1], (midPosition[2] || routeData.altitude) + 20],
      style: {
        text: `${routeData.name}\n高度:${routeData.altitude}m 速度:${routeData.speed}m/s`,
        font_size: 14,
        font_family: "微软雅黑",
        color: "#ffffff",
        background: true,
        backgroundColor: "rgba(82, 196, 26, 0.8)",
        pixelOffsetY: -10,
        distanceDisplayCondition: true,
        distanceDisplayCondition_far: 5000,
        visibleDepth: false
      },
      attr: { type: "route_label" }
    })

    previewLayer.addGraphic(labelGraphic)
    currentRouteGraphics.push(labelGraphic)
  }
}

// 飞到航线范围
function flyToRoute(positions) {
  if (positions.length >= 2) {
    map.flyToPositions(positions, {
      radius: 800,
      duration: 2,
      heading: 0,
      pitch: -45
    })
  }
}

// 清除航线显示
export function clearRouteDisplay() {
  currentRouteGraphics.forEach((graphic) => {
    previewLayer.removeGraphic(graphic)
  })
  currentRouteGraphics = []
}

// 开始航线仿真
export function startRouteSimulation(routeData) {
  // 停止之前的仿真
  stopSimulation()

  if (!routeData || !routeData.waypoints || routeData.waypoints.length < 2) {
    console.warn("无效的航线数据，无法开始仿真")
    return
  }

  const positions = routeData.waypoints

  // 创建仿真飞行路线
  currentSimulation = new mars3d.graphic.FixedRoute({
    name: `仿真飞行-${routeData.name}`,
    position: {
      type: "time",
      speed: routeData.speed,
      startTime: "2025-07-31 09:00:00",
      list: positions
    },
    clockRange: mars3d.Cesium.ClockRange.CLAMPED,
    camera: {
      type: "gs",
      radius: 400
    },
    label: {
      text: routeData.name,
      font_size: 20,
      scale: 0.5,
      color: "#ffffff",
      background: true,
      backgroundColor: "rgba(24, 144, 255, 0.7)",
      pixelOffsetY: -25,
      distanceDisplayCondition: true,
      distanceDisplayCondition_far: 3000
    },
    model: {
      url: "/model/dajiang.gltf",
      scale: 0.8,
      minimumPixelSize: 80
    },
    path: {
      color: "rgba(255, 69, 0, 0.8)",
      width: 3,
      leadTime: 0
    },
    wall: {
      color: "rgba(255, 69, 0, 0.3)",
      surface: true
    }
  })

  graphicLayer.addGraphic(currentSimulation)

  // 绑定仿真事件
  currentSimulation.on(mars3d.EventType.start, () => {
    console.log("仿真开始:", routeData.name)
    eventTarget.fire("simulationStart", { route: routeData })
  })

  currentSimulation.on(mars3d.EventType.stop, () => {
    console.log("仿真结束:", routeData.name)
    eventTarget.fire("simulationEnd", { route: routeData })
  })

  currentSimulation.on(mars3d.EventType.change, (event) => {
    // 实时位置信息
    eventTarget.fire("simulationUpdate", {
      route: routeData,
      info: currentSimulation.info
    })
  })

  // 修改控件对应的时间
  map.clock.currentTime = currentSimulation.startTime
  if (map.control.timeline) {
    map.control.timeline.zoomTo(currentSimulation.startTime, currentSimulation.stopTime)
  }

  // 开始仿真
  currentSimulation.start()

  console.log("航线仿真已启动:", routeData.name)
}

// 停止仿真
export function stopSimulation() {
  if (currentSimulation) {
    currentSimulation.stop()
    graphicLayer.removeGraphic(currentSimulation)
    currentSimulation = null
    console.log("仿真已停止")
  }
}

// 暂停仿真
export function pauseSimulation() {
  if (currentSimulation) {
    currentSimulation.pause()
  }
}

// 继续仿真
export function resumeSimulation() {
  if (currentSimulation) {
    currentSimulation.proceed()
  }
}

// 重置仿真
export function resetSimulation() {
  if (currentSimulation) {
    currentSimulation.stop()
    setTimeout(() => {
      if (currentSimulation) {
        currentSimulation.start()
      }
    }, 100)
  }
}

// 航线数据管理
export function getSavedRoutes() {
  try {
    const routes = JSON.parse(localStorage.getItem("uav_routes") || "[]")
    // 按创建时间倒序排列
    return routes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (error) {
    console.error("读取航线数据失败:", error)
    return []
  }
}

export function saveRoute(routeData) {
  try {
    const routes = getSavedRoutes()

    // 检查是否已存在同名航线
    const existingIndex = routes.findIndex((route) => route.name === routeData.name)
    if (existingIndex >= 0) {
      // 更新现有航线
      routeData.updatedAt = new Date().toISOString()
      routes[existingIndex] = routeData
    } else {
      // 添加新航线
      routeData.createdAt = routeData.createdAt || new Date().toISOString()
      routeData.updatedAt = new Date().toISOString()
      routes.unshift(routeData) // 添加到开头
    }

    localStorage.setItem("uav_routes", JSON.stringify(routes))
    console.log("航线保存成功:", routeData.name)

    return true
  } catch (error) {
    console.error("保存航线失败:", error)
    return false
  }
}

export function deleteRoute(routeId) {
  try {
    let routes = getSavedRoutes()
    const originalLength = routes.length
    routes = routes.filter((route) => route.id !== routeId)

    if (routes.length < originalLength) {
      localStorage.setItem("uav_routes", JSON.stringify(routes))
      console.log("航线删除成功:", routeId)
      return true
    } else {
      console.warn("未找到要删除的航线:", routeId)
      return false
    }
  } catch (error) {
    console.error("删除航线失败:", error)
    return false
  }
}

export function updateRoute(routeData) {
  try {
    const routes = getSavedRoutes()
    const index = routes.findIndex((route) => route.id === routeData.id)

    if (index >= 0) {
      routeData.updatedAt = new Date().toISOString()
      routes[index] = routeData
      localStorage.setItem("uav_routes", JSON.stringify(routes))
      console.log("航线更新成功:", routeData.name)
      return true
    } else {
      console.warn("未找到要更新的航线:", routeData.id)
      return false
    }
  } catch (error) {
    console.error("更新航线失败:", error)
    return false
  }
}

// 航线统计信息
export function getRouteStatistics() {
  const routes = getSavedRoutes()
  return {
    totalRoutes: routes.length,
    totalWaypoints: routes.reduce((sum, route) => sum + route.waypoints.length, 0),
    averageWaypoints: routes.length > 0 ? Math.round(routes.reduce((sum, route) => sum + route.waypoints.length, 0) / routes.length) : 0,
    altitudeRange:
      routes.length > 0
        ? {
            min: Math.min(...routes.map((r) => r.altitude)),
            max: Math.max(...routes.map((r) => r.altitude))
          }
        : { min: 0, max: 0 },
    speedRange:
      routes.length > 0
        ? {
            min: Math.min(...routes.map((r) => r.speed)),
            max: Math.max(...routes.map((r) => r.speed))
          }
        : { min: 0, max: 0 }
  }
}

// 批量操作
export function batchDeleteRoutes(routeIds) {
  try {
    let routes = getSavedRoutes()
    const originalLength = routes.length
    routes = routes.filter((route) => !routeIds.includes(route.id))

    localStorage.setItem("uav_routes", JSON.stringify(routes))
    const deletedCount = originalLength - routes.length
    console.log(`批量删除航线成功，删除了 ${deletedCount} 条航线`)

    return deletedCount
  } catch (error) {
    console.error("批量删除航线失败:", error)
    return 0
  }
}

export function exportRoutes(routeIds = null) {
  try {
    let routes = getSavedRoutes()

    if (routeIds && Array.isArray(routeIds)) {
      routes = routes.filter((route) => routeIds.includes(route.id))
    }

    const exportData = {
      exportTime: new Date().toISOString(),
      version: "1.0",
      routeCount: routes.length,
      routes: routes
    }

    return exportData
  } catch (error) {
    console.error("导出航线失败:", error)
    return null
  }
}

// 搜索和筛选
export function searchRoutes(keyword) {
  const routes = getSavedRoutes()
  if (!keyword || keyword.trim() === "") {
    return routes
  }

  const searchTerm = keyword.toLowerCase()
  return routes.filter(
    (route) => route.name.toLowerCase().includes(searchTerm) || (route.description && route.description.toLowerCase().includes(searchTerm))
  )
}

export function filterRoutesByAltitude(minAlt, maxAlt) {
  const routes = getSavedRoutes()
  return routes.filter((route) => route.altitude >= minAlt && route.altitude <= maxAlt)
}

export function filterRoutesBySpeed(minSpeed, maxSpeed) {
  const routes = getSavedRoutes()
  return routes.filter((route) => route.speed >= minSpeed && route.speed <= maxSpeed)
}
