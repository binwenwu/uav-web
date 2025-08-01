<template>
  <div class="waypoint-info">
    <h4>航点信息</h4>
    <div v-if="waypoints.length === 0" class="empty-waypoints">
      <p>尚未添加航点</p>
      <p class="hint">在地图上点击添加航点</p>
    </div>
    <div v-else class="waypoint-summary">
      <div class="summary-stats">
        <div class="stat-item">
          <span class="label">航点数量</span>
          <span class="value">{{ waypoints.length }}</span>
        </div>
        <div class="stat-item">
          <span class="label">航线距离</span>
          <span class="value">{{ routeDistance }}</span>
        </div>
        <div class="stat-item">
          <span class="label">预计飞行时间</span>
          <span class="value">{{ estimatedTime }}</span>
        </div>
      </div>

      <div class="waypoint-details">
        <div
          v-for="(waypoint, index) in waypoints"
          :key="index"
          class="waypoint-item"
          :class="{ active: activeIndex === index }"
          @click="selectWaypoint(index)"
        >
          <div class="waypoint-number">{{ index + 1 }}</div>
          <div class="waypoint-coords">
            <div class="coord-line">
              <span class="coord-label">经度:</span>
              <span class="coord-value">{{ formatCoordinate(waypoint.lng) }}</span>
            </div>
            <div class="coord-line">
              <span class="coord-label">纬度:</span>
              <span class="coord-value">{{ formatCoordinate(waypoint.lat) }}</span>
            </div>
            <div class="coord-line">
              <span class="coord-label">高度:</span>
              <span class="coord-value">{{ waypoint.alt }}m</span>
            </div>
          </div>
          <div class="waypoint-actions">
            <a-button type="link" size="small" @click.stop="editWaypoint(index)"> 编辑 </a-button>
            <a-button type="link" size="small" danger @click.stop="removeWaypoint(index)"> 删除 </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import type { Waypoint } from "../types"

// Props
const props = defineProps<{
  waypoints: Waypoint[]
  speed: number // m/s
}>()

// Emits
const emit = defineEmits<{
  select: [index: number]
  edit: [index: number]
  remove: [index: number]
}>()

// 响应式数据
const activeIndex = ref<number>(-1)

// 计算属性
const routeDistance = computed(() => {
    if (props.waypoints.length < 2) {
        return "0 km"
    }

  let totalDistance = 0
  for (let i = 1; i < props.waypoints.length; i++) {
    const prev = props.waypoints[i - 1]
    const curr = props.waypoints[i]
    totalDistance += calculateDistance(prev, curr)
  }

  return totalDistance >= 1000 ? `${(totalDistance / 1000).toFixed(2)} km` : `${totalDistance.toFixed(0)} m`
})

const estimatedTime = computed(() => {
    if (props.waypoints.length < 2 || props.speed <= 0) {
        return "0 分钟"
    }

  let totalDistance = 0
  for (let i = 1; i < props.waypoints.length; i++) {
    const prev = props.waypoints[i - 1]
    const curr = props.waypoints[i]
    totalDistance += calculateDistance(prev, curr)
  }

  const timeInSeconds = totalDistance / props.speed
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = Math.floor(timeInSeconds % 60)

  if (minutes > 0) {
    return `${minutes} 分 ${seconds} 秒`
  } else {
    return `${seconds} 秒`
  }
})

// 方法
const selectWaypoint = (index: number) => {
  activeIndex.value = activeIndex.value === index ? -1 : index
  emit("select", index)
}

const editWaypoint = (index: number) => {
  emit("edit", index)
}

const removeWaypoint = (index: number) => {
  emit("remove", index)
}

const formatCoordinate = (coord: number): string => {
  return coord.toFixed(6)
}

// 计算两点间距离（简化的球面距离公式）
const calculateDistance = (point1: Waypoint, point2: Waypoint): number => {
  const R = 6371000 // 地球半径，单位米
  const lat1Rad = (point1.lat * Math.PI) / 180
  const lat2Rad = (point2.lat * Math.PI) / 180
  const deltaLatRad = ((point2.lat - point1.lat) * Math.PI) / 180
  const deltaLngRad = ((point2.lng - point1.lng) * Math.PI) / 180

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}
</script>

<style scoped lang="less">
.waypoint-info {
  h4 {
    margin: 0 0 15px 0;
    font-size: 14px;
    color: #333;
  }

  .empty-waypoints {
    text-align: center;
    padding: 30px 10px;
    color: #999;

    p {
      margin: 5px 0;
    }

    .hint {
      font-size: 12px;
      font-style: italic;
    }
  }

  .waypoint-summary {
    .summary-stats {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 15px;

      .stat-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          font-size: 12px;
          color: #666;
        }

        .value {
          font-size: 12px;
          font-weight: 500;
          color: #333;
        }
      }
    }

    .waypoint-details {
      max-height: 250px;
      overflow-y: auto;

      .waypoint-item {
        display: flex;
        align-items: center;
        padding: 10px;
        border: 1px solid #f0f0f0;
        border-radius: 4px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: #1890ff;
          background-color: #f6ffed;
        }

        &.active {
          border-color: #1890ff;
          background-color: #e6f7ff;
        }

        .waypoint-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #1890ff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 500;
          margin-right: 10px;
          flex-shrink: 0;
        }

        .waypoint-coords {
          flex: 1;

          .coord-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;

            &:last-child {
              margin-bottom: 0;
            }

            .coord-label {
              font-size: 11px;
              color: #666;
              width: 35px;
            }

            .coord-value {
              font-size: 11px;
              color: #333;
              font-family: monospace;
            }
          }
        }

        .waypoint-actions {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-left: 8px;

          .ant-btn {
            padding: 0;
            height: auto;
            line-height: 1;
            font-size: 11px;
          }
        }
      }
    }
  }
}
</style>
