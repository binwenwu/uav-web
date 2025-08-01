<template>
  <div class="top-bar">
    <div class="top-bar-content">
      <!-- 左侧菜单 -->
      <div class="menu-section left-menu">
        <!-- 系统管理下拉菜单 -->
        <div class="custom-dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
          <div class="menu-item" :class="{ active: isSystemActive }">
            <mars-icon icon="system" width="25"></mars-icon>
            <span>系统管理</span>
          </div>
          <div v-show="showDropdown" class="custom-dropdown-menu">
            <div class="sub-menu-item" @click="handleSubMenuClick('airspace')">
              <mars-icon icon="engineering-brand" width="20"></mars-icon>
              <span>空域管理</span>
            </div>
            <div class="sub-menu-item" @click="handleSubMenuClick('aircraft')">
              <mars-icon icon="drone-one" width="20"></mars-icon>
              <span>机型管理</span>
            </div>
            <div class="sub-menu-item" @click="handleSubMenuClick('hangar')">
              <mars-icon icon="dropbox" width="20"></mars-icon>
              <span>机巢管理</span>
            </div>
            <div class="sub-menu-item" @click="handleSubMenuClick('route')">
              <mars-icon icon="switch-track" width="20"></mars-icon>
              <span>航线管理</span>
            </div>
          </div>
        </div>
        
        <div class="menu-item" @click="handleMenuClick('simulation')">
          <mars-icon icon="clothes-gloves" width="25"></mars-icon>
          <span>手动航线规划</span>
        </div>
        <div class="menu-item" :class="{ active: isManageLayersActive }" @click="handleMenuClick('manage-layers')">
          <mars-icon icon="assembly-line" width="25"></mars-icon>
          <span>自动航线规划</span>
        </div>
      </div>
      
      <!-- 中间标题 -->
      <div class="title">赤壁低空云平台</div>
      
      <!-- 右侧菜单 -->
      <div class="menu-section right-menu">
        <div class="menu-item" @click="handleMenuClick('task')">
          <mars-icon icon="plan" width="25"></mars-icon>
          <span>飞行任务</span>
        </div>
        <div class="menu-item" @click="handleMenuClick('monitor')">
          <mars-icon icon="smart-optimization" width="25"></mars-icon>
          <span>智能识别</span>
        </div>
        <div class="menu-item" @click="handleMenuClick('settings')">
          <mars-icon icon="caution" width="25"></mars-icon>
          <span>事件预警</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useWidget } from "@mars/common/store/widget"

// 顶部栏组件
const { activate, disable, isActivate } = useWidget()

// 响应式状态，跟踪菜单激活状态
const menuStates = ref({
  menu1Active: false
})

// 控制系统管理下拉菜单显示
const showDropdown = ref(false)

// 计算属性，实时获取widget状态
const isManageLayersActive = computed(() => isActivate("manage-layers"))

// 系统管理菜单激活状态（如果有任何子项激活则高亮）
const isSystemActive = computed(() => {
  // 可以根据需要添加系统管理相关的widget检测
  return false // 暂时设为false，后续可根据子项widget状态调整
})

// 菜单点击处理函数
const handleMenuClick = (menuType: string) => {
  console.log("点击菜单:", menuType)
  
  switch (menuType) {
    case "manage-layers":
      // 检查manage-layers widget是否激活
      if (isActivate("manage-layers")) {
        // 如果已激活，则关闭
        disable("manage-layers")
      } else {
        // 如果未激活，则激活
        activate("manage-layers")
      }
      break
    case "simulation":
      // 手动航线规划
      console.log("激活手动航线规划")
      activate({ name: "route-planning" })
      break
    case "route":
      break
    case "task":
      break
    case "monitor":
      break
    case "settings":
      break
    default:
      console.log("未知菜单类型:", menuType)
  }
}

