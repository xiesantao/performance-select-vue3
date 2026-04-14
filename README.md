# performance-select-vue3

一个面向 Vue 3 的高性能下拉选择组件，支持单选、多选、本地筛选、远程搜索和分页加载。

A high-performance select component for Vue 3, supporting single select, multiple select, local filtering, remote search, and incremental loading.

- 仓库地址 / Repository: [https://github.com/xiesantao/performance-select-vue3.git](https://github.com/xiesantao/performance-select-vue3.git)
- 问题反馈 / Issues: [https://github.com/xiesantao/performance-select-vue3/issues](https://github.com/xiesantao/performance-select-vue3/issues)
- 许可证 / License: MIT

## 中文

### 目录

- [特性](#特性)
- [安装](#安装)
- [全局注册](#全局注册)
- [局部引入](#局部引入)
- [多选示例](#多选示例)
- [远程加载示例](#远程加载示例)
- [el-form 联动示例](#el-form-联动示例)
- [Props](#props)
- [v-model 类型说明](#v-model-类型说明)
- [Events](#events)
- [远程模式约定](#远程模式约定)
- [与表单联动](#与表单联动)
- [注意事项](#注意事项)
- [常见问题](#常见问题)
- [构建](#构建)
- [发包前检查](#发包前检查)
- [发布](#发布)
- [版本发布流程](#版本发布流程)
- [English](#english)

### 特性

这个组件当前覆盖的核心能力：

- 单选和多选共用一套 API
- 本地筛选和远程搜索两种数据模式
- 列表分段渲染，避免一次性展示过多选项
- 支持滚动触底加载更多数据
- 支持在标签中展示 value 值
- 内置 element-plus `el-form-item.is-error` 错误态样式联动
- 提供 TypeScript 类型导出，便于业务代码约束 `v-model`

适合这几类场景：

- 选项量较大，但不希望一次性渲染全部列表
- 既要支持本地筛选，也要支持远程搜索
- 需要和业务表单、尤其是 el-form，一起使用
- 希望同时覆盖单选和多选交互

### 安装

```bash
npm install performance-select-vue3
```

环境要求：

- Vue 3.5+
- Node.js 18+

### 全局注册

```ts
import { createApp } from 'vue'
import App from './App.vue'
import PerformanceSelect from 'performance-select-vue3'
import 'performance-select-vue3/style.css'

createApp(App).use(PerformanceSelect).mount('#app')
```

### 局部引入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PerformanceSelect } from 'performance-select-vue3'
import 'performance-select-vue3/style.css'

const value = ref('')
const options = ref([
  { code: 'A01', name: '活动一' },
  { code: 'A02', name: '活动二' },
])
</script>

<template>
  <PerformanceSelect
    v-model="value"
    :options="options"
    labelText="name"
    valueText="code"
    placeholder="请选择"
  />
</template>
```

### 多选示例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PerformanceSelect } from 'performance-select-vue3'
import 'performance-select-vue3/style.css'

const value = ref<string[]>([])
const options = [
  { label: '新品', value: 'new' },
  { label: '促销', value: 'sale' },
  { label: '高复购', value: 'repeat' },
]
</script>

<template>
  <PerformanceSelect
    v-model="value"
    :options="options"
    :multiple="true"
    placeholder="请选择标签"
  />
</template>
```

### 远程加载示例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PerformanceSelect } from 'performance-select-vue3'
import 'performance-select-vue3/style.css'

interface RemoteItem {
  id: string
  name: string
}

const value = ref('')
const options = ref<RemoteItem[]>([])
const loading = ref(false)
const isInit = ref(false)
const pageIndex = ref(1)
const keyword = ref('')
const pageSize = 20

async function queryList(type: 'init' | 'load' = 'load') {
  if (type === 'init') {
    isInit.value = true
    options.value = []
    pageIndex.value = 1
  } else {
    loading.value = true
  }

  const allData = Array.from({ length: 100 }).map((_, index) => ({
    id: `ID-${index + 1}`,
    name: `选项 ${index + 1}`,
  }))

  const filtered = keyword.value
    ? allData.filter((item) => item.id.includes(keyword.value) || item.name.includes(keyword.value))
    : allData

  const start = (pageIndex.value - 1) * pageSize
  const nextData = filtered.slice(start, start + pageSize)

  options.value = [...options.value, ...nextData]
  isInit.value = false
  loading.value = false
}

function handleInit() {
  queryList('init')
}

function handleLoadMore() {
  pageIndex.value += 1
  queryList('load')
}

function handleFilter(val: string) {
  keyword.value = val
  queryList('init')
}
</script>

<template>
  <PerformanceSelect
    v-model="value"
    :remote="true"
    :isInit="isInit"
    :options="options"
    :loading="loading"
    :filterable="true"
    labelText="name"
    valueText="id"
    @init="handleInit"
    @loadMore="handleLoadMore"
    @filter="handleFilter"
  />
</template>
```

### el-form 联动示例

```vue
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElButton, ElForm, ElFormItem } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { PerformanceSelect } from 'performance-select-vue3'
import 'performance-select-vue3/style.css'

const formRef = ref<FormInstance>()
const form = reactive({
  category: '',
  tags: [] as string[],
})

const rules: FormRules = {
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  tags: [{ required: true, type: 'array', min: 1, message: '请至少选择一个标签', trigger: 'change' }],
}

const categoryOptions = [
  { label: '前端开发', value: 'frontend' },
  { label: '后端开发', value: 'backend' },
]

const tagOptions = [
  { label: 'Vue3', value: 'vue3' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'Vite', value: 'vite' },
]
</script>

<template>
  <ElForm ref="formRef" :model="form" :rules="rules" label-width="80px">
    <ElFormItem label="分类" prop="category">
      <PerformanceSelect
        v-model="form.category"
        :options="categoryOptions"
        placeholder="请选择分类"
      />
    </ElFormItem>

    <ElFormItem label="标签" prop="tags">
      <PerformanceSelect
        v-model="form.tags"
        :options="tagOptions"
        :multiple="true"
        placeholder="请选择标签"
      />
    </ElFormItem>

    <ElButton type="primary" @click="formRef?.validate()">提交</ElButton>
  </ElForm>
</template>
```

### Props (English)

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| options | Array | [] | 下拉选项数据 |
| placeholder | string | 请选择 | 占位文本 |
| labelText | string | label | 选项显示字段 |
| valueText | string | value | 选项值字段 |
| disabled | boolean | false | 是否禁用 |
| multiple | boolean | false | 是否多选 |
| inLabelShowValue | boolean | false | 是否在展示标签中显示 value |
| remote | boolean | false | 是否启用远程模式 |
| loading | boolean | false | 远程分页加载状态 |
| filterable | boolean | false | 是否允许输入筛选 |
| filterKey | '' \| 'labelText' \| 'valueText' | '' | 本地筛选匹配字段 |
| isInit | boolean | false | 远程初始化加载状态 |

### v-model 类型说明

| 模式 | 建议类型 | 说明 |
| --- | --- | --- |
| 单选 | string \| number \| '' \| null \| undefined | `multiple=false` 时使用 |
| 多选 | Array<string \| number> | `multiple=true` 时必须传数组 |

组件对外导出的类型包括：

- `PerformanceSelectOption`
- `PerformanceSelectPrimitive`
- `PerformanceSelectFilterKey`
- `PerformanceSelectSingleValue`
- `PerformanceSelectMultipleValue`
- `PerformanceSelectModelValue`

### Events (English)

| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| change | 当前值 | 选中值变化时触发 |
| loadMore | - | 远程模式下滚动到底部触发 |
| filter | keyword | 远程模式下输入变化触发 |
| init | - | 远程模式下首次展开触发 |

### 远程模式约定

当 `remote=true` 时，组件本身不负责请求数据，父组件需要自行维护以下状态：

- `options`: 当前已加载的数据
- `isInit`: 首次展开时的加载状态
- `loading`: 分页追加时的加载状态
- `@init`: 首次展开时触发初始化加载
- `@filter`: 输入变化时触发远程搜索
- `@loadMore`: 滚动到底部时触发下一页加载

推荐接入流程：

1. 在 `@init` 中重置分页和 `options`
2. 在 `@filter` 中重置关键词、分页和 `options`
3. 在 `@loadMore` 中仅追加下一页数据
4. 父组件统一控制 `loading` 和 `isInit`

### 与表单联动

组件内已经包含对 `.el-form-item.is-error` 的错误态样式支持。

如果你在 `element-plus` 的 `el-form` 中使用它，推荐：

- 校验规则使用 `trigger: 'change'`
- `change` 事件中调用 `validateField`
- 多选字段在表单模型中始终使用数组

### 注意事项

- `multiple=true` 时，`v-model` 必须是数组，否则组件会在开发期输出错误提示
- 本地筛选只会改变内部展示集合，不会修改原始 `options`
- `labelText` 和 `valueText` 应始终指向稳定字段
- 远程模式下是否还有更多数据，需要由父组件自己判断
- 如果包被引入后没有样式，通常是因为没有显式引入 `performance-select-vue3/style.css`

### 常见问题

#### 1. 为什么远程模式下下拉展开后没有数据？

因为远程模式的数据源完全由父组件控制。需要同时传入 `remote`、`isInit`、`options`，并监听 `@init`。

#### 2. 为什么多选时表单校验不生效？

通常是因为表单字段不是数组，或者规则没有使用 `trigger: 'change'`。

#### 3. 为什么删除标签后外层值没有更新？

组件会正常触发 `v-model` 和 `change`。如果外层值被回滚，通常是父组件自己的监听逻辑又把旧值写回去了。

### 构建

```bash
npm run build
```

构建后会输出：

- `dist/index.js`
- `dist/index.umd.cjs`
- `dist/style.css`
- `dist/types`

### 发包前检查

建议在发布前至少执行一次：

```bash
npm run pack:preview
```

这会先构建包，再执行 `npm pack --dry-run`，用于确认最终会被发布到 npm 的文件集合。

### 发布

确认以下信息已补齐后再发布：

- `package.json` 中的 `license`
- `package.json` 中的仓库信息，例如 `repository`、`homepage`、`bugs`
- 版本号已经根据变更正确递增

是否需要先发布到 GitHub：

- 不是必须。`npm publish` 本身不依赖 GitHub 仓库。
- 但如果 `package.json` 里保留了 `repository`、`homepage`、`bugs` 这些 GitHub 链接，最好先把对应仓库创建并推送上去，否则 npm 包页上的这些链接会失效。
- 如果你暂时不准备公开 GitHub 仓库，也可以先把这些字段改成真实可访问地址，或者先移除再发包。

建议在正式发布前先确认 npm 登录状态：

```bash
npm whoami
```

发布命令：

```bash
npm run publish:public
```

当前 `publishConfig.access` 已配置为 `public`，并且发布源固定为 npm 官方源。如果未来要发私有源，再按实际仓库策略调整。

### 版本发布流程

推荐流程：

1. 修改代码并完成本地验证
2. 执行版本升级
3. 执行打包预检
4. 发布到 npm

版本升级命令：

```bash
npm run release:patch
npm run release:minor
npm run release:major
```

它们分别对应：

- `patch`: 修复类版本，例如 `0.1.0 -> 0.1.1`
- `minor`: 新增功能但保持兼容，例如 `0.1.0 -> 0.2.0`
- `major`: 存在不兼容变更，例如 `0.1.0 -> 1.0.0`

一次完整发布通常可以按这个顺序执行：

```bash
npm run release:patch
npm run pack:preview
npm run publish:public
```

如果你准备走更完整的开源发布流程，推荐顺序是：

1. 先创建 GitHub 仓库并推送代码
2. 在 npm 上执行 `npm login`
3. 执行 `npm run pack:preview`
4. 执行 `npm run publish:public`

只有在你后续想接入 GitHub Actions 自动发布、README 徽章、Issue 跟踪，或者 npm provenance 这类能力时，GitHub 才会从“建议”变成“基本需要”。

## English

### Overview

`performance-select-vue3` is a Vue 3 select component designed for better behavior with medium-to-large option lists. It supports single select, multi select, local filtering, remote search, incremental loading, and error-state styling inside `element-plus` forms.

### Features

- Unified API for single and multiple selection
- Local filtering and remote search modes
- Incremental list rendering instead of dumping all items at once
- Load-more callback when scrolling to the bottom
- Optional value display inside rendered tags
- Built-in `.el-form-item.is-error` style integration
- Exported TypeScript types for safer `v-model` usage

### Install

```bash
npm install performance-select-vue3
```

Requirements:

- Vue 3.5+
- Node.js 18+

### Global Registration

```ts
import { createApp } from 'vue'
import App from './App.vue'
import PerformanceSelect from 'performance-select-vue3'
import 'performance-select-vue3/style.css'

createApp(App).use(PerformanceSelect).mount('#app')
```

### Local Import

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PerformanceSelect } from 'performance-select-vue3'
import 'performance-select-vue3/style.css'

const value = ref('')
const options = ref([
  { code: 'A01', name: 'Campaign A' },
  { code: 'A02', name: 'Campaign B' },
])
</script>

<template>
  <PerformanceSelect
    v-model="value"
    :options="options"
    labelText="name"
    valueText="code"
    placeholder="Please select"
  />
</template>
```

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| options | Array | [] | Select option list |
| placeholder | string | 请选择 | Placeholder text |
| labelText | string | label | Label field name |
| valueText | string | value | Value field name |
| disabled | boolean | false | Disable the component |
| multiple | boolean | false | Enable multi select |
| inLabelShowValue | boolean | false | Show the value in rendered tags |
| remote | boolean | false | Enable remote mode |
| loading | boolean | false | Loading state for remote pagination |
| filterable | boolean | false | Enable input filtering |
| filterKey | '' \| 'labelText' \| 'valueText' | '' | Local filtering field |
| isInit | boolean | false | Initial loading state in remote mode |

### Events

| Event | Payload | Description |
| --- | --- | --- |
| change | current value | Triggered when selection changes |
| loadMore | - | Triggered when scrolling to bottom in remote mode |
| filter | keyword | Triggered when search text changes in remote mode |
| init | - | Triggered on first open in remote mode |

### v-model Types

- Single mode: `string | number | '' | null | undefined`
- Multiple mode: `Array<string | number>`

Exported types:

- `PerformanceSelectOption`
- `PerformanceSelectPrimitive`
- `PerformanceSelectFilterKey`
- `PerformanceSelectSingleValue`
- `PerformanceSelectMultipleValue`
- `PerformanceSelectModelValue`

### Remote Mode Contract

When `remote=true`, the component does not fetch data by itself. The parent component is responsible for managing:

- `options`
- `isInit`
- `loading`
- `@init`
- `@filter`
- `@loadMore`

Recommended flow:

1. Reset pagination and options inside `@init`
2. Reset keyword, pagination, and options inside `@filter`
3. Append only the next page inside `@loadMore`
4. Let the parent control `loading` and `isInit`

### Form Integration

The component already includes error-state styling for `.el-form-item.is-error`.

Recommended usage with `element-plus` forms:

- Use `trigger: 'change'` in validation rules
- Call `validateField` in change handlers when needed
- Keep multi-select fields as arrays in the form model

### Notes

- When `multiple=true`, `v-model` must be an array
- Local filtering only changes the rendered subset, not the original `options`
- `labelText` and `valueText` should always point to stable fields
- The parent component is responsible for deciding whether more remote data exists
- If styles are missing, check whether `performance-select-vue3/style.css` was imported

### FAQ

#### Why is there no data after opening the dropdown in remote mode?

Because remote mode is fully controlled by the parent. You need to pass `remote`, `isInit`, `options`, and handle `@init`.

#### Why does validation not work in multi-select mode?

Usually because the form field is not an array, or because the validation rule is not using `trigger: 'change'`.

#### Why does the outer value appear unchanged after removing a tag?

The component updates `v-model` and emits `change` correctly. If the value rolls back, the parent component is usually writing the old value back.

### Build

```bash
npm run build
```

Outputs:

- `dist/index.js`
- `dist/index.umd.cjs`
- `dist/style.css`
- `dist/types`

### Preview Before Publish

```bash
npm run pack:preview
```

This builds the package first and then runs `npm pack --dry-run` so you can inspect the final publish content.

### Publish

```bash
npm publish --access public
```

### Release Workflow

```bash
npm run release:patch
npm run pack:preview
npm publish --access public
```
