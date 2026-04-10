# K-12 Math Matrix API 接口文档

## 1. 目标

本接口文档用于把现有架构文档和数据模型文档落到可实现层。接口风格固定为 REST，不引入 GraphQL 作为首版主接口。后端实现固定为 `Python + FastAPI`，并默认输出 OpenAPI 文档。接口分为两类：

- 学生前台只读接口
- 教研后台管理接口

统一约束：

- 基础路径：`/api/v1`
- 返回格式：JSON
- 时间格式：ISO 8601 UTC
- 鉴权方式：后台接口使用 `JWT + HttpOnly Cookie`
- 前台只读取 `published` 内容
- 调试文档：`/docs` 与 `/openapi.json` 仅在非生产或受控环境开放

## 2. 通用返回格式

成功响应：

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

失败响应：

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "title is required",
    "details": []
  }
}
```

分页响应：

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

## 3. 认证与权限

### 3.1 登录

`POST /api/v1/auth/login`

请求体：

```json
{
  "email": "editor@example.com",
  "password": "password"
}
```

响应：

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_1",
      "name": "Alice",
      "role": "editor"
    }
  }
}
```

说明：

- 登录成功后由服务端下发 HttpOnly Cookie
- 首版仅支持平台账号登录

### 3.2 当前用户

`GET /api/v1/auth/me`

用途：

- 后台页面初始化
- 权限守卫回显

### 3.3 角色约束

- `student`：只读公开接口
- `editor`：创建、修改、提交审核
- `reviewer`：审核、发布、回滚

## 4. 学生前台接口

### 4.1 获取课程树

`GET /api/v1/curriculum/tree`

查询参数：

- `track`：`standard | olympiad`
- `stage`：`primary | middle | high`
- `depth`：默认 `4`

示例：

`GET /api/v1/curriculum/tree?track=standard&stage=middle`

返回：

```json
{
  "success": true,
  "data": {
    "track": "standard",
    "stage": "middle",
    "nodes": [
      {
        "id": "cur_1",
        "type": "grade",
        "name": "八年级",
        "children": []
      }
    ]
  }
}
```

### 4.2 获取课程节点下的知识点列表

`GET /api/v1/curriculum/nodes/:nodeId/knowledge-points`

查询参数：

- `page`
- `pageSize`
- `difficultyLevel`
- `status`：前台固定忽略，默认只返回已发布

用途：

- 课程目录页
- 专题列表页

### 4.3 获取知识点详情

`GET /api/v1/knowledge/:slug`

返回内容必须聚合：

- 基本信息
- 理论正文
- 方法正文
- 公式
- 案例
- 技巧/易错点
- 图
- 视频
- 关系边
- 来源记录
- 当前发布版本

### 4.4 获取知识点关系图

`GET /api/v1/knowledge/:id/relations`

查询参数：

- `depth`：默认 `1`，最大 `2`
- `types`：逗号分隔的关系类型列表

返回：

```json
{
  "success": true,
  "data": {
    "center": {
      "id": "kp_1",
      "title": "勾股定理"
    },
    "nodes": [],
    "edges": []
  }
}
```

### 4.5 搜索知识点

`GET /api/v1/search`

查询参数：

- `q`
- `stage`
- `gradeBand`
- `domain`
- `subdomain`
- `track`
- `difficultyLevel`
- `tags`
- `page`
- `pageSize`

说明：

- `q` 允许为空，此时按筛选条件查询
- `tags` 使用逗号分隔

### 4.6 获取专题页

`GET /api/v1/topics/:slug`

专题页返回：

- 专题基本信息
- 推荐知识点列表
- 推荐学习顺序
- 关联图谱节点

### 4.7 获取推荐知识点

`GET /api/v1/recommendations/knowledge-points`

查询参数：

- `stage`
- `track`
- `topic`

说明：

- 首版不是个性化推荐
- 默认基于人工配置和内容热度排序

## 5. 教研后台接口

### 5.1 创建知识点

`POST /api/v1/admin/knowledge`

请求体：

```json
{
  "title": "勾股定理",
  "slug": "pythagorean-theorem",
  "summary": "直角三角形三边关系定理。",
  "stage": "middle",
  "gradeBand": "grade-8",
  "domain": "geometry",
  "subdomain": "plane-geometry",
  "track": "standard"
}
```

权限：

- `editor`
- `reviewer`

### 5.2 更新知识点基础信息

`PATCH /api/v1/admin/knowledge/:id`

可更新字段：

- 标题、别名、摘要
- 学段、年级、领域、子领域
- 主归属主线
- 结构化正文

### 5.3 保存理论与方法正文

`PATCH /api/v1/admin/knowledge/:id/content`

请求体：

```json
{
  "theoryDoc": {},
  "methodDoc": {},
  "changeSummary": "补充定义与推导步骤"
}
```

### 5.4 绑定课程节点

`POST /api/v1/admin/knowledge/:id/curriculum-bindings`

请求体：

```json
{
  "bindings": [
    {
      "curriculumNodeId": "cur_1",
      "isPrimary": true,
      "orderIndex": 1
    }
  ]
}
```

说明：

- 支持一个知识点绑定多个课程节点
- 允许同时出现在课标主线和竞赛支线

### 5.5 管理公式

- `POST /api/v1/admin/knowledge/:id/formulas`
- `PATCH /api/v1/admin/formulas/:formulaId`
- `DELETE /api/v1/admin/formulas/:formulaId`

单条公式结构：

```json
{
  "name": "勾股定理公式",
  "latex": "a^2 + b^2 = c^2",
  "plainText": "a^2 + b^2 = c^2",
  "description": "直角三角形三边平方关系",
  "usageNote": "只适用于直角三角形"
}
```

