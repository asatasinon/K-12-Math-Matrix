import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { KnowledgePoint } from '../types';

interface KnowledgeGraphProps {
  data: KnowledgePoint[];
  onNodeClick: (id: string) => void;
  activeId?: string;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ data, onNodeClick, activeId }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = 400;

    // Prepare nodes and links
    const nodes = data.map(d => ({ ...d, radius: d.id === activeId ? 30 : 20 }));
    const links: any[] = [];
    
    data.forEach(source => {
      source.successors.forEach(targetId => {
        // Only create links if target exists in filtered data
        if (data.find(d => d.id === targetId)) {
          links.push({ source: source.id, target: targetId });
        }
      });
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40));

    // Arrow marker
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .enter().append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 28) // Shift arrow back
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#94a3b8");

    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Circles
    node.append("circle")
      .attr("r", (d: any) => d.id === activeId ? 10 : 6)
      .attr("fill", (d: any) => {
          if (d.category === '图形与几何') return '#3b82f6';
          if (d.category === '数与代数') return '#10b981';
          return '#6366f1';
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("class", "cursor-pointer hover:stroke-slate-400 transition-colors")
      .on("click", (event, d) => onNodeClick(d.id));

    // Labels
    node.append("text")
      .text((d: any) => d.title.split(' ')[0]) // Simple label
      .attr("x", 12)
      .attr("y", 4)
      .attr("font-size", "10px")
      .attr("fill", "#475569")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, activeId]);

  return (
    <div className="w-full h-[400px] bg-slate-50 border rounded-lg overflow-hidden relative">
      <div className="absolute top-2 left-2 text-xs text-slate-400 font-mono">Knowledge Graph Visualization</div>
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default KnowledgeGraph;