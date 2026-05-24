<template>
  <mars-dialog v-model:visible="isActivate" title="空域计算 - AI算法展示" :width="1400" :height="720" top="100px" left="100px">
    <div class="airspace-computation">
      <div class="header-section">
        <h3>智能算法库</h3>
        <div class="filter-section">
          <span>算法分类：</span>
          <a-select v-model:value="selectedCategory" style="width: 150px; margin-right: 20px" @change="filterAlgorithms">
            <a-select-option value="all">全部算法</a-select-option>
            <a-select-option value="infrastructure">基础设施</a-select-option>
            <a-select-option value="safety">安全检测</a-select-option>
            <a-select-option value="environment">环境监测</a-select-option>
            <a-select-option value="traffic">交通相关</a-select-option>
          </a-select>
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索算法名称..."
            style="width: 200px"
            @search="searchAlgorithms"
            @input="searchAlgorithms"
          />
        </div>
      </div>

      <div class="algorithms-grid">
        <div
          v-for="algorithm in filteredAlgorithms"
          :key="algorithm.id"
          class="algorithm-card"
          :class="{ expanded: expandedCards[algorithm.id] }"
          @click="toggleCard(algorithm.id)"
        >
          <div class="card-header">
            <div class="algorithm-image">
              <img :src="algorithm.imagePath" :alt="algorithm.name" />
              <div class="category-tag">{{ getCategoryText(algorithm.category) }}</div>
            </div>
            <div class="algorithm-info">
              <h4>{{ algorithm.name }}</h4>
              <p class="description">{{ algorithm.description }}</p>
              <div class="meta-info">
                <span v-if="algorithm.accuracy" class="accuracy">
                  <mars-icon icon="check" width="14" />
                  准确率: {{ algorithm.accuracy }}
                </span>
                <span v-if="algorithm.processingTime" class="processing-time">
                  <mars-icon icon="time" width="14" />
                  处理时间: {{ algorithm.processingTime }}
                </span>
              </div>
            </div>
            <div class="card-actions">
              <a-button type="primary" size="small" @click.stop="selectAlgorithm(algorithm)"> 选择算法 </a-button>
              <a-button size="small" @click.stop="toggleCard(algorithm.id)">
                {{ expandedCards[algorithm.id] ? "收起" : "详情" }}
              </a-button>
            </div>
          </div>

          <div v-if="expandedCards[algorithm.id]" class="card-expanded">
            <div class="scenarios-section">
              <h5>适用场景：</h5>
              <div class="scenarios-tags">
                <a-tag v-for="scenario in algorithm.applicableScenarios" :key="scenario" color="blue">
                  {{ scenario }}
                </a-tag>
              </div>
            </div>
            <div class="tech-specs">
              <h5>技术规格：</h5>
              <ul>
                <li>算法类型: {{ getAlgorithmType(algorithm.name) }}</li>
                <li>输入格式: 高分辨率无人机图像</li>
                <li>输出格式: 检测结果标注图像 + JSON数据</li>
                <li>最小分辨率要求: 2cm/像素</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredAlgorithms.length === 0" class="empty-state">
        <a-empty description="未找到匹配的算法" />
      </div>
    </div>
  </mars-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useWidget } from "@mars/common/store/widget"
import { message } from "ant-design-vue"
import type { AlgorithmInfo, AlgorithmCategory } from "./types"

// Widget状态管理
const { isActivate } = useWidget()

// 搜索和筛选状态
const selectedCategory = ref<string>("all")
const searchKeyword = ref<string>("")
const expandedCards = ref<Record<string, boolean>>({})

