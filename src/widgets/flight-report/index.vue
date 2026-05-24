<template>
  <mars-dialog 
    v-model:visible="isActivate" 
    title="飞行报告管理" 
    :width="1400"
    :height="720"
    top="100px"
    left="100px"
  >
    <div class="flight-report">
      <div class="header-section">
        <h3>飞行报告列表</h3>
        <div class="filter-section">
          <span>状态筛选：</span>
          <a-select v-model:value="filterStatus" style="width: 120px; margin-right: 20px;" @change="handleFilter">
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="generating">生成中</a-select-option>
            <a-select-option value="failed">生成失败</a-select-option>
          </a-select>
          
          <span>算法筛选：</span>
          <a-select v-model:value="filterAlgorithm" style="width: 180px; margin-right: 20px;" @change="handleFilter">
            <a-select-option value="all">全部算法</a-select-option>
            <a-select-option value="road_crack_detection">道路裂纹检测</a-select-option>
            <a-select-option value="fire_smoke_detection">烟火检测</a-select-option>
            <a-select-option value="safety_helmet_recognition">安全帽识别</a-select-option>
            <a-select-option value="engineering_vehicle_detection">工程车辆检测</a-select-option>
          </a-select>

          <a-input-search 
            v-model:value="searchKeyword" 
            placeholder="搜索任务名称..." 
            style="width: 200px;"
            @search="handleSearch"
            @input="handleSearch"
          />
        </div>
      </div>

      <div class="table-section">
        <a-table
          :columns="columns"
          :data-source="filteredReports"
          :pagination="pagination"
          :loading="tableLoading"
          :scroll="{ x: 'max-content' }"
          rowKey="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'algorithm'">
              <span>{{ getAlgorithmText(record.algorithm) }}</span>
            </template>
            <template v-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                <template v-if="record.status === 'generating'">
                  <mars-icon icon="loading" width="12" style="margin-right: 4px;" />
                </template>
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
            <template v-if="column.key === 'fileSize'">
              <span v-if="record.fileSize">{{ record.fileSize }}</span>
              <span v-else class="text-muted">-</span>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button 
                  size="small" 
                  type="primary"
                  :disabled="record.status !== 'completed'"
                  @click="viewReport(record)"
                >
                  查看
                </a-button>
                <a-button 
                  size="small"
                  :disabled="record.status !== 'completed'"
                  @click="downloadReport(record)"
                >
                  下载
                </a-button>
                <a-dropdown>
                  <template #overlay>
                    <a-menu @click="handleMenuClick($event, record)">
                      <a-menu-item key="regenerate" :disabled="record.status === 'generating'">
                        重新生成
                      </a-menu-item>
                      <a-menu-item key="delete" danger>
                        删除报告
                      </a-menu-item>
                    </a-menu>
                  </template>
                  <a-button size="small">
                    更多
                    <mars-icon icon="down" width="12" />
                  </a-button>
                </a-dropdown>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>

      <!-- 报告查看弹窗 -->
      <ReportViewer 
        v-model:visible="reportViewerVisible"
        :report-id="selectedReportId"
        @download="handleReportDownload"
      />
    </div>
  </mars-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWidget } from '@mars/common/store/widget'
import { message } from 'ant-design-vue'
import ReportViewer from './components/ReportViewer.vue'
import type { FlightReport, FlightReportStatus } from './types'

// Widget状态管理
const { isActivate } = useWidget()

// 响应式数据
const tableLoading = ref(false)
const filterStatus = ref<string>('all')
const filterAlgorithm = ref<string>('all')
const searchKeyword = ref<string>('')
const reportViewerVisible = ref(false)
const selectedReportId = ref<string>('')

// 飞行报告数据
const reports = ref<FlightReport[]>([
  {
    id: 'rpt_001',
    taskName: '北区日常巡检任务',
    executionTime: '2024-01-15 09:00:00',
    flightRoute: '北区巡检航线',
    algorithm: 'road_crack_detection',
    status: 'completed' as FlightReportStatus,
    createdAt: '2024-01-15 10:30:00',
    fileSize: '12.5MB',
    duration: '45分钟'
  },
  {
    id: 'rpt_002',
    taskName: '南区应急响应任务',
    executionTime: '2024-01-16 10:30:00',
    flightRoute: '南区巡检航线',
    algorithm: 'fire_smoke_detection',
    status: 'completed' as FlightReportStatus,
    createdAt: '2024-01-16 12:00:00',
    fileSize: '8.7MB',
    duration: '30分钟'
  },
  {
    id: 'rpt_003',
    taskName: '设备检测任务',
    executionTime: '2024-01-14 08:00:00',
    flightRoute: '应急响应航线',
    algorithm: 'engineering_vehicle_detection',
    status: 'completed' as FlightReportStatus,
    createdAt: '2024-01-14 09:45:00',
    fileSize: '15.2MB',
    duration: '55分钟'
  },
  {
    id: 'rpt_004',
    taskName: '工地安全检查任务',
    executionTime: '2024-01-17 14:00:00',
    flightRoute: '工地巡检航线',
    algorithm: 'safety_helmet_recognition',
    status: 'generating' as FlightReportStatus,
    createdAt: '2024-01-17 15:30:00',
    duration: '25分钟'
  },
  {
    id: 'rpt_005',
    taskName: '高速公路巡检任务',
    executionTime: '2024-01-18 06:30:00',
    flightRoute: '高速巡检航线',
    algorithm: 'road_crack_detection',
    status: 'failed' as FlightReportStatus,
    createdAt: '2024-01-18 08:00:00',
    duration: '40分钟'
  }
])

