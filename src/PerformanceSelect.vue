<template>
  <div class="customSelectBox" ref="rootRef">
    <div
      :class="['top', customDisabled ? 'disabled' : '', isFocus ? 'focused' : '']"
      @click="activateInput"
    >
      <div class="multipleBox" v-if="multiple">
        <span
          :class="['selectedItem', customDisabled ? 'disabledBg' : '']"
          v-for="item in Array.isArray(renderLabel) ? renderLabel : []"
          :key="item.__selectKey"
        >
          {{
            item.noMatch
              ? item[valueText]
              : inLabelShowValue
                ? "(" + item[valueText] + ")" + item[labelText]
                : item[labelText]
          }}
          <button
            v-if="!customDisabled"
            class="delete"
            type="button"
            @mousedown.stop.prevent
            @click.stop.prevent="deleteMultipleItem(item.__selectIndex ?? -1)"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" class="icon-svg">
              <path
                d="M4 4l8 8M12 4L4 12"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </span>
        <input
          :class="['input', !canFilterAble || !isFocus ? 'hide' : '']"
          ref="inputRef"
          v-model="searchValue"
          :disabled="customDisabled"
          @input="onInput"
          @focus="handleFocus"
        />
        <p v-if="!isFocus && !haveValue" class="placeholder">
          {{ placeholder }}
        </p>
      </div>

      <label
        :class="['singleBox', isFocus && canFilterAble ? 'focus' : '']"
        v-else
      >
        <input
          class="input"
          ref="inputRef"
          v-model="searchValue"
          @input="onInput"
          :disabled="customDisabled"
          @focus="handleFocus"
        />
        <p
          :class="['renderText', !haveValue ? 'placeholder' : '']"
          :title="displayText"
        >
          {{ !haveValue ? placeholder : displayText }}
        </p>
      </label>

      <button
        v-if="!isFocus"
        type="button"
        @click.stop="toggleCollapse"
        :class="['icon', 'down', haveValue && !customDisabled && 'isHide']"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" class="icon-svg">
          <path
            d="M4 6l4 4 4-4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <span
        v-else
        :class="['icon', 'down', haveValue && !customDisabled && 'isHide']"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" class="icon-svg">
          <path
            d="M4 10l4-4 4 4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <button
        v-if="haveValue && !customDisabled"
        class="icon clear"
        type="button"
        @click.stop="clear"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" class="icon-svg">
          <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.12" />
          <path
            d="M5 5l6 6M11 5L5 11"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <Transition name="select-pop">
      <div
        v-if="isFocus"
        ref="contentRef"
        :class="[
          'customSelectContentList',
          `placement-${placement}`,
          `align-${alignment}`,
        ]"
      >
        <span class="list-arrow"></span>
        <div class="list-inner">
          <div ref="scrollBoxRef" @scroll="handleScrollMore" class="selectContent">
            <ul v-if="showDataBox" class="listBox">
              <li
                v-for="item in remote ? options : renderOptions"
                :key="item[valueText]"
                :class="[
                  'listItem',
                  isSameValue(mouseActive, item[valueText]) ? 'isHover' : '',
                  (
                    multiple
                      ? Array.isArray(modelValue) &&
                        modelValue.some((item2) => isSameValue(item2, item[valueText]))
                      : isSameValue(modelValue, item[valueText])
                  )
                    ? 'active'
                    : '',
                ]"
                @mouseenter="itemMouseenter(item)"
                @click="itemClick(item)"
              >
                <p class="text">
                  {{ props.inLabelShowValue ? `(${item[valueText]})` : "" }}{{ item[labelText] }}
                </p>
                <span
                  v-if="
                    multiple &&
                    Array.isArray(modelValue) &&
                    modelValue.some((item2) => isSameValue(item2, item[valueText]))
                  "
                  class="selected"
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true" class="icon-svg">
                    <path
                      d="M3 8.4l3 3.1 7-7"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </li>
              <li class="loadingBox" v-if="loadingMore">
                <div class="loading-animation">
                  <span class="loading-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" class="icon-svg">
                      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-opacity="0.2" stroke-width="2" />
                      <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                  </span>
                  <span>加载中...</span>
                </div>
              </li>
            </ul>
            <template v-else>
              <div class="loadingBox waitData" v-if="loadingData">
                <div class="loading-animation">
                  <span class="loading-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" class="icon-svg">
                      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-opacity="0.2" stroke-width="2" />
                      <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                  </span>
                  <span>加载中...</span>
                </div>
              </div>
              <div v-else class="emptyBox">暂无数据</div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { PropType } from 'vue'

