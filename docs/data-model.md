# K-12 Math Matrix 数据模型文档

## 1. 建模目标

数据模型必须同时解决 4 个问题：

- 表达从小学到高中的课程树结构
- 表达课标主干与竞赛支线的双主线知识体系
- 表达知识点正文、公式、案例、技巧、媒体等复合内容
- 表达版本、审核、来源、关系变更等运营数据

## 2. 核心实体

### 2.1 CurriculumNode

用于描述课程树节点。

关键字段：

- `id`
- `type`：`stage | grade | module | unit | topic`
- `name`
- `slug`
- `parentId`
- `track`：`standard | olympiad`
- `orderIndex`
- `status`

说明：

- 课标主干和竞赛支线都用同一张表表达
- 通过 `track` 区分主干与支线
- 通过 `parentId` 和 `orderIndex` 构造树

### 2.2 KnowledgePoint

平台最核心实体。

关键字段：

- `id`
- `title`
- `slug`
- `aliases`
- `summary`
- `theoryDoc`
- `methodDoc`
- `difficultyLevel`
- `stage`
- `gradeBand`
- `domain`
- `subdomain`
- `track`
- `status`
- `publishedVersionId`
- `createdBy`
- `updatedBy`
- `createdAt`
- `updatedAt`

说明：

- `theoryDoc`、`methodDoc` 使用 JSONB 存结构化富文本
- `track` 代表主要归属，不等于唯一归属
- 一个知识点可以通过关联表挂到多个课程节点

### 2.3 KnowledgePointCurriculum

知识点与课程树节点的挂接关系。

关键字段：

- `id`
- `knowledgePointId`
- `curriculumNodeId`
- `isPrimary`
- `orderIndex`

用途：

- 支持一个知识点同时出现在课标主线和竞赛支线
- 支持主归属与次归属

### 2.4 Formula

公式实体单独建模，便于复用与索引。

关键字段：

- `id`
- `knowledgePointId`
- `name`
- `latex`
- `plainText`
- `description`
- `usageNote`
- `orderIndex`

### 2.5 Example

案例/例题实体。

关键字段：

- `id`
- `knowledgePointId`
- `title`
- `difficulty`
- `problemDoc`
- `solutionDoc`
- `answerDoc`
- `tags`
- `orderIndex`

### 2.6 Technique

技巧、思路、易错点统一归入技巧实体。

关键字段：

- `id`
- `knowledgePointId`
- `type`：`technique | pitfall | heuristic`
- `title`
- `contentDoc`
- `orderIndex`

### 2.7 DiagramSpec

图形规格实体，用于静态图和交互图。

关键字段：

- `id`
- `knowledgePointId`
- `title`
- `diagramType`：`static-svg | interactive-jsxgraph`
- `specJson`
- `coverAssetId`
- `orderIndex`

说明：

- `specJson` 保存图元、坐标、标注、交互参数
- 静态图和交互图共用一个入口，渲染端按类型分发

### 2.8 MediaAsset

通用媒体资源。

关键字段：

- `id`
- `kind`：`image | thumbnail | attachment`
- `storageKey`
- `mimeType`
- `size`
- `width`
- `height`
- `sourceType`
- `createdAt`

### 2.9 VideoAsset

视频元数据实体。

关键字段：

- `id`
- `knowledgePointId`
- `title`
- `provider`
- `embedUrl`
- `coverAssetId`
- `durationSeconds`
- `chapterMarkers`
- `status`

说明：

- 第一版不存视频文件，只存嵌入信息和业务元数据

### 2.10 RelationEdge

知识点关系边。

关键字段：

- `id`
- `fromKnowledgePointId`
- `toKnowledgePointId`
- `relationType`
- `strength`
- `note`
- `createdBy`

`relationType` 固定为：

- `prerequisite`
- `successor`
- `same-core`
- `application-of`
- `extends`
- `related`

### 2.11 ReviewTask

审核任务实体。

关键字段：

- `id`
- `entityType`
- `entityId`
- `candidateVersionId`
- `status`
- `reviewerId`
- `reviewComment`
- `submittedAt`
- `reviewedAt`

### 2.12 ContentVersion

内容版本实体。

关键字段：

- `id`
- `entityType`
- `entityId`
- `versionNumber`
- `snapshotJson`
- `changeSummary`
- `createdBy`
- `createdAt`
- `publishState`

### 2.13 SourceAttribution

来源与版权记录实体。

关键字段：

