<template>
  <mars-dialog title="机型管理" icon="drone" custom-class="aircraft-management-panel" :draggable="true" width="1100" height="700" top="90" left="80">
    <!-- 顶部工具栏 -->
    <div class="aircraft-toolbar">
      <div class="search-controls">
        <mars-input v-model="searchKeyword" placeholder="搜索机型名称或编码..." style="width: 300px" @change="handleSearch">
          <template #prefix>
            <mars-icon icon="search" :width="16" />
          </template>
        </mars-input>
        <mars-button @click="handleSearch" type="primary">
          <mars-icon icon="search" :width="16" />
          搜索
        </mars-button>
      </div>

      <div class="action-controls">
        <mars-button @click="handleAdd" type="primary">
          <mars-icon icon="plus" :width="16" />
          新增机型
        </mars-button>
        <mars-button @click="handleRefresh">
          <mars-icon icon="refresh" :width="16" />
          刷新
        </mars-button>
      </div>
    </div>

    <!-- 机型列表表格 -->
    <div class="aircraft-table-container">
      <mars-table
        :columns="tableColumns"
        :data-source="aircraftList"
        :pagination="paginationConfig"
        :loading="loading"
        row-key="id"
        @change="handleTableChange"
      >
        <!-- 状态列自定义渲染 -->
        <template #status="{ record }">
          <span :class="`status-tag ${record.status === 1 ? 'active' : 'inactive'}`">
            {{ record.status === 1 ? "启用" : "禁用" }}
          </span>
        </template>

        <!-- 操作列自定义渲染 -->
        <template #action="{ record }">
          <div class="action-buttons">
            <mars-button size="small" type="primary" @click="handleEdit(record)"> 编辑 </mars-button>
            <mars-button size="small" type="danger" @click="handleDelete(record)"> 删除 </mars-button>
            <mars-button size="small" @click="handleToggleStatus(record)">
              {{ record.status === 1 ? "禁用" : "启用" }}
            </mars-button>
          </div>
        </template>
      </mars-table>
    </div>

    <!-- 新增/编辑机型弹窗 -->
    <AircraftForm v-model:visible="formVisible" :aircraft-data="currentAircraft" :is-edit="isEditMode" @success="handleFormSuccess" />

    <!-- 删除确认弹窗 -->
    <mars-dialog title="确认删除" v-model:visible="deleteVisible" width="400" height="160" top="420" left="450" custom-class="delete-confirm-dialog">
      <div class="delete-content">
        <p>确定要删除机型 "{{ deleteTarget?.modelName }}" 吗？</p>
        <p style="color: #ff4d4f; font-size: 12px">注意：删除后将无法恢复，且关联的航线和任务可能受到影响。</p>
      </div>

      <template #footer>
        <div class="delete-dialog-footer" style="display: flex; justify-content: center; gap: 12px; width: 100%; padding-bottom: 10px;">
          <mars-button @click="deleteVisible = false">取消</mars-button>
          <mars-button type="danger" @click="confirmDelete" :loading="deleteLoading"> 确认 </mars-button>
        </div>
      </template>
    </mars-dialog>
  </mars-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue"
import { useWidget } from "@mars/common/store/widget"
import AircraftForm from "./components/AircraftForm.vue"
import { $message } from "@mars/components/mars-ui"
import * as aircraftApi from "@mars/widgets/aircraft-management/api/aircraft"
import type { AircraftModel, AircraftSearchParams } from "./types/index"



// Widget相关
const { currentWidget } = useWidget()

// 响应式数据
const loading = ref(false)
const searchKeyword = ref("")
const aircraftList = ref<AircraftModel[]>([])
const formVisible = ref(false)
const deleteVisible = ref(false)
const deleteLoading = ref(false)
const currentAircraft = ref<AircraftModel | null>(null)
const deleteTarget = ref<AircraftModel | null>(null)
const isEditMode = ref(false)

