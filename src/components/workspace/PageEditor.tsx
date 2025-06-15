
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Link2, Tag, Clock, Sparkles } from "lucide-react"
import type { Page } from "@/pages/Workspace"

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
    if (newTag.trim() && !page.tags.includes(newTag.trim())) {
      onUpdatePage({ tags: [...page.tags, newTag.trim()] })
      setNewTag("")
    }
  }
  
  const removeTag = (tagToRemove: string) => {
    onUpdatePage({ tags: page.tags.filter(tag => tag !== tagToRemove) })
  }
  
  const insertLink = (linkedPage: Page) => {
    const linkText = `[${linkedPage.title}](/${linkedPage.id})`
    setContent(prev => prev + `\n\n${linkText}`)
    setShowLinkSuggestions(false)
  }
  
  const generateAITags = () => {
    // Simulate AI tag generation
    const words = content.toLowerCase().match(/\b\w{4,}\b/g) || []
    const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use']
    
    const relevantWords = words
      .filter(word => !commonWords.includes(word))
      .filter(word => !page.tags.includes(word))
      .slice(0, 3)
    
    if (relevantWords.length > 0) {
      onUpdatePage({ tags: [...page.tags, ...relevantWords] })
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
          {page.tags.map(tag => (
            <Badge 
              key={tag} 
              variant="secondary"
              className="cursor-pointer hover:bg-gray-200"
              onClick={() => removeTag(tag)}
            >
              {tag} ×
            </Badge>
          ))}
          <div className="flex items-center gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              placeholder="Add tag..."
              className="w-24 h-6 text-xs"
              size={newTag.length || 10}
            />
            <Button onClick={generateAITags} variant="ghost" size="sm" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Tags
            </Button>
          </div>
        </div>
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
