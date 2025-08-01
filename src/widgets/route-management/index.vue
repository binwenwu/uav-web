<template>
  <mars-dialog :visible="true" width="500" right="10" top="100" bottom="120">
    <template #title>航线管理</template>

    <div class="route-management">
      <!-- 工具栏 -->
      <div class="toolbar">
        <a-space>
          <a-button type="primary" @click="refreshRoutes">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
          <a-button @click="exportAllRoutes">
            <template #icon><DownloadOutlined /></template>
            导出全部
          </a-button>
          <a-button @click="showImportModal">
            <template #icon><UploadOutlined /></template>
            导入
          </a-button>
        </a-space>
      </div>

      <!-- 统计信息 -->
      <route-statistics :statistics="routeStatistics" @showDetails="showStatisticsDetails" />

      <!-- 搜索和筛选 -->
      <route-filter
        :routes="routes"
        :filteredCount="filteredRoutes.length"
        @search="handleSearch"
        @filter="handleFilter"
        @reset="handleFilterReset"
      />

      <!-- 航线列表 -->
      <div class="route-list">
        <div v-if="filteredRoutes.length === 0" class="empty-state">
          <div class="empty-icon">📍</div>
          <div class="empty-text">{{ routes.length === 0 ? "暂无航线数据" : "没有符合条件的航线" }}</div>
          <div class="empty-hint">{{ routes.length === 0 ? '请先使用"手动航线规划"创建航线' : "请调整筛选条件" }}</div>
        </div>

        <div v-else class="route-items">
          <div v-for="route in filteredRoutes" :key="route.id" class="route-item" :class="{ active: selectedRoute?.id === route.id }">
            <div class="route-header" @click="selectRoute(route)">
              <div class="route-name">{{ route.name }}</div>
              <div class="route-meta">
                <span class="waypoint-count">{{ route.waypoints.length }}个航点</span>
                <span class="route-date">{{ formatDate(route.createdAt) }}</span>
              </div>
            </div>

            <div class="route-details" v-if="selectedRoute?.id === route.id">
              <div class="route-info">
                <a-descriptions size="small" :column="2">
                  <a-descriptions-item label="飞行高度">{{ route.altitude }}米</a-descriptions-item>
                  <a-descriptions-item label="飞行速度">{{ route.speed }}m/s</a-descriptions-item>
                  <a-descriptions-item label="创建时间" :span="2">
                    {{ formatDateTime(route.createdAt) }}
                  </a-descriptions-item>
                  <a-descriptions-item v-if="route.description" label="描述" :span="2">
                    {{ route.description }}
                  </a-descriptions-item>
                </a-descriptions>
              </div>

              <div class="route-actions">
                <a-space>
                  <a-button size="small" @click="previewRoute(route)">
                    <template #icon><EyeOutlined /></template>
                    预览
                  </a-button>
                  <a-button size="small" @click="simulateRoute(route)">
                    <template #icon><PlayCircleOutlined /></template>
                    仿真
                  </a-button>
                  <a-button size="small" @click="editRoute(route)">
                    <template #icon><EditOutlined /></template>
                    编辑
                  </a-button>
                  <a-button size="small" @click="duplicateRoute(route)">
                    <template #icon><CopyOutlined /></template>
                    复制
                  </a-button>
                  <a-button size="small" danger @click="confirmDeleteRoute(route)">
                    <template #icon><DeleteOutlined /></template>
                    删除
                  </a-button>
                </a-space>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <a-modal v-model:open="deleteModalVisible" title="确认删除" @ok="handleDeleteRoute" @cancel="deleteModalVisible = false">
      <p>确定要删除航线 "{{ routeToDelete?.name }}" 吗？</p>
      <p class="warning-text">此操作不可恢复！</p>
    </a-modal>

    <!-- 导入弹窗 -->
    <a-modal v-model:open="importModalVisible" title="导入航线" @ok="handleImportRoutes" @cancel="importModalVisible = false">
      <a-upload-dragger v-model:fileList="fileList" :beforeUpload="beforeUpload" :remove="handleRemoveFile" accept=".json">
        <p class="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p class="ant-upload-hint">支持JSON格式的航线文件</p>
      </a-upload-dragger>
    </a-modal>
  </mars-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue"
import {
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  EditOutlined,
  CopyOutlined,
  DeleteOutlined
} from "@ant-design/icons-vue"
import * as mapWork from "./map.js"
import { message } from "ant-design-vue"
import useLifecycle from "@mars/common/uses/use-lifecycle"
import { useWidget } from "@mars/common/store/widget"
import RouteStatistics from "./components/RouteStatistics.vue"
import RouteFilter from "./components/RouteFilter.vue"
// 数据接口定义
import type { RouteData } from "./types"

