// 航线规划相关的类型定义

export interface RouteForm {
  name: string
  altitude: number
  speed: number
  description: string
}

export interface Waypoint {
  lng: number
  lat: number
  alt: number
  index: number
}

export interface PlanningState {
  step: "settings" | "editing"
  isSimulating: boolean
  simulationStatus: "stopped" | "running" | "paused"
}

export interface RouteData {
  id: string
  name: string
  speed: number
  altitude: number
  description?: string
  waypoints: number[][]
  createdAt: string | Date
  updatedAt: string | Date
}

export interface SimulationOptions {
  waypoints: Waypoint[]
  speed: number
  altitude: number
}

export interface MapEvent {
  point: {
    lng: number
    lat: number
    alt: number
  }
}

export interface RouteStatistics {
  totalRoutes: number
  totalWaypoints: number
  averageWaypoints: number
  altitudeRange: {
    min: number
    max: number
  }
  speedRange: {
    min: number
    max: number
  }
}

// 导出数据格式
export interface RouteExportData {
  exportTime: string
  version: string
  routeCount: number
  routes: RouteData[]
}