### 5.6 管理案例

- `POST /api/v1/admin/knowledge/:id/examples`
- `PATCH /api/v1/admin/examples/:exampleId`
- `DELETE /api/v1/admin/examples/:exampleId`

### 5.7 管理技巧与易错点

- `POST /api/v1/admin/knowledge/:id/techniques`
- `PATCH /api/v1/admin/techniques/:techniqueId`
- `DELETE /api/v1/admin/techniques/:techniqueId`

### 5.8 管理图形规格

- `POST /api/v1/admin/knowledge/:id/diagrams`
- `PATCH /api/v1/admin/diagrams/:diagramId`
- `DELETE /api/v1/admin/diagrams/:diagramId`

图形规格请求体：

```json
{
  "title": "勾股定理示意图",
  "diagramType": "interactive-jsxgraph",
  "specJson": {},
  "coverAssetId": "asset_1"
}
```

### 5.9 管理视频元数据

- `POST /api/v1/admin/knowledge/:id/videos`
- `PATCH /api/v1/admin/videos/:videoId`
- `DELETE /api/v1/admin/videos/:videoId`

视频请求体：

```json
{
  "title": "勾股定理动画讲解",
  "provider": "bilibili",
  "embedUrl": "https://player.example.com/embed/1",
  "coverAssetId": "asset_2",
  "durationSeconds": 360,
  "chapterMarkers": []
}
```

### 5.10 管理关系边

- `POST /api/v1/admin/knowledge/:id/relations`
- `DELETE /api/v1/admin/relations/:relationId`

请求体：

```json
{
  "toKnowledgePointId": "kp_2",
  "relationType": "prerequisite",
  "strength": 5,
  "note": "学习本知识点前应掌握直角三角形性质"
}
```

关系校验规则：

- `prerequisite` 不允许形成环
- `same-core` 自动补全对称边
- `successor` 不允许手动写入

### 5.11 上传媒体资源

`POST /api/v1/admin/media/presign-upload`

请求体：

```json
{
  "filename": "diagram.svg",
  "mimeType": "image/svg+xml",
  "size": 10240
}
```

返回：

```json
{
  "success": true,
  "data": {
    "assetId": "asset_1",
    "uploadUrl": "https://minio.example.com/presigned",
    "storageKey": "media/2026/04/diagram.svg"
  }
}
```

### 5.12 查询媒体资源

`GET /api/v1/admin/media/assets/:assetId`

用途：

- 媒体中心查看
- 回填图片和封面

## 6. 审核与发布接口

### 6.1 提交审核

`POST /api/v1/admin/knowledge/:id/submit-review`

请求体：

```json
{
  "changeSummary": "补充案例、修正关系边、新增视频"
}
```

服务端行为：

- 创建版本快照
- 状态转为 `in_review`
- 创建 `ReviewTask`
- 投递后续异步检查或索引任务给 Celery

### 6.2 获取待审任务

`GET /api/v1/admin/review/tasks`

查询参数：

- `status`
- `reviewerId`
- `page`
- `pageSize`

### 6.3 查看审核详情

`GET /api/v1/admin/review/tasks/:taskId`

返回：

- 候选版本
- 当前已发布版本
- 差异摘要
- 评论记录

### 6.4 审核通过

`POST /api/v1/admin/review/:taskId/approve`

服务端行为：

- 将候选版本标记为 `published`
- 更新知识点发布版本指针
- 更新搜索索引
- 刷新缓存

### 6.5 退回修改

`POST /api/v1/admin/review/:taskId/request-changes`

请求体：

```json
{
  "reviewComment": "案例解析不完整，视频与正文不一致"
}
```

### 6.6 拒绝发布

`POST /api/v1/admin/review/:taskId/reject`

说明：

- 用于严重不合格内容
- 被拒绝内容回到 `editing`

### 6.7 回滚版本

`POST /api/v1/admin/knowledge/:id/rollback/:versionId`

说明：

- 回滚不是覆盖旧版本
- 服务端基于旧快照创建新版本并进入审核

## 7. AI 任务接口

### 7.1 创建知识点初稿生成任务

`POST /api/v1/admin/ai/generate-knowledge-draft`

请求体：

```json
{
  "knowledgePointId": "kp_1",
  "template": {
    "mustIncludeFormulas": ["a^2 + b^2 = c^2"],
    "needDiagram": true,
    "needVideo": true
  }
}
```

### 7.2 查询 AI 任务状态

`GET /api/v1/admin/ai/tasks/:taskId`

返回字段：

- `status`
- `taskType`
- `inputSnapshot`
- `outputSummary`
- `errorMessage`

### 7.3 触发质量校验

`POST /api/v1/admin/ai/check-content-quality`

用途：

- LaTeX 检查
- 字段完整性检查
- 长度与结构检查
- 幻觉风险提示

## 8. 错误码约定

固定错误码建议如下：

- `UNAUTHORIZED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `RELATION_CYCLE_DETECTED`
- `REVIEW_STATE_INVALID`
- `PUBLISHED_CONTENT_READONLY`
- `AI_TASK_FAILED`
- `MEDIA_UPLOAD_INVALID`

## 9. API 验收要求

- 一个知识点可以完整通过接口完成创建、编辑、关系绑定、提交审核、发布
- 前台详情接口必须一次性返回完整展示数据，避免页面多次拼装
- 关系接口必须能支持图谱渲染
- 回滚与审核接口必须带审计语义
- AI 接口只负责生成和校验，不允许越权直接发布
