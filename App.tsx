
import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Header } from './components/Header';
import { TryOnButton } from './components/TryOnButton';
import { visualTryOn, extractClothingItems, generate3DViews, glassesTryOn, generateInteriorDesign, generateRoomView, identifyAndSegmentRooms } from './services/geminiService';
import type { ClothingType, TryOnResult, Room } from './types';
import { ExtractorResultDisplay } from './components/ExtractorResultDisplay';
import { ThreeDViewResultDisplay } from './components/ThreeDViewResultDisplay';
import { GlassesTryOnResultDisplay } from './components/GlassesTryOnResultDisplay';
import { InteriorResultDisplay } from './components/InteriorResultDisplay';
import { InteriorViewResultDisplay } from './components/InteriorViewResultDisplay';
import { GithubIcon } from './components/icons/GithubIcon';
import { XSocialIcon } from './components/icons/XSocialIcon';
import { LinkedinIcon } from './components/icons/LinkedinIcon';
import { NpmIcon } from './components/icons/NpmIcon';
import { ClothingTypeSelector } from './components/ClothingTypeSelector';
import { ApiKeyInput } from './components/ApiKeyInput';
import { InteractiveFloorPlan } from './components/InteractiveFloorPlan';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { Examples } from './components/Examples';

type AppMode = 'clothingTryOn' | 'glassesTryOn' | 'extractor' | 'threeDView' | 'interiorDesign' | 'interiorVisualization';
type Studio = 'apparel' | 'eyewear' | 'interior';

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

  // Interior Design Mode State
  const [floorPlanImage, setFloorPlanImage] = useState<string | null>(null);
  const [stylePrompt, setStylePrompt] = useState<string>('');
  const [interiorDesignResult, setInteriorDesignResult] = useState<TryOnResult | null>(null);
  const [isGeneratingInterior, setIsGeneratingInterior] = useState<boolean>(false);

  // Interior View Mode State
  const [interiorViewInputImage, setInteriorViewInputImage] = useState<string | null>(null);
  const [interiorViewResult, setInteriorViewResult] = useState<TryOnResult | null>(null);
  const [isGeneratingInteriorView, setIsGeneratingInteriorView] = useState<boolean>(false);
  const [identifiedRooms, setIdentifiedRooms] = useState<Room[] | null>(null);
  const [roomMaskImage, setRoomMaskImage] = useState<string | null>(null);
  const [isIdentifyingRooms, setIsIdentifyingRooms] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

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
    if (!userApiKey && !process.env.API_KEY) {
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
    if (!userApiKey && !process.env.API_KEY) {
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
    if (!userApiKey && !process.env.API_KEY) {
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
    setIsGeneratingInterior(true);
    try {
        const { mimeType, data } = extractMimeTypeAndData(floorPlanImage);
        const result = await generateInteriorDesign(data, mimeType, stylePrompt, userApiKey);
        setInteriorDesignResult(result);
        setInteriorViewInputImage(result.imageUrl);
        setIdentifiedRooms(null);
        setRoomMaskImage(null);
        setSelectedRoom(null);
        setInteriorViewResult(null);
    } catch (err) {
        handleApiError(err);
    } finally {
        setIsGeneratingInterior(false);
    }
  }, [floorPlanImage, stylePrompt, userApiKey]);

  const handleIdentifyRooms = useCallback(async () => {
    const sourceImage = interiorViewInputImage;
    if (!sourceImage) {
      setError('Please provide a floor plan image first.');
      return;
    }
    if (!userApiKey && !process.env.API_KEY) {
      setError('Please provide your Gemini API Key to use this feature.');
      return;
    }
    setError(null);
    setIdentifiedRooms(null);
    setRoomMaskImage(null);
    setSelectedRoom(null);
    setIsIdentifyingRooms(true);
    try {
      const { mimeType, data } = extractMimeTypeAndData(sourceImage);
      const result = await identifyAndSegmentRooms(data, mimeType, userApiKey);
      if (result.rooms.length === 0) {
        setError("The AI could not identify any rooms in this image. Please try a clearer floor plan.");
      } else {
        setIdentifiedRooms(result.rooms);
        setRoomMaskImage(result.maskImageUrl);
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsIdentifyingRooms(false);
    }
  }, [interiorViewInputImage, userApiKey]);

  const handleGenerateInteriorView = useCallback(async () => {
    const sourceImage = interiorViewInputImage;
    if (!sourceImage || !selectedRoom) {
      setError('Please select a room to visualize.');
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
      const { mimeType, data } = extractMimeTypeAndData(sourceImage);
      const result = await generateRoomView(data, mimeType, selectedRoom.name, selectedRoom.boundary, userApiKey);
      setInteriorViewResult(result);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsGeneratingInteriorView(false);
    }
  }, [interiorViewInputImage, selectedRoom, userApiKey]);

  const handleInteriorViewImageChange = (image: string | null) => {
    setInteriorViewInputImage(image);
    setIdentifiedRooms(null);
    setRoomMaskImage(null);
    setSelectedRoom(null);
    setInteriorViewResult(null);
  };

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setInteriorViewResult(null);
  };

  const handleStudioChange = (studio: Studio) => {
    setActiveStudio(studio);
    setError(null);
    if (studio === 'apparel') {
      setAppMode('clothingTryOn');
    } else if (studio === 'eyewear') {
      setAppMode('threeDView');
    } else if (studio === 'interior') {
      setAppMode('interiorDesign');
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
        <div className="mt-8">
          <TryOnButton onClick={handleGenerate3DView} disabled={!threeDViewImage || isGenerating3DView} isLoading={isGenerating3DView} loadingText="Generating...">Generate Views</TryOnButton>
        </div>
      </div>
      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm min-h-[400px] flex flex-col justify-center items-center">
        <ThreeDViewResultDisplay isLoading={isGenerating3DView} results={threeDViewResults} />
      </div>
    </div>
  );

  const renderInteriorDesignMode = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">Interior Design Generator</h2>
            <ImageUploader id="floor-plan-uploader" label="Upload Floor Plan" value={floorPlanImage} onChange={setFloorPlanImage} />
            <div className="flex flex-col gap-2">
                <label htmlFor="style-prompt" className="font-semibold text-gray-300 text-center">Describe your desired style (optional)</label>
                <input
                    id="style-prompt"
                    type="text"
                    value={stylePrompt}
                    onChange={(e) => setStylePrompt(e.target.value)}
                    placeholder="e.g., Modern, Minimalist, Scandinavian"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="mt-2">
                <TryOnButton onClick={handleGenerateInteriorDesign} disabled={!floorPlanImage || isGeneratingInterior} isLoading={isGeneratingInterior} loadingText="Generating...">Generate Design</TryOnButton>
            </div>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm min-h-[400px] flex flex-col justify-center items-center">
            <InteriorResultDisplay isLoading={isGeneratingInterior} result={interiorDesignResult} />
        </div>
    </div>
  );

  const renderInteriorVisualizationMode = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Room Visualizer</h2>
        
        {interiorViewInputImage ? (
          <InteractiveFloorPlan
            imageUrl={interiorViewInputImage}
            rooms={identifiedRooms}
            maskImageUrl={roomMaskImage}
            selectedRoom={selectedRoom}
            onSelectRoom={handleSelectRoom}
            onClear={() => handleInteriorViewImageChange(null)}
          />
        ) : (
          <ImageUploader
            id="interior-view-uploader"
            label="1. Upload Furnished Floor Plan"
            value={interiorViewInputImage}
            onChange={handleInteriorViewImageChange}
          />
        )}
  
        {interiorViewInputImage && !identifiedRooms && !isIdentifyingRooms && (
          <div className="text-center flex flex-col items-center gap-3">
            <p className="font-semibold text-gray-300">2. Let the AI identify the rooms</p>
            <TryOnButton onClick={handleIdentifyRooms} disabled={isIdentifyingRooms} isLoading={isIdentifyingRooms} loadingText="Analyzing...">
              Identify Rooms
            </TryOnButton>
          </div>
        )}

        {isIdentifyingRooms && (
          <div className="flex items-center justify-center gap-3 text-sky-300">
            <SpinnerIcon className="w-6 h-6" />
            <span className="font-semibold">Analyzing floor plan...</span>
          </div>
        )}
  
        {identifiedRooms && (
          <div className="text-center flex flex-col items-center gap-3">
            <p className="font-semibold text-gray-300">{selectedRoom ? '3. Generate your view!' : '3. Select a room on the plan'}</p>
            <TryOnButton 
              onClick={handleGenerateInteriorView} 
              disabled={!selectedRoom || isGeneratingInteriorView} 
              isLoading={isGeneratingInteriorView} 
              loadingText="Generating...">
              {selectedRoom ? `Generate View for ${selectedRoom.name}` : 'Select a Room'}
            </TryOnButton>
          </div>
        )}
      </div>
      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm min-h-[400px] flex flex-col justify-center items-center">
        <InteriorViewResultDisplay isLoading={isGeneratingInteriorView} result={interiorViewResult} />
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
    switch (appMode) {
      case 'interiorDesign': return renderInteriorDesignMode();
      case 'interiorVisualization': return renderInteriorVisualizationMode();
      default: return null;
    }
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
        <button onClick={() => setAppMode('interiorDesign')} className={`px-4 md:px-6 py-3 font-semibold text-base md:text-lg transition-colors duration-200 border-b-4 ${appMode === 'interiorDesign' ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>Floor Plan Generator</button>
        <button onClick={() => setAppMode('interiorVisualization')} className={`px-4 md:px-6 py-3 font-semibold text-base md:text-lg transition-colors duration-200 border-b-4 ${appMode === 'interiorVisualization' ? 'text-sky-400 border-sky-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>Room Visualizer</button>
      </div>
      {renderActiveInteriorMode()}
    </>
  );

  return (
    <div className="min-h-screen bg-dots-pattern">
      <Header activeStudio={activeStudio} />
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

          <div className="flex justify-center items-center bg-gray-800/50 border border-gray-700 rounded-full p-1.5 max-w-lg mx-auto mb-10 backdrop-blur-sm">
            <button onClick={() => handleStudioChange('apparel')} className={`w-1/3 py-2.5 rounded-full font-bold transition-colors ${activeStudio === 'apparel' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Apparel</button>
            <button onClick={() => handleStudioChange('eyewear')} className={`w-1/3 py-2.5 rounded-full font-bold transition-colors ${activeStudio === 'eyewear' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Eyewear</button>
            <button onClick={() => handleStudioChange('interior')} className={`w-1/3 py-2.5 rounded-full font-bold transition-colors ${activeStudio === 'interior' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Interior</button>
          </div>

          {activeStudio === 'apparel' && renderApparelStudio()}
          {activeStudio === 'eyewear' && renderEyewearStudio()}
          {activeStudio === 'interior' && renderInteriorStudio()}
          
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
            <div className="flex justify-center items-center gap-6">
                <a href="https://github.com/charliecyt" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><GithubIcon className="w-6 h-6" /></a>
                <a href="https://x.com/charliecyt" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><XSocialIcon className="w-5 h-5" /></a>
                <a href="https://www.linkedin.com/in/charliecyt/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><LinkedinIcon className="w-6 h-6" /></a>
                <a href="https://www.npmjs.com/~charliecyt" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><NpmIcon className="w-6 h-6" /></a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