// 分页配置
const paginationConfig = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 表格列配置
const tableColumns = [
  {
    title: "机型名称",
    dataIndex: "modelName",
    key: "modelName",
    width: 150
  },
  {
    title: "制造商",
    dataIndex: "manufacturer",
    key: "manufacturer",
    width: 120
  },
  {
    title: "机型编码",
    dataIndex: "modelCode",
    key: "modelCode",
    width: 120
  },
  {
    title: "最大飞行时间",
    dataIndex: "maxFlightTime",
    key: "maxFlightTime",
    width: 120,
    customRender: ({ text }: any) => (text ? `${text}分钟` : "-")
  },
  {
    title: "最大距离",
    dataIndex: "maxFlightDistance",
    key: "maxFlightDistance",
    width: 100,
    customRender: ({ text }: any) => (text ? `${text}km` : "-")
  },
  {
    title: "最大高度",
    dataIndex: "maxAltitude",
    key: "maxAltitude",
    width: 100,
    customRender: ({ text }: any) => (text ? `${text}m` : "-")
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 100,
    slots: { customRender: "status" }
  },
  {
    title: "创建时间",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 150,
    customRender: ({ text }: any) => (text ? new Date(text).toLocaleString() : "-")
  },
  {
    title: "操作",
    key: "action",
    width: 200,
    fixed: "right",
    slots: { customRender: "action" }
  }
]

// 搜索参数
const searchParams = computed(
  (): AircraftSearchParams => ({
    page: paginationConfig.current,
    size: paginationConfig.pageSize,
    keyword: searchKeyword.value.trim() || undefined
  })
)

// 生命周期
onMounted(() => {
  loadAircraftList()
})

// 方法
const loadAircraftList = async () => {
  try {
    loading.value = true
    const response = await aircraftApi.getAircraftList(searchParams.value)
    aircraftList.value = response.data.records
    paginationConfig.total = response.data.total
  } catch (error) {
    console.error("加载机型列表失败:", error)
    $message("加载机型列表失败", "error")
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  paginationConfig.current = 1
  loadAircraftList()
}

const handleRefresh = () => {
  searchKeyword.value = ""
  paginationConfig.current = 1
  loadAircraftList()
}

const handleAdd = () => {
  currentAircraft.value = null
  isEditMode.value = false
  formVisible.value = true
}

const handleEdit = (aircraft: AircraftModel) => {
  currentAircraft.value = { ...aircraft }
  isEditMode.value = true
  formVisible.value = true
}

const handleDelete = (aircraft: AircraftModel) => {
  deleteTarget.value = aircraft
  deleteVisible.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) {
    return
  }

  try {
    deleteLoading.value = true
    await aircraftApi.deleteAircraft(deleteTarget.value.id)
    $message("删除成功", "success")
    deleteVisible.value = false
    loadAircraftList()
  } catch (error) {
    console.error("删除失败:", error)
    $message("删除失败", "error")
  } finally {
    deleteLoading.value = false
  }
}

const handleToggleStatus = async (aircraft: AircraftModel) => {
  try {
    const newStatus = aircraft.status === 1 ? 0 : 1
    await aircraftApi.updateAircraftStatus(aircraft.id, newStatus)
    $message(`${newStatus === 1 ? "启用" : "禁用"}成功`, "success")
    loadAircraftList()
  } catch (error) {
    console.error("状态更新失败:", error)
    $message("状态更新失败", "error")
  }
}

const handleTableChange = (pagination: any) => {
  paginationConfig.current = pagination.current
  paginationConfig.pageSize = pagination.pageSize
  loadAircraftList()
}

const handleFormSuccess = () => {
  formVisible.value = false
  loadAircraftList()
}
</script>

<style lang="less" scoped>
.aircraft-management-panel {
  .aircraft-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 16px;
    background: var(--mars-control-bg);
    border-radius: 4px;

    .search-controls {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .action-controls {
      display: flex;
      gap: 8px;
    }
  }

  .aircraft-table-container {
    height: calc(100% - 80px);
    overflow: auto;

    .status-tag {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;

      &.active {
        background: #f6ffed;
        color: #52c41a;
        border: 1px solid #b7eb8f;
      }

      &.inactive {
        background: #fff2f0;
        color: #ff4d4f;
        border: 1px solid #ffccc7;
      }
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }
  }

  :deep(.delete-confirm-dialog .mars-dialog__footer) {
    justify-content: center !important;
    padding-left: 0 !important;
  }

  .delete-dialog-footer {
    display: flex;
    justify-content: center;
    gap: 12px;
    width: 100%;
  }

  .delete-content {
    padding: 10px 0;
    
    p {
      margin: 12px 0;
      line-height: 1.6;
      
      &:first-child {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 16px;
      }
      
      &:last-child {
        margin-top: 16px;
        margin-bottom: 8px;
      }
    }
  }
}
</style>

