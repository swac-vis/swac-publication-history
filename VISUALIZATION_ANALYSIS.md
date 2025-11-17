# SWAC可视化实现分析 (Visualization Implementation Analysis)

## 📊 架构概述 (Architecture Overview)

### 核心技术栈
- **D3.js v7**: 数据驱动的可视化库
- **SVG**: 矢量图形渲染
- **JavaScript ES6+**: 面向对象设计（Class-based）
- **HTML5/CSS3**: 响应式布局和样式

### 核心类: `SWACVisualization`
一个完整的可视化类，封装了所有功能模块。

---

## 🎨 可视化类型: Stream Graph (流图)

### 什么是Stream Graph？
Stream Graph是一种堆叠面积图（Stacked Area Chart）的变体，特点：
- **居中基线**: 使用`stackOffsetSilhouette`，图形在零基线上下对称分布
- **平滑曲线**: 使用`curveCatmullRom.alpha(0.5)`实现平滑过渡
- **视觉平衡**: 多个系列重叠时形成"河流"般的流动效果

### 数据准备流程 (`prepareData()`)

```javascript
1. 根据当前维度（series/topics/type/author）收集数据
2. 按年份统计每个维度的数量
3. 选择Top 12个值（按总数排序）
4. 创建堆叠数据结构（stackedData）
5. 支持图例筛选（selectedCategories）
```

### 渲染流程 (`createStreamGraph()`)

```javascript
1. 创建D3 Stack生成器
   - keys: 选择的维度值
   - order: stackOrderInsideOut（内部到外部排序）
   - offset: stackOffsetSilhouette（居中基线）

2. 生成堆叠数据系列
   - 每个系列包含 [y0, y1] 数组
   - y0: 下边界，y1: 上边界

3. 创建Area路径生成器
   - x: 年份映射到X轴
   - y0/y1: 堆叠边界映射到Y轴
   - curve: Catmull-Rom平滑曲线

4. 绘制SVG路径
   - 每个系列一个<path>元素
   - 颜色来自统一的vintage调色板

5. 添加关键词标注
   - 在流图上放置关键词标签
   - 基于标题提取的高频词
   - 智能避让重叠
```

---

## 🎯 多维度视图 (Multi-Dimensional Views)

### 支持的维度
1. **Series (系列)**: 43个不同的出版系列
2. **Topics (主题)**: 12个主题分类
3. **Type (类型)**: 13种文档类型
4. **Author (作者)**: 主要作者/协调人

### 维度切换机制
- 切换维度时重新计算数据
- 自动选择Top 12个值
- 更新颜色映射
- 重置选择状态

---

## 🎬 动画播放功能 (Playback Animation)

### 实现原理
```javascript
1. 使用SVG clipPath（裁剪路径）控制可见区域
2. clipPath的宽度动态变化，从0到完整宽度
3. 每50ms更新一次，实现~20fps的动画
4. 左上角显示当前年份（corner-year）
```

### 播放流程
```
开始播放 → 创建完整图形 → 应用clipPath → 
逐年扩展clipPath宽度 → 更新年份指示器 → 
到达终点 → 移除clipPath → 显示完整视图
```

### 技术细节
- **clipPath**: SVG裁剪路径，限制图形可见区域
- **requestAnimationFrame**: 平滑动画帧
- **setTimeout**: 控制播放速度（50ms延迟）
- **过渡动画**: clipPath宽度使用D3 transition平滑变化

---

## 🔍 交互功能 (Interactions)

### 1. 悬停提示 (Tooltip)
- **触发**: 鼠标悬停在流图区域
- **内容**: 显示维度值、年份、数量
- **位置**: 跟随鼠标移动
- **样式**: 深色半透明背景，白色文字

### 2. 点击选择 (Click Selection)
- **单次点击**: 选中某个流，高亮显示，其他流变透明
- **再次点击**: 取消选择，恢复所有流的显示
- **视觉反馈**: 
  - 选中: opacity=1, stroke-width=2.5, stroke-color=#8c6d5a
  - 未选中: opacity=0（其他流隐藏）

### 3. 双击查看 (Double-Click)
- **功能**: 显示该维度值在特定年份的出版物列表
- **过滤**: 根据当前维度和年份过滤数据
- **展示**: 弹出覆盖层，显示出版物列表