interface SelectItem {
  label?: string
  value?: string | number
  __selectIndex?: number
  __selectKey?: string
  [key: string]: any
}

const props = defineProps({
  options: {
    type: Array as PropType<SelectItem[]>,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
  labelText: {
    type: String,
    default: 'label',
  },
  valueText: {
    type: String,
    default: 'value',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  inLabelShowValue: {
    type: Boolean,
    default: false,
  },
  remote: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  filterable: {
    type: Boolean,
    default: false,
  },
  filterKey: {
    type: String,
    default: '',
    validator(value: string) {
      return ['', 'labelText', 'valueText'].includes(value)
    },
  },
  isInit: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['change', 'loadMore', 'filter', 'init', 'close'])

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: number | null = null
  return (...args: Parameters<T>) => {
    if (timer) {
      window.clearTimeout(timer)
    }
    timer = window.setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

function isSameValue(left: unknown, right: unknown) {
  return Object.is(left, right)
}

function findOptionByValue(value: unknown) {
  return props.options.find((item) => isSameValue(item[props.valueText], value))
}

function createMultipleRenderItem(value: unknown, index: number): SelectItem {
  const selectKey = `${typeof value}:${String(value)}:${index}`
  const found = findOptionByValue(value)

  if (found) {
    return {
      ...found,
      __selectIndex: index,
      __selectKey: selectKey,
    }
  }

  return {
    [props.labelText]: value,
    [props.valueText]: value,
    noMatch: true,
    __selectIndex: index,
    __selectKey: selectKey,
  }
}

const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const scrollBoxRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

const placement = ref<'top' | 'bottom'>('bottom')
const alignment = ref<'start' | 'end'>('start')
const mouseActive = ref<any>(null)
const renderOptions = ref<SelectItem[]>([])
const loadingMore = ref(false)
const loadingData = ref(false)
const searchValue = ref('')
const isFocus = ref(false)

const modelValue = defineModel<any>({
  get(value) {
    if (props.multiple && !Array.isArray(value)) {
      console.error('多选应传入数组')
    }
    if (!props.multiple && Array.isArray(value)) {
      console.error('单选应传入字符串|undefined|null')
    }
    return value
  },
})

watch(
  () => props.isInit,
  (val) => {
    loadingData.value = val
  },
)

watch(
  () => modelValue.value,
  (val) => {
    if (!val) {
      searchValue.value = ''
      renderOptions.value = []
      mouseActive.value = null
    }
  },
)

watch(
  () => props.loading,
  (val) => {
    loadingMore.value = val
  },
)

const showDataBox = computed(() => {
  return props.remote ? props.options?.length > 0 : renderOptions.value?.length > 0
})

const canFilterAble = computed(() => {
  return props.options.length > 10 || props.filterable
})

const customDisabled = computed(() => {
  return props.disabled
})

const haveValue = computed(() => {
  if (props.multiple) {
    return Array.isArray(modelValue.value) ? modelValue.value.length > 0 : false
  }
  return String(modelValue.value ?? '') ? true : false
})

const singleSelectRenderLabel = computed(() => {
  if (modelValue.value === undefined || modelValue.value === null || modelValue.value === '') {
    return []
  }
  return props.options.filter((item) => isSameValue(item[props.valueText], modelValue.value))
})

const multipleSelectRenderLabel = computed(() => {
  const values = Array.isArray(modelValue.value) ? modelValue.value : []
  return values.map((value, index) => createMultipleRenderItem(value, index))
})

const renderLabel = computed<SelectItem[]>(() => {
  return props.multiple ? multipleSelectRenderLabel.value : singleSelectRenderLabel.value
})

const displayText = computed(() => {
  if (!renderLabel.value?.length) return ''
  const current = renderLabel.value[0]
  return props.inLabelShowValue
    ? `(${current[props.valueText]})${current[props.labelText]}`
    : `${current[props.labelText]}`
})

const updatePlacement = () => {
  if (!rootRef.value || !contentRef.value) return
  const triggerRect = rootRef.value.getBoundingClientRect()
  const panelRect = contentRef.value.getBoundingClientRect()
  const panelHeight = Math.min(panelRect.height || 300, 300)
  const panelWidth = panelRect.width || Math.max(triggerRect.width, 300)
  const gap = 6

  const spaceBelow = window.innerHeight - triggerRect.bottom - gap
  const spaceAbove = triggerRect.top - gap
  placement.value =
    spaceBelow < panelHeight && spaceAbove > spaceBelow ? 'top' : 'bottom'

  const overflowRight = triggerRect.left + panelWidth > window.innerWidth - 8
  const overflowLeft = triggerRect.right - panelWidth < 8
  alignment.value = overflowRight && !overflowLeft ? 'end' : 'start'
}

const handleViewportChange = () => {
  if (!isFocus.value) return
  updatePlacement()
}

watch(isFocus, (val) => {
  if (val) {
    if (!customDisabled.value && ((props.remote && !renderOptions.value?.length) || !props.remote)) {
      initRenderData()
    }
    nextTick(() => {
      updatePlacement()
      window.addEventListener('resize', handleViewportChange)
      window.addEventListener('scroll', handleViewportChange, true)
    })
    return
  }
  window.removeEventListener('resize', handleViewportChange)
  window.removeEventListener('scroll', handleViewportChange, true)
})

watch(
  () => [renderOptions.value?.length, props.options.length, loadingData.value, loadingMore.value],
  () => {
    if (!isFocus.value) return
    nextTick(() => {
      updatePlacement()
    })
  },
)

onMounted(() => {
  document.addEventListener('mousedown', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleDocumentClick)
  window.removeEventListener('resize', handleViewportChange)
  window.removeEventListener('scroll', handleViewportChange, true)
})

function handleDocumentClick(event: MouseEvent) {
  if (!rootRef.value) return
  if (!rootRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

function closeDropdown() {
  isFocus.value = false
  searchValue.value = ''
  mouseActive.value = null
}

function activateInput() {
  if (customDisabled.value) return
  isFocus.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function toggleCollapse() {
  if (customDisabled.value) return
  if (isFocus.value) {
    closeDropdown()
  } else {
    activateInput()
  }
}

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value || ''
  searchChange(value)
}

function itemMouseenter(item: SelectItem) {
  if (!String(modelValue.value)) {
    mouseActive.value = item[props.valueText]
  }
}

function itemClick(data: SelectItem) {
  if (props.multiple) {
    if (Array.isArray(modelValue.value)) {
      let list = [...modelValue.value]
      const existingIndex = list.findIndex((item) => isSameValue(item, data[props.valueText]))
      if (existingIndex > -1) {
        list.splice(existingIndex, 1)
      } else {
        list.push(data[props.valueText])
      }
      handleChange(list)
      modelValue.value = list
    }
  } else {
    modelValue.value = data[props.valueText]
    mouseActive.value = ''
    handleChange(data[props.valueText])
    closeDropdown()
  }
}

const initRenderData = () => {
  if (!isFocus.value) return
  if (props.remote) {
    emit('init')
    return
  }
  loadingData.value = true
  renderOptions.value = props.options.length ? props.options.slice(0, 20) : []
  nextTick(() => {
    loadingData.value = false
  })
}

const deleteMultipleItem = (index: number) => {
  const arr = Array.isArray(modelValue.value) ? [...modelValue.value] : []
  if (index > -1) {
    arr.splice(index, 1)
    modelValue.value = arr
    handleChange(arr)
  }
}

const selectScrollTop = () => {
  if (scrollBoxRef.value) {
    scrollBoxRef.value.scrollTop = 0
  }
}

const searchChange = debounce((val: string) => {
  if (props.remote) {
    emit('filter', val)
    return
  }

  let arr: SelectItem[] = []
  if (val.length > 0) {
    arr = props.options.filter((item: SelectItem) => {
      if (props.filterKey == 'valueText') {
        return String(item[props.valueText]).indexOf(val) > -1
      }
      if (props.filterKey == 'labelText') {
        return String(item[props.labelText]).indexOf(val) > -1
      }
      return (
        String(item[props.labelText]).indexOf(val) > -1 ||
        String(item[props.valueText]).indexOf(val) > -1
      )
    })
  } else {
    arr = props.options.length ? props.options.slice(0, 20) : []
  }

  renderOptions.value = arr
  nextTick(() => {
    selectScrollTop()
  })
}, 300)

const selectLoadMore = debounce(() => {
  if (props.remote) {
    emit('loadMore')
    return
  }
  if (searchValue.value) {
    return
  }
  loadingMore.value = true
  const renderLength = renderOptions.value.length
  const optionsLength = props.options.length
  if (renderLength < optionsLength) {
    renderOptions.value = [
      ...renderOptions.value,
      ...props.options.slice(renderLength, renderLength + 20),
    ]
  }
  nextTick(() => {
    loadingMore.value = false
  })
}, 100)

const clear = () => {
  modelValue.value = props.multiple ? [] : ''
  nextTick(() => {
    handleChange(modelValue.value)
    initRenderData()
  })
}

const handleFocus = () => {
  if (customDisabled.value) return
  isFocus.value = true
}

function handleScrollMore() {
  const el = scrollBoxRef.value
  if (!el) return
  const { scrollHeight, scrollTop, clientHeight } = el
  if (scrollHeight - scrollTop - clientHeight === 0) {
    selectLoadMore()
  }
}

const handleChange = (val: any) => {
  emit('change', val)
}
</script>

<style scoped>
.customSelectBox {
  width: 100%;
  position: relative;
}
.customSelectBox .top {
  width: 100%;
  border-radius: var(--bd-border-radius-base);
  border: 1px solid #d6d9e0;
  padding: 4px 12px;
  min-height: 32px;
  box-sizing: border-box;
  display: flex;
  gap: 6px;
  align-items: center;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.customSelectBox .top:hover {
  border-color: #b9bfce;
}
.customSelectBox .top.focused {
  border-color: #7e93ff;
  box-shadow: 0 0 0 2px rgba(126, 147, 255, 0.15);
}
.customSelectBox .top .multipleBox,
.customSelectBox .top .singleBox {
  width: 100%;
}
.customSelectBox .top .multipleBox .input,
.customSelectBox .top .singleBox .input {
  display: block;
  height: 24px;
  width: 100%;
  border: none;
  outline: none;
  padding: 0;
  color: #333;
  font-size: 14px;
  border-radius: 0;
  background: transparent;
  box-sizing: border-box;
}
.customSelectBox .top .singleBox {
  position: relative;
  height: 24px;
}
.customSelectBox .top .singleBox .renderText {
  width: 100%;
  line-height: 24px;
  margin: 0;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 0;
}
.customSelectBox .top .singleBox .renderText.placeholder {
  color: #adb0b7;
}
.customSelectBox .top .singleBox .input {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  opacity: 0;
}
.customSelectBox .top .singleBox .input.hide {
  width: 0;
  height: 0;
}
.customSelectBox .top .singleBox.focus .input {
  opacity: 1;
}
.customSelectBox .top .multipleBox {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 6px;
  height: auto;
  margin-left: -8px;
}
.customSelectBox .top .multipleBox .selectedItem {
  background: #f4f4f5;
  border-radius: var(--bd-tag-border-radius);
  max-width: 100%;
  height: 22px;
  padding: 0 5px 0 9px;
  position: relative;
  display: block;
  line-height: 22px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: #4f4c4c;
}
.customSelectBox .top .multipleBox .selectedItem.disabledBg {
  background-color: #e1e1e799;
}
.customSelectBox .top .multipleBox .selectedItem .delete {
  color: #999;
  cursor: pointer;
  margin-left: 5px;
  vertical-align: middle;
  border: 0;
  background: transparent;
  padding: 0;
  line-height: 1;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.customSelectBox .top .multipleBox .selectedItem .delete:hover {
  color: #737780;
  background: rgba(0, 0, 0, 0.06);
}
.customSelectBox .top .multipleBox .input {
  display: block;
  height: 24px;
  width: 100%;
  border: none;
  outline: none;
  padding: 0 5px 0 9px;
  box-sizing: border-box;
  color: #333;
  font-size: 14px;
}
.customSelectBox .top .multipleBox .input.hide {
  width: 0;
  height: 0;
}
.customSelectBox .top .multipleBox .placeholder {
  width: 100%;
  line-height: 24px;
  margin: -6px 0 0 0;
  font-size: 14px;
  color: #adb0b7;
}
.customSelectBox .top.disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
}
.customSelectBox .top.disabled .renderText,
.customSelectBox .top.disabled .selectedItem {
  color: #999;
}
.customSelectBox .top .icon {
  color: #bec0c5;
  border: 0;
  background: transparent;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: color 0.2s ease, background-color 0.2s ease;
}
.customSelectBox .top .icon .icon-svg {
  width: 14px;
  height: 14px;
}
.customSelectBox .top .icon.down {
  cursor: pointer;
}
.customSelectBox .top .icon.clear {
  display: none;
}
.customSelectBox .top:hover .isHide {
  display: none;
}
.customSelectBox .top:hover .clear {
  display: inline-flex;
  cursor: pointer;
}
.customSelectBox .top:hover .icon:hover {
  color: #7f879a;
  background: #f1f3f9;
}
</style>

<style>
.bd-form .bd-form-item.is-error .customSelectBox .top {
  border: 0;
  box-shadow: 0 0 0 1px var(--bd-color-danger) inset;
}
.el-form-item.is-error .customSelectBox .top {
  border: 0;
  box-shadow: 0 0 0 1px var(--el-color-danger, #f56c6c) inset;
}
.select-pop-enter-active,
.select-pop-leave-active {
  transition: opacity 0.2s cubic-bezier(0.23, 1, 0.32, 1),
    transform 0.2s cubic-bezier(0.23, 1, 0.32, 1);
}
.select-pop-enter-from,
.select-pop-leave-to {
  opacity: 0;
  transform: scaleY(0.9);
}
.customSelectContentList {
  position: absolute;
  min-width: 300px;
  width: max-content;
  max-width: min(520px, calc(100vw - 16px));
  padding: 0;
  z-index: 30;
  overflow: visible;
}
.customSelectContentList .list-inner {
  border: 1px solid #d6d9e0;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(18, 27, 62, 0.12);
  overflow: hidden;
}
.customSelectContentList .list-arrow {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #fff;
  transform: rotate(45deg);
  z-index: 1;
}
.customSelectContentList.placement-bottom {
  top: calc(100% + 10px);
  transform-origin: top center;
}
.customSelectContentList.placement-bottom .list-arrow {
  top: -5px;
  border-top: 1px solid #d6d9e0;
  border-left: 1px solid #d6d9e0;
}
.customSelectContentList.placement-top {
  bottom: calc(100% + 10px);
  transform-origin: bottom center;
}
.customSelectContentList.placement-top .list-arrow {
  bottom: -5px;
  border-bottom: 1px solid #d6d9e0;
  border-right: 1px solid #d6d9e0;
}
.customSelectContentList.align-start {
  left: 0;
}
.customSelectContentList.align-start .list-arrow {
  left: 16px;
}
.customSelectContentList.align-end {
  right: 0;
}
.customSelectContentList.align-end .list-arrow {
  right: 16px;
}
.customSelectContentList .selectContent {
  max-height: 300px;
  overflow: auto;
  text-align: left;
}
.customSelectContentList .selectContent .listBox {
  width: 100%;
  margin: 0;
  padding: 0;
}
.customSelectContentList .selectContent .listBox .listItem {
  font-size: var(--bd-font-size-base, 14px);
  padding: 0 20px;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.customSelectContentList .selectContent .listBox .listItem.isHover,
.customSelectContentList .selectContent .listBox .listItem:hover {
  background-color: var(--bd-fill-color-light, #f5f7fa);
}
.customSelectContentList .selectContent .listBox .listItem.active {
  color: #ac2236;
  font-weight: 700;
  background-color: var(--bd-fill-color-light, #f5f7fa);
}
.customSelectContentList .selectContent .listBox .listItem.active .text,
.customSelectContentList .selectContent .listBox .listItem.active .selected {
  color: #ac2236;
}
.customSelectContentList .selectContent .listBox .listItem .text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--bd-text-color-regular, #606266);
  height: 34px;
  line-height: 34px;
  margin: 0;
}
.customSelectContentList .selectContent .listBox .listItem .selected {
  color: #ac2236;
  width: 16px;
  height: 16px;
}
.customSelectContentList .selectContent .listBox .listItem .selected .icon-svg {
  width: 16px;
  height: 16px;
}
.customSelectContentList .selectContent .loadingBox.waitData {
  height: 228px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.customSelectContentList .selectContent .loadingBox.waitData .loading-animation {
  font-size: 20px;
  color: #999;
}
.customSelectContentList .selectContent .loadingBox .loading-animation {
  display: flex;
  justify-content: center;
  align-items: center;
}
.customSelectContentList .selectContent .loadingBox .loading-icon {
  animation: rotate 1.5s linear infinite;
  margin-right: 8px;
  display: inline-flex;
}
.customSelectContentList .selectContent .loadingBox .loading-icon .icon-svg {
  width: 16px;
  height: 16px;
}
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.customSelectContentList .selectContent .emptyBox {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}
</style>
