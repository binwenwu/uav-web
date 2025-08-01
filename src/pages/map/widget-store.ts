/**
 * index页面的widget配置
 * @copyright 武汉大学 mars3d.cn
 * @author 贪肯奇 2022-02-19
 */
import { defineAsyncComponent, markRaw } from "vue"
import { WidgetState } from "@mars/common/store/widget"
import { StoreOptions } from "vuex"

const store: StoreOptions<WidgetState> = {
  state: {
    widgets: [
      {
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/basic/query-poi/index.vue"))),
        name: "query-poi",
        autoDisable: true
      },
      {
        // 工具栏
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/basic/toolbar/index.vue"))),
        name: "toolbar",
        autoDisable: true
      },
      {
        // 图层管理
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/basic/manage-layers/index.vue"))),
        name: "manage-layers",
        group: "manage",
        disableOther: ["roamLine"]
      },
      {
        // 坐标定位
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/basic/location-point/index.vue"))),
        name: "location-point",
        group: "tools"
      },
      {
        // 机型管理
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/aircraft-management/index.vue"))),
        name: "aircraft-management",
        group: "system"
      },
      {
        // 图上量算
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/basic/measure/index.vue"))),
        name: "measure",
        group: "tools"
      },
      {
        // 图上标绘
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/basic/plot/index.vue"))),
        name: "plot",
        group: "tools"
      },
      {
        // 空间分析
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/basic/analysis/index.vue"))),
        name: "analysis",
        group: "tools"
      },
      {
        // 日照分析
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/basic/analysis/sunshine-analysis/index.vue"))),
        name: "sunshine-analysis"
      },
      {
        // 可视域分析
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/basic/analysis/visual-analysis/index.vue"))),
        name: "visual-analysis"
      },
      {
        // 方量分析
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/basic/analysis/volume-analysis/index.vue"))),
        name: "volume-analysis"
      },
      {
        // 地形开挖
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/basic/analysis/dig-analysis/index.vue"))),
        name: "dig-analysis"
      },
      {
        // 地表透明
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/basic/analysis/surface-transparency/index.vue"))),
        name: "surface-transparency"
      },
      {
        // 坡度坡向分析
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/basic/analysis/slope-aspect/index.vue"))),
        name: "slope-aspect"
      },
      {
        // 淹没分析
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/basic/analysis/inundation-analysis/index.vue"))),
        name: "inundation-analysis"
      },
      {
        // 开敞度分析
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/basic/analysis/openness-analysis/index.vue"))),
        name: "openness-analysis"
      },
      {
        // 天际线分析
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/basic/analysis/skyline-analysis/index.vue"))),
        name: "skyline-analysis"
      },
      {
        // 图层编辑
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/basic/graphic-editor/index.vue"))),
        name: "graphic-editor"
      },
      {
        // 无人机航飞 demo
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/flight-demo/index.vue"))),
        name: "flight-demo",
        group: "tools"
      },
      {
        // 手动航线规划
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/route-planning/index.vue"))),
        name: "route-planning",
        group: "route",
        disableOther: ["route-management"]
      },
      {
        // 航线管理
        component: markRaw(defineAsyncComponent(() => import("@mars/widgets/route-management/index.vue"))),
        name: "route-management",
        group: "route",
        disableOther: ["route-planning"]
      }
    ],
    openAtStart: ["toolbar", "query-poi"]
  }
}

export default store
