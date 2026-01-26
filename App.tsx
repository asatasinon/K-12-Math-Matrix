import React, { useState, useMemo } from 'react';
import { Search, GraduationCap, Layers, Filter, Book, ChevronRight, LayoutGrid } from 'lucide-react';
import { MOCK_KNOWLEDGE_POINTS, TAGS } from './constants';
import { Stage, CategoryType, FilterState } from './types';
import DetailView from './components/DetailView';
import KnowledgeGraph from './components/KnowledgeGraph';
import MathText from './components/MathText';

const App: React.FC = () => {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    stages: [],
    categories: [],
    tags: [],
    searchQuery: ''
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Filter Logic
  const filteredPoints = useMemo(() => {
    return MOCK_KNOWLEDGE_POINTS.filter(kp => {
      const matchStage = filters.stages.length === 0 || filters.stages.includes(kp.stage);
      const matchCat = filters.categories.length === 0 || filters.categories.includes(kp.category);
      const matchTags = filters.tags.length === 0 || filters.tags.every(t => kp.tags.includes(t));
      const matchSearch = filters.searchQuery === '' || 
        kp.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) || 
        kp.definition.includes(filters.searchQuery);
      
      return matchStage && matchCat && matchTags && matchSearch;
    });
  }, [filters]);

  const handleNavigate = (id: string) => {
    setSelectedPointId(id);
    setView('detail');
    window.scrollTo(0, 0);
  };

  const toggleFilter = <T,>(key: keyof FilterState, value: T) => {
    setFilters(prev => {
      const current = prev[key] as unknown as T[];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists ? current.filter(i => i !== value) : [...current, value]
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('list')}>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-white font-bold text-xl font-serif">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">K-12 Math Matrix</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">全维数学知识图谱</p>
            </div>
          </div>

          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="搜索知识点、公式、几何定理..." 
                className="w-full bg-slate-100 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 cursor-pointer"></div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        
        {/* Sidebar Filters - Only visible in List View */}
        {view === 'list' && (
          <aside className={`w-64 flex-shrink-0 print:hidden transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full absolute z-10'}`}>
            <div className="bg-white rounded-xl shadow-sm border p-5 sticky top-24 space-y-8">
              
              {/* Stages */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> 学段筛选
                </h3>
                <div className="space-y-2">
                  {Object.values(Stage).map(stage => (
                    <label key={stage} className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer hover:text-blue-600 transition-colors">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={filters.stages.includes(stage)}
                        onChange={() => toggleFilter('stages', stage)}
                      />
                      {stage}
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" /> 知识领域
                </h3>
                <div className="space-y-2">
                  {Object.values(CategoryType).map(cat => (
                    <label key={cat} className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer hover:text-blue-600 transition-colors">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={filters.categories.includes(cat)}
                        onChange={() => toggleFilter('categories', cat)}
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> 智能标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleFilter('tags', tag.id)}
                      className={`text-xs px-2.5 py-1 rounded-full transition-all border ${
                        filters.tags.includes(tag.id)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>
        )}

        {/* Content Area */}
        <main className={`flex-1 min-w-0 ${view === 'list' && !isSidebarOpen ? 'ml-0' : ''}`}>
          
          {view === 'list' ? (
            <div className="space-y-6">
              {/* Breadcrumbs / Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-slate-500">
                  <span>首页</span>
                  <ChevronRight className="w-4 h-4 mx-1" />
                  <span className="text-slate-900 font-medium">知识库检索</span>
                  <span className="mx-2 text-slate-300">|</span>
                  <span>共找到 {filteredPoints.length} 个知识点</span>
                </div>
                
                {/* Graph View Toggle could go here */}
              </div>

              {/* D3 Graph Preview (Only if points < 10 for clarity, or always) */}
              {filteredPoints.length > 0 && filteredPoints.length <= 15 && (
                 <KnowledgeGraph 
                    data={filteredPoints} 
                    onNodeClick={handleNavigate}
                 />
              )}

              {/* Results Grid */}
              <div className="grid grid-cols-1 gap-4">
                {filteredPoints.length > 0 ? (
                  filteredPoints.map(point => (
                    <div 
                      key={point.id}
                      onClick={() => handleNavigate(point.id)}
                      className="group bg-white rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none group-hover:from-blue-100 transition-colors"></div>
                      
                      <div className="flex justify-between items-start mb-3 relative">
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                               {point.grade}
                             </span>
                             <span className="text-xs text-slate-400">{point.category}</span>
                           </div>
                           <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                             {point.title}
                           </h3>
                        </div>
                        <div className="flex gap-1">
                          {'★'.repeat(point.difficultyLevel).split('').map((_, i) => (
                            <span key={i} className="text-yellow-400 text-xs">★</span>
                          ))}
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        <MathText text={point.definition} />
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {point.tags.slice(0, 3).map(tid => {
                            const tag = TAGS.find(t => t.id === tid);
                            return tag ? (
                              <span key={tid} className={`text-[10px] px-2 py-0.5 rounded-full ${tag.color} opacity-80`}>
                                {tag.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                        <div className="text-slate-400 group-hover:translate-x-1 transition-transform">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                    <Book className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">未找到符合条件的知识点</p>
                    <button 
                      onClick={() => setFilters({ stages: [], categories: [], tags: [], searchQuery: '' })}
                      className="mt-4 text-blue-600 font-medium hover:underline"
                    >
                      清空筛选条件
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <DetailView 
              point={MOCK_KNOWLEDGE_POINTS.find(p => p.id === selectedPointId)!} 
              onBack={() => setView('list')}
              onNavigate={handleNavigate}
              allPoints={MOCK_KNOWLEDGE_POINTS}
            />
          )}

        </main>
      </div>
    </div>
  );
};

export default App;