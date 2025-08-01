<template>
  <mars-dialog :visible="true" width="400" right="10" top="100">
    <template #title>手动航线规划</template>
    
    <!-- 航线设置区域 -->
    <div v-if="planningState.step === 'settings'" class="route-settings">
      <a-form layout="vertical" :model="routeForm">
        <a-form-item label="航线名称" required>
          <a-input v-model:value="routeForm.name" placeholder="请输入航线名称" />
        </a-form-item>
        
        <a-form-item label="飞行高度" required>
          <a-input-number 
            v-model:value="routeForm.altitude" 
            :min="50" 
            :max="1000" 
            :step="10"
            addon-after="米"
            style="width: 100%"
            placeholder="50-1000米"
          />
        </a-form-item>
        
        <a-form-item label="飞行速度" required>
          <a-input-number 
            v-model:value="routeForm.speed" 
            :min="5" 
            :max="50" 
            :step="1"
            addon-after="m/s"
            style="width: 100%"
            placeholder="5-50米/秒"
          />
        </a-form-item>
        
        <a-form-item label="航线描述">
          <a-textarea 
            v-model:value="routeForm.description" 
            placeholder="请输入航线描述（可选）"
            :rows="3"
          />
        </a-form-item>
      </a-form>
      
      <div class="action-buttons">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="startPlanning">开始规划</a-button>
      </div>
    </div>
    
    <!-- 航点编辑区域 -->
    <div v-else-if="planningState.step === 'editing'" class="waypoint-editing">
      <div class="editing-header">
        <h3>{{ routeForm.name }}</h3>
        <p>高度: {{ routeForm.altitude }}米 | 速度: {{ routeForm.speed }}m/s</p>
      </div>
      
      <waypoint-info 
        :waypoints="waypoints" 
        :speed="routeForm.speed"
        @select="handleWaypointSelect"
        @edit="handleWaypointEdit"
        @remove="removeWaypoint"
      />
      
      <div class="editing-actions">
        <a-space direction="vertical" style="width: 100%">
          <a-button block @click="clearWaypoints">清空航点</a-button>
          <a-button 
            block 
            type="primary" 
            :disabled="waypoints.length < 2"
            @click="previewRoute"
          >
            预览航线
          </a-button>
          <!-- 仿真控制按钮组 -->
          <div v-if="planningState.simulationStatus === 'stopped'">
            <a-button 
              block 
              :disabled="waypoints.length < 2"
              @click="simulateFlight"
            >
              仿真飞行
            </a-button>
          </div>
          <div v-else class="simulation-controls">
            <a-space direction="vertical" style="width: 100%">
              <a-button 
                v-if="planningState.simulationStatus === 'running'"
                block 
                @click="pauseSimulation"
              >
                暂停仿真
              </a-button>
              <a-button 
                v-if="planningState.simulationStatus === 'paused'"
                block 
                type="primary"
                @click="resumeSimulation"
              >
                恢复仿真
              </a-button>
              <a-button 
                block 
                danger
                @click="stopSimulation"
              >
                停止仿真
              </a-button>
            </a-space>
          </div>
          <a-button 
            block 
            type="primary" 
            :disabled="waypoints.length < 2"
            @click="saveRoute"
          >
            保存航线
          </a-button>
          <a-button block @click="backToSettings">返回设置</a-button>
        </a-space>
      </div>
    </div>
  </mars-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from "vue"
import * as mapWork from "./map.js"
import useLifecycle from "@mars/common/uses/use-lifecycle"
import { useWidget } from "@mars/common/store/widget"
import { message } from "ant-design-vue"
import WaypointInfo from "./components/WaypointInfo.vue"
import type { RouteForm, Waypoint, PlanningState, RouteData, SimulationOptions } from "./types"

// 启用map.js生命周期
useLifecycle(mapWork)

// Widget控制
const { disable, currentWidget } = useWidget()

// 响应式数据
const routeForm = reactive<RouteForm>({
  name: '',
  altitude: 120,
  speed: 15,
  description: ''
})

const waypoints = ref<Waypoint[]>([])

const planningState = reactive<PlanningState>({
  step: 'settings',
  isSimulating: false,
  simulationStatus: 'stopped'
})

// 生命周期
onMounted(() => {
  // 监听地图点击添加航点
  mapWork.eventTarget.on("waypointAdded", handleWaypointAdded)
  
  // 监听仿真完成
  mapWork.eventTarget.on("simulationComplete", handleSimulationComplete)
  
  // 监听仿真状态变化
  mapWork.eventTarget.on("simulationStatusChanged", handleSimulationStatusChanged)
  
  // 监听widget数据更新（用于编辑模式）
  if (currentWidget) {
    currentWidget.onUpdate((data: any) => {
      if (data.editRoute) {
        loadEditRoute(data.editRoute)
      }
    })
  }
})

onUnmounted(() => {
  mapWork.eventTarget.off("waypointAdded", handleWaypointAdded)
  mapWork.eventTarget.off("simulationComplete", handleSimulationComplete)
  mapWork.eventTarget.off("simulationStatusChanged", handleSimulationStatusChanged)
})

// 事件处理
const handleCancel = () => {
  // 关闭widget
  disable("route-planning")
}

const startPlanning = () => {
  if (!routeForm.name.trim()) {
    message.error('请输入航线名称')
    return
  }
  
  planningState.step = 'editing'
  mapWork.enableWaypointMode(routeForm.altitude)
  message.success('已进入航点编辑模式，请在地图上点击添加航点')
}

