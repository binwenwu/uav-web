/**
 * 机型管理API接口
 */
import type {
  AircraftModel,
  CreateAircraftDTO,
  UpdateAircraftDTO,
  AircraftSearchParams,
  PageResult,
  ApiResponse,
  AircraftModelOption,
  AircraftStats
} from "../types"

// 模拟API延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 模拟数据存储
const mockAircraftData: AircraftModel[] = [
  {
    id: 1,
    modelName: "DJI Mini 3 Pro",
    manufacturer: "DJI",
    modelCode: "DJI-MINI3PRO",
    maxFlightTime: 34,
    maxFlightDistance: 12,
    maxAltitude: 120,
    maxSpeed: 16,
    payloadCapacity: 0.249,
    batteryCapacity: 2453,
    specifications: {
      weight: 249,
      dimensions: {
        length: 145,
        width: 90,
        height: 62,
        wingspan: 245
      },
      camera: {
        resolution: "4K/60fps",
        zoomRange: "3x",
        gimbalType: "3轴机械云台"
      }
    },
    status: 1,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    createdBy: "admin"
  },
  {
    id: 2,
    modelName: "Phantom 4 RTK",
    manufacturer: "DJI",
    modelCode: "DJI-P4RTK",
    maxFlightTime: 30,
    maxFlightDistance: 7,
    maxAltitude: 120,
    maxSpeed: 20,
    payloadCapacity: 1.391,
    batteryCapacity: 5870,
    specifications: {
      weight: 1391,
      dimensions: {
        length: 289,
        width: 289,
        height: 196,
        wingspan: 350
      },
      camera: {
        resolution: "4K",
        zoomRange: "1x",
        gimbalType: "3轴机械云台"
      }
    },
    status: 1,
    createdAt: "2024-01-14T09:20:00Z",
    updatedAt: "2024-01-14T09:20:00Z",
    createdBy: "admin"
  },
  {
    id: 3,
    modelName: "Matrice 300 RTK",
    manufacturer: "DJI",
    modelCode: "DJI-M300RTK",
    maxFlightTime: 55,
    maxFlightDistance: 15,
    maxAltitude: 100,
    maxSpeed: 23,
    payloadCapacity: 2.7,
    batteryCapacity: 5935,
    specifications: {
      weight: 6300,
      dimensions: {
        length: 810,
        width: 670,
        height: 430,
        wingspan: 895
      },
      sensors: [
        {
          type: "RTK",
          model: "D-RTK 2",
          specifications: "厘米级定位精度"
        }
      ]
    },
    status: 0,
    createdAt: "2024-01-13T14:15:00Z",
    updatedAt: "2024-01-13T14:15:00Z",
    createdBy: "admin"
  },
  {
    id: 4,
    modelName: "Air 2S",
    manufacturer: "DJI",
    modelCode: "DJI-AIR2S",
    maxFlightTime: 31,
    maxFlightDistance: 12,
    maxAltitude: 120,
    maxSpeed: 19,
    payloadCapacity: 0.595,
    batteryCapacity: 3500,
    specifications: {
      weight: 595,
      dimensions: {
        length: 180,
        width: 97,
        height: 77,
        wingspan: 303
      },
      camera: {
        resolution: "5.4K",
        zoomRange: "4x",
        gimbalType: "3轴机械云台"
      }
    },
    status: 1,
    createdAt: "2024-01-12T16:45:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
    createdBy: "admin"
  },
  {
    id: 5,
    modelName: "M30T",
    manufacturer: "DJI",
    modelCode: "DJI-M30T",
    maxFlightTime: 41,
    maxFlightDistance: 8,
    maxAltitude: 120,
    maxSpeed: 23,
    payloadCapacity: 3.77,
    batteryCapacity: 5880,
    specifications: {
      weight: 3770,
      dimensions: {
        length: 365,
        width: 365,
        height: 215,
        wingspan: 470
      },
      sensors: [
        {
          type: "热成像",
          model: "FLIR",
          specifications: "640×512分辨率"
        },
        {
          type: "RTK",
          model: "D-RTK 2",
          specifications: "厘米级定位"
        }
      ]
    },
    status: 1,
    createdAt: "2024-01-11T11:20:00Z",
    updatedAt: "2024-01-11T11:20:00Z",
    createdBy: "admin"
  },
  {
    id: 6,
    modelName: "EVO II Pro",
    manufacturer: "Autel",
    modelCode: "AUTEL-EVO2PRO",
    maxFlightTime: 40,
    maxFlightDistance: 9,
    maxAltitude: 120,
    maxSpeed: 20,
    payloadCapacity: 1.127,
    batteryCapacity: 7100,
    specifications: {
      weight: 1127,
      dimensions: {
        length: 357,
        width: 280,
        height: 107,
        wingspan: 357
      },
      camera: {
        resolution: "6K",
        zoomRange: "1x",
        gimbalType: "3轴机械云台"
      }
    },
    status: 1,
    createdAt: "2024-01-10T13:30:00Z",
    updatedAt: "2024-01-10T13:30:00Z",
    createdBy: "admin"
  },
  {
    id: 7,
    modelName: "Alpha 800",
    manufacturer: "PowerVision",
    modelCode: "PV-ALPHA800",
    maxFlightTime: 60,
    maxFlightDistance: 20,
    maxAltitude: 120,
    maxSpeed: 25,
    payloadCapacity: 5.2,
    batteryCapacity: 12000,
    specifications: {
      weight: 5200,
      dimensions: {
        length: 950,
        width: 950,
        height: 380,
        wingspan: 1200
      },
      communication: {
        frequency: "2.4G/5.8G",
        range: 20,
        protocols: ["MAVLink", "RTMP"]
      }
    },
    status: 1,
    createdAt: "2024-01-09T09:15:00Z",
    updatedAt: "2024-01-09T09:15:00Z",
    createdBy: "admin"
  },
  {
    id: 8,
    modelName: "X8-2000",
    manufacturer: "科比特",
    modelCode: "KBT-X8-2000",
    maxFlightTime: 35,
    maxFlightDistance: 15,
    maxAltitude: 120,
    maxSpeed: 18,
    payloadCapacity: 2.5,
    batteryCapacity: 16000,
    specifications: {
      weight: 2500,
      dimensions: {
        length: 800,
        width: 800,
        height: 300,
        wingspan: 1000
      },
      sensors: [
        {
          type: "光电吊舱",
          model: "KBT-Z30",
          specifications: "30倍光学变焦"
        }
      ]
    },
    status: 1,
    createdAt: "2024-01-08T14:25:00Z",
    updatedAt: "2024-01-08T14:25:00Z",
    createdBy: "admin"
  },
  {
    id: 9,
    modelName: "Anafi USA",
    manufacturer: "Parrot",
    modelCode: "PARROT-ANAFI-USA",
    maxFlightTime: 32,
    maxFlightDistance: 4,
    maxAltitude: 120,
    maxSpeed: 15,
    payloadCapacity: 0.5,
    batteryCapacity: 2700,
    specifications: {
      weight: 500,
      dimensions: {
        length: 175,
        width: 240,
        height: 65,
        wingspan: 240
      },
      camera: {
        resolution: "4K HDR",
        zoomRange: "3x",
        gimbalType: "3轴机械云台"
      }
    },
    status: 0,
    createdAt: "2024-01-07T10:50:00Z",
    updatedAt: "2024-01-07T10:50:00Z",
    createdBy: "admin"
  },
  {
    id: 10,
    modelName: "T30",
    manufacturer: "DJI",
    modelCode: "DJI-T30",
    maxFlightTime: 22,
    maxFlightDistance: 7,
    maxAltitude: 120,
    maxSpeed: 8,
    payloadCapacity: 30,
    batteryCapacity: 17500,
    specifications: {
      weight: 24500,
      dimensions: {
        length: 2740,
        width: 2740,
        height: 758,
        wingspan: 2740
      },
      communication: {
        frequency: "2.4G",
        range: 7,
        protocols: ["OcuSync"]
      }
    },
    status: 1,
    createdAt: "2024-01-06T15:40:00Z",
    updatedAt: "2024-01-06T15:40:00Z",
    createdBy: "admin"
  },
  {
    id: 11,
    modelName: "固定翼-2000",
    manufacturer: "易瓦特",
    modelCode: "EWT-FW2000",
    maxFlightTime: 120,
    maxFlightDistance: 50,
    maxAltitude: 120,
    maxSpeed: 30,
    payloadCapacity: 2.0,
    batteryCapacity: 22000,
    specifications: {
      weight: 8500,
      dimensions: {
        length: 1800,
        width: 300,
        height: 200,
        wingspan: 2000
      },
      sensors: [
        {
          type: "测绘相机",
          model: "Sony A7R",
          specifications: "4200万像素"
        }
      ]
    },
    status: 1,
    createdAt: "2024-01-05T12:10:00Z",
    updatedAt: "2024-01-05T12:10:00Z",
    createdBy: "admin"
  },
  {
    id: 12,
    modelName: "V330A",
    manufacturer: "纵横股份",
    modelCode: "ZONGHENG-V330A",
    maxFlightTime: 240,
    maxFlightDistance: 100,
    maxAltitude: 120,
    maxSpeed: 35,
    payloadCapacity: 3.5,
    batteryCapacity: 35000,
    specifications: {
      weight: 14000,
      dimensions: {
        length: 3300,
        width: 400,
        height: 350,
        wingspan: 3300
      },
      communication: {
        frequency: "L/S频段",
        range: 100,
        protocols: ["数据链", "图传"]
      }
    },
    status: 1,
    createdAt: "2024-01-04T08:35:00Z",
    updatedAt: "2024-01-04T08:35:00Z",
    createdBy: "admin"
  },
  {
    id: 13,
    modelName: "U11",
    manufacturer: "成都纵横",
    modelCode: "CDZONGHENG-U11",
    maxFlightTime: 150,
    maxFlightDistance: 60,
    maxAltitude: 120,
    maxSpeed: 28,
    payloadCapacity: 5.5,
    batteryCapacity: 28000,
    specifications: {
      weight: 16800,
      dimensions: {
        length: 2400,
        width: 450,
        height: 380,
        wingspan: 3110
      },
      sensors: [
        {
          type: "多光谱相机",
          model: "RedEdge-MX",
          specifications: "5个光谱通道"
        },
        {
          type: "激光雷达",
          model: "VLP-16",
          specifications: "16线激光雷达"
        }
      ]
    },
    status: 0,
    createdAt: "2024-01-03T17:20:00Z",
    updatedAt: "2024-01-03T17:20:00Z",
    createdBy: "admin"
  }
]

