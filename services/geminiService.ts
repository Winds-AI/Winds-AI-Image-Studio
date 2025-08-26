
import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { GenerateContentResponse, Part } from "@google/genai";
import type { TryOnResult, ClothingType, Room } from '../types';

const model = 'gemini-2.5-flash-image-preview';

const getApiKey = (userApiKey?: string): string => {
    const key = userApiKey || process.env.API_KEY;
    if (!key) {
        throw new Error("Gemini API key is not configured. Please provide one in the UI or set the API_KEY environment variable.");
    }
    return key;
}

/**
 * Validates the response from the Gemini API.
 * Throws a user-friendly error if the response is empty or blocked.
 * @param response The response object from the API.
 * @param userFriendlyErrorPrefix A prefix for the error message shown to the user.
 * @returns The content parts from the response if valid.
 */
function getValidatedParts(response: GenerateContentResponse, userFriendlyErrorPrefix: string): Part[] {
    const parts = response.candidates?.[0]?.content?.parts;

    if (!parts || parts.length === 0) {
        const blockReason = response.promptFeedback?.blockReason;
        const safetyRatings = response.promptFeedback?.safetyRatings;
        
        // Log detailed error for developers
        console.error("Gemini API Error: No content returned.", { 
            promptFeedback: response.promptFeedback, 
            candidates: response.candidates 
        });

        // Create user-friendly error
        let errorMessage = userFriendlyErrorPrefix;
        if (blockReason === 'SAFETY') {
            const blockedCategories = safetyRatings?.filter(r => r.blocked).map(r => r.category.replace('HARM_CATEGORY_', '')) || [];
            if (blockedCategories.length > 0) {
                errorMessage += ` The request was blocked for safety reasons (${blockedCategories.join(', ')}). Please try a different image.`;
            } else {
                errorMessage += " The request was blocked for safety reasons. Please try a different image.";
            }
        } else if (blockReason) {
            errorMessage += ` The request was blocked: ${blockReason}.`;
        } else {
            errorMessage += " The model did not return any content. Please try again with a different image.";
        }
        
        throw new Error(errorMessage);
    }
    
    return parts;
}


const generateFinalImage = async (
  personImageData: string,
  personMimeType: string,
  clothingImageData: string,
  clothingMimeType: string,
  prompt: string,
  apiKey: string,
): Promise<TryOnResult> => {
    const ai = new GoogleGenAI({ apiKey });
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            { inlineData: { data: personImageData, mimeType: personMimeType } },
            { inlineData: { data: clothingImageData, mimeType: clothingMimeType } },
            { text: prompt },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const parts = getValidatedParts(response, "The AI couldn't generate an image.");
    const result: TryOnResult = { imageUrl: null, text: null };

    for (const part of parts) {
        if (part.text) {
            result.text = part.text;
        } else if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            result.imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
        }
    }
    
    if (!result.imageUrl) {
        // If the model returned an explanation instead of an image, use it as the error message.
        if (result.text) {
            throw new Error(`The AI provided feedback: ${result.text}`);
        }
        // Fallback if the model returns parts, but no image part and no text.
        throw new Error("The AI did not generate an image. Please try a different one.");
    }

    return result;
}

const getPromptForClothingType = (clothingType: ClothingType): string => {
    const basePrompt = "You are an expert digital stylist. Your primary goal is to create a photorealistic image of the person from the first image wearing the clothing item from the second image. Ensure the fit, drape, texture, and lighting are consistent with the original photo. Output only the final edited image.";

    switch (clothingType) {
        case 'top':
            return `Task: Replace the person's existing top (shirt, t-shirt, blouse, etc.) with the clothing item from the second image. Do not alter their pants, skirt, or other clothing unless necessary for a natural look. ${basePrompt}`;
        case 'bottom':
            return `Task: Replace the person's existing bottoms (pants, skirt, shorts, etc.) with the clothing item from the second image. Do not alter their top unless necessary for a natural look (e.g., tucking in a shirt). ${basePrompt}`;
        case 'outerwear':
            return `Task: Place the outerwear item from the second image over the person's existing clothes. Ensure it layers naturally. ${basePrompt}`;
        case 'fullBody':
            return `Task: Replace the person's existing outfit with the full-body item (dress, jumpsuit, etc.) from the second image. ${basePrompt}`;
        default:
            return basePrompt;
    }
};

// NOTE: The user-provided file was incomplete. The functions below are synthesized based on their usage in App.tsx to ensure the app remains functional.