### 4. 图例交互 (Legend Interaction)
- **点击图例项**: 切换该系列的显示/隐藏
- **筛选逻辑**: 使用`selectedCategories` Set存储选中项
- **视觉反馈**: 
  - 选中: opacity=1
  - 未选中: opacity=0.3

---

## 📝 关键词标注 (Keyword Annotation)

### 提取算法 (`extractKeywordCountsFromTitles()`)
```javascript
1. 合并所有标题文本
2. 提取单词（支持法语重音字符）
3. 过滤停用词（英语+法语）
4. 过滤短词（长度>4）
5. 统计词频
6. 返回Top关键词及其计数
```

### 放置算法 (`addStreamKeywords()`)
```javascript
1. 遍历每个流和每个年份
2. 找到该流在该年份的出版物
3. 提取关键词
4. 计算流的Y位置（band center）
5. 尝试多个垂直偏移位置
6. 检测重叠（使用bounding box）
7. 放置第一个不重叠的位置
8. 字体大小根据词频动态调整（10px-28px）
```

### 视觉效果
- **字体**: 白色文字，黑色描边（提高可读性）
- **大小**: 根据词频动态调整
- **位置**: 在流的中心区域，避免重叠
- **限制**: 如果无法放置，跳过以保持清晰

---

## 🎯 关键事件检测 (Key Events Detection)

### 事件类型

#### 1. 峰值年份 (Peak Years)
```javascript
检测条件:
- 局部最大值（比前后年份都高）
- 总数量 > 20
- 增长率 > 30%

标记: 红色圆点 (#b3574d)
```

#### 2. 首次出现 (First Appearance)
```javascript
检测条件:
- Top流系列的首个非零年份
- 出现在数据集的早期（前5年）

标记: 黄色圆点 (#d29a4c)
```

#### 3. 主题转变 (Topic Shifts)
```javascript
检测算法:
- 计算每年主题分布的向量
- 使用余弦相似度比较相邻年份
- 相似度变化 > 0.35 视为显著转变
- 提取转变年份的Top关键词

标记: 蓝色圆点 (#5f87a7)
```

### 事件标记可视化
- **位置**: 图表顶部的时间轴带（bandY = -14）
- **连线**: 虚线从图表顶部连接到标记点
- **悬停**: 显示事件详情（年份、类型、描述）
- **标注**: 每隔一个事件显示年份标签

---

## 🎨 视觉设计 (Visual Design)

### 配色方案 (Vintage Newspaper Theme)
```javascript
统一调色板（20种颜色）:
- 赤陶红: #b3574d, #c56a5a
- 赭石黄: #d29a4c, #d8aa59, #e0be7a
- 灰尘蓝: #4f6d88, #5f87a7, #6b8fa2
- 鼠尾草绿: #5f8066, #6f9589, #86a993
- 淡紫红: #7a5f7f, #94707a
- 米色中性: #c7b59d, #b2987a, #9a7f63, #d3c4b4
- 支持灰: #848683, #9a9c99
```

### 设计特点
- **背景色**: #f5f0e6（暖米色）
- **容器背景**: #fbf7ef（浅米色）
- **字体**: Georgia serif（传统报纸风格）
- **混合模式**: `mix-blend-mode: multiply`（印刷效果）
- **透明度**: 默认0.88，悬停时1.0

### 响应式设计
- **移动端**: 
  - 容器高度: 600px → 400px
  - 控件垂直排列
  - 统计信息垂直堆叠

---

## 📊 数据统计 (Statistics)

### 底部统计栏
- **Total Publications**: 总出版物数（来自metadata）
- **Years Spanned**: 年份范围（min-max）
- **Current Dimension**: 当前选择的维度

### 实时更新
- 切换维度时更新统计
- 数据来自`data.metadata`

---

## 🎭 故事旅程 (Story Journeys)

### 功能
- **Story Journeys按钮**: 显示预定义的故事菜单
- **故事类型**:
  1. The Rise of Urban Research (城市研究兴起)
  2. Series Evolution (系列演变)
  3. Document Types Transformation (文档类型转变)

### 实现
- 点击按钮显示覆盖菜单
- 选择故事后：
  - 切换维度（如需要）
  - 高亮相关流
  - 显示叙述文本
  - 自动隐藏（6秒后）

