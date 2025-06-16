
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText, ChevronRight, ChevronDown } from "lucide-react"
import type { Page } from "@/pages/Workspace"

interface WorkspaceSidebarProps {
  pages: Page[];
  currentPageId: string | null;
  onPageSelect: (id: string) => void;
  onNewPage: (title?: string, parentId?: string, content?: string) => void;
  onOpenLinkModal?: () => void;
  onOpenGraph?: () => void;
}

const WorkspaceSidebar = ({ pages, currentPageId, onPageSelect, onNewPage, onOpenLinkModal, onOpenGraph }: WorkspaceSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())
  
  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )
  
  const toggleExpanded = (pageId: string) => {
    const newExpanded = new Set(expandedPages)
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId)
    } else {
      newExpanded.add(pageId)
    }
    setExpandedPages(newExpanded)
  }
  
  const renderPageTree = (page: Page, level: number = 0) => {
    const hasChildren = pages.some(p => p.parentId === page.id)
    const isExpanded = expandedPages.has(page.id)
    
    return (
      <div key={page.id}>
        <div 
          className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
            currentPageId === page.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${12 + level * 20}px` }}
          onClick={() => onPageSelect(page.id)}
        >
          {hasChildren && (
            <button 
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(page.id)
              }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          <FileText className="h-4 w-4 flex-shrink-0" />
          <span className="truncate text-sm">{page.title}</span>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {pages
              .filter(p => p.parentId === page.id)
              .map(childPage => renderPageTree(childPage, level + 1))
            }
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-semibold text-gray-900">My Workspace</span>
        </div>
        
        <Button 
          onClick={() => onNewPage()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </div>
      
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
      </div>
      
      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {filteredPages
            .filter(page => !page.parentId) // Only show root pages, children will be rendered recursively
            .map(page => renderPageTree(page))
          }
        </div>
        
        {filteredPages.length === 0 && searchQuery && (
          <div className="text-center text-gray-500 text-sm mt-8">
            No pages found matching "{searchQuery}"
          </div>
        )}
      </div>
      
      {/* AI Features */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={onOpenLinkModal}>
            🔗 AI-Link Suggestions
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={onOpenGraph ? onOpenGraph : () => {
            alert('Knowledge Graph: This feature will visualize the relationships between your notes and tags. (Coming soon!)');
          }}>
            🌐 Knowledge Graph
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={() => {
            alert('Smart Tags: This feature will help you organize your notes with AI-generated tags. (Already available in the note editor!)');
          }}>
            🏷️ Smart Tags
          </Button>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceSidebar

// What does 'Auto-Link Suggestions' do?
// This feature will analyze the content of your current note and, using AI embeddings and semantic similarity, suggest links to other notes in your workspace that are most relevant. This helps you quickly interconnect related knowledge without manual searching. (Feature coming soon!)

// What does 'Knowledge Graph' do?
// This feature will visualize your workspace as a graph, showing connections between notes, tags, and semantic links. You can explore how your knowledge is structured and discover hidden relationships. (Feature coming soon!)

