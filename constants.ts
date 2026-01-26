import { KnowledgePoint, Stage, CategoryType, Tag } from './types';

export const TAGS: Tag[] = [
  { id: 't1', name: '基础', type: 'difficulty', color: 'bg-green-100 text-green-800' },
  { id: 't2', name: '进阶', type: 'difficulty', color: 'bg-blue-100 text-blue-800' },
  { id: 't3', name: '压轴', type: 'difficulty', color: 'bg-red-100 text-red-800' },
  { id: 't4', name: '必考点', type: 'importance', color: 'bg-yellow-100 text-yellow-800' },
  { id: 't5', name: '易错点', type: 'importance', color: 'bg-orange-100 text-orange-800' },
  { id: 't6', name: '证明题', type: 'form', color: 'bg-purple-100 text-purple-800' },
  { id: 't7', name: '逻辑推理', type: 'core', color: 'bg-indigo-100 text-indigo-800' },
];

export const MOCK_KNOWLEDGE_POINTS: KnowledgePoint[] = [
  {
    id: 'kp_001',
    title: '勾股定理 (Pythagorean Theorem)',
    stage: Stage.MIDDLE,
    grade: '八年级上',
    category: CategoryType.GEOMETRY,
    subcategory: '平面几何',
    tags: ['t1', 't4', 't6', 't7'],
    difficultyLevel: 3,
    definition: '如果直角三角形的两条直角边长分别为 $a, b$，斜边长为 $c$，那么 $a^2 + b^2 = c^2$。',
    methodology: '1. 确认三角形为直角三角形。\n2. 找准直角边和斜边。\n3. 知二求一，灵活变形：$c = \\sqrt{a^2+b^2}$ 或 $a = \\sqrt{c^2-b^2}$。',
    examples: [
      {
        id: 'ex_1',
        title: '基础边长计算',
        difficulty: '基础',
        content: '在 Rt$\\triangle ABC$ 中，$\\angle C = 90^\\circ$，若 $a=3, b=4$，求 $c$。',
        solution: '由勾股定理得：$c = \\sqrt{a^2 + b^2} = \\sqrt{3^2 + 4^2} = \\sqrt{9+16} = 5$。'
      },
      {
        id: 'ex_2',
        title: '折叠问题应用',
        difficulty: '拓展',
        content: '一张矩形纸片 $ABCD$，长 $AD=10$，宽 $AB=8$，将纸片折叠，使 $D$ 点落在 $BC$ 边上的 $E$ 点处，折痕为 $AF$，求 $EF$ 的长。',
        solution: '设 $EF=x$。由折叠性质知 $AF$ 为折痕，$\\triangle ADF \\cong \\triangle AEF$。此题需构造方程求解 $x$。'
      }
    ],
    prerequisites: ['kp_002'],
    successors: ['kp_003', 'kp_004']
  },
  {
    id: 'kp_002',
    title: '直角三角形的性质',
    stage: Stage.MIDDLE,
    grade: '七年级下',
    category: CategoryType.GEOMETRY,
    subcategory: '平面几何',
    tags: ['t1'],
    difficultyLevel: 2,
    definition: '有一个角是直角（$90^\\circ$）的三角形叫做直角三角形。直角三角形的两个锐角互余。',
    methodology: '判定直角三角形的方法：1. 定义法；2. 勾股定理逆定理。',
    examples: [],
    prerequisites: [],
    successors: ['kp_001']
  },
  {
    id: 'kp_003',
    title: '勾股定理逆定理',
    stage: Stage.MIDDLE,
    grade: '八年级上',
    category: CategoryType.GEOMETRY,
    subcategory: '平面几何',
    tags: ['t2', 't7'],
    difficultyLevel: 3,
    definition: '如果三角形的三边长 $a, b, c$ 满足 $a^2 + b^2 = c^2$，那么这个三角形是直角三角形。',
    methodology: '先确定最大边，计算最大边的平方是否等于另外两边的平方和。',
    examples: [],
    prerequisites: ['kp_001'],
    successors: []
  },
  {
    id: 'kp_004',
    title: '两点间距离公式',
    stage: Stage.HIGH,
    grade: '高二上',
    category: CategoryType.GEOMETRY,
    subcategory: '解析几何',
    tags: ['t2', 't4'],
    difficultyLevel: 3,
    definition: '在平面直角坐标系中，两点 $A(x_1, y_1)$ 和 $B(x_2, y_2)$ 之间的距离为 $|AB| = \\sqrt{(x_1-x_2)^2 + (y_1-y_2)^2}$。',
    methodology: '这是勾股定理在解析几何中的直接应用。',
    examples: [],
    prerequisites: ['kp_001'],
    successors: ['kp_005']
  },
  {
    id: 'kp_005',
    title: '圆的标准方程',
    stage: Stage.HIGH,
    grade: '高二上',
    category: CategoryType.GEOMETRY,
    subcategory: '解析几何',
    tags: ['t4', 't5'],
    difficultyLevel: 4,
    definition: '圆心为 $(a, b)$，半径为 $r$ 的圆的标准方程是 $(x-a)^2 + (y-b)^2 = r^2$。',
    methodology: '利用配方法将一般方程转化为标准方程，从而求出圆心和半径。',
    examples: [],
    prerequisites: ['kp_004'],
    successors: []
  },
  {
    id: 'kp_006',
    title: '一元二次方程的解法',
    stage: Stage.MIDDLE,
    grade: '九年级上',
    category: CategoryType.ALGEBRA,
    subcategory: '式与方程',
    tags: ['t1', 't4'],
    difficultyLevel: 3,
    definition: '形如 $ax^2 + bx + c = 0 (a \\neq 0)$ 的方程。求根公式为 $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$。',
    methodology: '1. 直接开平方法；2. 配方法；3. 公式法；4. 因式分解法。',
    examples: [],
    prerequisites: [],
    successors: []
  }
];