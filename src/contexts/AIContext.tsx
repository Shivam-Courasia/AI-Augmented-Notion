import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { Page } from '@/pages/Workspace';
import { generateAITags, findRelatedPages, answerQuestion, generateContent } from '@/lib/ai';

interface AIContextType {
  isAIAssistantOpen: boolean;
  openAIAssistant: () => void;
  closeAIAssistant: () => void;
  generateTags: (content: string) => Promise<string[]>;
  findRelated: (query: string, pages: Page[]) => Promise<{id: string, relevance: number}[]>;
  askQuestion: (question: string, context: string) => Promise<string>;
  generateAIContent: (prompt: string) => Promise<string>;
  isProcessing: boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const openAIAssistant = useCallback(() => {
    setIsAIAssistantOpen(true);
  }, []);

  const closeAIAssistant = useCallback(() => {
    setIsAIAssistantOpen(false);
  }, []);

  const generateTags = useCallback(async (content: string): Promise<string[]> => {
    if (!content.trim()) return [];
    setIsProcessing(true);
    try {
      return await generateAITags(content);
    } catch (error) {
      console.error('Error generating tags:', error);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const findRelated = useCallback(async (query: string, pages: Page[]) => {
    if (!query.trim() || !pages.length) return [];
    setIsProcessing(true);
    try {
      return await findRelatedPages(
        query,
        pages.map(p => ({
          id: p.id,
          title: p.title,
          content: p.content
        }))
      );
    } catch (error) {
      console.error('Error finding related pages:', error);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const askQuestion = useCallback(async (question: string, context: string) => {
    if (!question.trim()) return '';
    setIsProcessing(true);
    try {
      return await answerQuestion(question, context);
    } catch (error) {
      console.error('Error answering question:', error);
      return 'Sorry, I encountered an error while processing your question.';
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const generateAIContent = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return '';
    setIsProcessing(true);
    try {
      return await generateContent(prompt);
    } catch (error) {
      console.error('Error generating content:', error);
      return 'Sorry, I encountered an error while generating content.';
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return (
    <AIContext.Provider
      value={{
        isAIAssistantOpen,
        openAIAssistant,
        closeAIAssistant,
        generateTags,
        findRelated,
        askQuestion,
        generateAIContent,
        isProcessing,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
