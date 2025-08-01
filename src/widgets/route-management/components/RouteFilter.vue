<template>
  <div class="route-filter">
    <h4>筛选和搜索</h4>
    
    <!-- 搜索框 -->
    <div class="search-section">
      <a-input-search
        v-model:value="searchKeyword"
        placeholder="搜索航线名称或描述"
        @search="handleSearch"
        @change="handleSearchChange"
        size="small"
      />
    </div>
    
    <!-- 筛选条件 -->
    <div class="filter-section">
      <a-collapse size="small" ghost>
        <a-collapse-panel key="altitude" header="按高度筛选">
          <div class="filter-range">
            <a-input-number
              v-model:value="filters.minAltitude"
              :min="0"
              :max="1000"
              placeholder="最小"
              size="small"
              @change="handleFilterChange"
            />
            <span class="range-separator">至</span>
            <a-input-number
              v-model:value="filters.maxAltitude"
              :min="0"
              :max="1000"
              placeholder="最大"
              size="small"
              @change="handleFilterChange"
            />
            <span class="unit">米</span>
          </div>
        </a-collapse-panel>
        
        <a-collapse-panel key="speed" header="按速度筛选">
          <div class="filter-range">
            <a-input-number
              v-model:value="filters.minSpeed"
              :min="0"
              :max="100"
              placeholder="最小"
              size="small"
              @change="handleFilterChange"
            />
            <span class="range-separator">至</span>
            <a-input-number
              v-model:value="filters.maxSpeed"
              :min="0"
              :max="100"
              placeholder="最大"
              size="small"
              @change="handleFilterChange"
            />
            <span class="unit">m/s</span>
          </div>
        </a-collapse-panel>
        
        <a-collapse-panel key="waypoints" header="按航点数筛选">
          <div class="filter-range">
            <a-input-number
              v-model:value="filters.minWaypoints"
              :min="2"
              :max="100"
              placeholder="最小"
              size="small"
              @change="handleFilterChange"
            />
            <span class="range-separator">至</span>
            <a-input-number
              v-model:value="filters.maxWaypoints"
              :min="2"
              :max="100"
              placeholder="最大"
              size="small"
              @change="handleFilterChange"
            />
            <span class="unit">个</span>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </div>
    
    <!-- 快速筛选标签 -->
    <div class="quick-filters">
      <h5>快速筛选</h5>
      <div class="filter-tags">
        <a-tag
          v-for="tag in quickFilterTags"
          :key="tag.key"
          :color="tag.active ? 'blue' : ''"
          @click="toggleQuickFilter(tag)"
          style="cursor: pointer; margin-bottom: 4px;"
        >
          {{ tag.label }}
        </a-tag>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="filter-actions">
      <a-space direction="vertical" style="width: 100%">
        <a-button size="small" block @click="resetFilters">
          重置筛选
        </a-button>
        <a-button size="small" block type="primary" @click="applyFilters">
          应用筛选 ({{ filteredCount }})
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from "vue"
import type { RouteData } from "../types"

// Props
const props = defineProps<{
  routes: RouteData[]
  filteredCount: number
}>()

// Emits
const emit = defineEmits<{
  search: [keyword: string]
  filter: [filters: any]
  reset: []
}>()

// 响应式数据
const searchKeyword = ref('')

const filters = reactive({
  minAltitude: null,
  maxAltitude: null,
  minSpeed: null,
  maxSpeed: null,
  minWaypoints: null,
  maxWaypoints: null
})

const quickFilterTags = ref([
  { key: 'low_altitude', label: '低空飞行 (<200m)', active: false },
  { key: 'high_speed', label: '高速飞行 (>20m/s)', active: false },
  { key: 'long_route', label: '长航线 (>10点)', active: false },
  { key: 'short_route', label: '短航线 (≤5点)', active: false },
  { key: 'recent', label: '最近创建', active: false }
])

// 计算属性
const hasActiveFilters = computed(() => {
  return searchKeyword.value.trim() !== '' ||
         Object.values(filters).some(val => val !== null) ||
         quickFilterTags.value.some(tag => tag.active)
})

// 防抖搜索
let searchTimeout: NodeJS.Timeout

// 监听器
watch(searchKeyword, (newVal) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (newVal.trim() === '') {
      handleSearch('')
    }
  }, 300)
})

// 方法
const handleSearch = (keyword: string) => {
  emit('search', keyword.trim())
}

const handleSearchChange = () => {
  // 实时搜索在watch中处理
}

const handleFilterChange = () => {
  applyFilters()
}

const toggleQuickFilter = (tag: any) => {
  tag.active = !tag.active
  applyQuickFilters()
}

const applyQuickFilters = () => {
  // 根据快速筛选标签设置筛选条件
  quickFilterTags.value.forEach(tag => {
    if (tag.active) {
      switch (tag.key) {
        case 'low_altitude':
          filters.maxAltitude = 200
          break
        case 'high_speed':
          filters.minSpeed = 20
          break
        case 'long_route':
          filters.minWaypoints = 10
          break
        case 'short_route':
          filters.maxWaypoints = 5
          break
      }
    }
  })
  applyFilters()
}

const applyFilters = () => {
  const filterOptions = {
    keyword: searchKeyword.value.trim(),
    ...filters,
    quickFilters: quickFilterTags.value.filter(tag => tag.active).map(tag => tag.key)
  }
  emit('filter', filterOptions)
}

const resetFilters = () => {
  searchKeyword.value = ''
  Object.keys(filters).forEach(key => {
    filters[key] = null
  })
  quickFilterTags.value.forEach(tag => {
    tag.active = false
  })
  emit('reset')
}
</script>

<style scoped lang="less">
.route-filter {
  h4, h5 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #333;
  }
  
  h5 {
    font-size: 12px;
    color: #666;
  }
  
  .search-section {
    margin-bottom: 15px;
  }
  
  .filter-section {
    margin-top: 5px;
    margin-bottom: 15px;
    
    :deep(.ant-collapse-header) {
      padding: 8px 0 !important;
      font-size: 12px !important;
    }
    
    /* 第一个折叠面板特殊处理 */
    :deep(.ant-collapse > .ant-collapse-item:first-child .ant-collapse-header) {
      padding-top: 12px !important;
    }
    
    :deep(.ant-collapse-content-box) {
      padding: 8px 0 !important;
    }
    
    .filter-range {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      
      .ant-input-number {
        flex: 1;
        min-width: 60px;
      }
      
      .range-separator {
        font-size: 12px;
        color: #666;
      }
      
      .unit {
        font-size: 12px;
        color: #666;
        white-space: nowrap;
      }
    }
  }
  
  .quick-filters {
    margin-bottom: 15px;
    
    .filter-tags {
      .ant-tag {
        font-size: 11px;
        margin-right: 4px;
        user-select: none;
      }
    }
  }
  
  .filter-actions {
    padding-top: 15px;
    margin-top: 5px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>
