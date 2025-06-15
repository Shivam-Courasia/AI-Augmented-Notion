
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Link2, Tag, Clock, Sparkles, Loader2 } from "lucide-react"
import type { Page } from "@/pages/Workspace"
import { generateAITags } from "@/lib/ai"

interface PageTag {
  name: string;
  isAIGenerated: boolean;
}

interface PageEditorProps {
  page: Page
  onUpdatePage: (updates: Partial<Page>) => void
  pages: Page[]
}

const PageEditor = ({ page, onUpdatePage, pages }: PageEditorProps) => {
  const [title, setTitle] = useState(page.title)
  const [content, setContent] = useState(page.content)
  const [newTag, setNewTag] = useState("")
  const [suggestedLinks, setSuggestedLinks] = useState<Page[]>([])
  const [showLinkSuggestions, setShowLinkSuggestions] = useState(false)
  const [isGeneratingTags, setIsGeneratingTags] = useState(false)
  
  // Convert string tags to PageTag objects
  const tags = page.tags.map(tag => ({
    name: tag,
    isAIGenerated: tag.startsWith('ai_')
  }));
  
  // Auto-save functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (title !== page.title || content !== page.content) {
        onUpdatePage({ title, content })
      }
    }, 1000)
    
    return () => clearTimeout(timeoutId)
  }, [title, content, page.title, page.content, onUpdatePage])
  
  // AI Auto-linking simulation
  useEffect(() => {
    if (content.length > 50) {
      const suggestions = pages
        .filter(p => p.id !== page.id)
        .filter(p => {
          const contentWords = content.toLowerCase().split(/\s+/)
          const pageWords = p.title.toLowerCase().split(/\s+/)
          return pageWords.some(word => contentWords.includes(word) && word.length > 3)
        })
        .slice(0, 3)
      
      setSuggestedLinks(suggestions)
      setShowLinkSuggestions(suggestions.length > 0)
    } else {
      setSuggestedLinks([])
      setShowLinkSuggestions(false)
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
        const newTags = aiTags
          .filter((tag: string) => !page.tags.includes(tag) && !page.tags.includes(`ai_${tag}`))
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
    <div className="h-full flex flex-col bg-white">
      {/* Page Header */}
      <div className="border-b border-gray-200 p-6">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-3xl font-bold border-none p-0 shadow-none focus-visible:ring-0 mb-4"
          placeholder="Untitled"
        />
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Last edited {page.updatedAt.toLocaleDateString()}</span>
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
        
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes sparkle {
              0% { 
                opacity: 0.6;
                filter: drop-shadow(0 0 2px rgba(99, 102, 241, 0.8));
              }
              50% { 
                opacity: 1;
                filter: drop-shadow(0 0 4px rgba(99, 102, 241, 1));
              }
              100% { 
                opacity: 0.6;
                filter: drop-shadow(0 0 2px rgba(99, 102, 241, 0.8));
              }
            }
            
            .ai-button {
              animation: sparkle 3s ease-in-out infinite;
            }
            
            .ai-button:hover {
              animation: none;
            }
          `
        }} />
      </div>
      
      {/* AI Link Suggestions */}
      {showLinkSuggestions && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">AI Suggested Links</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {suggestedLinks.map(linkedPage => (
              <Button
                key={linkedPage.id}
                onClick={() => insertLink(linkedPage)}
                variant="outline"
                size="sm"
                className="text-xs bg-white hover:bg-blue-100 border-blue-200"
              >
                + Link to "{linkedPage.title}"
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Editor */}
      <div className="flex-1 p-6">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing... Use markdown for formatting"
          className="w-full h-full border-none shadow-none resize-none focus-visible:ring-0 text-base leading-relaxed"
        />
      </div>
      
      {/* Markdown Preview Hint */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="text-xs text-gray-500 flex items-center gap-4">
          <span>💡 Tip: Use **bold**, *italic*, # headers, and - lists for formatting</span>
          <span className="ml-auto">Auto-saved</span>
        </div>
      </div>
    </div>
  )
}

export default PageEditor
