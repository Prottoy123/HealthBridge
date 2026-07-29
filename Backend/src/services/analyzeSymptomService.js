import { z } from "zod";
import aiModel from "../config/ai.config.js";
import { ApiError } from "../utils/apiError.js";

// 1. Input Validation Schema: For data coming from the frontend
export const symptomInputSchema = z.object({
  symptoms: z
    .string()
    .min(10, "Symptoms must be at least 10 characters long.")
    .max(500, "Symptoms description is too long."),
});

// 2. Output Validation Schema: For data coming from the AI
export const aiSymptomOutputSchema = z.object({
  aiSymptomSummary: z
    .string()
    .describe(
      "An empathetic summary mentioning 1-2 or 3 possible common medical conditions for these symptoms to give the patient an idea. Must include a reassuring tone and a short disclaimer that this is not a clinical diagnosis."
    ),
  specialistRecommendation: z
    .string()
    .describe(
      "Return ONLY the exact category name of the doctor they should visit. No sentences, just the title (e.g., 'Neurologist', 'Cardiologist', 'Ophthalmologist', 'General Physician')."
    ),
  severityLevel: z
    .enum(["LOW", "MEDIUM", "HIGH"])
    .describe(
      "Assess the urgency of the medical condition based on the symptoms."
    ),
});

export const analyzeSymptomService = async (symptomsText) => {
  // STEP 1: Input Validation (The Gatekeeper)
  const inputValidation = symptomInputSchema.safeParse({
    symptoms: symptomsText,
  });

  if (!inputValidation.success) {
    // Hitesh Sir's architecture: Throw custom ApiError for bad requests
    throw new ApiError(400, inputValidation.error.errors[0].message);
  }

  // STEP 2: Prompt Engineering (The Control Room)
  const prompt = `
    You are a highly empathetic AI Healthcare Assistant. 
    Analyze the following patient symptoms: "${inputValidation.data.symptoms}"

    Your job is to give the patient a clear idea of their condition without causing panic. 
    Include 1 or 2 or 3 common, possible reasons (conditions/diseases) for these symptoms. 
    You MUST include a short disclaimer saying this is just an AI assessment and not a final medical diagnosis.
    
    For the specialistRecommendation, you MUST choose ONLY ONE of the following exact categories that best fits the symptoms:
    "General Medicine", "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology", "Neurology", "Oncology", "Pediatrics", "Psychiatry", "Orthopedics", "Ophthalmology", "ENT (Otolaryngology)", "Gynecology", "Urology", "Nephrology", "Pulmonology", "Rheumatology", "Dental", "Surgery", "Psychology", "Nutrition & Dietetics".
    If none fit perfectly, use "Other".

    Return a JSON object matching this exact structure:
    {
        "aiSymptomSummary": "string (Empathetic summary + possible conditions + short disclaimer)",
        "specialistRecommendation": "string (Must be EXACTLY one of the allowed categories listed above)",
        "severityLevel": "LOW | MEDIUM | HIGH"
    }
`;
  try {
    // STEP 3: Execute AI Model (The Brain)
    const result = await aiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        // This forces Gemini to output strictly in JSON format without hallucinations
        responseMimeType: "application/json",
      },
    });

    // Extract the raw text from AI response and parse it into a JavaScript Object
    const rawResponse = result.response.text();
    const parsedAiData = JSON.parse(rawResponse);

    // STEP 4: Output Validation (The Interrogation Room)
    const outputValidation = aiSymptomOutputSchema.safeParse(parsedAiData);

    if (!outputValidation.success) {
      // Log the actual error for debugging, but throw a clean ApiError for the system
      console.error("AI Hallucination Detected:", outputValidation.error);
      throw new ApiError(500, "AI returned invalid data structure.");
    }

    // Return the clean, type-safe data to the controller
    return outputValidation.data;
  } catch (error) {
    console.error("AI Service Execution Error:", error);

    // STEP 5: Fallback Mechanism (The Safety Net)
    // If API is down or parsing fails, return safe default data instead of crashing the app
    return {
      aiSymptomSummary:
        "Unable to process symptoms automatically at this moment.",
      specialistRecommendation: "General Physician",
      severityLevel: "MEDIUM",
    };
  }
};
