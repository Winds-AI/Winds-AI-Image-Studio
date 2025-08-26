
import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Header } from './components/Header';
import { TryOnButton } from './components/TryOnButton';
import { visualTryOn, extractClothingItems, generate3DViews, glassesTryOn } from './services/geminiService';
import type { ClothingType, TryOnResult } from './types';
import { ExtractorResultDisplay } from './components/ExtractorResultDisplay';
import { ThreeDViewResultDisplay } from './components/ThreeDViewResultDisplay';
import { GlassesTryOnResultDisplay } from './components/GlassesTryOnResultDisplay';
import { ClothingTypeSelector } from './components/ClothingTypeSelector';
import { ApiKeyInput } from './components/ApiKeyInput';
import { Examples } from './components/Examples';

type AppMode = 'clothingTryOn' | 'glassesTryOn' | 'extractor' | 'threeDView';
type Studio = 'apparel' | 'eyewear';

const App: React.FC = () => {
  // Common state
  const [activeStudio, setActiveStudio] = useState<Studio>('apparel');
  const [appMode, setAppMode] = useState<AppMode>('clothingTryOn');
  const [error, setError] = useState<string | null>(null);
  const [userApiKey, setUserApiKey] = useState<string>('');

  // Clothing Try-On Mode State
  const [personImageForClothing, setPersonImageForClothing] = useState<string | null>(null);
  const [clothingItemImage, setClothingItemImage] = useState<string | null>(null);
  const [clothingType, setClothingType] = useState<ClothingType>('top');
  const [clothingTryOnResult, setClothingTryOnResult] = useState<TryOnResult | null>(null);
  const [isTryingOnClothing, setIsTryingOnClothing] = useState<boolean>(false);

  // Glasses Try-On Mode State
  const [personImageForGlasses, setPersonImageForGlasses] = useState<string | null>(null);
  const [glassesImage, setGlassesImage] = useState<string | null>(null);
  const [glassesTryOnResults, setGlassesTryOnResults] = useState<TryOnResult[] | null>(null);
  const [isTryingOnGlasses, setIsTryingOnGlasses] = useState<boolean>(false);

  // Extractor Mode State
  const [extractorImage, setExtractorImage] = useState<string | null>(null);
  const [extractedItems, setExtractedItems] = useState<TryOnResult[] | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  // 3D View Mode State
  const [threeDViewImage, setThreeDViewImage] = useState<string | null>(null);
  const [threeDViewResults, setThreeDViewResults] = useState<TryOnResult[] | null>(null);
  const [isGenerating3DView, setIsGenerating3DView] = useState<boolean>(false);

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

  const handleUserApiKeyChange = (key: string) => {
      setUserApiKey(key);
      try {
          localStorage.setItem('geminiUserApiKey', key);
      } catch (e) {
          console.error("Could not access local storage:", e);
      }
  };

  // Image upload handlers
  const handlePersonImageForClothingUpload = useCallback((base64Image: string | null) => setPersonImageForClothing(base64Image), []);
  const handleClothingItemImageUpload = useCallback((base64Image: string | null) => setClothingItemImage(base64Image), []);
  const handleExtractorImageUpload = useCallback((base64Image: string | null) => setExtractorImage(base64Image), []);
  const handle3DViewImageUpload = useCallback((base64Image: string | null) => setThreeDViewImage(base64Image), []);
  const handlePersonImageForGlassesUpload = useCallback((base64Image: string | null) => setPersonImageForGlasses(base64Image), []);
  const handleGlassesImageUpload = useCallback((base64Image: string | null) => setGlassesImage(base64Image), []);

  const extractMimeTypeAndData = (base64String: string): { mimeType: string, data: string } => {
    const match = base64String.match(/^data:(image\/(?:jpeg|png|webp|avif));base64,(.+)$/);
    if (!match) {
        throw new Error('Invalid or unsupported image format. Please use JPEG, PNG, WebP, or AVIF.');
    }
    return { mimeType: match[1], data: match[2] };
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
    if (!userApiKey) {
      setError('Please provide your Gemini API Key to use this feature.');
      return;
    }
    setError(null);
    setClothingTryOnResult(null);
    setIsTryingOnClothing(true);
    try {
      const { mimeType: personMimeType, data: personData } = extractMimeTypeAndData(personImageForClothing);
      const { mimeType: clothingMimeType, data: clothingData } = extractMimeTypeAndData(clothingItemImage);
      const result = await visualTryOn(personData, personMimeType, clothingData, clothingMimeType, clothingType, userApiKey);
      setClothingTryOnResult(result);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsTryingOnClothing(false);
    }
  }, [personImageForClothing, clothingItemImage, clothingType, userApiKey]);
  
  const handleGlassesTryOn = useCallback(async () => {
    if (!personImageForGlasses || !glassesImage) {
      setError('Please upload both a person and a glasses photo.');
      return;
    }
    if (!userApiKey) {
      setError('Please provide your Gemini API Key to use this feature.');
      return;
    }
    setError(null);
    setGlassesTryOnResults(null);
    setIsTryingOnGlasses(true);
    try {
      const { mimeType: personMimeType, data: personData } = extractMimeTypeAndData(personImageForGlasses);
      const { mimeType: glassesMimeType, data: glassesData } = extractMimeTypeAndData(glassesImage);
      const results = await glassesTryOn(personData, personMimeType, glassesData, glassesMimeType, userApiKey);
      setGlassesTryOnResults(results);
    } catch (err) {
        handleApiError(err);
    } finally {
        setIsTryingOnGlasses(false);
    }
  }, [personImageForGlasses, glassesImage, userApiKey]);

  const handleExtractItems = useCallback(async () => {
    console.log('Extracting items with user api key: ', userApiKey.slice(-5)); // i want to show last 5 characters
    if (!extractorImage) {
        setError('Please upload an image to extract clothing from.');
        return;
    }
    if (!userApiKey) {
      setError('Please provide your Gemini API Key to use this feature.');
      return;
    }
    setError(null);
    setExtractedItems(null);
    setIsExtracting(true);
    try {
        const { mimeType, data } = extractMimeTypeAndData(extractorImage);
        const results = await extractClothingItems(data, mimeType, userApiKey);
        setExtractedItems(results);
    } catch (err) {
        handleApiError(err);
    } finally {
        setIsExtracting(false);
    }
  }, [extractorImage, userApiKey]);

  const handleGenerate3DView = useCallback(async () => {
    if (!threeDViewImage) {
      setError('Please upload an image of the sunglasses.');
      return;
    }
    if (!userApiKey) {
      setError('Please provide your Gemini API Key to use this feature.');
      return;
    }
    setError(null);
    setThreeDViewResults(null);
    setIsGenerating3DView(true);
    try {
      const { mimeType, data } = extractMimeTypeAndData(threeDViewImage);
      const results = await generate3DViews(data, mimeType, userApiKey);
      setThreeDViewResults(results);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsGenerating3DView(false);
    }
  }, [threeDViewImage, userApiKey]);

  const handleStudioChange = (studio: Studio) => {
    setActiveStudio(studio);
    setError(null);
    if (studio === 'apparel') {
      setAppMode('clothingTryOn');
    } else {
      setAppMode('threeDView');
    }
  };

  const renderClothingTryOnMode = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Create Your Look</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUploader id="person-uploader" label="Upload Your Photo" onImageUpload={handlePersonImageForClothingUpload} />
          <ImageUploader id="clothing-uploader" label="Upload Clothing Item" onImageUpload={handleClothingItemImageUpload} />
        </div>
        <ClothingTypeSelector value={clothingType} onChange={setClothingType} />
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
                <ImageUploader id="person-glasses-uploader" label="Upload Your Photo" onImageUpload={handlePersonImageForGlassesUpload} />
                <ImageUploader id="glasses-uploader" label="Upload Glasses Photo" onImageUpload={handleGlassesImageUpload} />
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
          <ImageUploader id="extractor-uploader" label="Upload Full Outfit Photo" onImageUpload={handleExtractorImageUpload} />
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
          <ImageUploader id="3d-view-uploader" label="Upload Sunglasses Photo" onImageUpload={handle3DViewImageUpload} />
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

  const renderActiveMode = () => {
    switch (appMode) {
      case 'clothingTryOn': return renderClothingTryOnMode();
      case 'glassesTryOn': return renderGlassesTryOnMode();
      case 'extractor': return renderExtractorMode();
      case 'threeDView': return render3DViewMode();
      default: return null;
    }
  }

  const renderApparelStudio = () => (
    <>
      <div className="flex flex-wrap justify-center border-b border-gray-700 mb-8">
        <button onClick={() => setAppMode('clothingTryOn')} className={`px-4 md:px-6 py-3 font-semibold text-base md:text-lg transition-colors duration-200 border-b-4 ${appMode === 'clothingTryOn' ? 'text-purple-400 border-purple-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>Clothing Try-On</button>
        <button onClick={() => setAppMode('extractor')} className={`px-4 md:px-6 py-3 font-semibold text-base md:text-lg transition-colors duration-200 border-b-4 ${appMode === 'extractor' ? 'text-cyan-400 border-cyan-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>Outfit Extractor</button>
      </div>
      {renderActiveMode()}
    </>
  );

  const renderEyewearStudio = () => (
    <>
      <div className="flex flex-wrap justify-center border-b border-gray-700 mb-8">
        <button onClick={() => setAppMode('threeDView')} className={`px-4 md:px-6 py-3 font-semibold text-base md:text-lg transition-colors duration-200 border-b-4 ${appMode === 'threeDView' ? 'text-emerald-400 border-emerald-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>3D View Generator</button>
        <button onClick={() => setAppMode('glassesTryOn')} className={`px-4 md:px-6 py-3 font-semibold text-base md:text-lg transition-colors duration-200 border-b-4 ${appMode === 'glassesTryOn' ? 'text-amber-400 border-amber-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>Glasses Try-On</button>
      </div>
      {renderActiveMode()}
    </>
  );

  return (
    <div className="min-h-screen bg-dots-pattern">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                Virtual Try-On Studio
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
                Experience the future of fashion. Upload your photo and an item to see how it looks on you, powered by Gemini.
            </p>
          </div>

          <div className="flex justify-center items-center bg-gray-800/50 border border-gray-700 rounded-full p-1.5 max-w-sm mx-auto mb-10 backdrop-blur-sm">
            <button onClick={() => handleStudioChange('apparel')} className={`w-1/2 py-2.5 rounded-full font-bold transition-colors ${activeStudio === 'apparel' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Apparel Studio</button>
            <button onClick={() => handleStudioChange('eyewear')} className={`w-1/2 py-2.5 rounded-full font-bold transition-colors ${activeStudio === 'eyewear' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Eyewear Studio</button>
          </div>

          {activeStudio === 'apparel' ? renderApparelStudio() : renderEyewearStudio()}

          
          
          {error && (
            <div className="mt-8 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-center" role="alert">
              <span className="font-bold">Error: </span>
              <span>{error}</span>
            </div>
          )}

          <ApiKeyInput value={userApiKey} onChange={handleUserApiKeyChange} />

          <Examples />

        </div>
      </main>
      <footer className="py-8 mt-12 border-t border-gray-800">
        <div className="container mx-auto text-center text-gray-500">
            <p className="mb-4">Built with Gemini by The Winds</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
