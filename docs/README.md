# K-12 Math Matrix 文档导航

当前 `docs/` 采用扁平结构，不额外创建子目录。

原因很简单：

- 现阶段只有 5 份基础文档，继续拆分目录会增加跳转成本。
- 这些文档都属于项目 0-1 阶段的“基础设计文档”，彼此强相关，放在同一级最容易维护。
- 等后续扩展到接口文档、部署手册、运营文档、教研规范时，再拆成 `product/`、`engineering/`、`operations/` 会更合适。

当前文档列表：

- `architecture.md`：系统架构文档
- `tech-stack.md`：技术栈与工程选型文档
- `roadmap.md`：三阶段产品与技术路线图
- `data-model.md`：内容实体、关系模型与 API 草案
- `content-pipeline.md`：AI 辅助内容生产与审核流程
- `api-spec.md`：REST API 接口细化文档
- `database-schema.md`：数据库表结构与索引设计文档

推荐阅读顺序：

1. `architecture.md`
2. `tech-stack.md`
3. `data-model.md`
4. `api-spec.md`
5. `database-schema.md`
6. `content-pipeline.md`
7. `roadmap.md`

如果后续新增文档数量超过 10 份，建议再做一次目录重构，按以下方式迁移：

- `docs/product/`：产品规划、课程结构、路线图
- `docs/engineering/`：架构、技术栈、数据模型、接口设计
- `docs/operations/`：内容生产、审核规范、发布流程、运维手册
