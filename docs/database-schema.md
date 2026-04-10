# K-12 Math Matrix 数据库表设计文档

## 1. 目标

这份文档把 [data-model.md](/Users/raven/code/K-12-Math-Matrix/docs/data-model.md) 的实体设计进一步细化为 PostgreSQL 可实现的库表方案。目标是支持：

- 双主线课程树
- 结构化知识点内容
- 关系图谱
- 媒体资源
- 审核流和版本回滚
- 搜索索引重建

首版数据库固定采用 PostgreSQL 16。

## 2. 设计原则

- 主键统一使用 `uuid`
- 时间字段统一使用 `timestamptz`
- 状态字段使用 `text + check constraint`
- 结构化正文、图规格、快照使用 `jsonb`
- 删除优先软删除，避免破坏历史数据

## 3. 核心表概览

表分 7 组：

- 用户与权限：`users`
- 课程体系：`curriculum_nodes`
- 内容主体：`knowledge_points`、`knowledge_point_curriculum_bindings`
- 内容组件：`formulas`、`examples`、`techniques`、`diagram_specs`、`media_assets`、`video_assets`
- 图谱关系：`relation_edges`
- 审核与版本：`content_versions`、`review_tasks`
- 来源记录：`source_attributions`

## 4. 表结构细化

### 4.1 users

