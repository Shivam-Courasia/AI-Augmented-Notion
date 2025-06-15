
import { useState } from "react"
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar"
import PageEditor from "@/components/workspace/PageEditor"
import AIAssistant from "@/components/workspace/AIAssistant"
import { Button } from "@/components/ui/button"
import { Search, Bell, Settings } from "lucide-react"

export interface Page {
  id: string
  title: string
  content: string
  parentId?: string
  children?: Page[]
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

const Workspace = () => {
  const [pages, setPages] = useState<Page[]>([
    {
      id: "1",
      title: "Getting Started",
      content: "# Welcome to your AI-powered workspace!\n\nThis is where you'll create, organize, and discover knowledge.\n\n## Features\n- **AI Auto-Linking**: Automatically connects related content\n- **Smart Tagging**: AI generates relevant tags for your pages\n- **Semantic Search**: Find information using natural language\n- **Knowledge Graph**: Visualize connections between your ideas",
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ["getting-started", "tutorial"]
    }
  ])
  
  const [currentPageId, setCurrentPageId] = useState<string>("1")
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  
  const currentPage = pages.find(p => p.id === currentPageId)
  
  const updatePage = (pageId: string, updates: Partial<Page>) => {
    setPages(prev => prev.map(page => 
      page.id === pageId 
        ? { ...page, ...updates, updatedAt: new Date() }
        : page
    ))
  }
  
  const createNewPage = (title: string = "Untitled", parentId?: string) => {
    const newPage: Page = {
      id: Date.now().toString(),
      title,
      content: "",
      parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    }
    
    setPages(prev => [...prev, newPage])
    setCurrentPageId(newPage.id)
    return newPage
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <WorkspaceSidebar 
        pages={pages}
        currentPageId={currentPageId}
        onPageSelect={setCurrentPageId}
        onNewPage={createNewPage}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 max-w-md flex-1">
              <Search className="h-4 w-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search everything..." 
                className="bg-transparent outline-none text-sm flex-1"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              🤖 AI Assistant
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 flex">
          <div className="flex-1">
            {currentPage ? (
              <PageEditor 
                page={currentPage}
                onUpdatePage={(updates) => updatePage(currentPage.id, updates)}
                pages={pages}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select a page to start editing
              </div>
            )}
          </div>
          
          {/* AI Assistant Panel */}
          {showAIAssistant && (
            <AIAssistant 
              pages={pages}
              onClose={() => setShowAIAssistant(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Workspace
