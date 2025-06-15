import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, X, Bot, Sparkles, Link as LinkIcon, Tag, Lightbulb, Loader2 } from 'lucide-react';
import { Page } from '@/pages/Workspace';
import { cn } from '@/lib/utils';
import { useAI } from '@/contexts/AIContext';

type MessageType = 'user' | 'ai' | 'system';

interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  pages: Page[];
  currentPage?: Page | null;
}

const AIAssistant = ({ isOpen, onClose, pages, currentPage }: AIAssistantProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    isProcessing, 
    askQuestion, 
    findRelated, 
    generateAIContent,
    generateTags 
  } = useAI();

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: '1',
          type: 'ai',
          content: "Hi! I'm your AI assistant. I can help you with your notes, find related content, and answer your questions. How can I assist you today?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Handle sending a message
  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isProcessing) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      let response = '';
      const lowerMessage = inputMessage.toLowerCase();
      
      // Handle different types of queries
      if (lowerMessage.includes('related') || lowerMessage.includes('similar')) {
        // Find related pages
        const related = await findRelated(inputMessage, pages);
        if (related.length > 0) {
          const relatedPages = related.map(r => {
            const page = pages.find(p => p.id === r.id);
            return page ? `- ${page.title} (relevance: ${Math.round(r.relevance * 100)}%)` : '';
          }).filter(Boolean);
          
          response = relatedPages.length > 0
            ? `Here are some related pages I found:\n\n${relatedPages.join('\n')}`
            : "I couldn't find any directly related pages. Would you like me to search your notes for something specific?";
        } else {
          response = "I couldn't find any related pages. Try being more specific or check back later as you add more content.";
        }
      } 
      else if (lowerMessage.includes('summarize') || lowerMessage.includes('summary')) {
        // Generate a summary
        if (currentPage) {
          const prompt = `Please provide a concise summary of the following content. Focus on the key points and main ideas.\n\nTitle: ${currentPage.title}\nContent: ${currentPage.content.substring(0, 2000)}`;
          response = await generateAIContent(prompt);
        } else {
          response = "Please open a page first so I can summarize its content.";
        }
      }
      else if (lowerMessage.includes('suggest') || lowerMessage.includes('improve')) {
        // Provide suggestions
        if (currentPage) {
          const prompt = `Provide 3-5 specific suggestions to improve the following note. Focus on content, structure, and clarity.\n\nTitle: ${currentPage.title}\nContent: ${currentPage.content.substring(0, 2000)}`;
          response = await generateAIContent(prompt);
        } else {
          response = "Please open a page first so I can provide suggestions.";
        }
      }
      else if (lowerMessage.includes('tag') || lowerMessage.includes('categorize')) {
        // Generate tags
        if (currentPage) {
          const tags = await generateTags(currentPage.content);
          response = tags.length > 0
            ? `Here are some relevant tags for this page: ${tags.map(t => `#${t}`).join(', ')}`
            : "I couldn't generate any specific tags. The content might be too short or generic.";
        } else {
          response = "Please open a page first so I can generate tags for it.";
        }
      }
      else {
        // General question answering
        const context = currentPage 
          ? `Current page: ${currentPage.title}\n${currentPage.content.substring(0, 1000)}`
          : `Available pages: ${pages.slice(0, 5).map(p => p.title).join(', ')}`;
          
        response = await askQuestion(inputMessage, context);
      }
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [inputMessage, pages, currentPage, askQuestion, findRelated, generateAIContent, generateTags, isProcessing]);

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    let message = '';
    
    switch (action) {
      case 'summarize':
        message = "Can you summarize this page for me?";
        break;
      case 'related':
        message = "What other pages are related to this one?";
        break;
      case 'suggestions':
        message = "Do you have any suggestions for improving this page?";
        break;
      case 'tags':
        message = "What tags would you suggest for this page?";
        break;
      default:
        return;
    }
    
    setInputMessage(message);
    // Small delay to allow state to update before sending
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">AI Assistant</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={cn(
                'flex',
                message.type === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div 
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-2',
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                )}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick Actions */}
        {currentPage && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => handleQuickAction('summarize')}
              disabled={isProcessing}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Summarize
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => handleQuickAction('related')}
              disabled={isProcessing}
            >
              <LinkIcon className="h-3 w-3 mr-1" />
              Find Related
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => handleQuickAction('suggestions')}
              disabled={isProcessing}
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              Get Suggestions
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => handleQuickAction('tags')}
              disabled={isProcessing}
            >
              <Tag className="h-3 w-3 mr-1" />
              Suggest Tags
            </Button>
          </div>
        )}
        
        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your notes..."
              className="min-h-[60px] pr-12 resize-none"
              disabled={isProcessing}
            />
            <Button 
              size="icon" 
              className="absolute right-2 bottom-2 h-8 w-8"
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
