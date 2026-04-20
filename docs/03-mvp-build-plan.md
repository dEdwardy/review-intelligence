# MVP Build Plan

更新日期：`2026-04-20`

## 1. 开发目标

做一个可以上线演示并开始收费的最小版本。

核心闭环：

1. 用户输入 App Store 链接
2. 系统抓评论
3. 系统聚类和归因
4. 系统生成结论
5. 用户复制结果或导出

## 2. 推荐技术策略

为了更快起步，建议：

- 前端：Next.js
- UI：最简单的 React 页面，不做复杂设计系统
- 后端：Next.js Route Handlers 或最轻量 API 层
- 数据库：先可选，能不加就不加
- 缓存：文件缓存或内存缓存都可以先顶住
- LLM：单模型先跑通主题归类和摘要

原则：

- 先把流程做通
- 不为未来扩展过早设计
- 第一版优先直出结果，不优先“架构美”

## 3. 推荐 MVP 范围

### 必做

- Landing + input form
- App Store 链接解析
- 评论抓取
- 评论标准化
- 主题聚类
- 情绪 / 类型归类
- Summary 输出
- Reply draft 输出
- Markdown 导出

### 可选

- 竞品对比
- CSV 导出
- 时间范围切换
- 星级筛选

### 暂缓

- 登录
- 订阅计费联动
- 邮件周报
- 历史分析记录
- 多平台接入

## 4. 48 小时开发优先级

### Day 1

- 搭页面和基础结构
- 跑通 App Store 链接输入
- 获取评论数据
- 做评论标准化
- 做最基础主题分类和摘要

### Day 2

- 补 issue clusters
- 补 reply drafts
- 补 Markdown 导出
- 补 competitor gap
- 部署可访问版本

## 5. 初版数据模型

### App

- `id`
- `name`
- `store_url`
- `app_store_id`
- `icon_url`

### Review

- `id`
- `app_id`
- `author`
- `title`
- `body`
- `rating`
- `version`
- `created_at`
- `source`

### ReviewCluster

- `id`
- `app_id`
- `label`
- `type`
- `review_count`
- `sentiment`
- `summary`
- `suggested_action`

### AnalysisRun

- `id`
- `app_id`
- `competitor_app_ids`
- `time_range_days`
- `created_at`
- `summary_markdown`

## 6. API / 模块建议

按模块拆，足够了：

- `parseAppStoreUrl()`
- `fetchAppMetadata()`
- `fetchAppReviews()`
- `normalizeReviews()`
- `clusterReviews()`
- `summarizeClusters()`
- `generateReplyDrafts()`
- `buildCompetitorGap()`
- `renderMarkdownReport()`

## 7. 最小页面文案

### Hero

Turn App Store reviews into fixes, replies, and roadmap decisions.

### Subheadline

Paste your app and competitor links. See what users hate, what competitors keep getting wrong, and what to fix next.

### CTA

Analyze my reviews

## 8. 一开始最容易做错的地方

### 错误 1：做成完整 ASO 平台

修正：

- 只做评论 intelligence

### 错误 2：结果太分析化，不够行动化

修正：

- 每个 cluster 必须带 `suggested action`
- 每次分析必须带 `top 5 issues`

### 错误 3：页面太多，首屏价值不清楚

修正：

- 先把输入页和结果页做清楚

### 错误 4：一开始就接太多平台

修正：

- 先锁死 `Apple App Store`

## 9. 开发完成的最低验收标准

- 能输入 App Store 链接并成功跑分析
- 能看到至少 3 个评论主题
- 能生成英文回复草稿
- 能导出 Markdown 结果
- 页面可公开访问

## 10. 如果时间只够做更小版本

那就砍到只剩：

- 单个 app
- 最近 30 天评论
- Top 5 issues
- 3 个回复草稿
- 1 份 Markdown summary

只要这个流程顺，已经可以拿去做用户验证。
