
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

export const visualTryOn = (personImageData: string, personMimeType: string, clothingImageData: string, clothingMimeType: string, prompt: string, userApiKey?: string): Promise<TryOnResult> => {
    const apiKey = getApiKey(userApiKey);
    return generateFinalImage(personImageData, personMimeType, clothingImageData, clothingMimeType, prompt, apiKey);
};

export const extractClothingItems = async (imageData: string, mimeType: string, prompt: string, userApiKey?: string): Promise<TryOnResult[]> => {
    const apiKey = getApiKey(userApiKey);
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { inlineData: { data: imageData, mimeType: mimeType } },
                { text: prompt },
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

export const generate3DViews = async (imageData: string, mimeType: string, prompt: string, userApiKey?: string): Promise<TryOnResult[]> => {
    const apiKey = getApiKey(userApiKey);
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { inlineData: { data: imageData, mimeType: mimeType } },
                { text: prompt },
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

export const glassesTryOn = async (personData: string, personMimeType: string, glassesData: string, glassesMimeType: string, prompt: string, userApiKey?: string): Promise<TryOnResult[]> => {
    const apiKey = getApiKey(userApiKey);
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { inlineData: { data: personData, mimeType: personMimeType } },
                { inlineData: { data: glassesData, mimeType: glassesMimeType } },
                { text: prompt },
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
export const generateInteriorDesign = async (data: string, mimeType: string, prompt: string, userApiKey?: string): Promise<TryOnResult> => {
    const apiKey = getApiKey(userApiKey);
    const ai = new GoogleGenAI({ apiKey });

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
export const generateRoomView = async (data: string, mimeType: string, prompt: string, userApiKey?: string): Promise<TryOnResult> => {
    const apiKey = getApiKey(userApiKey);
    const ai = new GoogleGenAI({ apiKey });

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