// 算法数据
const algorithms = ref<AlgorithmInfo[]>([
  {
    id: "drainage_cover_detection",
    name: "高速排水沟盖板缺失检测算法",
    description: "基于深度学习的排水沟盖板缺失智能检测，确保道路安全",
    imagePath: "/img/algo/高速排水沟盖板缺失检测算法.png",
    category: "infrastructure",
    accuracy: "95.2%",
    processingTime: "2-3秒",
    applicableScenarios: ["高速公路巡检", "城市道路维护", "基础设施安全检查"]
  },
  {
    id: "isolation_fence_damage_detection",
    name: "高速隔离栏破损检测算法",
    description: "自动识别高速公路隔离栏的破损、变形等安全隐患",
    imagePath: "/img/algo/高速隔离栏破损检测算法.png",
    category: "infrastructure",
    accuracy: "93.8%",
    processingTime: "1-2秒",
    applicableScenarios: ["高速公路安全检查", "交通设施维护", "事故预防"]
  },
  {
    id: "urban_garbage_detection",
    name: "城市垃圾堆检测算法",
    description: "智能识别城市环境中的垃圾堆积，助力环境卫生管理",
    imagePath: "/img/algo/城市垃圾堆检测算法.png",
    category: "environment",
    accuracy: "91.5%",
    processingTime: "2-4秒",
    applicableScenarios: ["城市环卫管理", "违法倾倒监控", "环境治理评估"]
  },
  {
    id: "safety_helmet_recognition",
    name: "安全帽识别算法",
    description: "实时检测工作人员是否佩戴安全帽，保障作业安全",
    imagePath: "/img/algo/安全帽识别算法.png",
    category: "safety",
    accuracy: "97.1%",
    processingTime: "1秒",
    applicableScenarios: ["建筑工地监管", "工业安全检查", "作业合规监督"]
  },
  {
    id: "engineering_vehicle_detection",
    name: "工程车辆检测算法",
    description: "精准识别各类工程车辆，支持施工现场智能管理",
    imagePath: "/img/algo/工程车辆检测算法.png",
    category: "traffic",
    accuracy: "94.6%",
    processingTime: "2秒",
    applicableScenarios: ["施工现场管理", "设备调度监控", "工程进度跟踪"]
  },
  {
    id: "road_crack_detection",
    name: "道路裂纹检测算法",
    description: "高精度识别道路表面裂纹，为道路维护提供数据支撑",
    imagePath: "/img/algo/道路裂纹检测算法.png",
    category: "infrastructure",
    accuracy: "96.3%",
    processingTime: "3-5秒",
    applicableScenarios: ["道路质量评估", "预防性维护", "路面病害调查"]
  },
  {
    id: "fire_smoke_detection",
    name: "烟火检测算法",
    description: "快速识别火灾烟雾，实现早期火灾预警和应急响应",
    imagePath: "/img/algo/烟火检测算法.png",
    category: "safety",
    accuracy: "98.7%",
    processingTime: "1秒",
    applicableScenarios: ["森林防火监控", "工业安全预警", "城市消防巡检"]
  },
  {
    id: "general_person_vehicle_detection",
    name: "通用人车检测算法",
    description: "高效识别人员和车辆，适用于多种监控和统计场景",
    imagePath: "/img/algo/通用人车检测算法.png",
    category: "traffic",
    accuracy: "95.9%",
    processingTime: "1-2秒",
    applicableScenarios: ["交通流量统计", "人群密度分析", "违章行为监控"]
  },
  {
    id: "water_target_detection",
    name: "水上目标检测算法",
    description: "专业识别水面船只、漂浮物等目标，服务水域管理",
    imagePath: "/img/algo/水上目标检测算法.png",
    category: "environment",
    accuracy: "92.4%",
    processingTime: "2-3秒",
    applicableScenarios: ["水域安全监控", "船舶交通管理", "水面污染监测"]
  }
])

// 计算过滤后的算法列表
const filteredAlgorithms = computed(() => {
  let result = algorithms.value

  // 按类别过滤
  if (selectedCategory.value !== "all") {
    result = result.filter((algo) => algo.category === selectedCategory.value)
  }

  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      (algo) =>
        algo.name.toLowerCase().includes(keyword) ||
        algo.description.toLowerCase().includes(keyword) ||
        algo.applicableScenarios.some((scenario) => scenario.toLowerCase().includes(keyword))
    )
  }

  return result
})

// 方法
const getCategoryText = (category: string) => {
  const categoryMap = {
    infrastructure: "基础设施",
    safety: "安全检测",
    environment: "环境监测",
    traffic: "交通相关"
  }
  return categoryMap[category] || category
}

const getAlgorithmType = (name: string) => {
  if (name.includes("检测")) {
    return "目标检测"
  }

  if (name.includes("识别")) {
    return "图像识别"
  }

  return "深度学习"
}

const toggleCard = (algorithmId: string) => {
  expandedCards.value[algorithmId] = !expandedCards.value[algorithmId]
}

const selectAlgorithm = (algorithm: AlgorithmInfo) => {
  message.success(`已选择算法：${algorithm.name}`)
  // 这里可以添加选择算法后的逻辑，比如传递给其他模块
}

const filterAlgorithms = () => {
  // 触发重新计算过滤结果
}

const searchAlgorithms = () => {
  // 触发重新计算搜索结果
}

onMounted(() => {
  console.log("空域计算模块加载完成")
})
</script>

<style scoped>
.airspace-computation {
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
  flex-wrap: wrap;
  gap: 12px;
}

.filter-section span {
  color: #666;
  font-weight: 500;
}

.algorithms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.algorithm-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.algorithm-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.algorithm-card.expanded {
  border-color: #1890ff;
}

.card-header {
  display: flex;
  padding: 16px;
  align-items: flex-start;
}

.algorithm-image {
  position: relative;
  width: 120px;
  height: 80px;
  margin-right: 16px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.algorithm-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-tag {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(24, 144, 255, 0.9);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}

.algorithm-info {
  flex: 1;
  min-width: 0;
}

.algorithm-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.description {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-info span {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #888;
}

.meta-info .mars-icon {
  margin-right: 4px;
}

.accuracy {
  color: #52c41a !important;
}

.processing-time {
  color: #1890ff !important;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 12px;
}

.card-expanded {
  border-top: 1px solid #f0f0f0;
  padding: 16px;
  background: #fafafa;
}

.scenarios-section,
.tech-specs {
  margin-bottom: 16px;
}

.scenarios-section h5,
.tech-specs h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.scenarios-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tech-specs ul {
  margin: 0;
  padding-left: 16px;
}

.tech-specs li {
  font-size: 12px;
  color: #666;
  line-height: 1.6;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .algorithms-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .algorithms-grid {
    grid-template-columns: 1fr;
  }

  .header-section {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .filter-section {
    justify-content: space-between;
  }

  .card-header {
    flex-direction: column;
  }

  .algorithm-image {
    width: 100%;
    height: 120px;
    margin-right: 0;
    margin-bottom: 12px;
  }

  .card-actions {
    flex-direction: row;
    margin-left: 0;
    margin-top: 12px;
  }
}
</style>
