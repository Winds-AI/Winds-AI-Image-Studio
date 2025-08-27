
import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Header } from './components/Header';
import { TryOnButton } from './components/TryOnButton';
// Fix: Added generateRoomView to imports
import { visualTryOn, extractClothingItems, generate3DViews, glassesTryOn, generateInteriorDesign, generateRoomView, generalImageEdit } from './services/geminiService';
import type { ClothingType, TryOnResult, AppMode, Studio } from './types';
import { ExtractorResultDisplay } from './components/ExtractorResultDisplay';
import { ThreeDViewResultDisplay } from './components/ThreeDViewResultDisplay';
import { GlassesTryOnResultDisplay } from './components/GlassesTryOnResultDisplay';
import { InteriorResultDisplay } from './components/InteriorResultDisplay';
import { InteriorViewResultDisplay } from './components/InteriorViewResultDisplay';
import { ClothingTypeSelector } from './components/ClothingTypeSelector';
import { ApiKeyInput } from './components/ApiKeyInput';
import { SelectionEditor } from './components/SelectionEditor';
import { HomeIcon } from './components/icons/HomeIcon';
import { ExamplesPage } from './pages/ExamplesPage';
import { ImageEditingResultDisplay } from './components/ImageEditingResultDisplay';

const App: React.FC = () => {
  // App view state
  const [view, setView] = useState<'studio' | 'examples'>('studio');
  
  // Common state
  const [activeStudio, setActiveStudio] = useState<Studio>('apparel');
  const [appMode, setAppMode] = useState<AppMode>('clothingTryOn');
  const [error, setError] = useState<string | null>(null);
  const [userApiKey, setUserApiKey] = useState<string>('');

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

  // Clothing Try-On Mode State
  const [personImageForClothing, setPersonImageForClothing] = useState<string | null>(null);
  const [clothingItemImage, setClothingItemImage] = useState<string | null>(null);
  const [clothingType, setClothingType] = useState<ClothingType>('top');
  const [clothingTryOnPrompt, setClothingTryOnPrompt] = useState<string>(getPromptForClothingType('top'));
  const [clothingTryOnResult, setClothingTryOnResult] = useState<TryOnResult | null>(null);
  const [isTryingOnClothing, setIsTryingOnClothing] = useState<boolean>(false);

  // Glasses Try-On Mode State
  const [personImageForGlasses, setPersonImageForGlasses] = useState<string | null>(null);
  const [glassesImage, setGlassesImage] = useState<string | null>(null);
  const [glassesTryOnPrompt, setGlassesTryOnPrompt] = useState<string>("You are an expert digital stylist specializing in eyewear. The first image is a person. The second image is a style sheet of sunglasses from multiple angles. Your task is to create two photorealistic images of the person wearing the sunglasses. One from a frontal view, and one from a slight side (three-quarter) view. Ensure the fit, perspective, and lighting are realistic. Output only the two final edited images.");
  const [glassesTryOnResults, setGlassesTryOnResults] = useState<TryOnResult[] | null>(null);
  const [isTryingOnGlasses, setIsTryingOnGlasses] = useState<boolean>(false);

  // Extractor Mode State
  const [extractorImage, setExtractorImage] = useState<string | null>(null);
  const [extractorPrompt, setExtractorPrompt] = useState<string>("You are an expert at image segmentation. Identify every distinct clothing item (like shirts, pants, jackets, shoes, hats) in the image. For each item you find, create a new image that contains only that single item on a transparent background. Output all the generated images.");
  const [extractedItems, setExtractedItems] = useState<TryOnResult[] | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  // 3D View Mode State
  const [threeDViewImage, setThreeDViewImage] = useState<string | null>(null);
  const [threeDViewPrompt, setThreeDViewPrompt] = useState<string>("Given this single image of a product (sunglasses), generate a style sheet of multiple photorealistic views from different angles: front, side, three-quarter, and top-down. Output each view as a separate image.");
  const [threeDViewResults, setThreeDViewResults] = useState<TryOnResult[] | null>(null);
  const [isGenerating3DView, setIsGenerating3DView] = useState<boolean>(false);

  // Interior Design Mode State
  const [floorPlanImage, setFloorPlanImage] = useState<string | null>(null);
  const [furnishedPlanImage, setFurnishedPlanImage] = useState<string | null>(null);
  const [interiorSourceTab, setInteriorSourceTab] = useState<'generate' | 'upload'>('generate');
  const [interiorDesignPrompt, setInteriorDesignPrompt] = useState<string>('You are an expert architect and interior designer. Your task is to convert the provided 2D floor plan into a single, beautiful, photorealistic, top-down 3D rendering of a fully furnished and decorated interior.\nThe final image should look like a professional architectural visualization.\nUse a modern, elegant, and inviting style.\nEnsure the layout in your rendering accurately reflects the floor plan. Output only the final rendered image.');
  const [interiorDesignResult, setInteriorDesignResult] = useState<TryOnResult | null>(null);
  const [isGeneratingInterior, setIsGeneratingInterior] = useState<boolean>(false);

  // Interior View Mode State
  const [interiorViewPrompt, setInteriorViewPrompt] = useState<string>("You are an expert architectural visualizer. Your task is to transform this top-down view of a room into a photorealistic, eye-level, first-person perspective. Imagine you are standing inside this room and taking a photograph. The generated image must show the room from a human viewpoint, looking forward. It is crucial that you DO NOT output another top-down or bird's-eye view. The style and furniture from the input image must be accurately represented in the new perspective. Output only the final, first-person view image.");
  const [interiorViewResult, setInteriorViewResult] = useState<TryOnResult | null>(null);
  const [isGeneratingInteriorView, setIsGeneratingInteriorView] = useState<boolean>(false);
  
  // Image Editing Mode State
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string>("You are a professional photo editor. Apply the following edit to the image: Make the sky a dramatic sunset.");
  const [editingResult, setEditingResult] = useState<TryOnResult | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    try {
        const storedKey = localStorage.getItem('geminiUserApiKey');
        if (storedKey) {
            setUserApiKey(storedKey);
        }
    } catch (e) {
        console.error("Could not access local storage:", e);
    }
  }, []);
  
  useEffect(() => {
    setClothingTryOnPrompt(getPromptForClothingType(clothingType));
  }, [clothingType]);


  const handleUserApiKeyChange = (key: string) => {
      setUserApiKey(key);
      try {
          localStorage.setItem('geminiUserApiKey', key);
      } catch (e) {
          console.error("Could not access local storage:", e);
      }
  };

  const extractMimeTypeAndData = (base64String: string): { mimeType: string, data: string } => {
    // Check if it's a direct URL from the examples folder
    if (!base64String.startsWith('data:')) {
        // Assume it's a common image type and fetch it.
        // This is a simplified approach for the examples feature.
        // A more robust solution would involve actually fetching and converting.
        const extension = base64String.split('.').pop()?.toLowerCase();
        const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
        return { mimeType, data: base64String };
    }
    const match = base64String.match(/^data:(image\/(?:jpeg|png|webp|avif));base64,(.+)$/);
    if (!match) {
        throw new Error('Invalid or unsupported image format. Please use JPEG, PNG, WebP, or AVIF.');
    }
    return { mimeType: match[1], data: match[2] };
  };

  const imageToData = async (imageUrl: string): Promise<string> => {
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error converting image URL to data URL:", error);
        setError("Could not load the example image. Please check your network connection.");
        return ""; // Return empty string on failure
    }
  };
  
  const handleApiError = (err: unknown) => {
    let errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    if (typeof errorMessage === 'string' && (errorMessage.toLowerCase().includes('quota exceeded') || errorMessage.toLowerCase().includes('daily limit'))) {
        errorMessage = 'API quota exceeded. Free-tier accounts have low daily limits for this model. Please try again after the daily reset (midnight PST), or add a payment method to your Google Cloud project to increase your limits.';
    }
    setError(errorMessage);
  };

  // AI action handlers
  const handleClothingTryOn = useCallback(async () => {
    if (!personImageForClothing || !clothingItemImage) {
      setError('Please upload both a person and a clothing photo.');
      return;
    }
    if (!userApiKey && !process.env.API_KEY) {
      setError('Please provide your Gemini API Key to use this feature.');
      return;
    }
    setError(null);
    setClothingTryOnResult(null);
    setIsTryingOnClothing(true);
    try {
      const [personImageB64, clothingImageB64] = await Promise.all([
        imageToData(personImageForClothing),
        imageToData(clothingItemImage)
      ]);
      if (!personImageB64 || !clothingImageB64) return;

      const { mimeType: personMimeType, data: personData } = extractMimeTypeAndData(personImageB64);
      const { mimeType: clothingMimeType, data: clothingData } = extractMimeTypeAndData(clothingImageB64);
      const result = await visualTryOn(personData, personMimeType, clothingData, clothingMimeType, clothingTryOnPrompt, userApiKey);
      setClothingTryOnResult(result);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsTryingOnClothing(false);
    }
  }, [personImageForClothing, clothingItemImage, clothingTryOnPrompt, userApiKey]);
  
  const handleGlassesTryOn = useCallback(async () => {
    if (!personImageForGlasses || !glassesImage) {
      setError('Please upload both a person and a glasses photo.');
      return;
    }
    if (!userApiKey && !process.env.API_KEY) {
      setError('Please provide your Gemini API Key to use this feature.');
      return;
    }
    setError(null);
    setGlassesTryOnResults(null);
    setIsTryingOnGlasses(true);
    try {
      const [personImageB64, glassesImageB64] = await Promise.all([
        imageToData(personImageForGlasses),
        imageToData(glassesImage)
      ]);
      if (!personImageB64 || !glassesImageB64) return;

      const { mimeType: personMimeType, data: personData } = extractMimeTypeAndData(personImageB64);
      const { mimeType: glassesMimeType, data: glassesData } = extractMimeTypeAndData(glassesImageB64);
      const results = await glassesTryOn(personData, personMimeType, glassesData, glassesMimeType, glassesTryOnPrompt, userApiKey);
      setGlassesTryOnResults(results);
    } catch (err) {
        handleApiError(err);
    } finally {
        setIsTryingOnGlasses(false);
    }
  }, [personImageForGlasses, glassesImage, glassesTryOnPrompt, userApiKey]);

  const handleExtractItems = useCallback(async () => {
    if (!extractorImage) {
        setError('Please upload an image to extract clothing from.');
        return;
    }
    if (!userApiKey && !process.env.API_KEY) {
      setError('Please provide your Gemini API Key to use this feature.');
      return;
    }
    setError(null);
    setExtractedItems(null);
    setIsExtracting(true);
    try {
        const imageB64 = await imageToData(extractorImage);
        if(!imageB64) return;
        const { mimeType, data } = extractMimeTypeAndData(imageB64);
        const results = await extractClothingItems(data, mimeType, extractorPrompt, userApiKey);
        setExtractedItems(results);
    } catch (err) {
        handleApiError(err);
    } finally {
        setIsExtracting(false);
    }
  }, [extractorImage, extractorPrompt, userApiKey]);

  const handleGenerate3DView = useCallback(async () => {
    if (!threeDViewImage) {
      setError('Please upload an image of the sunglasses.');
      return;
    }
    if (!userApiKey && !process.env.API_KEY) {
      setError('Please provide your Gemini API Key to use this feature.');
      return;
    }
    setError(null);
    setThreeDViewResults(null);
    setIsGenerating3DView(true);
    try {
      const imageB64 = await imageToData(threeDViewImage);
      if (!imageB64) return;
      const { mimeType, data } = extractMimeTypeAndData(imageB64);
      const results = await generate3DViews(data, mimeType, threeDViewPrompt, userApiKey);
      setThreeDViewResults(results);
    } catch (err)
 {
      handleApiError(err);
    } finally {
      setIsGenerating3DView(false);
    }
  }, [threeDViewImage, threeDViewPrompt, userApiKey]);

  const handleFloorPlanUpload = (image: string | null) => {
    setFloorPlanImage(image);
    setFurnishedPlanImage(null);
    setInteriorDesignResult(null);
    setInteriorViewResult(null);
    setInteriorSourceTab('generate');
  };

  const handleFurnishedPlanUpload = (image: string | null) => {
      setFurnishedPlanImage(image);
      setFloorPlanImage(null);
      setInteriorDesignResult(null);
      setInteriorViewResult(null);
      setInteriorSourceTab('upload');
  };

  const handleGenerateInteriorDesign = useCallback(async () => {
    if (!floorPlanImage) {
        setError('Please upload a floor plan image.');
        return;
    }
    if (!userApiKey && !process.env.API_KEY) {
        setError('Please provide your Gemini API Key to use this feature.');
        return;
    }
    setError(null);
    setInteriorDesignResult(null);
    setInteriorViewResult(null);
    setFurnishedPlanImage(null);
    setIsGeneratingInterior(true);
    try {
        const imageB64 = await imageToData(floorPlanImage);
        if(!imageB64) return;
        const { mimeType, data } = extractMimeTypeAndData(imageB64);
        const result = await generateInteriorDesign(data, mimeType, interiorDesignPrompt, userApiKey);
        setInteriorDesignResult(result);
    } catch (err) {
        handleApiError(err);
    } finally {
        setIsGeneratingInterior(false);
    }
  }, [floorPlanImage, interiorDesignPrompt, userApiKey]);

  const handleGenerateInteriorView = useCallback(async (selectionDataUrl: string) => {
    if (!selectionDataUrl) {
      setError('Invalid selection data.');
      return;
    }
    if (!userApiKey && !process.env.API_KEY) {
      setError('Please provide your Gemini API Key to use this feature.');
      return;
    }
    setError(null);
    setInteriorViewResult(null);
    setIsGeneratingInteriorView(true);
    try {
      const { mimeType, data } = extractMimeTypeAndData(selectionDataUrl);
      const result = await generateRoomView(data, mimeType, interiorViewPrompt, userApiKey);
      setInteriorViewResult(result);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsGeneratingInteriorView(false);
    }
  }, [userApiKey, interiorViewPrompt]);

  const handleImageEdit = useCallback(async () => {
    if (!editingImage) {
      setError('Please upload an image to edit.');
      return;
    }
    if (!userApiKey && !process.env.API_KEY) {
      setError('Please provide your Gemini API Key to use this feature.');
      return;
    }
    setError(null);
    setEditingResult(null);
    setIsEditing(true);
    try {
      const imageB64 = await imageToData(editingImage);
      if (!imageB64) return;

      const { mimeType, data } = extractMimeTypeAndData(imageB64);
      const result = await generalImageEdit(data, mimeType, editingPrompt, userApiKey);
      setEditingResult(result);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsEditing(false);
    }
  }, [editingImage, editingPrompt, userApiKey]);

  const handleStudioChange = (studio: Studio) => {
    setActiveStudio(studio);
    setError(null);
    if (studio === 'apparel') {
      setAppMode('clothingTryOn');
    } else if (studio === 'eyewear') {
      setAppMode('threeDView');
    } else if (studio === 'interior') {
      setAppMode('interiorDesign');
    } else if (studio === 'creative') {
      setAppMode('imageEditing');
    }
  };

  const renderClothingTryOnMode = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Create Your Look</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUploader id="person-uploader" label="Upload Your Photo" value={personImageForClothing} onChange={setPersonImageForClothing} />
          <ImageUploader id="clothing-uploader" label="Upload Clothing Item" value={clothingItemImage} onChange={setClothingItemImage} />
        </div>
        <ClothingTypeSelector value={clothingType} onChange={setClothingType} />
        <div className="flex flex-col gap-2">
            <label htmlFor="clothing-prompt" className="font-semibold text-gray-300 text-center">Customize Prompt (optional)</label>
            <textarea
                id="clothing-prompt"
                value={clothingTryOnPrompt}
                onChange={(e) => setClothingTryOnPrompt(e.target.value)}
                rows={5}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
        </div>
        <div className="mt-2">
          <TryOnButton onClick={handleClothingTryOn} disabled={!personImageForClothing || !clothingItemImage || isTryingOnClothing} isLoading={isTryingOnClothing} loadingText="Generating...">Generate Look</TryOnButton>
        </div>
      </div>
      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm min-h-[400px] flex flex-col justify-center items-center">
        <ResultDisplay isLoading={isTryingOnClothing} result={clothingTryOnResult} />
      </div>
    </div>
  );
  
  const renderGlassesTryOnMode = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">Try On Glasses</h2>
            <p className="text-center text-gray-400 -mt-4 mb-6">Upload your photo and a multi-angle glasses image.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUploader id="person-glasses-uploader" label="Upload Your Photo" value={personImageForGlasses} onChange={setPersonImageForGlasses} />
                <ImageUploader id="glasses-uploader" label="Upload Glasses Photo" value={glassesImage} onChange={setGlassesImage} />
            </div>
            <div className="flex flex-col gap-2 mt-6">
                <label htmlFor="glasses-prompt" className="font-semibold text-gray-300 text-center">Customize Prompt (optional)</label>
                <textarea
                    id="glasses-prompt"
                    value={glassesTryOnPrompt}
                    onChange={(e) => setGlassesTryOnPrompt(e.target.value)}
                    rows={5}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
            </div>
            <div className="mt-8">
                <TryOnButton onClick={handleGlassesTryOn} disabled={!personImageForGlasses || !glassesImage || isTryingOnGlasses} isLoading={isTryingOnGlasses} loadingText="Generating...">Generate Views</TryOnButton>
            </div>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm min-h-[400px] flex flex-col justify-center items-center">
            <GlassesTryOnResultDisplay isLoading={isTryingOnGlasses} results={glassesTryOnResults} />
        </div>
    </div>
  );

  const renderExtractorMode = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">Extract Clothing</h2>
        <p className="text-center text-gray-400 -mt-4 mb-6">Upload a photo to isolate the clothing items.</p>
        <div className="grid grid-cols-1 gap-6">
          <ImageUploader id="extractor-uploader" label="Upload Full Outfit Photo" value={extractorImage} onChange={setExtractorImage} />
        </div>
        <div className="flex flex-col gap-2 mt-6">
            <label htmlFor="extractor-prompt" className="font-semibold text-gray-300 text-center">Customize Prompt (optional)</label>
            <textarea
                id="extractor-prompt"
                value={extractorPrompt}
                onChange={(e) => setExtractorPrompt(e.target.value)}
                rows={5}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
        </div>
        <div className="mt-8">
          <TryOnButton onClick={handleExtractItems} disabled={!extractorImage || isExtracting} isLoading={isExtracting} loadingText="Extracting...">Extract Items</TryOnButton>
        </div>
      </div>
      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm min-h-[400px] flex flex-col justify-center items-center">
        <ExtractorResultDisplay isLoading={isExtracting} results={extractedItems} />
      </div>
    </div>
  );

  const render3DViewMode = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">3D View Generator</h2>
        <p className="text-center text-gray-400 -mt-4 mb-6">Upload a photo of sunglasses to generate multiple views.</p>
        <div className="grid grid-cols-1 gap-6">
          <ImageUploader id="3d-view-uploader" label="Upload Sunglasses Photo" value={threeDViewImage} onChange={setThreeDViewImage} />
        </div>
        <div className="flex flex-col gap-2 mt-6">
            <label htmlFor="3d-prompt" className="font-semibold text-gray-300 text-center">Customize Prompt (optional)</label>
            <textarea
                id="3d-prompt"
                value={threeDViewPrompt}
                onChange={(e) => setThreeDViewPrompt(e.target.value)}
                rows={5}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
        </div>
        <div className="mt-8">
          <TryOnButton onClick={handleGenerate3DView} disabled={!threeDViewImage || isGenerating3DView} isLoading={isGenerating3DView} loadingText="Generating...">Generate Views</TryOnButton>
        </div>
      </div>
      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm min-h-[400px] flex flex-col justify-center items-center">
        <ThreeDViewResultDisplay isLoading={isGenerating3DView} results={threeDViewResults} />
      </div>
    </div>
  );

  const renderInteriorDesignMode = () => {
    const sourceImageForSelection = interiorDesignResult?.imageUrl || furnishedPlanImage;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm flex flex-col gap-6">
                <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">1. Provide Top-Down Design</h2>
                
                <div className="grid grid-cols-2 gap-2 bg-gray-900 p-1 rounded-lg">
                    <button 
                        onClick={() => setInteriorSourceTab('generate')}
                        className={`py-2 px-4 rounded-md font-semibold transition-colors ${interiorSourceTab === 'generate' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
                    >
                        Generate New
                    </button>
                    <button 
                        onClick={() => setInteriorSourceTab('upload')}
                        className={`py-2 px-4 rounded-md font-semibold transition-colors ${interiorSourceTab === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
                    >
                        Upload Existing
                    </button>
                </div>

                {interiorSourceTab === 'generate' && (
                    <>
                        <ImageUploader id="floor-plan-uploader" label="Upload 2D Floor Plan" value={floorPlanImage} onChange={handleFloorPlanUpload} />
                        <div className="flex flex-col gap-2">
                            <label htmlFor="interior-design-prompt" className="font-semibold text-gray-300 text-center">Design Prompt</label>
                            <textarea
                                id="interior-design-prompt"
                                value={interiorDesignPrompt}
                                onChange={(e) => setInteriorDesignPrompt(e.target.value)}
                                rows={6}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mt-2">
                            <TryOnButton onClick={handleGenerateInteriorDesign} disabled={!floorPlanImage || isGeneratingInterior} isLoading={isGeneratingInterior} loadingText="Generating...">Generate Design</TryOnButton>
                        </div>
                    </>
                )}

                {interiorSourceTab === 'upload' && (
                    <ImageUploader id="furnished-plan-uploader" label="Upload Furnished Top-Down View" value={furnishedPlanImage} onChange={handleFurnishedPlanUpload} />
                )}
            </div>

            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm min-h-[400px] flex flex-col justify-start items-center gap-6">
                <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 w-full">2. Generate First-Person View</h2>
                {isGeneratingInterior ? (
                    <InteriorResultDisplay isLoading={true} result={null} />
                ) : sourceImageForSelection ? (
                    <div className="w-full flex flex-col items-center gap-6">
                        <SelectionEditor 
                            imageUrl={sourceImageForSelection}
                            onGenerateView={handleGenerateInteriorView}
                            isGenerating={isGeneratingInteriorView}
                        />
                        <div className="w-full flex flex-col items-center gap-2 max-w-lg">
                            <label htmlFor="interior-view-prompt" className="font-semibold text-gray-300 text-center">First-Person View Prompt</label>
                            <textarea
                                id="interior-view-prompt"
                                value={interiorViewPrompt}
                                onChange={(e) => setInteriorViewPrompt(e.target.value)}
                                rows={6}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <InteriorViewResultDisplay isLoading={isGeneratingInteriorView} result={interiorViewResult} />
                    </div>
                ) : (
                    <div className="text-center text-gray-500 flex-grow flex flex-col justify-center">
                        <HomeIcon className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-400">Your design will appear here</h3>
                        <p className="mt-1">Generate a new design or upload an existing one to begin.</p>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const renderImageEditingMode = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500">General Image Editor</h2>
        <ImageUploader id="editing-uploader" label="Upload Your Image" value={editingImage} onChange={setEditingImage} />
        <div className="flex flex-col gap-2">
            <label htmlFor="editing-prompt" className="font-semibold text-gray-300 text-center">Describe Your Edit</label>
            <textarea
                id="editing-prompt"
                value={editingPrompt}
                onChange={(e) => setEditingPrompt(e.target.value)}
                rows={5}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
        </div>
        <div className="mt-2">
          <TryOnButton onClick={handleImageEdit} disabled={!editingImage || isEditing} isLoading={isEditing} loadingText="Applying Edit...">Generate Image</TryOnButton>
        </div>
      </div>
      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm min-h-[400px] flex flex-col justify-center items-center">
        <ImageEditingResultDisplay isLoading={isEditing} result={editingResult} />
      </div>
    </div>
  );

  const renderActiveApparelMode = () => {
    switch (appMode) {
      case 'clothingTryOn': return renderClothingTryOnMode();
      case 'extractor': return renderExtractorMode();
      default: return null;
    }
  }

  const renderActiveEyewearMode = () => {
    switch (appMode) {
        case 'glassesTryOn': return renderGlassesTryOnMode();
        case 'threeDView': return render3DViewMode();
        default: return null;
      }
  }

  const renderActiveInteriorMode = () => {
    return renderInteriorDesignMode();
  }

  const renderApparelStudio = () => (
    <>
      <div className="flex flex-wrap justify-center border-b border-gray-700 mb-8">
        <button onClick={() => setAppMode('clothingTryOn')} className={`px-4 md:px-6 py-3 font-semibold text-base md:text-lg transition-colors duration-200 border-b-4 ${appMode === 'clothingTryOn' ? 'text-purple-400 border-purple-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>Clothing Try-On</button>
        <button onClick={() => setAppMode('extractor')} className={`px-4 md:px-6 py-3 font-semibold text-base md:text-lg transition-colors duration-200 border-b-4 ${appMode === 'extractor' ? 'text-cyan-400 border-cyan-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>Outfit Extractor</button>
      </div>
      {renderActiveApparelMode()}
    </>
  );

  const renderEyewearStudio = () => (
    <>
      <div className="flex flex-wrap justify-center border-b border-gray-700 mb-8">
        <button onClick={() => setAppMode('threeDView')} className={`px-4 md:px-6 py-3 font-semibold text-base md:text-lg transition-colors duration-200 border-b-4 ${appMode === 'threeDView' ? 'text-emerald-400 border-emerald-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>3D View Generator</button>
        <button onClick={() => setAppMode('glassesTryOn')} className={`px-4 md:px-6 py-3 font-semibold text-base md:text-lg transition-colors duration-200 border-b-4 ${appMode === 'glassesTryOn' ? 'text-amber-400 border-amber-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>Glasses Try-On</button>
      </div>
      {renderActiveEyewearMode()}
    </>
  );

  const renderInteriorStudio = () => (
    <>
      <div className="flex flex-wrap justify-center border-b border-gray-700 mb-8">
        <button className={`px-4 md:px-6 py-3 font-semibold text-base md:text-lg transition-colors duration-200 border-b-4 text-blue-400 border-blue-400`}>Interior Designer</button>
      </div>
      {renderActiveInteriorMode()}
    </>
  );

  const renderCreativeStudio = () => (
    <>
      <div className="flex flex-wrap justify-center border-b border-gray-700 mb-8">
        <button className={`px-4 md:px-6 py-3 font-semibold text-base md:text-lg transition-colors duration-200 border-b-4 text-pink-400 border-pink-400`}>Image Editor</button>
      </div>
      {renderImageEditingMode()}
    </>
  );

  const renderStudio = () => (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
              Virtual AI Studio
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the future of creation. Virtual try-on, interior design, and more, all powered by Gemini.
          </p>
        </div>

        <div className="flex justify-center items-center bg-gray-800/50 border border-gray-700 rounded-full p-1.5 max-w-xl mx-auto mb-10 backdrop-blur-sm">
          <button onClick={() => handleStudioChange('apparel')} className={`w-1/4 py-2.5 rounded-full font-bold transition-colors text-sm ${activeStudio === 'apparel' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Apparel</button>
          <button onClick={() => handleStudioChange('eyewear')} className={`w-1/4 py-2.5 rounded-full font-bold transition-colors text-sm ${activeStudio === 'eyewear' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Eyewear</button>
          <button onClick={() => handleStudioChange('interior')} className={`w-1/4 py-2.5 rounded-full font-bold transition-colors text-sm ${activeStudio === 'interior' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Interior</button>
          <button onClick={() => handleStudioChange('creative')} className={`w-1/4 py-2.5 rounded-full font-bold transition-colors text-sm ${activeStudio === 'creative' ? 'bg-rose-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Creative</button>
        </div>

        {activeStudio === 'apparel' && renderApparelStudio()}
        {activeStudio === 'eyewear' && renderEyewearStudio()}
        {activeStudio === 'interior' && renderInteriorStudio()}
        {activeStudio === 'creative' && renderCreativeStudio()}
        
        {error && (
          <div className="mt-8 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-center" role="alert">
            <span className="font-bold">Error: </span>
            <span>{error}</span>
          </div>
        )}

        <ApiKeyInput value={userApiKey} onChange={handleUserApiKeyChange} />

      </div>
    </main>
  );

  return (
    <div className="min-h-screen bg-dots-pattern">
      <Header 
        activeStudio={activeStudio} 
        onShowExamples={() => setView('examples')} 
      />
      
      {view === 'studio' ? renderStudio() : <ExamplesPage onBack={() => setView('studio')} />}

      <footer className="py-8 mt-12 border-t border-gray-800">
        <div className="container mx-auto text-center text-gray-500">
            <p className="mb-4">Built with Gemini by The Winds</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
