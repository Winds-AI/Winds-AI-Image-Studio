
import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateContentResponse, Part } from "@google/genai";
import type { TryOnResult, ClothingType } from '../types';

const model = 'gemini-2.5-flash-image-preview';

const getApiKey = (userApiKey?: string): string => {
    const key = userApiKey;
    if (!key) {
        throw new Error("Gemini API key is not configured. Please enter your API key in the UI.");
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
            return `Task: Replace the person's existing top (shirt, t-shirt, blouse, etc.) with the clothing item from the second image. Do not alter their pants, skirt, or any other lower-body clothing. ${basePrompt}`;
        case 'bottom':
            return `Task: Replace the person's existing bottom clothing (pants, skirt, shorts, etc.) with the clothing item from the second image. Do not alter their shirt or any other upper-body clothing. ${basePrompt}`;
        case 'outerwear':
            return `Task: Place the outerwear item (jacket, coat, etc.) from the second image over the person's current clothing. The person's existing shirt should be visible underneath if appropriate. The layering must look natural. ${basePrompt}`;
        case 'fullBody':
            return `Task: Replace the person's entire outfit with the full-body garment (dress, jumpsuit, etc.) from the second image. The new item must realistically cover both their upper and lower body. ${basePrompt}`;
        default:
            // Fallback for safety, though the UI should prevent this.
            return `Task: Realistically place the clothing item from the second image onto the person in the first image. If the person is wearing a similar item (e.g., a shirt being replaced by a new shirt, or pants being replaced by new pants), you must replace the existing item. If the item is an addition (e.g., a jacket over a shirt), add it naturally. ${basePrompt}`;
    }
};

export const visualTryOn = async (
  personImageData: string,
  personMimeType: string,
  clothingImageData: string,
  clothingMimeType: string,
  clothingType: ClothingType,
  userApiKey?: string,
): Promise<TryOnResult> => {
  try {
    const apiKey = getApiKey(userApiKey);
    const prompt = getPromptForClothingType(clothingType);
    return await generateFinalImage(personImageData, personMimeType, clothingImageData, clothingMimeType, prompt, apiKey);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate try-on image: ${error.message}`);
    }
    throw new Error("An unknown error occurred during the AI process.");
  }
};

export const extractClothingItems = async (
    imageData: string,
    mimeType: string,
    userApiKey?: string,
): Promise<TryOnResult[]> => {
    try {
        const apiKey = getApiKey(userApiKey);
        const ai = new GoogleGenAI({ apiKey });
        const prompt = "You are a fashion AI assistant. Your task is to isolate clothing items from an image.\n1. Analyze the provided image and identify all distinct articles of clothing (e.g., shirt, pants, jacket).\n2. For each identified article, generate a new image containing only that item.\n3. The generated image for each item must place it on a completely white, featureless background.\n4. Remove the person and any original background elements entirely.\nYour final output should consist solely of these generated images. Do not include any text, descriptions, or commentary.";
        
        const response: GenerateContentResponse = await ai.models.generateContent({
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

        const parts = getValidatedParts(response, "Failed to extract clothing items.");
        const results: TryOnResult[] = [];
        let modelFeedback: string | null = null;

        for (const part of parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageMimeType = part.inlineData.mimeType;
                results.push({
                    imageUrl: `data:${imageMimeType};base64,${base64ImageBytes}`,
                    text: null
                });
            } else if (part.text) {
                modelFeedback = (modelFeedback ? `${modelFeedback}\n` : "") + part.text;
            }
        }

        if (results.length === 0) {
            if (modelFeedback) {
                throw new Error(`The AI provided feedback: ${modelFeedback}`);
            }
            throw new Error("The AI did not extract any items. Please try a clearer photo.");
        }

        return results;

    } catch (error) {
        console.error("Error calling Gemini API for clothing extraction:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to extract clothing items: ${error.message}`);
        }
        throw new Error("An unknown error occurred during the AI extraction process.");
    }
};

