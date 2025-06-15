import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with the API key from environment variables
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// Initialize the model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Generate AI tags for content using Gemini
 */
export const generateAITags = async (content: string): Promise<string[]> => {
  try {
    const prompt = `Analyze the following content and generate 3-5 relevant tags. Return only a JSON array of tag strings:\n\n${content}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Try to parse the response as JSON
      return JSON.parse(text);
    } catch (e) {
      // If parsing fails, try to extract tags from plain text
      const tags = text.match(/\b\w+\b/g)?.slice(0, 5) || [];
      return Array.from(new Set(tags)); // Remove duplicates
    }
  } catch (error) {
    console.error('Error generating AI tags:', error);
    return [];
  }
};

/**
 * Find related pages based on content similarity using Gemini
 */
export const findRelatedPages = async (
  query: string, 
  pages: { id: string; title: string; content: string }[]
): Promise<{id: string, relevance: number}[]> => {
  try {
    if (!query.trim() || pages.length === 0) return [];
    
    // For small number of pages, we can send them all to the AI
    if (pages.length <= 10) {
      const prompt = `Given the following query and a list of pages, return a JSON array of objects with pageId and relevance score (0-1). 
      Query: "${query}"
      
      Pages (format: [id] title: content...):
      ${pages.map(p => `[${p.id}] ${p.title}: ${p.content.substring(0, 200)}`).join('\n')}
      
      Return only the JSON array, no other text.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      try {
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse related pages response:', text);
        return [];
      }
    }
    
    // For larger numbers of pages, we'll need to implement a more sophisticated approach
    // with embeddings and vector similarity search
    return [];
  } catch (error) {
    console.error('Error finding related pages:', error);
    return [];
  }
};

/**
 * Answer a question based on the provided context using Gemini
 */
export const answerQuestion = async (question: string, context: string): Promise<string> => {
  try {
    const prompt = `Answer the following question based on the provided context. 
    If the context doesn't contain enough information, say so.
    
    Question: ${question}
    
    Context: ${context}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error answering question:', error);
    return 'Sorry, I encountered an error while processing your question.';
  }
};

/**
 * Generate content using Gemini
 */
export const generateContent = async (prompt: string): Promise<string> => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content:', error);
    return 'Sorry, I encountered an error while generating content.';
  }
};