let nextId = 14

/**
 * 获取机型列表
 */
export async function getAircraftList(params: AircraftSearchParams): Promise<ApiResponse<PageResult<AircraftModel>>> {
  await delay(500) // 模拟网络延迟

  let filteredData = [...mockAircraftData]

  // 关键词搜索
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filteredData = filteredData.filter(
      (item) =>
        item.modelName.toLowerCase().includes(keyword) ||
        item.modelCode.toLowerCase().includes(keyword) ||
        item.manufacturer?.toLowerCase().includes(keyword)
    )
  }

  // 状态筛选
  if (params.status !== undefined) {
    filteredData = filteredData.filter((item) => item.status === params.status)
  }

  // 制造商筛选
  if (params.manufacturer) {
    filteredData = filteredData.filter((item) => item.manufacturer === params.manufacturer)
  }

  // 分页
  const page = params.page || 1
  const size = params.size || 10
  const total = filteredData.length
  const start = (page - 1) * size
  const end = start + size
  const records = filteredData.slice(start, end)

  return {
    code: 200,
    message: "success",
    success: true,
    timestamp: Date.now(),
    data: {
      records,
      total,
      current: page,
      size,
      pages: Math.ceil(total / size)
    }
  }
}

/**
 * 获取机型详情
 */
export async function getAircraftDetail(id: number): Promise<ApiResponse<AircraftModel>> {
  await delay(300)

  const aircraft = mockAircraftData.find((item) => item.id === id)

  if (!aircraft) {
    throw new Error("机型不存在")
  }

  return {
    code: 200,
    message: "success",
    success: true,
    timestamp: Date.now(),
    data: aircraft
  }
}