// 启用map.js生命周期
useLifecycle(mapWork)



// 响应式数据
const routes = ref<RouteData[]>([])
const filteredRoutes = ref<RouteData[]>([])
const selectedRoute = ref<RouteData | null>(null)
const deleteModalVisible = ref(false)
const importModalVisible = ref(false)
const routeToDelete = ref<RouteData | null>(null)
const fileList = ref([])
const currentFilters = ref<any>({})

// 计算属性
const routeStatistics = computed(() => {
  return mapWork.getRouteStatistics()
})

// Widget控制
const { activate, disable } = useWidget()

// 生命周期
onMounted(() => {
  loadRoutes()
})

// 数据加载
const loadRoutes = () => {
  routes.value = mapWork.getSavedRoutes()
  applyCurrentFilters()
  console.log("加载航线数据:", routes.value)
}

const refreshRoutes = () => {
  loadRoutes()
  message.success("航线数据已刷新")
}

// 搜索和筛选处理
const handleSearch = (keyword: string) => {
  currentFilters.value.keyword = keyword
  applyCurrentFilters()
}

const handleFilter = (filters: any) => {
  currentFilters.value = { ...filters }
  applyCurrentFilters()
}

const handleFilterReset = () => {
  currentFilters.value = {}
  filteredRoutes.value = [...routes.value]
}

const applyCurrentFilters = () => {
  let filtered = [...routes.value]

  // 关键词搜索
  if (currentFilters.value.keyword) {
    const keyword = currentFilters.value.keyword.toLowerCase()
    filtered = filtered.filter(
      (route) => route.name.toLowerCase().includes(keyword) || (route.description && route.description.toLowerCase().includes(keyword))
    )
  }

  // 高度筛选
  if (currentFilters.value.minAltitude !== null) {
    filtered = filtered.filter((route) => route.altitude >= currentFilters.value.minAltitude)
  }
  if (currentFilters.value.maxAltitude !== null) {
    filtered = filtered.filter((route) => route.altitude <= currentFilters.value.maxAltitude)
  }

  // 速度筛选
  if (currentFilters.value.minSpeed !== null) {
    filtered = filtered.filter((route) => route.speed >= currentFilters.value.minSpeed)
  }
  if (currentFilters.value.maxSpeed !== null) {
    filtered = filtered.filter((route) => route.speed <= currentFilters.value.maxSpeed)
  }

  // 航点数筛选
  if (currentFilters.value.minWaypoints !== null) {
    filtered = filtered.filter((route) => route.waypoints.length >= currentFilters.value.minWaypoints)
  }
  if (currentFilters.value.maxWaypoints !== null) {
    filtered = filtered.filter((route) => route.waypoints.length <= currentFilters.value.maxWaypoints)
  }

  // 快速筛选
  if (currentFilters.value.quickFilters && currentFilters.value.quickFilters.length > 0) {
    currentFilters.value.quickFilters.forEach((filter: string) => {
      switch (filter) {
          case "recent": {
              const recentDate = new Date()
              recentDate.setDate(recentDate.getDate() - 7) // 最近7天
              filtered = filtered.filter((route) => new Date(route.createdAt) >= recentDate)
              break
          }
      }
    })
  }

  filteredRoutes.value = filtered
}

const showStatisticsDetails = () => {
  message.info("详细统计功能开发中...")
}

// 航线操作
const selectRoute = (route: RouteData) => {
  if (selectedRoute.value?.id === route.id) {
    selectedRoute.value = null
    mapWork.clearRouteDisplay()
  } else {
    selectedRoute.value = route
    mapWork.showRoutePreview(route)
  }
}

const previewRoute = (route: RouteData) => {
  mapWork.showRoutePreview(route)
  message.success(`正在预览航线: ${route.name}`)
}

const simulateRoute = (route: RouteData) => {
  mapWork.startRouteSimulation(route)
  message.success(`开始仿真飞行: ${route.name}`)
}

const editRoute = (route: RouteData) => {
  // 关闭当前管理界面，激活规划界面并传入路线数据
  disable("route-management")
  activate({
    name: "route-planning",
    data: { editRoute: route }
  })
}

