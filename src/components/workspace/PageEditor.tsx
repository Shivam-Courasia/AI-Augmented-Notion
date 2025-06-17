import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Link2, Tag, Clock, Sparkles, Loader2 } from "lucide-react"
import type { Page } from "@/pages/Workspace"
import { generateAITags, findSimilarPages } from "@/lib/ai"
import SimpleMDE from "react-simplemde-editor"
import "simplemde/dist/simplemde.min.css"
import "./PageEditor.mde.css"

interface PageTag {
  name: string;
  isAIGenerated: boolean;
}

interface PageEditorProps {
  page: Page
  onUpdatePage: (updates: Partial<Page>) => void
  pages: Page[]
  onDeletePage?: (pageId: string) => void
}

const PageEditor = ({ page, onUpdatePage, pages, onDeletePage }: PageEditorProps) => {
  const [title, setTitle] = useState(page.title)
  const [content, setContent] = useState(page.content)
  const [newTag, setNewTag] = useState("")
  const [suggestedLinks, setSuggestedLinks] = useState<{page: Page, relevance: number}[]>([])
  const [showLinkSuggestions, setShowLinkSuggestions] = useState(false)
  const [isGeneratingTags, setIsGeneratingTags] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)
  
  // Convert string tags to PageTag objects
  const tags = page.tags.map(tag => ({
    name: tag,
    isAIGenerated: tag.startsWith('ai_')
  }));
  
  // Auto-save functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (title !== page.title || content !== page.content) {
        onUpdatePage({
          id: page.id, // ensure id is included
          title,
          content,
          updatedAt: new Date().toISOString()
        })
      }
    }, 1000)
    
    return () => clearTimeout(timeoutId)
  }, [title, content, page.title, page.content, onUpdatePage])
  
  // AI Semantic Auto-linking (debounced)
  useEffect(() => {
    // Only trigger for sufficient content length
    if (content.length < 50) {
      setSuggestedLinks([])
      setShowLinkSuggestions(false)
      setIsLoadingSuggestions(false)
      setLinkError(null)
      return
    }
    let cancelled = false
    setIsLoadingSuggestions(true)
    setLinkError(null)
    const timeoutId = setTimeout(async () => {
      try {
        // Prepare pages with embeddings (assume .embedding exists or is undefined)
        const candidates = pages.filter(p => p.id !== page.id)
        // If no candidates or no embeddings, fallback to empty
        if (!candidates.length || !candidates.some(p => Array.isArray(p.embedding))) {
          setSuggestedLinks([])
          setShowLinkSuggestions(false)
          setIsLoadingSuggestions(false)
          setLinkError("AI linking requires page embeddings. Please enable embedding support.")
          return
        }
        const similar = await findSimilarPages(content, candidates as any)
        if (cancelled) return
        // Map back to Page objects with relevance
        const links = similar
          .map(s => {
            const match = candidates.find(p => p.id === s.id)
            return match ? { page: match, relevance: s.relevance } : null
          })
          .filter(Boolean) as {page: Page, relevance: number}[]
        setSuggestedLinks(links)
        setShowLinkSuggestions(links.length > 0)
        setIsLoadingSuggestions(false)
        setLinkError(null)
      } catch (err: any) {
        setSuggestedLinks([])
        setShowLinkSuggestions(false)
        setIsLoadingSuggestions(false)
        setLinkError(err?.message || "AI linking unavailable.")
      }
    }, 600) // debounce
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [content, pages, page.id])
  
  const addTag = () => {
    const tagName = newTag.trim();
    if (tagName && !tags.some(tag => tag.name === tagName)) {
      onUpdatePage({ 
        tags: [...page.tags, tagName] // Store as regular string tag
      });
      setNewTag("");
    }
  }
  
  const removeTag = (tagToRemove: string) => {
    onUpdatePage({ 
      tags: page.tags.filter(tag => tag !== tagToRemove) 
    });
  }
  
  const insertLink = (linkedPage: Page) => {
    const linkText = `[${linkedPage.title}](/${linkedPage.id})`
    setContent(prev => prev + `\n\n${linkText}`)
    setShowLinkSuggestions(false)
  }
  
  const generateAITagsHandler = async () => {
    if (!content.trim()) {
      return;
    }

    setIsGeneratingTags(true);
    try {
      // Generate AI tags
      const aiTags = await generateAITags(content);
      
      if (aiTags && aiTags.length > 0) {
        // Filter out tags that already exist and add 'ai_' prefix
        const aiTagArtifacts = ["json", "array", "object", "string", "number", "null", "undefined", "true", "false", "yes", "no", "tag", "tags", "list", "data", "info", "information", "response", "output", "result"];
        const newTags = aiTags
          .filter((tag: string) => {
            const cleaned = String(tag).trim().toLowerCase();
            return cleaned && !aiTagArtifacts.includes(cleaned) && !page.tags.includes(tag) && !page.tags.includes(`ai_${tag}`);
          })
          .map((tag: string) => `ai_${tag}`);
        
        if (newTags.length > 0) {
          onUpdatePage({ 
            tags: [...page.tags, ...newTags] 
          });
        }
      }
    } catch (error) {
      console.error('Error generating AI tags:', error);
    } finally {
      setIsGeneratingTags(false);
    }
  }
  
  return (
    <>
      <div className="h-full flex flex-col bg-white">
      {/* Page Header */}
      <div className="border-b border-gray-200 p-6 flex items-center justify-between">
        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl font-bold border-none p-0 shadow-none focus-visible:ring-0 mb-4"
            placeholder="Untitled"
          />
        </div>
        {onDeletePage && (
          <Button
            variant="destructive"
            size="sm"
            className="ml-4"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
                onDeletePage(page.id);
              }
            }}
          >
            Delete Page
          </Button>
        )}
      </div>

      <div className="meta-time-row">
  <div className="meta-time-item">
    <Clock className="meta-time-icon" />
    <span>CreatedAt {page.createdAt.toLocaleDateString()} {page.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
  </div>
</div>
        
<div className="meta-time-row">
  <div className="meta-time-item">
    <Clock className="meta-time-icon" />
    <span>UpdatedAt {page.updatedAt.toLocaleDateString()} {page.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
  </div>
</div>
        
        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {tags.map(({ name, isAIGenerated }) => {
            const displayName = isAIGenerated ? name.replace(/^ai_/, '') : name;
            return (
              <Badge 
                key={name}
                variant={isAIGenerated ? 'default' : 'secondary'}
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => removeTag(name)}
              >
                {isAIGenerated && <Sparkles className="h-3 w-3 mr-1" />}
                {displayName} ×
              </Badge>
            );
          })}
          <div className="flex items-center gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              placeholder="Add tag..."
              className="w-24 h-6 text-xs"
              size={newTag.length || 10}
            />
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
              <Button 
                onClick={generateAITagsHandler} 
                variant="ghost" 
                size="sm" 
                className="relative bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs"
                disabled={isGeneratingTags}
              >
                {isGeneratingTags ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3 mr-1" />
                )}
                AI Tags
              </Button>
            </div>
          </div>
        </div>
      
      {/* AI Link Suggestions */}
      {(showLinkSuggestions || isLoadingSuggestions || linkError) && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">AI Suggested Links</span>
          </div>
          {isLoadingSuggestions && (
            <div className="flex items-center gap-2 text-blue-700 text-xs">
              <Loader2 className="h-4 w-4 animate-spin" /> Generating smart link suggestions...
            </div>
          )}
          {linkError && (
            <div className="text-xs text-red-500 py-1">{linkError}</div>
          )}
          {!isLoadingSuggestions && !linkError && suggestedLinks.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {suggestedLinks.map(({ page: linkedPage, relevance }) => (
                <Button
                  key={linkedPage.id}
                  onClick={() => insertLink(linkedPage)}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-white hover:bg-blue-100 border-blue-200"
                >
                  + Link to "{linkedPage.title}" <span className="ml-1 text-[10px] text-blue-700">({Math.round(relevance * 100)}%)</span>
                </Button>
              ))}
            </div>
          )}
          {!isLoadingSuggestions && !linkError && suggestedLinks.length === 0 && (
            <div className="text-xs text-blue-700">No strong semantic matches found yet. Add more content to see suggestions.</div>
          )}
        </div>
      )}
      
      {/* Notion-style Editor Area */}
      <div className="flex-1 flex flex-col justify-start bg-[#f7f8fa] px-0 pt-2 pb-8 min-h-[80vh]">
        <div className="w-full bg-white px-8 pt-6 pb-12">
          <SimpleMDE
            value={content}
            onChange={setContent}
            placeholder="Start writing... Use markdown for formatting"
            className="w-full min-h-[400px] border-none shadow-none resize-none focus-visible:ring-0 text-[1.15rem] leading-[2.1] font-sans bg-white"
            style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontSize: '1.15rem', background: 'white', lineHeight: '2.1' }}
          />
          {/* Markdown Preview Hint */}
          <div className="pt-3 mt-2 text-xs text-gray-400 flex items-center gap-4">
            <span>💡 Tip: Use **bold**, *italic*, # headers, and - lists for formatting</span>
            <span className="ml-auto">Auto-saved</span>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default PageEditor



