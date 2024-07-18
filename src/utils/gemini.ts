
import {Content, GoogleGenerativeAI} from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_TOKEN ?? '');

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

export const geminiChat = async (prompt: string, history?: Content[]) => {
  // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  const chatSession = model.startChat({
    generationConfig,
    history: history
    // safetySettings: Adjust safety settings
    // See https://ai.google.dev/gemini-api/docs/safety-settings
  });

  const result = await chatSession.sendMessage(prompt);
  console.log(result.response.text());

  const response = result.response;
  const text = response.text();
  return text;
}
