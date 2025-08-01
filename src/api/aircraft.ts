/**
 * 机型管理API接口
 * @copyright 赤壁低空云平台
 */
import type { 
  AircraftModel, 
  AircraftModelForm, 
  AircraftModelOption,
  AircraftQueryParams,
  PageResult,
  ApiResponse 
} from '@/types/aircraft'

// 模拟数据 - 后续替换为真实API调用
const mockAircraftModels: AircraftModel[] = [
  {
    id: 1,
    modelName: "DJI Phantom 4 Pro",
    manufacturer: "DJI",
    modelCode: "P4P-001",
    maxFlightTime: 30,
    maxFlightDistance: 7,
    maxAltitude: 6000,
    maxSpeed: 20,
    payloadCapacity: 1.4,
    batteryCapacity: 5870,
    specifications: {
      wingspan: 0.35,
      weight: 1.388,
      rotorCount: 4,
      cameraResolution: "4K",
      gpsAccuracy: 1.5,
      operatingTemp: "-10°C to 40°C",
      windResistance: 10,
      foldable: false
    },
    status: 1,
    createdAt: "2024-01-01 10:00:00",
    updatedAt: "2024-01-01 10:00:00"
  },
  {
    id: 2,
    modelName: "DJI Mavic 3",
    manufacturer: "DJI",
    modelCode: "M3-001",
    maxFlightTime: 46,
    maxFlightDistance: 15,
    maxAltitude: 6000,
    maxSpeed: 21,
    payloadCapacity: 0.895,
    batteryCapacity: 5000,
    specifications: {
      wingspan: 0.347,
      weight: 0.895,
      rotorCount: 4,
      cameraResolution: "5.1K",
      gpsAccuracy: 1,
      operatingTemp: "-10°C to 40°C",
      windResistance: 12,
      foldable: true
    },
    status: 1,
    createdAt: "2024-01-02 10:00:00",
    updatedAt: "2024-01-02 10:00:00"
  },
  {
    id: 3,
    modelName: "大疆经纬 M300 RTK",
    manufacturer: "DJI",
    modelCode: "M300-RTK",
    maxFlightTime: 55,
    maxFlightDistance: 15,
    maxAltitude: 7000,
    maxSpeed: 23,
    payloadCapacity: 2.7,
    batteryCapacity: 5935,
    specifications: {
      wingspan: 0.81,
      weight: 6.3,
      rotorCount: 4,
      cameraResolution: "变焦相机",
      gpsAccuracy: 0.1,
      operatingTemp: "-20°C to 50°C",
      windResistance: 15,
      foldable: true
    },
    status: 1,
    createdAt: "2024-01-03 10:00:00",
    updatedAt: "2024-01-03 10:00:00"
  }
]

let nextId = 4

// 模拟延迟
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 获取机型列表
 */
export async function getAircraftModels(params: AircraftQueryParams): Promise<ApiResponse<PageResult<AircraftModel>>> {
  await delay()
  
  let filteredData = [...mockAircraftModels]
  
  // 关键词搜索
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filteredData = filteredData.filter(item => 
      item.modelName.toLowerCase().includes(keyword) ||
      item.manufacturer.toLowerCase().includes(keyword) ||
      item.modelCode.toLowerCase().includes(keyword)
    )
  }
  
  // 状态筛选
  if (params.status !== undefined) {
    filteredData = filteredData.filter(item => item.status === params.status)
  }
  
  // 制造商筛选
  if (params.manufacturer) {
    filteredData = filteredData.filter(item => item.manufacturer === params.manufacturer)
  }
  
  // 分页
  const start = (params.page - 1) * params.size
  const end = start + params.size
  const data = filteredData.slice(start, end)
  
  return {
    code: 200,
    message: 'success',
    success: true,
    data: {
      data,
      total: filteredData.length,
      page: params.page,
      size: params.size,
      totalPages: Math.ceil(filteredData.length / params.size)
    }
  }
}

/**
 * 获取机型详情
 */
export async function getAircraftModel(id: number): Promise<ApiResponse<AircraftModel>> {
  await delay(200)
  
  const aircraft = mockAircraftModels.find(item => item.id === id)
  if (!aircraft) {
    return {
      code: 404,
      message: '机型不存在',
      success: false,
      data: null
    }
  }
  
  return {
    code: 200,
    message: 'success',
    success: true,
    data: aircraft
  }
}

/**
 * 创建机型
 */
export async function createAircraftModel(formData: AircraftModelForm): Promise<ApiResponse<AircraftModel>> {
  await delay(800)
  
  // 检查机型编码是否重复
  const exists = mockAircraftModels.some(item => item.modelCode === formData.modelCode)
  if (exists) {
    return {
      code: 400,
      message: '机型编码已存在',
      success: false,
      data: null
    }
  }
  
  const newAircraft: AircraftModel = {
    id: nextId++,
    ...formData,
    createdAt: new Date().toLocaleString(),
    updatedAt: new Date().toLocaleString()
  }
  
  mockAircraftModels.push(newAircraft)
  
  return {
    code: 200,
    message: '创建成功',
    success: true,
    data: newAircraft
  }
}

/**
 * 更新机型
 */
export async function updateAircraftModel(id: number, formData: AircraftModelForm): Promise<ApiResponse<AircraftModel>> {
  await delay(800)
  
  const index = mockAircraftModels.findIndex(item => item.id === id)
  if (index === -1) {
    return {
      code: 404,
      message: '机型不存在',
      success: false,
      data: null
    }
  }
  
  // 检查机型编码是否重复（排除自己）
  const exists = mockAircraftModels.some(item => item.id !== id && item.modelCode === formData.modelCode)
  if (exists) {
    return {
      code: 400,
      message: '机型编码已存在',
      success: false,
      data: null
    }
  }
  
  const updatedAircraft: AircraftModel = {
    ...mockAircraftModels[index],
    ...formData,
    updatedAt: new Date().toLocaleString()
  }
  
  mockAircraftModels[index] = updatedAircraft
  
  return {
    code: 200,
    message: '更新成功',
    success: true,
    data: updatedAircraft
  }
}

/**
 * 删除机型
 */
export async function deleteAircraftModel(id: number): Promise<ApiResponse<null>> {
  await delay(500)
  
  const index = mockAircraftModels.findIndex(item => item.id === id)
  if (index === -1) {
    return {
      code: 404,
      message: '机型不存在',
      success: false,
      data: null
    }
  }
  
  mockAircraftModels.splice(index, 1)
  
  return {
    code: 200,
    message: '删除成功',
    success: true,
    data: null
  }
}

/**
 * 获取启用的机型选项（用于下拉选择）
 */
export async function getAircraftModelOptions(): Promise<ApiResponse<AircraftModelOption[]>> {
  await delay(300)
  
  const options = mockAircraftModels
    .filter(item => item.status === 1)
    .map(item => ({
      value: item.id,
      label: `${item.modelName} (${item.modelCode})`,
      disabled: false
    }))
  
  return {
    code: 200,
    message: 'success',
    success: true,
    data: options
  }
}

/**
 * 获取制造商列表（用于筛选）
 */
export async function getManufacturers(): Promise<ApiResponse<string[]>> {
  await delay(200)
  
  const manufacturers = [...new Set(mockAircraftModels.map(item => item.manufacturer))]
  
  return {
    code: 200,
    message: 'success',
    success: true,
    data: manufacturers
  }
}