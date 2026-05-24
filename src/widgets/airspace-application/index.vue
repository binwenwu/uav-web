<template>
  <mars-dialog 
    v-model:visible="isActivate" 
    title="空域申请" 
    :width="1200"
    :height="700"
    top="100px"
    left="150px"
  >
    <div class="airspace-application">
      <div class="header-section">
        <h3>飞行任务申请</h3>
        <div class="filter-section">
          <span>状态筛选：</span>
          <a-select v-model:value="filterStatus" style="width: 120px; margin-right: 20px;">
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="pending">待审核</a-select-option>
            <a-select-option value="approved">审核通过</a-select-option>
            <a-select-option value="completed">已结束</a-select-option>
          </a-select>
          <a-button type="primary" @click="showAddForm">申请新任务</a-button>
        </div>
      </div>

      <div class="table-section">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="pagination"
          :scroll="{ x: 'max-content' }"
          rowKey="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'algorithm'">
              <span>{{ getAlgorithmText(record.algorithm) }}</span>
            </template>
            <template v-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button size="small" @click="viewDetail(record)">查看</a-button>
                <a-button size="small" type="primary" v-if="record.status === 'pending'" @click="editTask(record)">编辑</a-button>
                <a-button size="small" danger v-if="record.status === 'pending'" @click="deleteTask(record)">删除</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>

      <!-- 新增任务弹窗 -->
      <a-modal v-model:open="addFormVisible" title="申请新任务" width="600px" @ok="handleSubmit" @cancel="handleCancel">
        <a-form :model="formData" layout="vertical">
          <a-form-item label="任务名称">
            <a-input v-model:value="formData.name" placeholder="请输入任务名称" />
          </a-form-item>
          <a-form-item label="执行时间">
            <a-date-picker v-model:value="formData.startTime" show-time placeholder="请选择执行时间" style="width: 100%" />
          </a-form-item>
          <a-form-item label="飞行航线">
            <a-select v-model:value="formData.routeId" placeholder="请选择航线">
              <a-select-option value="route1">北区巡检航线</a-select-option>
              <a-select-option value="route2">南区巡检航线</a-select-option>
              <a-select-option value="route3">应急响应航线</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="执行算法">
            <a-select v-model:value="formData.algorithm" placeholder="请选择执行算法">
              <a-select-option value="drainage_cover_detection">高速排水沟盖板缺失检测算法</a-select-option>
              <a-select-option value="isolation_fence_damage_detection">高速隔离栏破损检测算法</a-select-option>
              <a-select-option value="urban_garbage_detection">城市垃圾堆检测算法</a-select-option>
              <a-select-option value="safety_helmet_recognition">安全帽识别算法</a-select-option>
              <a-select-option value="engineering_vehicle_detection">工程车辆检测算法</a-select-option>
              <a-select-option value="road_crack_detection">道路裂纹检测算法</a-select-option>
              <a-select-option value="fire_smoke_detection">烟火检测算法</a-select-option>
              <a-select-option value="general_person_vehicle_detection">通用人车检测算法</a-select-option>
              <a-select-option value="water_target_detection">水上目标检测算法</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="任务描述">
            <a-textarea v-model:value="formData.description" rows="3" placeholder="请输入任务描述" />
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  </mars-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWidget } from '@mars/common/store/widget'
import { message } from 'ant-design-vue'

// Widget状态管理
const { isActivate } = useWidget()

// 筛选状态
const filterStatus = ref('all')

// 表格数据
const tableData = ref([
  {
    id: '1',
    name: '北区日常巡检任务',
    startTime: '2024-01-15 09:00:00',
    routeName: '北区巡检航线',
    algorithm: 'road_crack_detection',
    status: 'pending',
    createdAt: '2024-01-10 14:30:00',
    description: '对北区进行日常巡检'
  },
  {
    id: '2', 
    name: '南区应急响应任务',
    startTime: '2024-01-16 10:30:00',
    routeName: '南区巡检航线',
    algorithm: 'fire_smoke_detection',
    status: 'approved',
    createdAt: '2024-01-11 16:45:00',
    description: '南区发生紧急情况，需要无人机响应'
  },
  {
    id: '3',
    name: '设备检测任务',
    startTime: '2024-01-14 08:00:00', 
    routeName: '应急响应航线',
    algorithm: 'engineering_vehicle_detection',
    status: 'completed',
    createdAt: '2024-01-09 10:20:00',
    description: '对关键设备进行检测'
  }
])

// 表格列配置
const columns = [
  {
    title: '任务名称',
    dataIndex: 'name',
    key: 'name',
    width: 200
  },
  {
    title: '执行时间',
    dataIndex: 'startTime', 
    key: 'startTime',
    width: 180
  },
  {
    title: '航线名称',
    dataIndex: 'routeName',
    key: 'routeName', 
    width: 150
  },
  {
    title: '执行算法',
    dataIndex: 'algorithm',
    key: 'algorithm',
    width: 200
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120
  },
  {
    title: '申请时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 200
  }
]

// 分页配置
const pagination = {
  current: 1,
  pageSize: 10,
  total: 3,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
}

// 新增表单相关
const addFormVisible = ref(false)
const formData = ref({
  name: '',
  startTime: null,
  routeId: '',
  algorithm: '',
  description: ''
})

// 状态相关方法
const getStatusColor = (status: string) => {
  const colors = {
    pending: 'orange',
    approved: 'green',
    completed: 'default'
  }
  return colors[status] || 'default'
}

const getStatusText = (status: string) => {
  const texts = {
    pending: '待审核',
    approved: '审核通过',
    completed: '已结束'
  }
  return texts[status] || status
}

// 算法相关方法
const getAlgorithmText = (algorithm: string) => {
  const algorithms = {
    drainage_cover_detection: '高速排水沟盖板缺失检测算法',
    isolation_fence_damage_detection: '高速隔离栏破损检测算法',
    urban_garbage_detection: '城市垃圾堆检测算法',
    safety_helmet_recognition: '安全帽识别算法',
    engineering_vehicle_detection: '工程车辆检测算法',
    road_crack_detection: '道路裂纹检测算法',
    fire_smoke_detection: '烟火检测算法',
    general_person_vehicle_detection: '通用人车检测算法',
    water_target_detection: '水上目标检测算法'
  }
  return algorithms[algorithm] || algorithm
}

// 事件处理方法
const showAddForm = () => {
  addFormVisible.value = true
}

const handleSubmit = () => {
  message.success('任务申请成功！')
  addFormVisible.value = false
  // 重置表单
  formData.value = {
    name: '',
    startTime: null,
    routeId: '',
    algorithm: '',
    description: ''
  }
}

const handleCancel = () => {
  addFormVisible.value = false
  // 重置表单
  formData.value = {
    name: '',
    startTime: null,
    routeId: '',
    algorithm: '',
    description: ''
  }
}

const viewDetail = (record: any) => {
  message.info(`查看任务：${record.name}`)
}

const editTask = (record: any) => {
  message.info(`编辑任务：${record.name}`)
}

const deleteTask = (record: any) => {
  message.success(`删除任务：${record.name}`)
}

onMounted(() => {
  console.log('空域申请模块加载完成')
})
</script>

<style scoped>
.airspace-application {
  padding: clamp(10px, 1.2vw, 20px);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;        /* 窄屏允许换行 */
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.header-section h3 {
  margin: 0;
  color: #1890ff;
}

.filter-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-section span {
  margin-right: 6px;
  color: #666;
  white-space: nowrap;
}

.table-section {
  margin-top: 20px;
}
</style>
