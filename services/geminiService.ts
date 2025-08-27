import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { GenerateContentResponse, Part } from "@google/genai";
import type { TryOnResult, Room } from '../types';

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

const generateSingleImage = async (
  parts: Part[],
  apiKey: string,
  errorPrefix: string = "The AI couldn't generate an image."
): Promise<TryOnResult> => {
    const ai = new GoogleGenAI({ apiKey });
    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const responseParts = getValidatedParts(response, errorPrefix);
    const result: TryOnResult = { imageUrl: null, text: null };

    for (const part of responseParts) {
        if (part.text) {
            result.text = part.text;
        } else if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            result.imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
            break; // We only need one image
        }
    }
    
    if (!result.imageUrl) {
        if (result.text) {
            throw new Error(`The AI provided feedback: ${result.text}`);
        }
        throw new Error("The AI did not generate an image. Please try a different one.");
    }

    return result;
}

const generateMultipleImages = async (
  parts: Part[],
  apiKey: string,
  errorPrefix: string = "The AI couldn't generate images."
): Promise<TryOnResult[]> => {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const responseParts = getValidatedParts(response, errorPrefix);
    const results: TryOnResult[] = [];
    for (const part of responseParts) {
        if (part.inlineData) {
            results.push({
                imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                text: null,
            });
        }
    }
    if (results.length === 0) {
        throw new Error("The AI did not generate any images. Try again or adjust the prompt.");
    }
    return results;
}

export const visualTryOn = (personImageData: string, personMimeType: string, clothingImageData: string, clothingMimeType: string, prompt: string, userApiKey?: string): Promise<TryOnResult> => {
    const apiKey = getApiKey(userApiKey);
    const parts: Part[] = [
      { inlineData: { data: personImageData, mimeType: personMimeType } },
      { inlineData: { data: clothingImageData, mimeType: clothingMimeType } },
      { text: prompt },
    ];
    return generateSingleImage(parts, apiKey, "The AI couldn't generate the try-on image.");
};

export const extractClothingItems = (imageData: string, mimeType: string, prompt: string, userApiKey?: string): Promise<TryOnResult[]> => {
    const apiKey = getApiKey(userApiKey);
    const parts: Part[] = [
        { inlineData: { data: imageData, mimeType: mimeType } },
        { text: prompt },
    ];
    return generateMultipleImages(parts, apiKey, "The AI couldn't extract clothing items.");
};

export const glassesTryOn = (personImageData: string, personMimeType: string, glassesImageData: string, glassesMimeType: string, prompt: string, userApiKey?: string): Promise<TryOnResult[]> => {
    const apiKey = getApiKey(userApiKey);
    const parts: Part[] = [
        { inlineData: { data: personImageData, mimeType: personMimeType } },
        { inlineData: { data: glassesImageData, mimeType: glassesMimeType } },
        { text: prompt },
    ];
    return generateMultipleImages(parts, apiKey, "The AI couldn't generate the glasses try-on.");
}

export const generate3DViews = (imageData: string, mimeType: string, prompt: string, userApiKey?: string): Promise<TryOnResult[]> => {
    const apiKey = getApiKey(userApiKey);
    const parts: Part[] = [
        { inlineData: { data: imageData, mimeType: mimeType } },
        { text: prompt },
    ];
    return generateMultipleImages(parts, apiKey, "The AI couldn't generate 3D views.");
}

export const generateInteriorDesign = (imageData: string, mimeType: string, prompt: string, userApiKey?: string): Promise<TryOnResult> => {
    const apiKey = getApiKey(userApiKey);
    const parts: Part[] = [
        { inlineData: { data: imageData, mimeType: mimeType } },
        { text: prompt },
    ];
    return generateSingleImage(parts, apiKey, "The AI couldn't generate the interior design.");
};

export const generateRoomView = (imageData: string, mimeType: string, prompt: string, userApiKey?: string): Promise<TryOnResult> => {
    const apiKey = getApiKey(userApiKey);
    const parts: Part[] = [
        { inlineData: { data: imageData, mimeType: mimeType } },
        { text: prompt },
    ];
    return generateSingleImage(parts, apiKey, "The AI couldn't generate the room view.");
};

export const generalImageEdit = (imageData: string, mimeType: string, prompt: string, userApiKey?: string): Promise<TryOnResult> => {
    const apiKey = getApiKey(userApiKey);
    const parts: Part[] = [
        { inlineData: { data: imageData, mimeType: mimeType } },
        { text: prompt },
    ];
    return generateSingleImage(parts, apiKey, "The AI couldn't edit the image.");
};