export const generate3DViews = async (
    imageData: string,
    mimeType: string,
    userApiKey?: string,
): Promise<TryOnResult[]> => {
    try {
        const apiKey = getApiKey(userApiKey);
        const ai = new GoogleGenAI({ apiKey });
        const prompt = "You are a product photography AI. Your task is to generate a multi-angle product showcase for the sunglasses in the input image.\n1. Isolate the sunglasses from the original image, removing all background and any person wearing them.\n2. Generate several new images of the isolated sunglasses from different perspectives:\n    - Front view\n    - Side view (profile)\n    - Three-quarter view\n    - Top-down view\n3. Each new image must show the sunglasses on a clean, plain white background.\nYour final output must only be the generated images. Do not add any text.";
        
        const response: GenerateContentResponse = await ai.models.generateContent({
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

        const parts = getValidatedParts(response, "Failed to generate 3D views.");
        const results: TryOnResult[] = [];
        let modelFeedback: string | null = null;

        for (const part of parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageMimeType = part.inlineData.mimeType;
                results.push({
                    imageUrl: `data:${imageMimeType};base64,${base64ImageBytes}`,
                    text: null
                });
            } else if (part.text) {
                modelFeedback = (modelFeedback ? `${modelFeedback}\n` : "") + part.text;
            }
        }

        if (results.length === 0) {
            if (modelFeedback) {
                throw new Error(`The AI provided feedback: ${modelFeedback}`);
            }
            throw new Error("The AI failed to generate the multi-angle views. Please try a different image.");
        }

        return results;

    } catch (error) {
        console.error("Error calling Gemini API for 3D view generation:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate 3D views: ${error.message}`);
        }
        throw new Error("An unknown error occurred during the AI 3D view generation process.");
    }
};

export const glassesTryOn = async (
    personImageData: string,
    personMimeType: string,
    glassesImageData: string,
    glassesMimeType: string,
    userApiKey?: string,
): Promise<TryOnResult[]> => {
    try {
        const apiKey = getApiKey(userApiKey);
        const ai = new GoogleGenAI({ apiKey });
        const prompt = "You are a virtual try-on AI. You will receive two images: one of a person, and one of sunglasses (possibly with multiple views).\nYour task is to generate 2-3 photorealistic images showing the person wearing the sunglasses.\n1. Accurately place the sunglasses onto the person's face.\n2. Ensure the fit is natural and the perspective is correct.\n3. Match the lighting on the sunglasses to the lighting in the person's photo.\n4. Create a few variations from different camera angles (e.g., front, three-quarter).\nYour final output must only be the generated images. Do not include text.";

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: {
              parts: [
                { inlineData: { data: personImageData, mimeType: personMimeType } },
                { inlineData: { data: glassesImageData, mimeType: glassesMimeType } },
                { text: prompt },
              ],
            },
            config: {
              responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const parts = getValidatedParts(response, "Failed to generate glasses try-on images.");
        const results: TryOnResult[] = [];
        let modelFeedback: string | null = null;

        for (const part of parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageMimeType = part.inlineData.mimeType;
                results.push({
                    imageUrl: `data:${imageMimeType};base64,${base64ImageBytes}`,
                    text: null
                });
            } else if (part.text) {
                modelFeedback = (modelFeedback ? `${modelFeedback}\n` : "") + part.text;
            }
        }
        
        if (results.length === 0) {
            if (modelFeedback) {
                throw new Error(`The AI provided feedback: ${modelFeedback}`);
            }
            throw new Error("The AI failed to generate the glasses try-on images. Please try a different image.");
        }

        return results;

    } catch (error) {
        console.error("Error calling Gemini API for glasses try-on:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate glasses try-on images: ${error.message}`);
        }
        throw new Error("An unknown error occurred during the AI glasses try-on process.");
    }
};
