// 航线管理相关的类型定义

export interface RouteData {
  id: string
  name: string
  speed: number
  altitude: number
  description?: string
  waypoints: number[][]
  createdAt: string
  updatedAt: string
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

export interface RouteExportData {
  exportTime: string
  version: string
  routeCount: number
  routes: RouteData[]
}

export interface RouteFilterOptions {
  keyword?: string
  minAltitude?: number
  maxAltitude?: number
  minSpeed?: number
  maxSpeed?: number
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface RouteSearchResult {
  routes: RouteData[]
  total: number
  filtered: number
}

// 仿真状态
export interface SimulationState {
  isRunning: boolean
  isPaused: boolean
  currentRoute: RouteData | null
  progress: number
  remainingTime: number
}

// 地图显示状态
export interface MapDisplayState {
  selectedRoute: RouteData | null
  previewedRoute: RouteData | null
  simulatingRoute: RouteData | null
  showWaypoints: boolean
  showPath: boolean
  showLabels: boolean
}