const handleWaypointAdded = (event: any) => {
  const waypoint: Waypoint = {
    lng: event.point.lng,
    lat: event.point.lat,
    alt: routeForm.altitude,
    index: waypoints.value.length + 1
  }
  waypoints.value.push(waypoint)
  mapWork.updateWaypointDisplay(waypoints.value)
}

const removeWaypoint = (index: number) => {
  waypoints.value.splice(index, 1)
  // 重新设置索引
  waypoints.value.forEach((wp, i) => {
    wp.index = i + 1
  })
  mapWork.updateWaypointDisplay(waypoints.value)
}

const clearWaypoints = () => {
  // 停止仿真（如果正在进行）
  if (planningState.isSimulating) {
    stopSimulation()
  }
  
  waypoints.value = []
  mapWork.clearWaypoints()
}

const previewRoute = () => {
  if (waypoints.value.length < 2) {
    message.error('至少需要2个航点才能预览航线')
    return
  }
  mapWork.showRoutePreview(waypoints.value)
}

const simulateFlight = () => {
  if (waypoints.value.length < 2) {
    message.error('至少需要2个航点才能进行仿真飞行')
    return
  }
  
  planningState.isSimulating = true
  planningState.simulationStatus = 'running'
  mapWork.startSimulation({
    waypoints: waypoints.value,
    speed: routeForm.speed,
    altitude: routeForm.altitude
  })
  message.success('仿真飞行已开始')
}

const pauseSimulation = () => {
  mapWork.pauseSimulation()
  // 状态将通过事件回调更新
}

const resumeSimulation = () => {
  mapWork.resumeSimulation()
  // 状态将通过事件回调更新
}

const stopSimulation = () => {
  mapWork.stopSimulation()
  // 状态将通过事件回调更新
}

const handleSimulationComplete = () => {
  planningState.isSimulating = false
  planningState.simulationStatus = 'stopped'
  message.success('仿真飞行完成')
}

const handleSimulationStatusChanged = (event: any) => {
  const { status, isPause, isStart } = event
  
  // 更新仿真状态
  planningState.simulationStatus = status
  planningState.isSimulating = isStart && !isPause
  
  // 显示状态提示
  if (status === 'paused') {
    message.info('仿真飞行已暂停')
  } else if (status === 'running') {
    message.info('仿真飞行已恢复')
  } else if (status === 'stopped') {
    message.info('仿真飞行已停止')
  }
  
  console.log('仿真状态更新:', status, { isPause, isStart })
}

const saveRoute = () => {
  if (waypoints.value.length < 2) {
    message.error('至少需要2个航点才能保存航线')
    return
  }
  
  // 检查是否为编辑模式（通过检查是否有现有的路线ID）
  const isEditing = currentWidget?.data?.editRoute?.id
  
  const routeData = {
    id: isEditing ? currentWidget.data.editRoute.id : Date.now().toString(),
    name: routeForm.name,
    speed: routeForm.speed,
    altitude: routeForm.altitude,
    description: routeForm.description,
    waypoints: waypoints.value.map(wp => [wp.lng, wp.lat, wp.alt]),
    createdAt: isEditing ? currentWidget.data.editRoute.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mapWork.saveRoute(routeData)
  message.success(isEditing ? '航线更新成功' : '航线保存成功')
  
  // 重置状态
  resetPlanning()
}

const backToSettings = () => {
  planningState.step = 'settings'
  mapWork.disableWaypointMode()
  clearWaypoints()
}

const resetPlanning = () => {
  // 静默停止仿真（不触发事件，避免状态冲突）
  if (planningState.isSimulating) {
    mapWork.stopSimulationSilent()
  }
  
  planningState.step = 'settings'
  planningState.isSimulating = false
  planningState.simulationStatus = 'stopped'
  waypoints.value = []
  routeForm.name = ''
  routeForm.description = ''
  routeForm.altitude = 120
  routeForm.speed = 15
  mapWork.disableWaypointMode()
  mapWork.clearWaypoints()
  
  // 清除编辑模式数据
  if (currentWidget?.data?.editRoute) {
    delete currentWidget.data.editRoute
  }
}

// 航点操作事件处理
const handleWaypointSelect = (index: number) => {
  // 在地图上高亮选中的航点
  mapWork.highlightWaypoint(index)
}

const handleWaypointEdit = (index: number) => {
  // 暂时用简单的提示，后续可以实现编辑弹窗
  message.info(`编辑航点 ${index + 1} 功能开发中...`)
}

// 加载编辑路线数据
const loadEditRoute = (route: RouteData) => {
  // 填充表单数据
  routeForm.name = route.name
  routeForm.altitude = route.altitude
  routeForm.speed = route.speed
  routeForm.description = route.description || ''
  
  // 转换航点数据格式
  waypoints.value = route.waypoints.map((pos, index) => ({
    lng: pos[0],
    lat: pos[1],
    alt: pos[2],
    index: index + 1
  }))
  
  // 切换到编辑模式
  planningState.step = 'editing'
  mapWork.enableWaypointMode(route.altitude)
  
  // 在地图上显示航点
  mapWork.updateWaypointDisplay(waypoints.value)
  
  message.success(`已加载航线: ${route.name}，可进行编辑`)
}
</script>

<style scoped lang="less">
.route-settings {
  .action-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    gap: 10px;
  }
}

.waypoint-editing {
  .editing-header {
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
    
    h3 {
      margin: 0 0 5px 0;
      color: #1890ff;
    }
    
    p {
      margin: 0;
      color: #666;
      font-size: 12px;
    }
  }
  

  
  .editing-actions {
    border-top: 1px solid #f0f0f0;
    padding-top: 15px;
  }
}
</style>
