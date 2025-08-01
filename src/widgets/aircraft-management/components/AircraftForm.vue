<template>
  <mars-dialog :title="isEdit ? '编辑机型' : '新增机型'" v-model:visible="dialogVisible" width="600" top="90" height="700" right="110" @close="handleClose">
    <div class="aircraft-form">
      <a-form ref="formRef" :model="formData" :rules="formRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>

          <a-form-item label="机型名称" name="modelName">
            <mars-input v-model:value="formData.modelName" placeholder="请输入机型名称" :maxlength="100" />
          </a-form-item>

          <a-form-item label="制造商" name="manufacturer">
            <mars-input v-model:value="formData.manufacturer" placeholder="请输入制造商" :maxlength="100" />
          </a-form-item>

          <a-form-item label="机型编码" name="modelCode">
            <mars-input v-model:value="formData.modelCode" placeholder="请输入机型编码" :maxlength="50" />
          </a-form-item>
        </div>

        <!-- 飞行性能参数 -->
        <div class="form-section">
          <h3 class="section-title">飞行性能参数</h3>

          <a-form-item label="最大飞行时间" name="maxFlightTime">
            <mars-input-number v-model:value="formData.maxFlightTime" :min="1" :max="1440" :step="1" placeholder="分钟" style="width: 100%" />
            <span class="input-suffix">分钟</span>
          </a-form-item>

          <a-form-item label="最大飞行距离" name="maxFlightDistance">
            <mars-input-number
              v-model:value="formData.maxFlightDistance"
              :min="0.1"
              :max="1000"
              :step="0.1"
              :precision="2"
              placeholder="公里"
              style="width: 100%"
            />
            <span class="input-suffix">公里</span>
          </a-form-item>

          <a-form-item label="最大飞行高度" name="maxAltitude">
            <mars-input-number v-model:value="formData.maxAltitude" :min="1" :max="10000" :step="1" placeholder="米" style="width: 100%" />
            <span class="input-suffix">米</span>
          </a-form-item>

          <a-form-item label="最大飞行速度" name="maxSpeed">
            <mars-input-number
              v-model:value="formData.maxSpeed"
              :min="0.1"
              :max="100"
              :step="0.1"
              :precision="1"
              placeholder="米/秒"
              style="width: 100%"
            />
            <span class="input-suffix">米/秒</span>
          </a-form-item>
        </div>

        <!-- 载荷和电池 -->
        <div class="form-section">
          <h3 class="section-title">载荷与电池</h3>

          <a-form-item label="载荷能力" name="payloadCapacity">
            <mars-input-number
              v-model:value="formData.payloadCapacity"
              :min="0"
              :max="1000"
              :step="0.1"
              :precision="2"
              placeholder="公斤"
              style="width: 100%"
            />
            <span class="input-suffix">公斤</span>
          </a-form-item>

          <a-form-item label="电池容量" name="batteryCapacity">
            <mars-input-number v-model:value="formData.batteryCapacity" :min="100" :max="50000" :step="100" placeholder="mAh" style="width: 100%" />
            <span class="input-suffix">mAh</span>
          </a-form-item>
        </div>

        <!-- 其他规格 -->
        <div class="form-section">
          <h3 class="section-title">其他规格</h3>

          <a-form-item label="详细规格" name="specifications">
            <mars-textarea
              v-model:value="specificationsText"
              :rows="4"
              placeholder="请输入详细规格信息，如重量、尺寸、传感器配置等（JSON格式或文本描述）"
              :maxlength="1000"
            />
          </a-form-item>

          <a-form-item label="启用状态" name="status">
            <mars-switch 
              v-model:checked="statusChecked" 
            />
          </a-form-item>
        </div>
      </a-form>
    </div>

    <template #footer>
      <div class="form-dialog-footer" style="display: flex; justify-content: center; gap: 12px; width: 100%; padding-bottom: 10px;">
        <mars-button @click="handleClose">取消</mars-button>
        <mars-button type="primary" @click="handleSubmit" :loading="submitLoading">
          {{ isEdit ? "更新" : "创建" }}
        </mars-button>
      </div>
    </template>
  </mars-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue"
import { Form } from "ant-design-vue"
import { $message } from "@mars/components/mars-ui"
import * as aircraftApi from "../api/aircraft"
import type { AircraftModel, CreateAircraftDTO, UpdateAircraftDTO } from "../types/index"

// Props
interface Props {
  visible: boolean
  aircraftData?: AircraftModel | null
  isEdit: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  aircraftData: null,
  isEdit: false
})

// Emits
const emit = defineEmits<{
  "update:visible": [value: boolean]
  success: []
}>()

// Form相关
const formRef = ref()
const submitLoading = ref(false)

