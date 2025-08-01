/**
 * 机型管理相关类型定义
 * @copyright 赤壁低空云平台
 */

// 机型基础信息
export interface AircraftModel {
  id: number
  modelName: string           // 机型名称
  manufacturer: string        // 制造商
  modelCode: string          // 机型编码
  maxFlightTime: number      // 最大飞行时间(分钟)
  maxFlightDistance: number  // 最大飞行距离(公里)
  maxAltitude: number        // 最大飞行高度(米)
  maxSpeed: number           // 最大飞行速度(米/秒)
  payloadCapacity: number    // 载荷能力(公斤)
  batteryCapacity: number    // 电池容量(mAh)
  specifications: Record<string, any> // 详细规格参数
  status: 1 | 0              // 状态: 1-启用, 0-禁用
  createdAt: string
  updatedAt: string
}

// 机型表单数据
export interface AircraftModelForm {
  modelName: string
  manufacturer: string
  modelCode: string
  maxFlightTime: number
  maxFlightDistance: number
  maxAltitude: number
  maxSpeed: number
  payloadCapacity: number
  batteryCapacity: number
  specifications: {
    wingspan?: number        // 翼展(米)
    weight?: number         // 重量(公斤)
    rotorCount?: number     // 旋翼数量
    cameraResolution?: string // 相机分辨率
    gpsAccuracy?: number    // GPS精度(米)
    operatingTemp?: string  // 工作温度范围
    windResistance?: number // 抗风等级
    foldable?: boolean      // 是否可折叠
    [key: string]: any
  }
  status: 1 | 0
}

// 机型选项（用于下拉选择）
export interface AircraftModelOption {
  value: number
  label: string
  disabled?: boolean
}

// 分页查询参数
export interface AircraftQueryParams {
  page: number
  size: number
  keyword?: string
  status?: 0 | 1
  manufacturer?: string
}

// 分页结果
export interface PageResult<T> {
  data: T[]
  total: number
  page: number
  size: number
  totalPages: number
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}