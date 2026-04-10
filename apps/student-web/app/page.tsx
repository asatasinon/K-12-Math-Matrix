const cards = [
  {
    title: "课程树导航",
    description: "按小学、初中、高中以及竞赛支线浏览知识主干。"
  },
  {
    title: "知识点详情页",
    description: "承载理论、公式、案例、技巧、图谱和视频嵌入。"
  },
  {
    title: "搜索与筛选",
    description: "按学段、年级、领域、难度和主线来源组合检索。"
  }
];

export default function StudentHomePage() {
  return (
    <main>
      <div className="shell">
        <section className="hero">
          <p className="label">Student Web</p>
          <h1 style={{ margin: "10px 0 16px", fontSize: "40px", lineHeight: 1.1 }}>
            K-12 Math Matrix
          </h1>
          <p className="muted" style={{ maxWidth: 720 }}>
            这是学生端骨架应用。后续会在这里接入课程树、知识点详情、专题页、关系图谱和学习路径。
          </p>

          <div className="grid">
            {cards.map((card) => (
              <article className="card" key={card.title}>
                <p className="label">Ready For Build</p>
                <h2 className="title">{card.title}</h2>
                <p className="muted">{card.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