// 表单数据
const formData = reactive({
  modelName: "",
  manufacturer: "",
  modelCode: "",
  maxFlightTime: undefined as number | undefined,
  maxFlightDistance: undefined as number | undefined,
  maxAltitude: undefined as number | undefined,
  maxSpeed: undefined as number | undefined,
  payloadCapacity: undefined as number | undefined,
  batteryCapacity: undefined as number | undefined,
  specifications: "",
  status: 1
})

// 规格信息文本处理
const specificationsText = ref("")
const statusChecked = computed({
  get: () => formData.status === 1,
  set: (value) => {
    formData.status = value ? 1 : 0
  }
})

// 表单验证规则
const formRules = {
  modelName: [
    { required: true, message: "请输入机型名称", trigger: "blur" },
    { min: 2, max: 100, message: "机型名称长度在2-100个字符", trigger: "blur" }
  ],
  manufacturer: [
    { required: true, message: "请输入制造商", trigger: "blur" },
    { max: 100, message: "制造商名称不能超过100个字符", trigger: "blur" }
  ],
  modelCode: [
    { required: true, message: "请输入机型编码", trigger: "blur" },
    { pattern: /^[A-Za-z0-9-_]+$/, message: "机型编码只能包含字母、数字、横线和下划线", trigger: "blur" },
    { max: 50, message: "机型编码不能超过50个字符", trigger: "blur" }
  ],
  maxFlightTime: [{ required: true, message: "请输入最大飞行时间", trigger: "blur" }],
  maxFlightDistance: [{ required: true, message: "请输入最大飞行距离", trigger: "blur" }],
  maxAltitude: [{ required: true, message: "请输入最大飞行高度", trigger: "blur" }]
}

// 计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value)
})

// 监听器
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      if (props.isEdit && props.aircraftData) {
        // 编辑模式，填充表单数据
        Object.assign(formData, {
          modelName: props.aircraftData.modelName || "",
          manufacturer: props.aircraftData.manufacturer || "",
          modelCode: props.aircraftData.modelCode || "",
          maxFlightTime: props.aircraftData.maxFlightTime,
          maxFlightDistance: props.aircraftData.maxFlightDistance,
          maxAltitude: props.aircraftData.maxAltitude,
          maxSpeed: props.aircraftData.maxSpeed,
          payloadCapacity: props.aircraftData.payloadCapacity,
          batteryCapacity: props.aircraftData.batteryCapacity,
          status: props.aircraftData.status || 1
        })

        // 处理规格信息
        if (props.aircraftData.specifications) {
          specificationsText.value =
            typeof props.aircraftData.specifications === "string"
              ? props.aircraftData.specifications
              : JSON.stringify(props.aircraftData.specifications, null, 2)
        } else {
          specificationsText.value = ""
        }
      } else {
        // 新增模式，重置表单
        resetForm()
      }
    }
  }
)

// 方法
const resetForm = () => {
  Object.assign(formData, {
    modelName: "",
    manufacturer: "",
    modelCode: "",
    maxFlightTime: undefined,
    maxFlightDistance: undefined,
    maxAltitude: undefined,
    maxSpeed: undefined,
    payloadCapacity: undefined,
    batteryCapacity: undefined,
    specifications: "",
    status: 1
  })
  specificationsText.value = ""
  formRef.value?.resetFields()
}

const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    submitLoading.value = true

    // 处理规格信息
    let specifications: any = ""
    if (specificationsText.value.trim()) {
      try {
        // 尝试解析为JSON
        specifications = JSON.parse(specificationsText.value)
      } catch {
        // 如果不是有效JSON，则作为字符串存储
        specifications = specificationsText.value.trim()
      }
    }

    const submitData = {
      ...formData,
      specifications
    }

    if (props.isEdit && props.aircraftData) {
      // 编辑模式
      await aircraftApi.updateAircraft(props.aircraftData.id, submitData as UpdateAircraftDTO)
      $message("机型更新成功", "success")
    } else {
      // 新增模式
      await aircraftApi.createAircraft(submitData as CreateAircraftDTO)
      $message("机型创建成功", "success")
    }

    emit("success")
  } catch (error: any) {
    if (error.errorFields) {
      // 表单验证错误
      console.log("表单验证失败:", error.errorFields)
    } else {
      // API调用错误
      console.error("提交失败:", error)
      $message(error.message || "操作失败，请重试", "error")
    }
  } finally {
    submitLoading.value = false
  }
}
</script>

<style lang="less" scoped>
.aircraft-form {
  max-height: 600px;
  overflow-y: auto;
  padding: 0 16px;

  .form-section {
    margin-bottom: 24px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--mars-text-color);
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--mars-border-color);
    }
  }

  .input-suffix {
    margin-left: 8px;
    color: var(--mars-text-color-secondary);
    font-size: 12px;
  }

  :deep(.ant-form-item) {
    margin-bottom: 16px;
  }

  :deep(.ant-form-item-label) {
    color: var(--mars-text-color);
  }
}
</style>
