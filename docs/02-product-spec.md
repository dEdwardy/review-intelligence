# Product Spec

更新日期：`2026-04-20`

## 1. 产品名称

工作名：

`Review Copilot`

更完整的描述名：

`App Store Review Copilot for Indie Developers`

## 2. 一句话定位

Paste your App Store link, see what users hate, compare competitors, and ship the next fix faster.

## 3. 目标用户

核心用户：

- 独立 iOS / macOS 开发者
- 有英文市场用户
- 手上有 `1-5` 个 app
- 没有专门的数据分析或 PM 团队

不服务的用户：

- 大型团队
- ASO agency
- 需要完整增长分析的平台型用户

## 4. 要解决的核心任务

用户打开产品后，最想完成的是：

1. 看懂自己最近的评论主题
2. 找到最紧急的问题
3. 看懂竞品最近被抱怨什么
4. 得到可直接复制的回复和行动建议

## 5. 核心输入

- 自己的 App Store 链接 `1 个`
- 竞品 App Store 链接 `0-3 个`
- 时间范围
  - 30 天
  - 90 天
- 可选筛选
  - 全部评论
  - 仅 1-2 星
  - 仅最近版本

## 6. 核心输出

### 6.1 Overview

- 评论总数
- 平均评分
- 1-2 星评论数
- 高频负面主题 Top 5
- 高频正面主题 Top 3

### 6.2 Issue Clusters

每个主题卡片包含：

- 主题名
- 主题类型
  - bug
  - UX
  - pricing
  - performance
  - feature request
  - support
- 评论数
- 占比
- 代表性评论摘要
- 建议动作

### 6.3 Competitor Gap

- 竞品高频抱怨主题
- 自己是否也中招
- 自己还没出现、但值得警惕的主题

### 6.4 Reply Drafts

- 差评回复草稿
- feature request 回复草稿
- pricing complaint 回复草稿

### 6.5 Weekly Summary

输出一段可复制文本，用于：

- changelog
- roadmap note
- Notion weekly note
- Linear planning memo

## 7. MVP 页面结构

### 页面 1：Landing / Input

目标：

- 让用户输入 app 链接
- 快速理解价值
- 发起第一次分析

内容：

- 标题
- 副标题
- 自己 app 链接输入框
- 竞品链接输入框
- 时间范围选择
- 分析按钮

### 页面 2：Analysis Overview

目标：

- 用 30 秒让用户看懂最近发生了什么

内容：

- 核心指标卡
- Top issues
- Top praise
- Summary headline

### 页面 3：Issue Detail

目标：

- 让用户快速定位最值得处理的评论主题

内容：

- 主题列表
- 主题详情
- 代表评论
- 建议动作
- 回复草稿

### 页面 4：Competitor Gap

目标：

- 让用户快速找到竞品漏洞和定位机会

内容：

- 竞品主题对比
- 我有 / 我没有 / 可利用
- 机会摘要

### 页面 5：Export

目标：

- 让用户把结果带走

内容：

- Markdown 导出
- CSV 导出
- 复制周报摘要

## 8. 明确不做

第一版不做：

- 登录后的多团队协作
- 评论自动回复发布
- Apple Ads
- keyword rank tracking
- 下载 / 收入分析
- 多商店统一面板
- Chrome Web Store / Google Play 同时接入

## 9. 成功标准

MVP 是否有效，先看这些：

- 用户能在 3 分钟内完成一次分析
- 用户看完结果后，会说“我知道下一步修什么了”
- 用户愿意复制回复草稿或导出周报
- 用户愿意再次回来跑第二次分析
- 至少有人愿意为竞品对比功能付费

## 10. 产品原则

- 单平台优先于多平台
- 问题排序优先于花哨图表
- 可复制文本优先于复杂可视化
- 行动建议优先于“分析感”
- 轻量优先于全家桶
