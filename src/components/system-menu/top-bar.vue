<template>
  <div class="top-bar" :class="{ 'icon-only': isIconOnly }">
    <div class="top-bar-content">
      <!-- 左侧菜单 -->
      <div class="menu-section left-menu">
        <!-- 设备清单下拉菜单 -->
        <div class="custom-dropdown" @mouseenter="showDeviceDropdown = true" @mouseleave="showDeviceDropdown = false">
          <div class="menu-item" :class="{ active: isDeviceActive }" :title="isIconOnly ? '设备清单' : ''">
            <mars-icon icon="system" :width="iconSize"></mars-icon>
            <span v-if="!isIconOnly">设备清单</span>
          </div>
          <div v-show="showDeviceDropdown" class="custom-dropdown-menu">
            <div class="sub-menu-item" @click="handleSubMenuClick('personal-device')">
              <mars-icon icon="user" :width="subIconSize"></mars-icon>
              <span>个人设备</span>
            </div>
            <div class="sub-menu-item" @click="handleSubMenuClick('public-device')">
              <mars-icon icon="drone-one" :width="subIconSize"></mars-icon>
              <span>公有设备</span>
            </div>
          </div>
        </div>

        <!-- 航线规划下拉菜单 -->
        <div class="custom-dropdown" @mouseenter="showRouteDropdown = true" @mouseleave="showRouteDropdown = false">
          <div class="menu-item" :class="{ active: isRouteActive }" :title="isIconOnly ? '航线规划' : ''">
            <mars-icon icon="switch-track" :width="iconSize"></mars-icon>
            <span v-if="!isIconOnly">航线规划</span>
          </div>
          <div v-show="showRouteDropdown" class="custom-dropdown-menu">
            <div class="sub-menu-item" @click="handleSubMenuClick('route-management')">
              <mars-icon icon="switch-track" :width="subIconSize"></mars-icon>
              <span>航线管理</span>
            </div>
            <div class="sub-menu-item" @click="handleSubMenuClick('manual-route')">
              <mars-icon icon="clothes-gloves" :width="subIconSize"></mars-icon>
              <span>手动航线规划</span>
            </div>
            <div class="sub-menu-item" @click="handleSubMenuClick('auto-route')">
              <mars-icon icon="assembly-line" :width="subIconSize"></mars-icon>
              <span>自动航线规划</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间标题 -->
      <div class="title">赤壁低空云平台</div>

      <!-- 右侧菜单 -->
      <div class="menu-section right-menu">
        <!-- 空域申请 -->
        <div
          class="menu-item"
          :class="{ active: isAirspaceApplicationActive }"
          :title="isIconOnly ? '空域申请' : ''"
          @click="handleMenuClick('airspace-application')"
        >
          <mars-icon icon="file-text" :width="iconSize"></mars-icon>
          <span v-if="!isIconOnly">空域申请</span>
        </div>

        <!-- 空域计算 -->
        <div
          class="menu-item"
          :class="{ active: isAirspaceComputationActive }"
          :title="isIconOnly ? '空域计算' : ''"
          @click="handleMenuClick('airspace-calculation')"
        >
          <mars-icon icon="calculator" :width="iconSize"></mars-icon>
          <span v-if="!isIconOnly">空域计算</span>
        </div>

        <!-- 飞行报告 -->
        <div
          class="menu-item"
          :class="{ active: isFlightReportActive }"
          :title="isIconOnly ? '飞行报告' : ''"
          @click="handleMenuClick('flight-report')"
        >
          <mars-icon icon="file-text-one" :width="iconSize"></mars-icon>
          <span v-if="!isIconOnly">飞行报告</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useWidget } from "@mars/common/store/widget"
import useBreakpoint from "@mars/common/uses/use-breakpoint"

// 顶部栏组件
const { activate, isActivate } = useWidget()
const { isIconOnly, isCompact } = useBreakpoint()

// icon 尺寸跟随断点变化（搭配 CSS 端的 clamp 字号）
const iconSize = computed(() => {
  if (isIconOnly.value) {
    return 22
  }
  if (isCompact.value) {
    return 20
  }
  return 25
})
const subIconSize = computed(() => (isCompact.value ? 16 : 20))

// 控制下拉菜单显示
const showDeviceDropdown = ref(false)
const showRouteDropdown = ref(false)

// widget 激活态
const isDeviceActive = computed(() => isActivate("aircraft-management"))
const isRouteActive = computed(() => isActivate("route-management") || isActivate("route-planning"))
const isAirspaceApplicationActive = computed(() => isActivate("airspace-application"))
const isAirspaceComputationActive = computed(() => isActivate("airspace-computation"))
const isFlightReportActive = computed(() => isActivate("flight-report"))

// 菜单点击处理函数
const handleMenuClick = (menuType: string) => {
  switch (menuType) {
    case "airspace-application":
      activate({ name: "airspace-application" })
      break
    case "airspace-calculation":
      activate({ name: "airspace-computation" })
      break
    case "flight-report":
      activate({ name: "flight-report" })
      break
  }
}

// 子菜单点击处理函数
const handleSubMenuClick = (subMenuType: string) => {
  showDeviceDropdown.value = false
  showRouteDropdown.value = false

  switch (subMenuType) {
    case "personal-device":
    case "public-device":
      activate({ name: "aircraft-management" })
      break
    case "route-management":
      activate({ name: "route-management" })
      break
    case "manual-route":
      activate({ name: "route-planning" })
      break
    case "auto-route":
      activate({ name: "auto-route-planning" })
      break
  }
}
</script>

