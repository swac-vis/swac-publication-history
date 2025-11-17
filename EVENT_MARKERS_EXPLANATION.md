# 事件标注点编码逻辑说明 (Event Markers Encoding Logic)

## 🎨 颜色编码 (Color Encoding)

事件标注点的颜色根据事件类型自动分配：

| 颜色 | 类型 | 说明 | 检测条件 |
|------|------|------|----------|
| 🔴 **红色** (`#b3574d`) | `peak` | 峰值年份 | 局部最大值，增长>30%，数量>20 |
| 🟠 **橙色/金色** (`#d29a4c`) | `first` | 首次出现 | Top streams的首次出现（前5年） |
| 🔵 **蓝色** (`#5f87a7`) | `topicShift` | 主题转变 | 主题分布重大转变（余弦相似度<0.65） |

## 📅 年份显示逻辑 (Year Label Display)

- **稀疏显示**：只有偶数索引的事件 (`i % 2 === 0`) 显示年份标签
- **原因**：避免视觉混乱，保持图表清晰
- **结果**：约50%的事件显示年份，50%不显示

## 🔍 事件检测逻辑 (Event Detection Logic)

### 1. Peak Events (峰值事件)
```javascript
// 检测局部最大值
- 条件：values[i] > values[i-1] && values[i] > values[i+1]
- 最小数量：values[i] > 20
- 增长要求：totalIncrease > 0.3 (30%)
```

### 2. First Appearance Events (首次出现事件)
```javascript
// 检测top streams的首次出现
- 只显示前5年的首次出现
- 条件：firstYear <= metadata.year_range.min + 5
```

### 3. Topic Shift Events (主题转变事件)
```javascript
// 检测主题分布的重大转变
- 计算相邻年份的主题分布余弦相似度
- 条件：shift > 0.35 (余弦相似度 < 0.65)
- 提取该年份的关键词作为上下文
```

## 📍 代码位置

- **检测逻辑**：`app.js` 第 640-763 行
  - `detectKeyEvents()` - 检测所有事件
  - `detectTopicShifts()` - 检测主题转变
  
- **可视化逻辑**：`app.js` 第 765-903 行
  - `addKeyEventMarkers()` - 添加事件标注点
  - 颜色设置：第 831 行
  - 年份显示：第 892 行

## 🎯 自定义选项

如果需要调整显示逻辑，可以修改：

1. **颜色**：修改第 831 行的颜色值
2. **年份显示频率**：修改第 892 行的 `i % 2 === 0` 条件
3. **检测阈值**：
   - Peak: 第 656-658 行的阈值
   - Topic Shift: 第 747 行的阈值 (0.35)
   - First Appearance: 第 686 行的年份范围

## 💡 建议

- 如果事件太多，可以增加检测阈值
- 如果年份标签太少，可以改为 `i % 3 === 0` 或移除条件
- 如果颜色不够明显，可以调整颜色值

