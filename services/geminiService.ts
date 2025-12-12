import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

// Helper to convert Blob to Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateExpandedImage = async (
  originalImageBase64: string,
  targetRatio: AspectRatio,
  promptDescription: string = "Expand this image naturally."
): Promise<string> => {
  try {
    // We strictly use process.env.API_KEY as per instructions.
    // The key must be selected via window.aistudio for this model.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: `Perform an outpainting task to resize the image to aspect ratio ${targetRatio}. 
            ${promptDescription} 
            Critical instructions:
            1. Keep the original central image absolutely unchanged and intact.
            2. Only generate new content in the added empty space (borders).
            3. The new background must seamlessly blend with the original lighting, textures, and style.
            4. High photorealism.`,
          },
          {
            inlineData: {
              data: originalImageBase64,
              mimeType: 'image/png', // Assuming PNG for generic handling.
            },
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: targetRatio,
          imageSize: "1K", 
        },
      },
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};