<style lang="less" scoped>
@import "@mars/components/mars-ui/themes/responsive.less";

/* 引入自定义字体 */
@font-face {
  font-family: 'YouSheBiaoTiHei';
  src: url('/fonts/YouSheBiaoTiHei.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  height: var(--topbar-h);
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background-color: rgba(0, 0, 0, 0.2);
  background-blend-mode: overlay;
}

.top-bar-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5px;
  flex-wrap: nowrap;
  /* 注意：不能加 overflow: hidden，否则会裁掉 absolute 定位的下拉子菜单
     菜单项溢出由 .menu-item 自身的 text-overflow: ellipsis 兜底 */
}

.title {
  flex: 0 1 auto;       /* 允许在极端窄屏时被压缩 */
  min-width: 0;
  font-size: var(--fs-title-xl);
  background: linear-gradient(to bottom, #ffffff 0%, #6E99BE 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
  font-family: 'YouSheBiaoTiHei', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  text-align: center;
  position: relative;
  z-index: 1;
  white-space: nowrap;
  padding: 0 12px;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.8)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  -webkit-text-stroke: 0.5px rgba(0, 0, 0, 0.3);
}

/* 菜单区域 */
.menu-section {
  display: flex;
  align-items: center;
  flex: 1 1 0;        /* 左右对称分配剩余空间 */
  min-width: 0;
  padding: 0 10px;
  gap: clamp(8px, 1vw, 20px);
}

.left-menu {
  justify-content: flex-start;
  padding-right: clamp(10px, 1.5vw, 25px);
}

/* 左侧两项填满左侧菜单容器，平分剩余空间，避免右侧留白 */
.left-menu > .custom-dropdown,
.left-menu > .menu-item {
  flex: 1 1 0;
  max-width: 360px;   /* 超宽屏时也不会被拉得过分 */
  min-width: 0;
}

.left-menu > .custom-dropdown > .menu-item {
  width: 100%;        /* 让 dropdown 内的菜单项撑满父容器 */
}

.right-menu {
  justify-content: flex-end;
  padding-left: clamp(10px, 1.5vw, 25px);
}

/* 菜单项：去掉 min-width，靠 padding + 内容撑开；
   背景图改为 100% 拉伸的方式，保留视觉风格 */
.menu-item {
  position: relative;
  background-image: url('/img/tietu/menu.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  padding: clamp(4px, 0.6vw, 8px) clamp(10px, 1.4vw, 28px);
  height: clamp(34px, 3vw, 45px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(4px, 0.5vw, 8px);
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 0 1 auto;     /* 让菜单项可被压缩，但不会无限拉伸 */
  white-space: nowrap;
  min-width: 0;
}

.menu-item > * {
  display: flex;
  align-items: center;
}

.menu-item:hover {
  transform: scale(1.05);
  filter: brightness(1.2);
}

.menu-item.active span {
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}

.menu-item .mars-icon {
  color: #ffffff;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.8));
  vertical-align: middle;
  line-height: 1;
  flex-shrink: 0;
}

.menu-item.active .mars-icon {
  color: #00ffff;
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.8));
}

.menu-item span {
  font-family: 'YouSheBiaoTiHei', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  font-size: var(--fs-menu-lg);
  color: #ffffff;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  z-index: 2;
  position: relative;
  line-height: 1;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 自定义下拉菜单样式 */
.custom-dropdown {
  position: relative;
  flex: 0 1 auto;
  min-width: 0;
}

.custom-dropdown-menu {
  position: absolute;
  top: calc(100% + 0px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  padding: 8px 0;
  min-width: 150px;
  background: transparent;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

/* 子菜单项样式 */
.sub-menu-item {
  position: relative;
  background-image: url('/img/tietu/menu.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  padding: 6px clamp(8px, 1vw, 12px);
  min-width: 120px;
  height: clamp(28px, 2.5vw, 35px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 4px;
}

.sub-menu-item:last-child {
  margin-bottom: 0;
}

.sub-menu-item:hover {
  transform: scale(1.05);
  filter: brightness(1.2);
}

.sub-menu-item .mars-icon {
  color: #ffffff;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.8));
  vertical-align: middle;
  line-height: 1;
}

.sub-menu-item span {
  font-family: 'YouSheBiaoTiHei', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  font-size: var(--fs-menu-md);
  color: #ffffff;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  z-index: 2;
  position: relative;
  line-height: 1;
  vertical-align: middle;
}

/* ---------- 极窄屏：图标-only 模式 ---------- */
.top-bar.icon-only {
  .menu-item {
    /* 图标-only 时压缩为方形按钮，背景图比例失真不明显 */
    padding: 4px 8px;
    min-width: clamp(34px, 6vw, 44px);
    gap: 0;
  }

  .title {
    /* 极窄屏标题降级，避免完全顶死 */
    font-size: clamp(20px, 5vw, 28px);
    letter-spacing: 0;
    padding: 0 4px;
  }

  .menu-section {
    gap: 6px;
    padding: 0 4px;
  }

  .left-menu {
    padding-right: 8px;
  }

  .right-menu {
    padding-left: 8px;
  }
}
</style>
