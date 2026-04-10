const modules = [
  "知识点编辑器",
  "关系维护",
  "审核发布",
  "媒体资源中心",
  "AI 任务中心",
  "版本回滚"
];

export default function AdminHomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Admin Web</p>
        <h1 style={{ margin: "10px 0 16px", fontSize: "38px", lineHeight: 1.15 }}>
          教研后台骨架
        </h1>
        <p className="muted" style={{ maxWidth: 720 }}>
          这是后台管理应用的起始页。后续会围绕内容生产、审核、媒体与 AI 流程扩展具体模块。
        </p>

        <div className="grid">
          {modules.map((item) => (
            <section className="panel" key={item}>
              <p className="eyebrow">Module</p>
              <h2 style={{ margin: "8px 0 10px", fontSize: "20px" }}>{item}</h2>
              <p className="muted">该模块已预留为后台主导航项，可继续落成业务页面与表单流程。</p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}

