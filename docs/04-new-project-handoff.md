# New Project Handoff

更新日期：`2026-04-20`

## 1. 新项目目标

准备单独创建一个新仓库，开发：

`App Store Review Copilot for Indie Developers`

目标不是做全量 ASO 平台，而是做一个极轻量的评论 intelligence 工具。

## 2. 新仓库建议包含的文档

建议把这个目录下 4 份文档直接带过去：

- `README.md`
- `01-market-validation.md`
- `02-product-spec.md`
- `03-mvp-build-plan.md`
- `04-new-project-handoff.md`

如果你想更干净，也可以只带：

- `README.md`
- `02-product-spec.md`
- `03-mvp-build-plan.md`

## 3. 新仓库建议结构

```text
review-copilot/
  app/
  components/
  lib/
    appstore/
    analysis/
    export/
  public/
  docs/
  scripts/
  README.md
```

## 4. 代码层建议的第一批模块

- `lib/appstore/url.ts`
  解析 App Store 链接和 app id

- `lib/appstore/fetch.ts`
  获取 app 基础信息和评论

- `lib/analysis/normalize.ts`
  标准化评论结构

- `lib/analysis/cluster.ts`
  主题聚类

- `lib/analysis/summary.ts`
  生成摘要和 top issues

- `lib/analysis/replies.ts`
  生成回复草稿

- `lib/export/markdown.ts`
  生成可复制报告

## 5. 新项目初始化任务

第一批任务建议直接写成 issue：

1. 建立 Next.js 项目和基础页面
2. 完成 App Store 链接解析
3. 完成评论抓取和标准化
4. 输出 Top issues 和 summary
5. 生成 reply drafts
6. 输出 Markdown 报告
7. 部署到可公开访问环境

## 6. 第一版不要纠结的事情

- 不要先想团队权限
- 不要先做完整登录流程
- 不要先做复杂数据库
- 不要先做特别重的图表
- 不要先优化多平台扩展性

## 7. 第一版最重要的事

第一版最重要的不是“功能全”，而是：

- 输入快
- 输出快
- 结果一眼能看懂
- 建议可以直接拿去行动

## 8. 可直接复制给 AI 的项目 brief

```md
Build a minimal MVP called "App Store Review Copilot for Indie Developers".

The product helps indie iOS/macOS developers understand recent App Store reviews, identify the top repeated issues, compare competitor complaints, and generate English reply drafts plus a short action summary.

Scope for v0.1:
- Input one App Store URL for the user's app
- Optionally input up to 3 competitor App Store URLs
- Fetch recent reviews
- Normalize and cluster reviews into categories such as bug, UX, pricing, performance, feature request, and support
- Show top issue clusters with counts and summaries
- Generate reply drafts for common negative reviews
- Export a Markdown report

Do not build:
- Full ASO platform features
- Keyword rank tracking
- Download/revenue analytics
- Team collaboration
- Multi-platform review aggregation

Keep the UI simple and fast. Focus on action-oriented outputs rather than dashboards for their own sake.
```

## 9. 我对新项目的建议命名

工作名可以先随便一点，后面再换：

- `review-copilot`
- `app-review-copilot`
- `indie-review-intelligence`
- `store-review-copilot`

## 10. 下一步建议

你新开项目之后，第一轮最值得先做的不是代码细节讨论，而是：

1. 先把输入和输出跑通
2. 先让一个真实 app 链接能出结果
3. 再看结果是否足够“让人想付费”

如果结果还不够强，优先改输出质量，而不是继续加功能。
