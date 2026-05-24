/**
 * 响应式断点 composable
 * 提供组件 setup() 中可用的响应式断点状态
 *
 * 与 themes/responsive.less 中的 CSS 变量保持同步：
 *   xs : < 768
 *   sm : 768  - 1280
 *   md : 1280 - 1440
 *   lg : 1440 - 1680
 *   xl : 1680 - 1920
 *   xxl: >= 1920
 *
 * 使用：
 *   const { breakpoint, isIconOnly, width } = useBreakpoint()
 *   isIconOnly.value === true  // 极窄屏，菜单切换为图标-only
 */
import { ref, computed, onMounted, onBeforeUnmount } from "vue"

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "xxl"

const BP = {
  xs: 768,
  sm: 1280,
  md: 1440,
  lg: 1680,
  xl: 1920
} as const

function resolveBreakpoint(w: number): Breakpoint {
  if (w < BP.xs) {
    return "xs"
  }
  if (w < BP.sm) {
    return "sm"
  }
  if (w < BP.md) {
    return "md"
  }
  if (w < BP.lg) {
    return "lg"
  }
  if (w < BP.xl) {
    return "xl"
  }
  return "xxl"
}

export default function useBreakpoint() {
  const width = ref(typeof window !== "undefined" ? window.innerWidth : 1920)
  const height = ref(typeof window !== "undefined" ? window.innerHeight : 1080)

  const update = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  let raf = 0
  const onResize = () => {
    if (raf) {
      cancelAnimationFrame(raf)
    }
    raf = requestAnimationFrame(update)
  }

  onMounted(() => {
    update()
    window.addEventListener("resize", onResize, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener("resize", onResize)
    if (raf) {
      cancelAnimationFrame(raf)
    }
  })

  const breakpoint = computed<Breakpoint>(() => resolveBreakpoint(width.value))

  // 极窄屏：右侧菜单切换为图标-only 模式
  const isIconOnly = computed(() => width.value < BP.xs)

  // 中等屏：开始压缩间距与字号台阶（仅用于布局判断，非字号本身）
  const isCompact = computed(() => width.value < BP.sm)

  return {
    width,
    height,
    breakpoint,
    isIconOnly,
    isCompact
  }
}