export const visualTryOn = (personImageData: string, personMimeType: string, clothingImageData: string, clothingMimeType: string, clothingType: ClothingType, userApiKey?: string): Promise<TryOnResult> => {
    const apiKey = getApiKey(userApiKey);
    const prompt = getPromptForClothingType(clothingType);
    return generateFinalImage(personImageData, personMimeType, clothingImageData, clothingMimeType, prompt, apiKey);
};
export const extractClothingItems = async (imageData: string, mimeType: string, userApiKey?: string): Promise<TryOnResult[]> => { throw new Error("Function not implemented in provided file."); };
export const generate3DViews = async (imageData: string, mimeType: string, userApiKey?: string): Promise<TryOnResult[]> => { throw new Error("Function not implemented in provided file."); };
export const glassesTryOn = async (personData: string, personMimeType: string, glassesData: string, glassesMimeType: string, userApiKey?: string): Promise<TryOnResult[]> => { throw new Error("Function not implemented in provided file."); };
export const generateInteriorDesign = async (data: string, mimeType: string, stylePrompt: string, userApiKey?: string): Promise<TryOnResult> => { throw new Error("Function not implemented in provided file."); };

export const identifyAndSegmentRooms = async (imageData: string, mimeType: string, userApiKey?: string): Promise<{ rooms: Room[], maskImageUrl: string }> => {
    const apiKey = getApiKey(userApiKey);
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { inlineData: { data: imageData, mimeType: mimeType } },
                { text: "Analyze this floor plan. Identify all distinct rooms (like 'Kitchen', 'Living Room', 'Bedroom 1', 'Bathroom'). For each room, provide its name, a unique hex color code, and a normalized bounding box (x, y, width, height). Also, generate a segmentation mask image where each room is filled with its assigned unique color." },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    rooms: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                color: { type: Type.STRING },
                                boundary: {
                                    type: Type.OBJECT,
                                    properties: {
                                        x: { type: Type.NUMBER },
                                        y: { type: Type.NUMBER },
                                        width: { type: Type.NUMBER },
                                        height: { type: Type.NUMBER },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const parts = getValidatedParts(response, "The AI couldn't identify rooms in the floor plan.");
    let jsonStr: string | null = null;
    let maskImageUrl: string | null = null;

    for (const part of parts) {
        if (part.text) {
            jsonStr = part.text.trim();
        } else if (part.inlineData) {
            maskImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }

    if (!jsonStr || !maskImageUrl) {
        throw new Error("The AI did not return both room data and a mask image.");
    }

    try {
        const parsedJson = JSON.parse(jsonStr);
        return { rooms: parsedJson.rooms || [], maskImageUrl };
    } catch (e) {
        console.error("Failed to parse JSON from Gemini:", jsonStr);
        throw new Error("The AI returned invalid room data.");
    }
};

export const generateRoomView = async (
  imageData: string,
  mimeType: string,
  roomName: string,
  boundary: { x: number; y: number; width: number; height: number },
  userApiKey?: string,
): Promise<TryOnResult> => {
  const apiKey = getApiKey(userApiKey);
  const ai = new GoogleGenAI({ apiKey });

  const boundaryText = `The room is located in a normalized bounding box with top-left corner at (${boundary.x.toFixed(3)}, ${boundary.y.toFixed(3)}) and dimensions (${boundary.width.toFixed(3)} x ${boundary.height.toFixed(3)}).`;

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        { inlineData: { data: imageData, mimeType: mimeType } },
        {
          text: `You are an expert interior design visualizer. Your task is to generate a single, photorealistic, first-person perspective view of the ${roomName} from the provided floor plan image.
          ${boundaryText}
          Crucially, you must use the furniture, layout, color scheme, textures, and overall style depicted *within that boundary* on the floor plan as a direct visual reference.
          Do not invent a new design. Your goal is to create a faithful, eye-level rendering of the room as it is already designed in the plan.
          Output only the final image.`,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  const parts = getValidatedParts(response, "The AI couldn't generate a view for this room.");
  const result: TryOnResult = { imageUrl: null, text: null };

  for (const part of parts) {
    if (part.text) {
      result.text = part.text;
    } else if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const partMimeType = part.inlineData.mimeType;
      result.imageUrl = `data:${partMimeType};base64,${base64ImageBytes}`;
      break; 
    }
  }

  if (!result.imageUrl) {
    if (result.text) {
      throw new Error(`The AI provided feedback: ${result.text}`);
    }
    throw new Error("The AI did not generate an image for the room view.");
  }

  return result;
};
