import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import PageEditor from "@/components/workspace/PageEditor";
import AIAssistant from "@/components/workspace/AIAssistant";
import { Button } from "@/components/ui/button";
import { Search, Bell, Settings, LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { generateWebLinks } from "@/lib/ai";

export interface Page {
  id: string;
  title: string;
  content: string;
  parentId?: string;
  children?: Page[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  embedding?: number[];
}

const Workspace = () => {
  const { user, signOut } = useAuth()
  const [pages, setPages] = useState<Page[]>([])
  const [currentPageId, setCurrentPageId] = useState<string | null>(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [loading, setLoading] = useState(true)
  // AI Link Suggestion modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkResults, setLinkResults] = useState<{title: string, url: string, snippet: string}[]>([]);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string|null>(null);
  const navigate = useNavigate();
  
  const currentPage = pages.find(p => p.id === currentPageId)

  // Delete page handler
  const deletePage = async (pageId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('pages').delete().eq('id', pageId);
      if (error) {
        toast.error('Failed to delete page');
        return;
      }
      setPages(prev => prev.filter(p => p.id !== pageId));
      setCurrentPageId(pages.length > 1 ? pages.find(p => p.id !== pageId)?.id || null : null);
      toast.success('Page deleted');
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  }

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
          tags: page.tags || [],
          embedding: Array.from({length: 10}, (_, i) => {
            let hash = 0;
            for (let c of page.id) hash += c.charCodeAt(0);
            return Math.sin(hash + i) * 0.5 + 0.5;
          })
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
  
  const updatePage = async (updates: Partial<Page>) => {
    // Accepts updates with id, title, content, tags, updatedAt (ISO string)
    const pageId = updates.id || currentPageId;
    if (!pageId) return;
    try {
      const { error } = await supabase
        .from('pages')
        .update({
          title: updates.title,
          content: updates.content,
          tags: updates.tags,
          updated_at: updates.updatedAt || new Date().toISOString()
        })
        .eq('id', pageId);

      if (error) {
        console.error('Error updating page:', error);
        toast.error('Failed to update page');
        return;
      }

      setPages(prev => prev.map(page =>
        page.id === pageId
          ? {
              ...page,
              ...updates,
              updatedAt: updates.updatedAt ? new Date(updates.updatedAt) : new Date()
            }
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

  const fetchWebLinks = async (query: string) => {
    setLinkLoading(true);
    setLinkError(null);
    setLinkResults([]);
    try {
      const links = await generateWebLinks(query);
      if (Array.isArray(links) && links.length > 0) {
        setLinkResults(links.map(l => ({ ...l, snippet: l.title })));
      } else {
        setLinkError('No relevant web links found.');
      }
    } catch (err) {
      setLinkError('Failed to fetch web links.');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleOpenLinkModal = () => {
    setShowLinkModal(true);
    if (currentPage) {
      fetchWebLinks(currentPage.title + ' ' + (currentPage.content?.slice(0, 100) || ''));
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
    <>
      <div className="h-screen flex bg-gray-50">
        {/* Sidebar */}
        <WorkspaceSidebar 
          pages={pages}
          currentPageId={currentPageId}
          onPageSelect={setCurrentPageId}
          onNewPage={createNewPage}
          onOpenLinkModal={handleOpenLinkModal}
          onOpenGraph={() => navigate('/workspace/graph')}
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
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  className="relative bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 hover:text-blue-700"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Assistant
                </Button>
              </div>
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
                  onUpdatePage={updatePage}
                  pages={pages}
                  onDeletePage={deletePage}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Select a page to start editing
                </div>
              )}
            </div>
            {/* AI Assistant Panel */}
            <AIAssistant 
              isOpen={showAIAssistant}
              pages={pages}
              currentPage={currentPage}
              onClose={() => setShowAIAssistant(false)}
            />
          </div>
        </div>
      </div>
      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Link Suggestions (from the Web)</DialogTitle>
            <DialogDescription>
              Here are some web links related to your current note. Click any to open in a new tab.
            </DialogDescription>
          </DialogHeader>
          {linkLoading && <div>Loading web suggestions...</div>}
          {linkError && <div className="text-red-500">{linkError}</div>}
          {!linkLoading && !linkError && linkResults.length === 0 && <div>No suggestions found.</div>}
          <ul className="space-y-2 mt-2">
            {linkResults.map(link => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-medium">{link.title}</a>
                <div className="text-xs text-gray-600">{link.snippet}</div>
              </li>
            ))}
          </ul>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowLinkModal(false)} variant="outline">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Workspace;
