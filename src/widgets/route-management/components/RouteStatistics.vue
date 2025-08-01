<template>
  <div class="route-statistics">
    <h4>航线统计</h4>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.totalRoutes }}</div>
          <div class="stat-label">总航线数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon waypoints">📍</div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.totalWaypoints }}</div>
          <div class="stat-label">总航点数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon average">📈</div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.averageWaypoints }}</div>
          <div class="stat-label">平均航点数</div>
        </div>
      </div>
    </div>
    
    <div class="range-stats">
      <div class="range-item">
        <span class="range-label">高度范围:</span>
        <span class="range-value">{{ formatAltitudeRange }}</span>
      </div>
      <div class="range-item">
        <span class="range-label">速度范围:</span>
        <span class="range-value">{{ formatSpeedRange }}</span>
      </div>
    </div>
    
    <div class="quick-actions">
      <a-button size="small" type="link" @click="showDetails">
        查看详细统计
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import type { RouteStatistics } from "../types"

// Props
const props = defineProps<{
  statistics: RouteStatistics
}>()

// Emits
const emit = defineEmits<{
  showDetails: []
}>()

// 计算属性
const formatAltitudeRange = computed(() => {
  const { min, max } = props.statistics.altitudeRange
    if (min === 0 && max === 0) {
        return "无数据"
    }
  return min === max ? `${min}m` : `${min}m - ${max}m`
})

const formatSpeedRange = computed(() => {
  const { min, max } = props.statistics.speedRange
    if (min === 0 && max === 0) {
        return "无数据"
    }
  return min === max ? `${min}m/s` : `${min}m/s - ${max}m/s`
})

// 方法
const showDetails = () => {
  emit('showDetails')
}
</script>

<style scoped lang="less">
.route-statistics {
  h4 {
    margin: 0 0 15px 0;
    font-size: 14px;
    color: #333;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 15px;
    
    .stat-card {
      display: flex;
      align-items: center;
      background: #f8f9fa;
      border-radius: 6px;
      padding: 10px;
      transition: all 0.2s ease;
      
      &:hover {
        background: #e9ecef;
      }
      
      .stat-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        margin-right: 10px;
        
        &.total {
          background: #e6f7ff;
        }
        
        &.waypoints {
          background: #f6ffed;
        }
        
        &.average {
          background: #fff7e6;
        }
      }
      
      .stat-content {
        flex: 1;
        
        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          line-height: 1;
          margin-bottom: 2px;
        }
        
        .stat-label {
          font-size: 11px;
          color: #666;
        }
      }
    }
  }
  
  .range-stats {
    background: #fafafa;
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 10px;
    
    .range-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .range-label {
        font-size: 12px;
        color: #666;
      }
      
      .range-value {
        font-size: 12px;
        color: #333;
        font-weight: 500;
      }
    }
  }
  
  .quick-actions {
    text-align: center;
    
    .ant-btn {
      padding: 0;
      height: auto;
      font-size: 11px;
    }
  }
}
</style>