// 子菜单点击处理函数
const handleSubMenuClick = (subMenuType: string) => {
  console.log("点击子菜单:", subMenuType)
  
  // 点击子菜单项后关闭下拉菜单
  showDropdown.value = false
  
  switch (subMenuType) {
    case "airspace":
      console.log("点击空域管理")
      // TODO: 后续实现空域管理功能
      break
    case "aircraft":
      console.log("点击机型管理")
      // 激活机型管理widget
      activate({ name: "aircraft-management" })
      break
    case "hangar":
      console.log("点击机巢管理")
      // TODO: 后续实现机巢管理功能
      break
    case "route":
      console.log("点击航线管理")
      // 激活航线管理widget
      activate({ name: "route-management" })
      break
    default:
      console.log("未知子菜单类型:", subMenuType)
  }
}
</script>

<style lang="less" scoped>
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
  height: 80px;
  // background-image: url('/img/tietu/topbar.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  /* 添加模糊背景效果 */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  /* 添加半透明背景增强对比度 */
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
  padding: 0 10px;
}

.title {
  flex: 0 0 auto;
  min-width: 400px;
  font-size: 65px;
  // font-weight: bold;
  // font-style: italic;
  background: linear-gradient(to bottom, #ffffff 0%, #6E99BE 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
  font-family: 'YouSheBiaoTiHei', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  text-align: center;
  position: relative;
  z-index: 1;
  // transform: translateY(-5px); // 文字位置偏移
  /* 添加文字轮廓和阴影增强可读性 */
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.8)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  /* 文字描边效果 */
  -webkit-text-stroke: 0.5px rgba(0, 0, 0, 0.3);
}

/* 菜单区域样式 */
.menu-section {
  display: flex;
  align-items: center;
  flex: 1;
  padding: 0 10px;
  gap: 10px;
}

.left-menu {
  justify-content: flex-start;
}

.right-menu {
  justify-content: flex-end;
}

/* 菜单项样式 */
.menu-item {
  position: relative;
  background-image: url('/img/tietu/menu.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  padding: 8px 15px;
  min-width: 140px;
  flex: 1;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
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
}

.menu-item.active .mars-icon {
  color: #00ffff;
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.8));
}

.menu-item span {
  font-family: 'YouSheBiaoTiHei', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  font-size: 28px;
  color: #ffffff;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  z-index: 2;
  position: relative;
  line-height: 1;
  vertical-align: middle;
}

/* 自定义下拉菜单样式 */
.custom-dropdown {
  position: relative;
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
  /* 添加毛玻璃效果 */
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  /* 添加半透明背景增强对比度 */
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
  padding: 6px 12px;
  min-width: 120px;
  height: 35px;
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
  font-size: 22px;
  color: #ffffff;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  z-index: 2;
  position: relative;
  line-height: 1;
  vertical-align: middle;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .menu-item {
    min-width: 120px;
    padding: 6px 12px;
    height: 40px;
    gap: 6px;
  }
  
  .menu-item .mars-icon {
    width: 20px;
  }
  
  .menu-item span {
    font-size: 24px;
  }
  
  .title {
    min-width: 350px;
    font-size: 45px;
  }
  
  .sub-menu-item {
    min-width: 100px;
    padding: 5px 10px;
    height: 30px;
    gap: 5px;
  }
  
  .sub-menu-item .mars-icon {
    width: 16px;
  }
  
  .sub-menu-item span {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .top-bar {
    height: 60px;
  }
  
  .title {
    font-size: 30px;
    letter-spacing: 1px;
    min-width: 280px;
  }
  
  .menu-section {
    gap: 5px;
    padding: 0 5px;
  }
  
  .menu-item {
    min-width: 90px;
    padding: 4px 8px;
    height: 35px;
    gap: 4px;
  }
  
  .menu-item .mars-icon {
    width: 18px;
  }
  
  .menu-item span {
    font-size: 18px;
  }
  
  .sub-menu-item {
    min-width: 80px;
    padding: 4px 8px;
    height: 28px;
    gap: 4px;
  }
  
  .sub-menu-item .mars-icon {
    width: 14px;
  }
  
  .sub-menu-item span {
    font-size: 16px;
  }
}
</style>