/**
 * 创建机型
 */
export async function createAircraft(data: CreateAircraftDTO): Promise<ApiResponse<AircraftModel>> {
  await delay(800)

  // 检查机型编码是否重复
  if (mockAircraftData.some((item) => item.modelCode === data.modelCode)) {
    throw new Error("机型编码已存在")
  }

  const newAircraft: AircraftModel = {
    id: nextId++,
    ...data,
    status: data.status ?? 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "current_user" // 实际应用中从用户上下文获取
  }

  mockAircraftData.unshift(newAircraft)

  return {
    code: 200,
    message: "创建成功",
    success: true,
    timestamp: Date.now(),
    data: newAircraft
  }
}

/**
 * 更新机型
 */
export async function updateAircraft(id: number, data: UpdateAircraftDTO): Promise<ApiResponse<AircraftModel>> {
  await delay(600)

  const index = mockAircraftData.findIndex((item) => item.id === id)

  if (index === -1) {
    throw new Error("机型不存在")
  }

  // 检查机型编码是否与其他记录重复
  if (data.modelCode && mockAircraftData.some((item) => item.id !== id && item.modelCode === data.modelCode)) {
    throw new Error("机型编码已存在")
  }

  const updatedAircraft = {
    ...mockAircraftData[index],
    ...data,
    updatedAt: new Date().toISOString()
  }

  mockAircraftData[index] = updatedAircraft

  return {
    code: 200,
    message: "更新成功",
    success: true,
    timestamp: Date.now(),
    data: updatedAircraft
  }
}

