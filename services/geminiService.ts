
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

export const visualTryOn = (personImageData: string, personMimeType: string, clothingImageData: string, clothingMimeType: string, clothingType: ClothingType, userApiKey?: string): Promise<TryOnResult> => {
    const apiKey = getApiKey(userApiKey);
    const prompt = getPromptForClothingType(clothingType);
    return generateFinalImage(personImageData, personMimeType, clothingImageData, clothingMimeType, prompt, apiKey);
};

export const extractClothingItems = async (imageData: string, mimeType: string, userApiKey?: string): Promise<TryOnResult[]> => {
    const apiKey = getApiKey(userApiKey);
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { inlineData: { data: imageData, mimeType: mimeType } },
                { text: "You are an expert at image segmentation. Identify every distinct clothing item (like shirts, pants, jackets, shoes, hats) in the image. For each item you find, create a new image that contains only that single item on a transparent background. Output all the generated images." },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const parts = getValidatedParts(response, "The AI couldn't extract clothing items.");
    const results: TryOnResult[] = [];
    for (const part of parts) {
        if (part.inlineData) {
            results.push({
                imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                text: null
            });
        }
    }

    if (results.length === 0) {
        const textPart = parts.find(p => p.text);
        if (textPart && textPart.text) {
            throw new Error(`The AI provided feedback: ${textPart.text}`);
        }
        throw new Error("The AI did not extract any clothing items.");
    }
    return results;
};

export const generate3DViews = async (imageData: string, mimeType: string, userApiKey?: string): Promise<TryOnResult[]> => {
    const apiKey = getApiKey(userApiKey);
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { inlineData: { data: imageData, mimeType: mimeType } },
                { text: "Given this single image of a product (sunglasses), generate a style sheet of multiple photorealistic views from different angles: front, side, three-quarter, and top-down. Output each view as a separate image." },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    const parts = getValidatedParts(response, "The AI couldn't generate 3D views.");
    const results: TryOnResult[] = [];
    for (const part of parts) {
        if (part.inlineData) {
            results.push({
                imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                text: null
            });
        }
    }
    
    if (results.length === 0) {
        const textPart = parts.find(p => p.text);
        if (textPart && textPart.text) {
            throw new Error(`The AI provided feedback: ${textPart.text}`);
        }
        throw new Error("The AI did not generate any views.");
    }
    return results;
};

export const glassesTryOn = async (personData: string, personMimeType: string, glassesData: string, glassesMimeType: string, userApiKey?: string): Promise<TryOnResult[]> => {
    const apiKey = getApiKey(userApiKey);
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { inlineData: { data: personData, mimeType: personMimeType } },
                { inlineData: { data: glassesData, mimeType: glassesMimeType } },
                { text: "You are an expert digital stylist specializing in eyewear. The first image is a person. The second image is a style sheet of sunglasses from multiple angles. Your task is to create two photorealistic images of the person wearing the sunglasses. One from a frontal view, and one from a slight side (three-quarter) view. Ensure the fit, perspective, and lighting are realistic. Output only the two final edited images." },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const parts = getValidatedParts(response, "The AI couldn't perform the glasses try-on.");
    const results: TryOnResult[] = [];
    for (const part of parts) {
        if (part.inlineData) {
            results.push({
                imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                text: null
            });
        }
    }
    
    if (results.length === 0) {
        const textPart = parts.find(p => p.text);
        if (textPart && textPart.text) {
            throw new Error(`The AI provided feedback: ${textPart.text}`);
        }
        throw new Error("The AI did not generate any try-on images.");
    }
    return results;
};

// Fix: Completed the implementation of generateInteriorDesign.
export const generateInteriorDesign = async (data: string, mimeType: string, stylePrompt: string, userApiKey?: string): Promise<TryOnResult> => {
    const apiKey = getApiKey(userApiKey);
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert architect and interior designer. Your task is to convert the provided 2D floor plan into a single, beautiful, photorealistic, top-down 3D rendering of a fully furnished and decorated interior.
The final image should look like a professional architectural visualization.
${stylePrompt ? `Adhere to the following style guide: ${stylePrompt}.` : "Use a modern, elegant, and inviting style."}
Ensure the layout in your rendering accurately reflects the floor plan. Output only the final rendered image.`;

    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { inlineData: { data: data, mimeType: mimeType } },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const parts = getValidatedParts(response, "The AI couldn't generate an interior design.");
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
        if (result.text) {
            throw new Error(`The AI provided feedback: ${result.text}`);
        }
        throw new Error("The AI did not generate an image. Please try a different floor plan.");
    }

    return result;
};

// Fix: Added and exported the missing generateRoomView function.
export const generateRoomView = async (data: string, mimeType: string, userApiKey?: string): Promise<TryOnResult> => {
    const apiKey = getApiKey(userApiKey);
    const ai = new GoogleGenAI({ apiKey });
    const prompt = "You are an expert architectural visualizer. Your task is to transform this top-down view of a room into a photorealistic, eye-level, first-person perspective. Imagine you are standing inside this room and taking a photograph. The generated image must show the room from a human viewpoint, looking forward. It is crucial that you DO NOT output another top-down or bird's-eye view. The style and furniture from the input image must be accurately represented in the new perspective. Output only the final, first-person view image.";

    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { inlineData: { data: data, mimeType: mimeType } },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const parts = getValidatedParts(response, "The AI couldn't generate a room view.");
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
        if (result.text) {
            throw new Error(`The AI provided feedback: ${result.text}`);
        }
        throw new Error("The AI did not generate an image for the room view.");
    }

    return result;
};
