
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { X, Send, Sparkles, Search } from "lucide-react"
import type { Page } from "@/pages/Workspace"

interface AIAssistantProps {
  pages: Page[]
  onClose: () => void
}

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

const AIAssistant = ({ pages, onClose }: AIAssistantProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI assistant. I can help you search through your workspace, suggest connections between pages, and answer questions about your content. What would you like to know?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  
  const sendMessage = async () => {
    if (!inputMessage.trim()) return
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsProcessing(true)
    
    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage, pages)
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
      setIsProcessing(false)
    }, 1500)
  }
  
  const generateAIResponse = (query: string, pages: Page[]): string => {
    const lowerQuery = query.toLowerCase()
    
    // Search functionality
    if (lowerQuery.includes('search') || lowerQuery.includes('find')) {
      const searchTerms = lowerQuery.split(' ').filter(word => 
        !['search', 'find', 'for', 'about', 'what', 'where', 'when', 'how'].includes(word)
      )
      
      const relevantPages = pages.filter(page => 
        searchTerms.some(term => 
          page.title.toLowerCase().includes(term) || 
          page.content.toLowerCase().includes(term) ||
          page.tags.some(tag => tag.toLowerCase().includes(term))
        )
      )
      
      if (relevantPages.length > 0) {
        return `I found ${relevantPages.length} page(s) that might be relevant:\n\n${
          relevantPages.map(page => `• **${page.title}** - ${page.content.substring(0, 100)}...`)
            .join('\n')
        }`
      } else {
        return "I couldn't find any pages matching your search. Try using different keywords or create a new page about this topic!"
      }
    }
    
    // Connection suggestions
    if (lowerQuery.includes('connect') || lowerQuery.includes('link') || lowerQuery.includes('relate')) {
      const connections = findConnections(pages)
      if (connections.length > 0) {
        return `Here are some potential connections I found between your pages:\n\n${
          connections.map(conn => `• **${conn.page1}** ↔ **${conn.page2}**: ${conn.reason}`)
            .join('\n')
        }`
      } else {
        return "I don't see any obvious connections between your current pages yet. As you add more content, I'll be able to suggest more meaningful links!"
      }
    }
    
    // General questions
    if (lowerQuery.includes('summary') || lowerQuery.includes('overview')) {
      return `Here's an overview of your workspace:\n\n• **Total pages**: ${pages.length}\n• **Total tags**: ${[...new Set(pages.flatMap(p => p.tags))].length}\n• **Most recent**: ${pages.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0]?.title}\n\nYour workspace covers topics like: ${[...new Set(pages.flatMap(p => p.tags))].join(', ')}`
    }
    
    // Default response
    return "I understand you're asking about your workspace. I can help you:\n\n• **Search** through your pages\n• **Find connections** between different topics\n• **Suggest tags** for better organization\n• **Summarize** your content\n\nTry asking me something like 'Search for project ideas' or 'What connections do you see?'"
  }
  
  const findConnections = (pages: Page[]): Array<{page1: string, page2: string, reason: string}> => {
    const connections = []
    
    for (let i = 0; i < pages.length; i++) {
      for (let j = i + 1; j < pages.length; j++) {
        const page1 = pages[i]
        const page2 = pages[j]
        
        // Check for common tags
        const commonTags = page1.tags.filter(tag => page2.tags.includes(tag))
        if (commonTags.length > 0) {
          connections.push({
            page1: page1.title,
            page2: page2.title,
            reason: `Both tagged with: ${commonTags.join(', ')}`
          })
        }
        
        // Check for similar words in content
        const words1 = page1.content.toLowerCase().split(/\s+/).filter(w => w.length > 4)
        const words2 = page2.content.toLowerCase().split(/\s+/).filter(w => w.length > 4)
        const commonWords = words1.filter(word => words2.includes(word))
        
        if (commonWords.length > 2) {
          connections.push({
            page1: page1.title,
            page2: page2.title,
            reason: `Similar content themes`
          })
        }
      }
    }
    
    return connections.slice(0, 3) // Limit to top 3 connections
  }
  
  const quickActions = [
    "Search through all pages",
    "Find related content",
    "Suggest new tags",
    "Show workspace overview"
  ]
  
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-gray-900">AI Assistant</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="text-xs font-medium text-gray-500 mb-2">Quick Actions</div>
        <div className="space-y-1">
          {quickActions.map(action => (
            <Button
              key={action}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-8"
              onClick={() => setInputMessage(action)}
            >
              {action}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div key={message.id} className={`${message.type === 'user' ? 'ml-8' : 'mr-8'}`}>
            <Card className={`p-3 ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white ml-4' 
                : 'bg-gray-50'
            }`}>
              <div className="text-sm whitespace-pre-line">{message.content}</div>
              <div className={`text-xs mt-2 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </Card>
          </div>
        ))}
        
        {isProcessing && (
          <div className="mr-8">
            <Card className="p-3 bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </Card>
          </div>
        )}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything..."
            className="text-sm"
            disabled={isProcessing}
          />
          <Button 
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isProcessing}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant
