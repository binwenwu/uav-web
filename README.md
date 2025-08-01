# 低空云平台 Demo 项目

一个基于Web的低空飞行管理平台演示项目，提供无人机航线规划、仿真飞行、航线管理等功能。

![image-20250801134512325](https://cdn.jsdelivr.net/gh/binwenwu/picgo_01/img/image-20250801134512325.png)

## 🛠️ 技术栈

- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - JavaScript的超集，提供类型安全
- **Vite** - 现代化的前端构建工具
- **Mars3D** - 基于Cesium的三维GIS引擎
- **Ant Design Vue** - 企业级UI组件库
- **Vuex** - Vue.js的状态管理模式
- **Less** - CSS预处理器

## 🚀 主要功能

- **🗺️ 三维地图展示** - 基于Mars3D的三维地图渲染
- **✈️ 手动航线规划** - 可视化航点设置和航线绘制
- **🎮 仿真飞行** - 实时无人机飞行仿真与控制
- **📊 航线管理** - 航线保存、编辑、删除和导入导出
- **📈 数据分析** - 航线统计和筛选功能
- **🎛️ 图形编辑** - 多种图形绘制和编辑工具

## 📁 项目结构

```
src/
├── components/              # 公共组件
│   ├── mars-ui/            # Mars UI组件库
│   ├── mars-work/          # 地图工作组件
│   └── system-menu/        # 系统菜单组件
├── widgets/                # 功能模块
│   ├── route-planning/     # 手动航线规划
│   ├── route-management/   # 航线管理
│   ├── flight-demo/        # 飞行演示
│   ├── aircraft-management/ # 机型管理
│   └── basic/              # 基础工具
│       ├── analysis/       # 分析工具
│       ├── graphic-editor/ # 图形编辑
│       ├── measure/        # 测量工具
│       └── plot/           # 标绘工具
├── pages/                  # 页面组件
├── utils/                  # 工具函数
├── types/                  # 类型定义
└── api/                    # 接口管理
```

## 🔧 开发环境

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```

## 🌟 核心特性

- **模块化架构** - 基于Widget的插件化设计
- **响应式设计** - 适配不同屏幕尺寸
- **类型安全** - 全面的TypeScript类型定义
- **实时仿真** - 支持暂停、恢复、停止的仿真控制
- **数据持久化** - 基于LocalStorage的客户端数据存储
- **交互友好** - 直观的操作界面和反馈机制
- **组件复用** - 高度模块化的组件设计
- **主题定制** - 支持明暗主题切换

## 🎯 Widget系统

本项目采用Widget插件化架构，每个功能模块都是独立的Widget：

- **生命周期管理** - 统一的组件加载和销毁机制
- **状态管理** - 基于Vuex的全局状态控制
- **事件通信** - Widget间的解耦通信
- **动态加载** - 按需加载功能模块

## 📄 许可证

本项目仅用于技术演示和学习交流。

---

*该项目展示了现代Web技术在低空飞行管理领域的应用实践。*