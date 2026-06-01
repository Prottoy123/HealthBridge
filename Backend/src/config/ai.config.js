import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    "FATAL ERROR: GEMINI_API_KEY is missing in the environment variables."
  );
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const selectedModel = process.env.GEMINI_MODEL_NAME || "gemini-1.5-flash";

const aiModel = genAI.getGenerativeModel({ model: selectedModel });

export default aiModel;
