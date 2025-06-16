import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with the API key from environment variables
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// Initialize the model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Generate an embedding vector for content using Hugging Face free hosted API (no API key required)
 * Uses sentence-transformers/all-MiniLM-L6-v2
 */
export const generateEmbedding = async (content: string): Promise<number[]> => {
  const HF_API_TOKEN = import.meta.env.VITE_HF_API_TOKEN;
  if (!HF_API_TOKEN) {
    throw new Error("Hugging Face API token is required. Please add VITE_HF_API_TOKEN to your .env file.");
  }
  console.log("Generating embedding for content:", content);
  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/sentence-similarity",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HF_API_TOKEN}`
      },
      body: JSON.stringify({ inputs: content })
    }
  );
  console.log("Response from Hugging Face API:", response);
  const data = await response.json();
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error("Failed to get embedding from Hugging Face API. Check your token and quota.");
  }
  return data[0];
};

/**
 * Compute cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

/**
 * Find similar pages using embeddings and cosine similarity
 * allPages: Array of { id, title, content, embedding }
 */
export const findSimilarPages = async (
  content: string,
  allPages: { id: string; title: string; content: string; embedding?: number[] }[],
  topN: number = 3,
  minScore: number = 0.75
): Promise<{ id: string; relevance: number }[]> => {
  if (!content.trim() || allPages.length === 0) return [];
  let embedding: number[];
  try {
    embedding = await generateEmbedding(content);
  } catch (e) {
    console.error('Embedding generation error:', e);
    return [];
  }
  const scored = allPages
    .filter(p => p.embedding && Array.isArray(p.embedding))
    .map(p => ({
      id: p.id,
      relevance: cosineSimilarity(embedding, p.embedding!)
    }))
    .filter(r => r.relevance >= minScore)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, topN);
  return scored;
}

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
 * Semantic Q&A: answer a question using semantic search over pages
 */
export const semanticAnswer = async (
  question: string,
  pages: { id: string; title: string; content: string; embedding?: number[] }[],
  topN: number = 3
): Promise<{ answer: string, references: { id: string; title: string }[] }> => {
  // 1. Generate embedding for the question
  let qEmbedding: number[];
  try {
    qEmbedding = await generateEmbedding(question);
  } catch (e) {
    return { answer: 'Semantic answering unavailable: embedding generation failed.', references: [] };
  }
  // 2. Find top-N most similar pages
  const scored = pages
    .filter(p => p.embedding && p.content)
    .map(p => ({
      ...p,
      relevance: cosineSimilarity(qEmbedding, p.embedding!)
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, topN);
  if (!scored.length) {
    return { answer: 'No relevant context found in your workspace.', references: [] };
  }
  // 3. Concatenate context
  const context = scored.map(p => `Title: ${p.title}\n${p.content}`).join('\n---\n');
  // 4. Ask LLM to answer using only this context
  const prompt = `Answer the following question using ONLY the provided context. If the context is insufficient, say so.\n\nQuestion: ${question}\n\nContext:\n${context}`;
  const answer = await generateContent(prompt);
  return {
    answer,
    references: scored.map(p => ({ id: p.id, title: p.title }))
  };
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


export const generateWebLinks = async (title: string): Promise<{title: string, url: string}[]> => {
  const prompt = `
    Given the following document title: "${title}", suggest 3-5 highly relevant and reputable web links (with titles) for further reading.
    Return only a JSON array of objects with "title" and "url" fields.
  `;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();
  console.log("Gemini raw response:", text);
  // Try plain JSON parse
  try {
    const arr = JSON.parse(text);
    if (Array.isArray(arr) && arr.every(l => l.title && l.url)) return arr;
  } catch {}
  // Try to extract JSON array from markdown code block
  const codeBlockMatch = text.match(/```(?:json)?([\s\S]*?)```/i);
  if (codeBlockMatch) {
    try {
      const arr = JSON.parse(codeBlockMatch[1]);
      if (Array.isArray(arr) && arr.every(l => l.title && l.url)) return arr;
    } catch {}
  }
  // Try to extract JSON array from anywhere in the text
  const arrayMatch = text.match(/\[\s*{[\s\S]+?}\s*\]/);
  if (arrayMatch) {
    try {
      const arr = JSON.parse(arrayMatch[0]);
      if (Array.isArray(arr) && arr.every(l => l.title && l.url)) return arr;
    } catch {}
  }
  // Try to extract from wrapped object (e.g., { "links": [...] })
  try {
    const obj = JSON.parse(text);
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (Array.isArray(obj[key]) && obj[key].every((l: any) => l.title && l.url)) {
          return obj[key];
        }
      }
    }
  } catch {}
  // Fallback: no links found
  return [];
};