```sql
create table users (
  id uuid primary key,
  email text not null unique,
  password_hash text not null,
  name text not null,
  role text not null check (role in ('editor', 'reviewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

说明：

- 学生前台不需要用户表参与
- 首版后台角色只保留 `editor` 和 `reviewer`

### 4.2 curriculum_nodes

```sql
create table curriculum_nodes (
  id uuid primary key,
  type text not null check (type in ('stage', 'grade', 'module', 'unit', 'topic')),
  name text not null,
  slug text not null unique,
  parent_id uuid references curriculum_nodes(id),
  track text not null check (track in ('standard', 'olympiad')),
  stage_code text not null check (stage_code in ('primary', 'middle', 'high')),
  order_index integer not null default 0,
  status text not null check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

索引：

```sql
create index idx_curriculum_nodes_parent_order
  on curriculum_nodes(parent_id, order_index);

create index idx_curriculum_nodes_track_stage
  on curriculum_nodes(track, stage_code, status);
```

### 4.3 knowledge_points

```sql
create table knowledge_points (
  id uuid primary key,
  title text not null,
  slug text not null unique,
  aliases jsonb not null default '[]'::jsonb,
  summary text not null default '',
  theory_doc jsonb not null default '{}'::jsonb,
  method_doc jsonb not null default '{}'::jsonb,
  difficulty_level smallint not null check (difficulty_level between 1 and 5),
  stage_code text not null check (stage_code in ('primary', 'middle', 'high')),
  grade_band text not null,
  domain_code text not null,
  subdomain_code text not null,
  primary_track text not null check (primary_track in ('standard', 'olympiad')),
  status text not null check (
    status in ('draft', 'ai_generated', 'editing', 'in_review', 'published', 'archived')
  ),
  published_version_id uuid,
  created_by uuid not null references users(id),
  updated_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

索引：

```sql
create index idx_knowledge_points_stage_grade
  on knowledge_points(stage_code, grade_band, status);

create index idx_knowledge_points_domain
  on knowledge_points(domain_code, subdomain_code, status);

create index idx_knowledge_points_track
  on knowledge_points(primary_track, status);
```

约束建议：

- `published_version_id` 在应用层保证只指向同一知识点的已发布版本

### 4.4 knowledge_point_curriculum_bindings

```sql
create table knowledge_point_curriculum_bindings (
  id uuid primary key,
  knowledge_point_id uuid not null references knowledge_points(id),
  curriculum_node_id uuid not null references curriculum_nodes(id),
  is_primary boolean not null default false,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  unique (knowledge_point_id, curriculum_node_id)
);
```

索引：

```sql
create index idx_kp_curriculum_node
  on knowledge_point_curriculum_bindings(curriculum_node_id, order_index);
```

说明：

- 一个知识点允许多个绑定
- 应用层保证每个知识点最多只有一个 `is_primary = true`

### 4.5 formulas

```sql
create table formulas (
  id uuid primary key,
  knowledge_point_id uuid not null references knowledge_points(id),
  name text not null,
  latex text not null,
  plain_text text not null,
  description text not null default '',
  usage_note text not null default '',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

索引：

```sql
create index idx_formulas_kp_order
  on formulas(knowledge_point_id, order_index);
```

### 4.6 examples

```sql
create table examples (
  id uuid primary key,
  knowledge_point_id uuid not null references knowledge_points(id),
  title text not null,
  difficulty text not null check (difficulty in ('basic', 'intermediate', 'advanced')),
  problem_doc jsonb not null default '{}'::jsonb,
  solution_doc jsonb not null default '{}'::jsonb,
  answer_doc jsonb not null default '{}'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

索引：

```sql
create index idx_examples_kp_order
  on examples(knowledge_point_id, order_index)
  where deleted_at is null;
```

### 4.7 techniques

```sql
create table techniques (
  id uuid primary key,
  knowledge_point_id uuid not null references knowledge_points(id),
  type text not null check (type in ('technique', 'pitfall', 'heuristic')),
  title text not null,
  content_doc jsonb not null default '{}'::jsonb,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

索引：

```sql
create index idx_techniques_kp_order
  on techniques(knowledge_point_id, order_index)
  where deleted_at is null;
```

### 4.8 media_assets

```sql
create table media_assets (
  id uuid primary key,
  kind text not null check (kind in ('image', 'thumbnail', 'attachment')),
  storage_key text not null unique,
  mime_type text not null,
  size_bytes bigint not null,
  width integer,
  height integer,
  source_type text not null check (source_type in ('upload', 'imported', 'generated')),
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

索引：

```sql
create index idx_media_assets_kind_created
  on media_assets(kind, created_at desc)
  where deleted_at is null;
```

### 4.9 diagram_specs

```sql
create table diagram_specs (
  id uuid primary key,
  knowledge_point_id uuid not null references knowledge_points(id),
  title text not null,
  diagram_type text not null check (diagram_type in ('static-svg', 'interactive-jsxgraph')),
  spec_json jsonb not null default '{}'::jsonb,
  cover_asset_id uuid references media_assets(id),
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

索引：

```sql
create index idx_diagram_specs_kp_order
  on diagram_specs(knowledge_point_id, order_index)
  where deleted_at is null;
```

### 4.10 video_assets

```sql
create table video_assets (
  id uuid primary key,
  knowledge_point_id uuid not null references knowledge_points(id),
  title text not null,
  provider text not null,
  embed_url text not null,
  cover_asset_id uuid references media_assets(id),
  duration_seconds integer not null default 0,
  chapter_markers jsonb not null default '[]'::jsonb,
  status text not null check (status in ('draft', 'active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

索引：

```sql
create index idx_video_assets_kp_status
  on video_assets(knowledge_point_id, status)
  where deleted_at is null;
```

### 4.11 relation_edges

```sql
create table relation_edges (
  id uuid primary key,
  from_knowledge_point_id uuid not null references knowledge_points(id),
  to_knowledge_point_id uuid not null references knowledge_points(id),
  relation_type text not null check (
    relation_type in ('prerequisite', 'same-core', 'application-of', 'extends', 'related')
  ),
  strength smallint not null default 3 check (strength between 1 and 5),
  note text not null default '',
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  unique (from_knowledge_point_id, to_knowledge_point_id, relation_type)
);
```

索引：

```sql
create index idx_relation_edges_from_type
  on relation_edges(from_knowledge_point_id, relation_type);

create index idx_relation_edges_to_type
  on relation_edges(to_knowledge_point_id, relation_type);
```

约束与应用规则：

- 不允许 `from_knowledge_point_id = to_knowledge_point_id`
- `same-core` 由应用层自动维护对称边
- `prerequisite` 通过应用层做环检测

### 4.12 content_versions

```sql
create table content_versions (
  id uuid primary key,
  entity_type text not null check (entity_type in ('knowledge_point')),
  entity_id uuid not null,
  version_number integer not null,
  snapshot_json jsonb not null,
  change_summary text not null default '',
  publish_state text not null check (
    publish_state in ('draft', 'submitted', 'published', 'superseded', 'rolled_back')
  ),
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, version_number)
);
```

索引：

```sql
create index idx_content_versions_entity
  on content_versions(entity_type, entity_id, version_number desc);

create index idx_content_versions_publish_state
  on content_versions(publish_state, created_at desc);
```

说明：

- 首版版本只覆盖 `knowledge_point`
- `snapshot_json` 必须是聚合快照，而不是局部补丁

### 4.13 review_tasks

```sql
create table review_tasks (
  id uuid primary key,
  entity_type text not null check (entity_type in ('knowledge_point')),
  entity_id uuid not null,
  candidate_version_id uuid not null references content_versions(id),
  status text not null check (
    status in ('pending', 'approved', 'rejected', 'changes_requested')
  ),
  reviewer_id uuid references users(id),
  review_comment text not null default '',
  submitted_by uuid not null references users(id),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);
```

索引：

```sql
create index idx_review_tasks_status_submitted
  on review_tasks(status, submitted_at desc);

create index idx_review_tasks_reviewer_status
  on review_tasks(reviewer_id, status, submitted_at desc);
```

### 4.14 source_attributions

```sql
create table source_attributions (
  id uuid primary key,
  entity_type text not null check (
    entity_type in ('knowledge_point', 'formula', 'example', 'diagram_spec', 'video_asset')
  ),
  entity_id uuid not null,
  source_kind text not null check (source_kind in ('textbook', 'reference', 'internal', 'external')),
  source_title text not null,
  source_url text,
  author text not null default '',
  license_note text not null default '',
  citation_note text not null default '',
  created_at timestamptz not null default now()
);
```

索引：

```sql
create index idx_source_attributions_entity
  on source_attributions(entity_type, entity_id);
```

## 5. published_version_id 外键补充

因为 `knowledge_points` 和 `content_versions` 存在先后创建顺序，建议采用两阶段方式：

1. 先创建 `knowledge_points`
2. 再创建 `content_versions`
3. 最后补充外键

```sql
alter table knowledge_points
  add constraint fk_knowledge_points_published_version
  foreign key (published_version_id) references content_versions(id);
```

## 6. 搜索索引重建策略

搜索索引数据不直接作为数据库表存储，重建来源固定为：

- `knowledge_points`
- `formulas`
- `knowledge_point_curriculum_bindings`
- `relation_edges`
- `content_versions`

只有满足以下条件的知识点进入搜索索引：

- `knowledge_points.status = 'published'`
- `published_version_id is not null`
- 至少存在一个课程节点绑定

## 7. 查询建议

### 7.1 知识点详情查询

使用聚合查询一次返回：

- `knowledge_points`
- `formulas`
- `examples`
- `techniques`
- `diagram_specs`
- `video_assets`
- `source_attributions`

### 7.2 图谱邻接查询

先查 `relation_edges`，再批量补全目标知识点标题、主领域、难度。

### 7.3 课程节点知识点列表

从 `knowledge_point_curriculum_bindings` 开始，按 `order_index` 排序，再关联 `knowledge_points`。

## 8. 迁移顺序建议

推荐按以下顺序创建迁移：

1. `users`
2. `curriculum_nodes`
3. `knowledge_points`
4. `knowledge_point_curriculum_bindings`
5. `formulas`
6. `examples`
7. `techniques`
8. `media_assets`
9. `diagram_specs`
10. `video_assets`
11. `relation_edges`
12. `content_versions`
13. `review_tasks`
14. `source_attributions`
15. `knowledge_points.published_version_id` 外键补充

## 9. 审计与软删除策略

首版不额外引入通用审计框架，但必须满足：

- 内容实体优先软删除
- 审核与版本记录不允许物理删除
- 所有发布与回滚操作都可追溯到用户

## 10. 验收标准

- 支持一个知识点挂接多个课程节点
- 支持知识点聚合正文、公式、案例、技巧、图和视频
- 支持审核流和版本回滚
- 支持关系图谱查询
- 支持从数据库重建搜索索引