---

## 🔧 技术细节 (Technical Details)

### SVG结构
```html
<svg>
  <defs>
    <clipPath id="year-clip">
      <rect /> <!-- 动态宽度控制可见区域 -->
    </clipPath>
  </defs>
  <g transform="translate(margin)">
    <!-- 流图路径 -->
    <path class="stream-area" />
    <!-- 关键词文本 -->
    <text class="stream-keyword" />
    <!-- 事件标记 -->
    <circle class="event-marker" />
    <!-- 坐标轴 -->
    <g class="axis" />
    <!-- 网格线 -->
    <line class="year-marker" />
  </g>
  <!-- 年份指示器 -->
  <text class="corner-year" />
</svg>
```

### 坐标系统
- **X轴**: 年份（线性比例尺）
  - Domain: [year_range.min, year_range.max]
  - Range: [0, width]
  
- **Y轴**: 数量（线性比例尺）
  - Domain: [yMin, yMax]（动态计算，允许负值）
  - Range: [height, 0]

### 性能优化
- **数据过滤**: 只显示Top 12个值
- **动画优化**: 使用requestAnimationFrame
- **事件限制**: 最多显示10个关键事件
- **关键词限制**: 每个流每年最多1个关键词

---

## 🎯 核心方法总结

| 方法 | 功能 |
|------|------|
| `prepareData()` | 准备堆叠数据 |
| `createStreamGraph()` | 创建流图 |
| `addAxes()` | 添加坐标轴和网格 |
| `addStreamKeywords()` | 添加关键词标注 |
| `addKeyEventMarkers()` | 添加关键事件标记 |
| `detectKeyEvents()` | 检测关键事件 |
| `detectTopicShifts()` | 检测主题转变 |
| `extractKeywordCountsFromTitles()` | 提取关键词 |
| `togglePlayback()` | 切换播放状态 |
| `animateStep()` | 动画步骤 |
| `updateVisualization()` | 更新可视化 |
| `updateLegend()` | 更新图例 |
| `showPublicationList()` | 显示出版物列表 |
| `selectStream()` | 选择流 |
| `showTooltip()` | 显示提示 |
| `showNarrative()` | 显示叙述 |

---

## 🚀 使用流程

1. **加载数据**: `d3.json('swac_data.json')`
2. **初始化**: `new SWACVisualization(data)`
3. **渲染**: 自动调用`updateVisualization()`
4. **交互**: 用户通过控件和鼠标交互
5. **更新**: 切换维度或筛选时重新渲染

---

## 📈 数据流

```
swac_data.json
  ↓
SWACVisualization constructor
  ↓
prepareData() → 处理原始数据
  ↓
createStreamGraph() → 生成SVG路径
  ↓
addStreamKeywords() → 添加关键词
  ↓
addKeyEventMarkers() → 添加事件标记
  ↓
addAxes() → 添加坐标轴
  ↓
updateLegend() → 更新图例
  ↓
用户交互 → 触发更新
```

---

## 🎨 设计哲学

1. **简约**: 干净的界面，减少视觉干扰
2. **叙事**: 通过动画和事件标记讲述故事
3. **探索**: 多维度视图支持深入探索
4. **美观**: 复古报纸风格，温暖色调
5. **交互**: 丰富的交互功能，但不复杂

---

## 🔮 未来改进方向

1. **性能优化**: 
   - 大数据集的分页/虚拟滚动
   - Web Workers处理关键词提取
   
2. **功能增强**:
   - 更多故事旅程
   - 导出功能（PNG/SVG）
   - 数据筛选器（年份范围、主题组合）
   
3. **用户体验**:
   - 加载动画
   - 更详细的数据提示
   - 键盘快捷键支持

---

## 📝 总结

这是一个功能完整、设计精美的数据可视化应用，结合了：
- **流图的优雅**: 平滑的曲线和流动感
- **多维度探索**: 四个不同视角分析数据
- **智能标注**: 自动提取和放置关键词
- **事件检测**: 自动识别重要年份和转变
- **交互体验**: 丰富的鼠标交互和动画
- **视觉设计**: 统一的复古风格调色板

通过Stream Graph的形式，将47年的出版历史以直观、美观的方式呈现，支持用户从多个角度探索数据，发现趋势和模式。

