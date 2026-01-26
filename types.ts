export enum Stage {
  PRIMARY = '小学部',
  MIDDLE = '初中部',
  HIGH = '高中部'
}

export enum CategoryType {
  ALGEBRA = '数与代数',
  GEOMETRY = '图形与几何',
  STATS = '统计与概率',
  APPLIED = '综合与实践'
}

export interface Tag {
  id: string;
  name: string;
  type: 'difficulty' | 'form' | 'importance' | 'core';
  color: string;
}

export interface Example {
  id: string;
  title: string;
  difficulty: '基础' | '中等' | '拓展';
  content: string; // Markdown/LaTeX
  solution: string; // Markdown/LaTeX
}

export interface KnowledgePoint {
  id: string;
  title: string;
  stage: Stage;
  grade: string; // e.g., "八年级上"
  category: CategoryType;
  subcategory: string; // e.g., "平面几何"
  tags: string[]; // Tag IDs
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  definition: string; // LaTeX enabled
  methodology: string;
  examples: Example[];
  prerequisites: string[]; // KP IDs
  successors: string[]; // KP IDs
}

export interface FilterState {
  stages: Stage[];
  categories: CategoryType[];
  tags: string[];
  searchQuery: string;
}