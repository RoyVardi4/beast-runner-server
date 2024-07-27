import { Content, GenerationConfig, GoogleGenerativeAI } from '@google/generative-ai';
import schema from '../ai_schema/workoutPlanGenerator';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_TOKEN ?? '');

const generationConfig: GenerationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: 'application/json',
  responseSchema: JSON.parse(schema),
};

export const geminiChat = async (prompt: string, history?: Content[]) => {
  // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const chatSession = model.startChat({
    generationConfig,
    history: history,
    // safetySettings: Adjust safety settings
    // See https://ai.google.dev/gemini-api/docs/safety-settings
  });

  const result = await chatSession.sendMessage(prompt);
  const jsonResult = JSON.parse(result.response.text())
  
  return jsonResult
};