const duplicateRoute = (route: RouteData) => {
  const newRoute = {
    ...route,
    id: Date.now().toString(),
    name: `${route.name}_副本`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  if (mapWork.saveRoute(newRoute)) {
    loadRoutes()
    message.success(`航线 "${route.name}" 已复制`)
  } else {
    message.error("复制航线失败")
  }
}

const confirmDeleteRoute = (route: RouteData) => {
  routeToDelete.value = route
  deleteModalVisible.value = true
}

const handleDeleteRoute = () => {
  if (routeToDelete.value) {
    if (mapWork.deleteRoute(routeToDelete.value.id)) {
      loadRoutes()
      if (selectedRoute.value?.id === routeToDelete.value.id) {
        selectedRoute.value = null
        mapWork.clearRouteDisplay()
      }
      message.success(`航线 "${routeToDelete.value.name}" 已删除`)
    } else {
      message.error("删除航线失败")
    }
  }
  deleteModalVisible.value = false
  routeToDelete.value = null
}

// 导入导出
const showImportModal = () => {
  importModalVisible.value = true
  fileList.value = []
}

const beforeUpload = (file: File) => {
  const isJSON = file.type === "application/json" || file.name.endsWith(".json")
  if (!isJSON) {
    message.error("只能上传JSON格式文件！")
    return false
  }

  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error("文件大小不能超过10MB！")
    return false
  }

  return false // 阻止自动上传
}

const handleRemoveFile = () => {
  fileList.value = []
}

const handleImportRoutes = async () => {
  if (fileList.value.length === 0) {
    message.error("请选择要导入的文件")
    return
  }

  const file = fileList.value[0].originFileObj || fileList.value[0]

  try {
    const text = await readFileAsText(file)
    const importData = JSON.parse(text)

    let importCount = 0
    if (Array.isArray(importData)) {
      // 批量导入
      for (const routeData of importData) {
        if (validateRouteData(routeData)) {
          routeData.id = Date.now().toString() + "_" + importCount
          if (mapWork.saveRoute(routeData)) {
            importCount++
          }
        }
      }
    } else if (validateRouteData(importData)) {
      // 单个导入
      importData.id = Date.now().toString()
      if (mapWork.saveRoute(importData)) {
        importCount = 1
      }
    }

    if (importCount > 0) {
      loadRoutes()
      message.success(`成功导入 ${importCount} 条航线`)
    } else {
      message.error("没有有效的航线数据")
    }
  } catch (error) {
    console.error("导入失败:", error)
    message.error("文件格式错误或数据无效")
  }

  importModalVisible.value = false
  fileList.value = []
}

const exportAllRoutes = () => {
  if (routes.value.length === 0) {
    message.warning("没有可导出的航线数据")
    return
  }

  const exportData = {
    exportTime: new Date().toISOString(),
    version: "1.0",
    routes: routes.value
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json"
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `uav_routes_${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  message.success("航线数据已导出")
}

// 工具函数
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

const validateRouteData = (data: any): boolean => {
  return (
    data &&
    typeof data.name === "string" &&
    typeof data.speed === "number" &&
    typeof data.altitude === "number" &&
    Array.isArray(data.waypoints) &&
    data.waypoints.length >= 2
  )
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("zh-CN")
}

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString("zh-CN")
}
</script>

<style scoped lang="less">
.route-management {
  .toolbar {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
  }

  .route-list {
    margin-top: 15px;
    height: 500px;
    overflow-y: auto;

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;

      .empty-icon {
        font-size: 48px;
        margin-bottom: 10px;
      }

      .empty-text {
        font-size: 16px;
        margin-bottom: 5px;
      }

      .empty-hint {
        font-size: 12px;
      }
    }

    .route-items {
      .route-item {
        border: 1px solid #f0f0f0;
        border-radius: 6px;
        margin-bottom: 10px;
        transition: all 0.3s ease;

        &:hover {
          border-color: #1890ff;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
        }

        &.active {
          border-color: #1890ff;
          background-color: #f6ffed;
        }

        .route-header {
          padding: 12px;
          cursor: pointer;

          .route-name {
            font-size: 16px;
            font-weight: 500;
            color: #333;
            margin-bottom: 5px;
          }

          .route-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #666;

            .waypoint-count {
              background: #e6f7ff;
              color: #1890ff;
              padding: 2px 6px;
              border-radius: 3px;
            }
          }
        }

        .route-details {
          border-top: 1px solid #f0f0f0;

          .route-info {
            padding: 12px;
            background: #fafafa;
          }

          .route-actions {
            padding: 12px;
            background: #fff;
          }
        }
      }
    }
  }
}

.warning-text {
  color: #ff4d4f;
  font-size: 12px;
  margin: 0;
}

:deep(.ant-descriptions-item-label) {
  font-weight: 500;
}

:deep(.ant-upload-drag) {
  .ant-upload-drag-icon {
    margin-bottom: 16px;

    .anticon {
      font-size: 48px;
      color: #1890ff;
    }
  }
}
</style>
