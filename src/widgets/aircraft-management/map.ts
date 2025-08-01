/**
 * 机型管理地图相关功能
 * @copyright 武汉大学 mars3d.cn
 * @author AI Assistant
 */
import * as mars3d from "mars3d"

export let map: mars3d.Map // mars3d.Map 三维地图对象

/**
 * 初始化地图业务，生命周期钩子函数（必须）
 * 框架在地图初始化完成后自动调用该函数
 * @param {mars3d.Map} mapInstance 地图对象
 * @returns {void} 无
 */
export function onMounted(mapInstance: mars3d.Map): void {
  map = mapInstance // 记录map
  console.log("机型管理模块地图初始化完成", map)
}

/**
 * 释放当前地图业务的生命周期函数
 * @returns {void} 无
 */
export function onUnmounted(): void {
  console.log("机型管理模块地图释放")
  map = null as any
}

/**
 * 显示机型在地图上的覆盖范围（可选功能）
 * @param aircraftData 机型数据
 */
export function showAircraftCoverage(aircraftData: {
  maxFlightDistance: number
  center?: [number, number] // [经度, 纬度]
}): void {
  if (!map || !aircraftData.maxFlightDistance) {
    return
  }

  const center = aircraftData.center || [114.3054, 30.5931] // 默认武汉坐标

  // 创建覆盖范围圆圈
  const graphic = new mars3d.graphic.CircleEntity({
    position: center,
    style: {
      radius: aircraftData.maxFlightDistance * 1000, // 转换为米
      color: "rgba(255, 255, 0, 0.3)",
      outline: true,
      outlineColor: "#ffff00",
      outlineWidth: 2,
      clampToGround: true
    }
  })

  // 添加到地图
  map.graphicLayer.addGraphic(graphic)
}

/**
 * 清除地图上的所有覆盖范围显示
 */
export function clearAircraftCoverage(): void {
  if (!map) {
    return
  }
  map.graphicLayer.clear()
}

/**
 * 飞行到指定位置查看机型覆盖范围
 * @param center 中心点坐标
 * @param distance 飞行距离（公里）
 */
export function flyToAircraftView(center: [number, number], distance: number): void {
  if (!map) {
    return
  }

  const height = Math.max(distance * 2000, 1000) // 根据距离计算合适的高度

  map.flyToPoint(center, {
    radius: height,
    duration: 2
  })
}

/**
 * 获取当前地图中心点坐标
 */
export function getCurrentMapCenter(): [number, number] | null {
  if (!map) {
    return null
  }

  const center = map.getCenter()
  return [center.lng, center.lat]
}

/**
 * 在地图上标注机型测试点
 * @param points 测试点数组
 */
export function markTestPoints(
  points: Array<{
    position: [number, number, number?]
    name: string
    aircraftModel?: string
  }>
): void {
  if (!map) {
    return
  }

  points.forEach((point) => {
    const graphic = new mars3d.graphic.BillboardEntity({
      position: point.position,
      style: {
        image: "/img/marker/mark-blue.png",
        scale: 1,
        pixelOffsetY: -20,
        label: {
          text: `${point.name}\n${point.aircraftModel || ""}`,
          font_size: 14,
          color: "#ffffff",
          pixelOffsetY: -50,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backgroundPadding: [4, 8]
        }
      },
      attr: point
    })

    map.graphicLayer.addGraphic(graphic)
  })
}

// 导出常用的地图工具函数
export const mapUtils = {
  showAircraftCoverage,
  clearAircraftCoverage,
  flyToAircraftView,
  getCurrentMapCenter,
  markTestPoints
}
