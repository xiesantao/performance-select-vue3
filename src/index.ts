import type { App, Plugin } from 'vue'
import PerformanceSelect from './PerformanceSelect.vue'

export type PerformanceSelectPrimitive = string | number
export type PerformanceSelectFilterKey = '' | 'labelText' | 'valueText'
export type PerformanceSelectSingleValue = PerformanceSelectPrimitive | '' | null | undefined
export type PerformanceSelectMultipleValue = PerformanceSelectPrimitive[]
export type PerformanceSelectModelValue =
  | PerformanceSelectSingleValue
  | PerformanceSelectMultipleValue

export interface PerformanceSelectOption {
  [key: string]: unknown
}

export { PerformanceSelect }

const PerformanceSelectPlugin: Plugin = {
  install(app: App) {
    app.component('PerformanceSelect', PerformanceSelect)
  },
}

export default PerformanceSelectPlugin
