import { z } from "zod";
import aiModel from "../config/ai.config.js";
import { ApiError } from "../utils/apiError.js";
import fs from "fs";

export const prescriptionOutputSchema = z
  .array(
    z.object({
      medicineName: z
        .string()
        .describe(
          "The exact brand name visually seen. If totally unreadable, output 'Unreadable (Manual Check Required)'."
        ),
      genericName: z
        .string()
        .describe(
          "The generic chemical composition. If unreadable, output 'Unreadable'."
        ),
      usage: z
        .string()
        .describe(
          "Dosage instructions and duration in Bengali (e.g., 'রোজ ১টি করে ২ মাস'). Read carefully as duration might be written in Bengali script."
        ),
      sideEffects: z
        .string()
        .describe(
          "1 or 2 most common side effects of this medicine written in Bengali. Keep it very brief."
        ),
    })
  )
  .describe(
    "An array of all medicines found in the prescription. NEVER drop a medicine just because one field is blurry."
  );

// ============================================================================
// 2. THE MAIN SERVICE FUNCTION (Vision AI)
// ============================================================================
export const decodePrescriptionService = async (file) => {
  if (!file || !file.path) {
    throw new ApiError(400, "Prescription image is missing.");
  }

  const filePath = file.path;
  const mimeType = file.mimetype;

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString("base64");

    const imagePayload = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    // Immediate Housekeeping
    fs.unlinkSync(filePath);

    // ============================================================================
    // THE NEW MASTER PROMPT (Bilingual & Strict Transcription)
    // ============================================================================
    const prompt = `
    You are an elite Medical Data Extractor AI operating in Bangladesh.
    I have attached an image of a real-world medical prescription.

    CRITICAL RULES FOR HYBRID EXTRACTION:
    1. BRAND NAME & DOSAGE (VISUAL + CLEANUP): Extract the brand name and dosage visually. If the doctor's handwriting is messy (e.g., looks like 'Zoventer' but 'Zoventa' is the actual medicine, or 'Maxmin' instead of 'Maxrin'), use your medical knowledge to AUTO-CORRECT it to the nearest valid medicine name available in Bangladesh. Include the power (e.g., 0.4mg, 40mg).
    2. GENERIC NAME & SIDE EFFECTS (KNOWLEDGE BASE): The doctor has NOT written the generic name or side effects in the image. Do NOT look for them visually. Once you identify the corrected brand name, use your internal medical knowledge to fill in the "genericName" (in English) and "sideEffects" (in Bengali).
    3. BILINGUAL DOSAGE: Carefully read Bengali duration and dosage numbers. Pay close attention to whether it says '১ মাস', '২ মাস', '১৪ দিন' etc., and output the exact usage instructions in Bengali.
    4. NO MARKDOWN: Return ONLY the raw JSON array.
    5. ADD WARNING IN THE END THAT SAYS: Gemini is AI and can make mistakes. Always double-check with a healthcare professional before taking any medication.

    Return an ARRAY of JSON objects matching this exact structure:
    [
        {
            "medicineName": "string (Corrected Brand Name with power, e.g., Maxrin 0.4mg)",
            "genericName": "string (Chemical group in English)",
            "usage": "string (Dosage & duration translated to clear Bengali, e.g., 'রাতে ১টি করে ১ মাস')",
            "sideEffects": "string (1-2 brief common side effects in Bengali)"
        }
    ]
`;

    const result = await aiModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }, imagePayload],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const rawResponse = result.response.text();
    const parsedData = JSON.parse(rawResponse);

    const validation = prescriptionOutputSchema.safeParse(parsedData);

    if (!validation.success) {
      console.error("AI Hallucination Detected:", validation.error);
      throw new Error("Invalid AI Data Structure");
    }

    return validation.data;
  } catch (error) {
    console.error("Vision AI Processing Error:", error);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw new ApiError(
      422,
      "ছবিটি অস্পষ্ট বা পড়া যাচ্ছে না। অনুগ্রহ করে আলোতে স্পষ্ট ছবি তুলে আবার আপলোড করুন।"
    );
  }
};