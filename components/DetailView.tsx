import React, { useState } from 'react';
import { ArrowLeft, Printer, Download, BookOpen, GitBranch } from 'lucide-react';
import { KnowledgePoint, Tag as TagType } from '../types';
import { TAGS } from '../constants';
import MathText from './MathText';

interface DetailViewProps {
  point: KnowledgePoint;
  onBack: () => void;
  onNavigate: (id: string) => void;
  allPoints: KnowledgePoint[];
}

const DetailView: React.FC<DetailViewProps> = ({ point, onBack, onNavigate, allPoints }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'examples'>('content');
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});

  const toggleSolution = (exId: string) => {
    setShowSolution(prev => ({ ...prev, [exId]: !prev[exId] }));
  };

  const getTagName = (id: string) => TAGS.find(t => t.id === id);

  const prerequisites = allPoints.filter(p => point.prerequisites.includes(p.id));
  const successors = allPoints.filter(p => point.successors.includes(p.id));

  return (
    <div className="bg-white rounded-xl shadow-sm min-h-screen">
      {/* Header */}
      <div className="p-6 border-b flex justify-between items-start no-print">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {point.stage} · {point.grade}
              </span>
              <span className="text-sm text-slate-500">
                {point.category} / {point.subcategory}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{point.title}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">打印资料</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">下载 PDF</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 p-8 lg:p-12">
          
          {/* Print Header */}
          <div className="print-only hidden mb-8 border-b pb-4">
             <h1 className="text-3xl font-bold mb-2">{point.title}</h1>
             <p className="text-slate-500">K-12 Math Matrix | {point.grade}</p>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {point.tags.map(tid => {
              const tag = getTagName(tid);
              if (!tag) return null;
              return (
                <span key={tid} className={`text-xs px-2 py-1 rounded-full font-medium ${tag.color}`}>
                  {tag.name}
                </span>
              );
            })}
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-100">
              {'★'.repeat(point.difficultyLevel)}{'☆'.repeat(5 - point.difficultyLevel)} 难度
            </span>
          </div>

          <div className="mb-8 no-print">
            <div className="flex border-b">
              <button
                className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === 'content' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setActiveTab('content')}
              >
                知识详解
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === 'examples' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setActiveTab('examples')}
              >
                典型例题 ({point.examples.length})
              </button>
            </div>
          </div>

          {activeTab === 'content' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <section>
                <div className="flex items-center gap-2 mb-4">
                   <BookOpen className="w-5 h-5 text-blue-600" />
                   <h2 className="text-lg font-bold text-slate-800">定义与定理</h2>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-lg leading-relaxed text-slate-800">
                  <MathText text={point.definition} block />
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                   <GitBranch className="w-5 h-5 text-emerald-600" />
                   <h2 className="text-lg font-bold text-slate-800">方法与技巧</h2>
                </div>
                <div className="prose prose-slate max-w-none text-slate-600">
                  <MathText text={point.methodology} />
                </div>
              </section>
            </div>
          )}

          {/* Always show examples in print mode */}
          {(activeTab === 'examples' || activeTab === 'content') && (
             <div className={`${activeTab === 'content' ? 'hidden print-only' : 'block'}`}>
                <div className="space-y-6 mt-8">
                  {point.examples.map((ex, idx) => (
                    <div key={ex.id} className="border rounded-xl overflow-hidden break-inside-avoid">
                      <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
                        <span className="font-semibold text-slate-700">例题 {idx + 1}：{ex.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          ex.difficulty === '基础' ? 'bg-green-100 text-green-700' :
                          ex.difficulty === '拓展' ? 'bg-purple-100 text-purple-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>{ex.difficulty}</span>
                      </div>
                      <div className="p-6">
                        <div className="mb-4 text-slate-800">
                          <MathText text={ex.content} />
                        </div>
                        
                        <div className="no-print">
                          <button 
                            onClick={() => toggleSolution(ex.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium underline-offset-2 hover:underline"
                          >
                            {showSolution[ex.id] ? '隐藏解析' : '查看解析'}
                          </button>
                        </div>
                        
                        {(showSolution[ex.id] || typeof window !== 'undefined') && (
                          <div className={`mt-4 pt-4 border-t border-dashed ${showSolution[ex.id] ? 'block' : 'hidden print-only'}`}>
                            <p className="text-sm font-bold text-slate-500 mb-2">【解析】</p>
                            <div className="text-slate-600">
                              <MathText text={ex.solution} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}
        </div>

        {/* Sidebar Relationships */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l bg-slate-50 p-6 no-print">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <GitBranch className="w-4 h-4" /> 知识图谱关联
          </h3>
          
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">前置知识 (Prerequisites)</p>
            {prerequisites.length > 0 ? (
              <ul className="space-y-2">
                {prerequisites.map(p => (
                  <li key={p.id}>
                    <button 
                      onClick={() => onNavigate(p.id)}
                      className="w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all text-sm text-slate-700 flex items-center justify-between group"
                    >
                      <span>{p.title}</span>
                      <ArrowLeft className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">无直接前置知识</p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">后续延伸 (Successors)</p>
            {successors.length > 0 ? (
              <ul className="space-y-2">
                {successors.map(p => (
                  <li key={p.id}>
                    <button 
                      onClick={() => onNavigate(p.id)}
                      className="w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-green-400 hover:shadow-sm transition-all text-sm text-slate-700 flex items-center justify-between group"
                    >
                      <span>{p.title}</span>
                      <ArrowLeft className="w-3 h-3 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity text-green-500" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">无直接延伸知识</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailView;