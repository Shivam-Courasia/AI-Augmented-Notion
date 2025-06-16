import React, { useCallback, useRef, useState, Suspense, lazy } from 'react';
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cosineSimilarity } from '@/lib/ai';

// Lazy load the force graph component
const ForceGraph = lazy(() => import('react-force-graph').then(mod => ({
  default: mod.ForceGraph2D || mod.default
})));

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color?: string;
  type?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
}

interface Page {
  id: string;
  title: string;
  parentId?: string;
  tags?: string[];
  content?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

interface KnowledgeGraphProps {
  pages: Page[];
  currentPageId?: string;
  onNodeClick?: (node: GraphNode) => void;
  selectedNodeId?: string | null;
}

const NODE_R = 8;
const DEFAULT_COLOR = '#3b82f6'; // blue-500
const CURRENT_COLOR = '#8b5cf6'; // purple-500
const TAG_COLOR = '#10b981'; // emerald-500
const NODE_TYPES = {
  PAGE: 'page',
  TAG: 'tag',
};

const SEMANTIC_LINK_COLOR = '#f59e42'; // orange-400

export default function KnowledgeGraph({ 
  pages, 
  currentPageId, 
  onNodeClick, 
  selectedNodeId 
}: KnowledgeGraphProps) {
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set());
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const graphRef = useRef<any>(null);
  
  // Process pages and tags into nodes and links, including semantic links
  const { nodes, links } = React.useMemo(() => {
    const nodesMap = new Map<string, GraphNode>();
    const links: (GraphLink & { type?: string; relevance?: number })[] = [];
    const addedLinks = new Set<string>();

    // Add pages as nodes
    pages.forEach(page => {
      const isCurrent = page.id === currentPageId;
      const isSelected = page.id === selectedNodeId;
      
      nodesMap.set(page.id, {
        id: page.id,
        name: page.title || 'Untitled',
        val: isCurrent ? 12 : isSelected ? 10 : 8,
        color: isCurrent ? CURRENT_COLOR : isSelected ? '#7c3aed' : DEFAULT_COLOR,
        type: NODE_TYPES.PAGE,
      });

      // Add parent-child relationship
      if (page.parentId) {
        const linkKey = `${page.parentId}-${page.id}`;
        if (!addedLinks.has(linkKey)) {
          links.push({
            source: page.parentId,
            target: page.id,
            value: 1,
            type: 'parent',
          });
          addedLinks.add(linkKey);
        }
      }

      // Add tag relationships
      if (page.tags && page.tags.length > 0) {
        page.tags.forEach(tag => {
          const tagId = `tag-${tag}`;
          
          // Add tag node if not exists
          if (!nodesMap.has(tagId)) {
            nodesMap.set(tagId, {
              id: tagId,
              name: tag,
              val: 6,
              color: TAG_COLOR,
              type: NODE_TYPES.TAG,
            });
          }

          // Add page-tag relationship
          const tagLinkKey = `${page.id}-${tagId}`;
          if (!addedLinks.has(tagLinkKey)) {
            links.push({
              source: page.id,
              target: tagId,
              value: 0.5,
              type: 'tag',
            });
            addedLinks.add(tagLinkKey);
          }
        });
      }
    });

    // Add semantic links (AI-discovered)
    // For every pair of pages with embeddings, add a link if similarity > 0.75
    const threshold = 0.75;
    for (let i = 0; i < pages.length; i++) {
      const a = pages[i] as any;
      if (!Array.isArray(a.embedding)) continue;
      for (let j = i + 1; j < pages.length; j++) {
        const b = pages[j] as any;
        if (!Array.isArray(b.embedding)) continue;
        const sim = cosineSimilarity(a.embedding, b.embedding);
        if (sim > threshold) {
          const key = `${a.id}-${b.id}-semantic`;
          if (!addedLinks.has(key)) {
            links.push({
              source: a.id,
              target: b.id,
              value: 0.7,
              type: 'semantic',
              relevance: sim,
            });
            addedLinks.add(key);
          }
        }
      }
    }

    return {
      nodes: Array.from(nodesMap.values()),
      links,
    };
  }, [pages, currentPageId, selectedNodeId]);
  
  // Update highlighted nodes when hover state changes
  const updateHighlight = useCallback((node: GraphNode | null) => {
    setHoverNode(node);
    
    if (!node) {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      return;
    }
    
    const nodeNeighbors = new Set<string>();
    const highlightedLinks = new Set<string>();
    
    // Find all connected nodes and links
    links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      
      if (sourceId === node.id || targetId === node.id) {
        const otherNode = sourceId === node.id ? targetId : sourceId;
        nodeNeighbors.add(otherNode);
        highlightedLinks.add(`${sourceId}-${targetId}`);
      }
    });
    
    // Include the hovered node
    nodeNeighbors.add(node.id);
    
    setHighlightNodes(nodeNeighbors);
    setHighlightLinks(highlightedLinks);
  }, [links]);
  
  // Handle node hover
  const handleNodeHover = useCallback((node: GraphNode | null) => {
    updateHighlight(node);
  }, [updateHighlight]);
  
  // Handle node click
  const handleNodeClick = useCallback((node: GraphNode) => {
    if (!node.x || !node.y) return;
    
    // Center the clicked node
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(2, 1000);
    }
    
    // Call the provided onNodeClick handler if it exists
    if (onNodeClick) {
      onNodeClick(node);
    }
    
    // Keep the highlight on click
    updateHighlight(node);
  }, [onNodeClick, updateHighlight]);

  // Handle link hover
  const getLinkColor = useCallback((link: GraphLink) => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    
    return highlightLinks.size === 0 || 
      highlightLinks.has(`${sourceId}-${targetId}`) || 
      highlightLinks.has(`${targetId}-${sourceId}`) 
      ? 'rgba(200, 200, 200, 0.8)' 
      : 'rgba(200, 200, 200, 0.2)';
  }, [highlightLinks]);

  // Handle link particles
  const getLinkParticles = useCallback((link: GraphLink) => {
    if (highlightLinks.size === 0) return 0;
    
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    
    return (highlightLinks.has(`${sourceId}-${targetId}`) || 
            highlightLinks.has(`${targetId}-${sourceId}`)) ? 3 : 0;
  }, [highlightLinks]);

  // Handle node paint
  const paintNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isHighlighted = highlightNodes.has(node.id);
    const isHovered = hoverNode?.id === node.id;
    const label = node.name;
    const fontSize = 12 / globalScale;
    
    // Draw node
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, NODE_R * (isHovered ? 1.5 : 1), 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color || DEFAULT_COLOR;
    ctx.shadowColor = isHovered ? 'rgba(0, 0, 0, 0.3)' : 'transparent';
    ctx.shadowBlur = isHovered ? 10 : 0;
    ctx.fill();
    
    // Draw label background
    if (isHighlighted || isHovered) {
      ctx.font = `${fontSize}px Sans-Serif`;
      const textWidth = ctx.measureText(label).width;
      const padding = 4;
      const bckgDimensions = [textWidth + padding * 2, fontSize + padding * 1.5];
      
      // Draw background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.strokeStyle = node.color || DEFAULT_COLOR;
      ctx.lineWidth = 1;
      
      // Rounded rectangle
      const radius = 4;
      const x = node.x! - bckgDimensions[0] / 2;
      const y = node.y! + NODE_R * 2;
      
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + bckgDimensions[0] - radius, y);
      ctx.quadraticCurveTo(
        x + bckgDimensions[0], y, 
        x + bckgDimensions[0], y + radius
      );
      ctx.lineTo(x + bckgDimensions[0], y + bckgDimensions[1] - radius);
      ctx.quadraticCurveTo(
        x + bckgDimensions[0], y + bckgDimensions[1], 
        x + bckgDimensions[0] - radius, y + bckgDimensions[1]
      );
      ctx.lineTo(x + radius, y + bckgDimensions[1]);
      ctx.quadraticCurveTo(
        x, y + bckgDimensions[1], 
        x, y + bckgDimensions[1] - radius
      );
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      
      ctx.fill();
      ctx.stroke();
      
      // Draw text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = node.color || DEFAULT_COLOR;
      ctx.fillText(label, node.x!, y + bckgDimensions[1] / 2 + 1);
    }
  }, [highlightNodes, hoverNode]);

  return (
    <div className="relative flex-shrink-0 bg-card border-l border-border w-full md:w-1/2 lg:w-1/3">
      <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground">Loading graph...</div>}>
        <ForceGraph
          ref={graphRef}
          graphData={{ nodes, links }}
          nodeLabel="name"
          nodeAutoColorBy="type"
          linkDirectionalParticles={getLinkParticles}
          linkDirectionalParticleWidth={2}
          nodeCanvasObject={paintNode}
          linkColor={(link: any) => link.type === 'semantic' ? SEMANTIC_LINK_COLOR : undefined}
          linkWidth={(link: any) => link.type === 'semantic' ? 2.5 : 1}
          linkOpacity={0.6}
          linkDirectionalParticleColor="rgba(100, 100, 100, 0.5)"
          linkLabel={(link: any) => {
            if (link.type === 'semantic' && typeof link.relevance === 'number') {
              return `Semantic: ${Math.round(link.relevance * 100)}%`;
            }
            if (link.type === 'parent') return 'Parent-Child';
            if (link.type === 'tag') return 'Tag';
            return '';
          }}
          onNodeHover={handleNodeHover}
          onNodeClick={handleNodeClick}
          onBackgroundClick={() => updateHighlight(null)}
          onZoomEnd={() => {
            const event = new Event('resize');
            window.dispatchEvent(event);
          }}
        />
      </Suspense>
      <div className="p-2 text-xs text-muted-foreground border-t">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
          <span>Pages</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Tags</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
          <span>Current Page</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: SEMANTIC_LINK_COLOR }}></span>
          <span>Semantic Link</span>
        </div>
      </div>
    </div>
  );
}
