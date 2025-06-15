
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar"
import PageEditor from "@/components/workspace/PageEditor"
import AIAssistant from "@/components/workspace/AIAssistant"
import { Button } from "@/components/ui/button"
import { Search, Bell, Settings, LogOut } from "lucide-react"
import { toast } from "sonner"

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
  const { user, signOut } = useAuth()
  const [pages, setPages] = useState<Page[]>([])
  const [currentPageId, setCurrentPageId] = useState<string | null>(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const currentPage = pages.find(p => p.id === currentPageId)

  // Load user's pages from Supabase
  useEffect(() => {
    const loadPages = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading pages:', error);
          toast.error('Failed to load pages');
          return;
        }

        const formattedPages = data.map(page => ({
          id: page.id,
          title: page.title,
          content: page.content || '',
          parentId: page.parent_id,
          createdAt: new Date(page.created_at),
          updatedAt: new Date(page.updated_at),
          tags: page.tags || []
        }));

        setPages(formattedPages);
        
        // If no pages exist, create a welcome page
        if (formattedPages.length === 0) {
          createNewPage("Getting Started", undefined, "# Welcome to your AI-powered workspace!\n\nThis is where you'll create, organize, and discover knowledge.\n\n## Features\n- **AI Auto-Linking**: Automatically connects related content\n- **Smart Tagging**: AI generates relevant tags for your pages\n- **Semantic Search**: Find information using natural language\n- **Knowledge Graph**: Visualize connections between your ideas");
        } else {
          setCurrentPageId(formattedPages[0].id);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadPages();
  }, [user]);
  
  const updatePage = async (pageId: string, updates: Partial<Page>) => {
    try {
      const { error } = await supabase
        .from('pages')
        .update({
          title: updates.title,
          content: updates.content,
          tags: updates.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', pageId);

      if (error) {
        console.error('Error updating page:', error);
        toast.error('Failed to update page');
        return;
      }

      setPages(prev => prev.map(page => 
        page.id === pageId 
          ? { ...page, ...updates, updatedAt: new Date() }
          : page
      ));
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    }
  }
  
  const createNewPage = async (title: string = "Untitled", parentId?: string, content: string = "") => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('pages')
        .insert({
          user_id: user.id,
          title,
          content,
          parent_id: parentId,
          tags: []
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating page:', error);
        toast.error('Failed to create page');
        return;
      }

      const newPage: Page = {
        id: data.id,
        title: data.title,
        content: data.content || '',
        parentId: data.parent_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        tags: data.tags || []
      };
      
      setPages(prev => [newPage, ...prev]);
      setCurrentPageId(newPage.id);
      return newPage;
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading workspace...</div>
      </div>
    );
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
            <span className="text-sm text-gray-600 mr-2">
              Welcome, {user?.email}
            </span>
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
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
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
