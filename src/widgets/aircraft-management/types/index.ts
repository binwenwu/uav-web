/**
 * 机型管理相关类型定义
 */

// 机型基础信息接口
export interface AircraftModel {
  id: number
  modelName: string
  manufacturer?: string
  modelCode: string
  maxFlightTime?: number // 最大飞行时间(分钟)
  maxFlightDistance?: number // 最大飞行距离(公里)
  maxAltitude?: number // 最大飞行高度(米)
  maxSpeed?: number // 最大飞行速度(米/秒)
  payloadCapacity?: number // 载荷能力(公斤)
  batteryCapacity?: number // 电池容量(mAh)
  specifications?: any // 详细规格参数(JSON或字符串)
  status: number // 状态: 1-启用, 0-禁用
  createdAt: string
  updatedAt: string
  createdBy?: string
}

// 创建机型DTO
export interface CreateAircraftDTO {
  modelName: string
  manufacturer?: string
  modelCode: string
  maxFlightTime?: number
  maxFlightDistance?: number
  maxAltitude?: number
  maxSpeed?: number
  payloadCapacity?: number
  batteryCapacity?: number
  specifications?: any
  status?: number
}

// 更新机型DTO
export interface UpdateAircraftDTO extends Partial<CreateAircraftDTO> {
  id?: number
}

// 机型搜索参数
export interface AircraftSearchParams {
  page?: number
  size?: number
  keyword?: string
  status?: number
  manufacturer?: string
}

// 分页结果
export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
  pages: number
}

// API响应结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
  timestamp: number
}

// 机型选项（用于下拉框）
export interface AircraftModelOption {
  value: number
  label: string
  modelCode: string
  disabled?: boolean
}

// 机型统计信息
export interface AircraftStats {
  totalCount: number
  activeCount: number
  inactiveCount: number
  manufacturerStats: Array<{
    manufacturer: string
    count: number
  }>
}

// 机型规格详情
export interface AircraftSpecifications {
  weight?: number // 重量(kg)
  dimensions?: {
    // 尺寸
    length?: number // 长度(mm)
    width?: number // 宽度(mm)
    height?: number // 高度(mm)
    wingspan?: number // 翼展(mm)
  }
  sensors?: Array<{
    // 传感器配置
    type: string
    model: string
    specifications?: string
  }>
  communication?: {
    // 通信能力
    frequency?: string // 频率
    range?: number // 通信距离(km)
    protocols?: string[] // 支持的协议
  }
  camera?: {
    // 相机参数
    resolution?: string
    zoomRange?: string
    gimbalType?: string
  }
  [key: string]: any // 其他自定义规格
}

// 机型验证结果
export interface AircraftValidation {
  isValid: boolean
  errors: Array<{
    field: string
    message: string
  }>
}

// 机型导入/导出
export interface AircraftImportResult {
  successCount: number
  failCount: number
  errors: Array<{
    row: number
    message: string
    data: any
  }>
}

export interface AircraftExportParams {
  ids?: number[]
  searchParams?: AircraftSearchParams
  includeInactive?: boolean
}