- `id`
- `entityType`
- `entityId`
- `sourceKind`
- `sourceTitle`
- `sourceUrl`
- `author`
- `licenseNote`
- `citationNote`

## 3. 关系规则

必须遵守以下约束：

- `prerequisite` 不能形成环
- `successor` 由 `prerequisite` 推导，不单独手工维护双向冗余
- `same-core` 必须是对称关系
- `application-of` 必须从应用知识指向基础知识
- `extends` 用于竞赛支线或拓展内容挂接主干知识
- 一个已发布知识点必须至少挂接 1 个课程节点

## 4. 状态机

### 4.1 知识点状态

- `draft`
- `ai_generated`
- `editing`
- `in_review`
- `published`
- `archived`

### 4.2 审核任务状态

- `pending`
- `approved`
- `rejected`
- `changes_requested`

## 5. 搜索索引模型

Meilisearch 文档结构建议如下：

```json
{
  "id": "kp_quadratic_formula",
  "title": "一元二次方程的解法",
  "aliases": ["求根公式", "二次方程解法"],
  "summary": "介绍配方法、公式法和因式分解法。",
  "stage": "初中",
  "gradeBand": "九年级",
  "domain": "数与代数",
  "subdomain": "方程",
  "track": "standard",
  "difficultyLevel": 3,
  "tags": ["必考点", "基础", "公式"],
  "formulaTexts": ["x = (-b ± sqrt(b^2-4ac)) / 2a"],
  "publishedAt": "2026-04-10T00:00:00Z"
}
```

可筛选字段：

- `stage`
- `gradeBand`
- `domain`
- `subdomain`
- `track`
- `difficultyLevel`
- `tags`

## 6. API 草案

### 6.1 前台查询 API

- `GET /api/v1/curriculum/tree?track=standard&stage=primary`
- `GET /api/v1/knowledge/:slug`
- `GET /api/v1/knowledge/:id/relations`
- `GET /api/v1/search?q=勾股定理&stage=middle&track=standard`
- `GET /api/v1/topics/:slug`

### 6.2 后台管理 API

- `POST /api/v1/admin/knowledge`
- `PATCH /api/v1/admin/knowledge/:id`
- `POST /api/v1/admin/knowledge/:id/submit-review`
- `POST /api/v1/admin/review/:taskId/approve`
- `POST /api/v1/admin/review/:taskId/reject`
- `POST /api/v1/admin/knowledge/:id/rollback/:versionId`

### 6.3 AI 任务 API

- `POST /api/v1/admin/ai/generate-knowledge-draft`
- `POST /api/v1/admin/ai/check-content-quality`
- `GET /api/v1/admin/ai/tasks/:taskId`

## 7. 典型返回结构

`GET /api/v1/knowledge/:slug`

```json
{
  "id": "kp_pythagorean_theorem",
  "title": "勾股定理",
  "summary": "直角三角形三边关系的核心定理。",
  "stage": "初中",
  "gradeBand": "八年级",
  "domain": "图形与几何",
  "track": "standard",
  "theoryDoc": {},
  "methodDoc": {},
  "formulas": [],
  "examples": [],
  "techniques": [],
  "diagrams": [],
  "videos": [],
  "relations": {
    "prerequisites": [],
    "sameCore": [],
    "extends": [],
    "applications": []
  },
  "sources": [],
  "version": {
    "id": "ver_12",
    "number": 12,
    "publishedAt": "2026-04-10T00:00:00Z"
  }
}
```

## 8. 索引与约束建议

必须建立的数据库索引：

- `knowledge_point.slug` 唯一索引
- `curriculum_node.parent_id + order_index`
- `knowledge_point_curriculum.knowledge_point_id + curriculum_node_id`
- `relation_edge.from_knowledge_point_id + relation_type`
- `formula.knowledge_point_id + order_index`
- `content_version.entity_type + entity_id + version_number`
- `review_task.status + submitted_at`

## 9. 版本与回滚策略

- 每次提交审核前创建版本快照
- 审核通过后将该版本标记为 `published`
- 回滚不是直接覆盖，而是创建“回滚后的新版本”
- 所有版本必须保留变更摘要和操作者

## 10. 验收要求

- 任一知识点能完整挂接课程节点、关系边、媒体资源和版本记录
- 搜索索引可以从已发布实体稳定重建
- 审核流不依赖人工口头协作，完全依赖状态和任务记录
- 关系变更、版本发布、媒体替换均可审计