// 表格列配置
const columns = [
  {
    title: '任务名称',
    dataIndex: 'taskName',
    key: 'taskName',
    width: 200,
    ellipsis: true
  },
  {
    title: '执行时间',
    dataIndex: 'executionTime',
    key: 'executionTime',
    width: 160
  },
  {
    title: '飞行航线',
    dataIndex: 'flightRoute',
    key: 'flightRoute',
    width: 140
  },
  {
    title: '执行算法',
    dataIndex: 'algorithm',
    key: 'algorithm',
    width: 180
  },
  {
    title: '飞行时长',
    dataIndex: 'duration',
    key: 'duration',
    width: 100
  },
  {
    title: '文件大小',
    dataIndex: 'fileSize',
    key: 'fileSize',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 160
  },
  {
    title: '操作',
    key: 'action',
    width: 240
  }
]

// 分页配置
const pagination = {
  current: 1,
  pageSize: 10,
  total: computed(() => filteredReports.value.length),
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
}

// 计算过滤后的报告列表
const filteredReports = computed(() => {
  let result = reports.value

  // 按状态过滤
  if (filterStatus.value !== 'all') {
    result = result.filter(report => report.status === filterStatus.value)
  }

  // 按算法过滤
  if (filterAlgorithm.value !== 'all') {
    result = result.filter(report => report.algorithm === filterAlgorithm.value)
  }

  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(report => 
      report.taskName.toLowerCase().includes(keyword) ||
      report.flightRoute.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 方法
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

const getStatusColor = (status: FlightReportStatus) => {
  const colors = {
    completed: 'green',
    generating: 'processing',
    pending: 'default',
    failed: 'error'
  }
  return colors[status] || 'default'
}

const getStatusText = (status: FlightReportStatus) => {
  const texts = {
    completed: '已完成',
    generating: '生成中',
    pending: '待生成',
    failed: '生成失败'
  }
  return texts[status] || status
}

const handleFilter = () => {
  // 触发重新计算过滤结果
}

const handleSearch = () => {
  // 触发重新计算搜索结果
}

const viewReport = (record: FlightReport) => {
  if (record.status !== 'completed') {
    message.warning('报告尚未生成完成，无法查看')
    return
  }
  
  selectedReportId.value = record.id
  reportViewerVisible.value = true
}

const downloadReport = (record: FlightReport) => {
  if (record.status !== 'completed') {
    message.warning('报告尚未生成完成，无法下载')
    return
  }
  
  // 创建下载链接
  const reportContent = generateReportContent(record)
  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${record.taskName}_飞行报告_${record.id}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  message.success(`报告下载已开始: ${record.taskName}`)
}

const generateReportContent = (record: FlightReport): string => {
  return `
飞行报告
=======

任务信息
-------
任务名称: ${record.taskName}
执行时间: ${record.executionTime}
飞行航线: ${record.flightRoute}
执行算法: ${getAlgorithmText(record.algorithm)}
飞行时长: ${record.duration}
报告生成时间: ${record.createdAt}

报告状态: ${getStatusText(record.status)}
文件大小: ${record.fileSize || '未知'}

详细内容
-------
本报告由系统自动生成，包含了本次飞行任务的完整信息和分析结果。

如需查看详细的图表、图像和深度分析，请使用系统内的报告查看功能。

生成时间: ${new Date().toLocaleString()}
  `.trim()
}

const handleReportDownload = (reportId: string) => {
  const report = reports.value.find(r => r.id === reportId)
  if (report) {
    downloadReport(report)
  }
}

const handleMenuClick = (event: any, record: FlightReport) => {
  const { key } = event
  
  switch (key) {
    case 'regenerate':
      regenerateReport(record)
      break
    case 'delete':
      deleteReport(record)
      break
  }
}

const regenerateReport = (record: FlightReport) => {
  message.info(`开始重新生成报告: ${record.taskName}`)
  
  // 更新状态为生成中
  const reportIndex = reports.value.findIndex(r => r.id === record.id)
  if (reportIndex !== -1) {
    reports.value[reportIndex].status = 'generating' as FlightReportStatus
  }
  
  // 模拟生成过程
  setTimeout(() => {
    if (reportIndex !== -1) {
      reports.value[reportIndex].status = 'completed' as FlightReportStatus
      message.success(`报告重新生成完成: ${record.taskName}`)
    }
  }, 3000)
}

const deleteReport = (record: FlightReport) => {
  const reportIndex = reports.value.findIndex(r => r.id === record.id)
  if (reportIndex !== -1) {
    reports.value.splice(reportIndex, 1)
    message.success(`已删除报告: ${record.taskName}`)
  }
}

onMounted(() => {
  console.log('飞行报告模块加载完成')
})
</script>

<style scoped>
.flight-report {
  padding: clamp(10px, 1.2vw, 20px);
  height: 100%;
  overflow-y: auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.header-section h3 {
  margin: 0;
  color: #1890ff;
  font-size: 18px;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-section span {
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

.table-section {
  margin-top: 20px;
}

.text-muted {
  color: #999;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-section {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .filter-section {
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .filter-section > div {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .filter-section .ant-select,
  .filter-section .ant-input-search {
    flex: 1;
  }
}
</style>