/**
 * 删除机型
 */
export async function deleteAircraft(id: number): Promise<ApiResponse<void>> {
  await delay(400)

  const index = mockAircraftData.findIndex((item) => item.id === id)

  if (index === -1) {
    throw new Error("机型不存在")
  }

  mockAircraftData.splice(index, 1)

  return {
    code: 200,
    message: "删除成功",
    success: true,
    timestamp: Date.now(),
    data: undefined
  }
}

/**
 * 更新机型状态
 */
export async function updateAircraftStatus(id: number, status: number): Promise<ApiResponse<AircraftModel>> {
  await delay(300)

  const aircraft = mockAircraftData.find((item) => item.id === id)

  if (!aircraft) {
    throw new Error("机型不存在")
  }

  aircraft.status = status
  aircraft.updatedAt = new Date().toISOString()

  return {
    code: 200,
    message: "状态更新成功",
    success: true,
    timestamp: Date.now(),
    data: aircraft
  }
}

/**
 * 获取启用的机型选项列表（用于下拉框）
 */
export async function getActiveAircraftOptions(): Promise<ApiResponse<AircraftModelOption[]>> {
  await delay(200)

  const options = mockAircraftData
    .filter((item) => item.status === 1)
    .map((item) => ({
      value: item.id,
      label: item.modelName,
      modelCode: item.modelCode
    }))

  return {
    code: 200,
    message: "success",
    success: true,
    timestamp: Date.now(),
    data: options
  }
}

/**
 * 获取机型统计信息
 */
export async function getAircraftStats(): Promise<ApiResponse<AircraftStats>> {
  await delay(300)

  const totalCount = mockAircraftData.length
  const activeCount = mockAircraftData.filter((item) => item.status === 1).length
  const inactiveCount = totalCount - activeCount

  // 统计各制造商的机型数量
  const manufacturerMap = new Map<string, number>()
  mockAircraftData.forEach((item) => {
    if (item.manufacturer) {
      manufacturerMap.set(item.manufacturer, (manufacturerMap.get(item.manufacturer) || 0) + 1)
    }
  })

  const manufacturerStats = Array.from(manufacturerMap.entries()).map(([manufacturer, count]) => ({
    manufacturer,
    count
  }))

  return {
    code: 200,
    message: "success",
    success: true,
    timestamp: Date.now(),
    data: {
      totalCount,
      activeCount,
      inactiveCount,
      manufacturerStats
    }
  }
}

/**
 * 批量删除机型
 */
export async function batchDeleteAircraft(ids: number[]): Promise<ApiResponse<void>> {
  await delay(600)

  ids.forEach((id) => {
    const index = mockAircraftData.findIndex((item) => item.id === id)
    if (index !== -1) {
      mockAircraftData.splice(index, 1)
    }
  })

  return {
    code: 200,
    message: `成功删除 ${ids.length} 个机型`,
    success: true,
    timestamp: Date.now(),
    data: undefined
  }
}

/**
 * 批量更新机型状态
 */
export async function batchUpdateAircraftStatus(ids: number[], status: number): Promise<ApiResponse<void>> {
  await delay(500)

  ids.forEach((id) => {
    const aircraft = mockAircraftData.find((item) => item.id === id)
    if (aircraft) {
      aircraft.status = status
      aircraft.updatedAt = new Date().toISOString()
    }
  })

  return {
    code: 200,
    message: `成功更新 ${ids.length} 个机型状态`,
    success: true,
    timestamp: Date.now(),
    data: undefined
  }
}

