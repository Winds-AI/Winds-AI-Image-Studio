
import React, { useState } from 'react';
import { ArrowLongRightIcon } from '../components/icons/ArrowLongRightIcon';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';
import type { Studio } from '../types';

interface ShowcaseStep {
  title: string;
  description: string;
  image: string;
  isFinal?: boolean;
}

interface ShowcaseExample {
  id: string;
  title: string;
  description: string;
  studio: Studio;
  steps: ShowcaseStep[];
}

const examples: ShowcaseExample[] = [
  {
    id: 'apparel-workflow',
    title: 'Virtual Clothing Try-On',
    description: 'See how a model can virtually try on an outfit from another image.',
    studio: 'apparel',
    steps: [
       {
        title: 'Step 1: Model Photo',
        description: 'Start with a photo of the person who will wear the clothes.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo23VOob61AhLBc2qMNRQfgFy4ESV7oOrvYt1Gk',
      },
      {
        title: 'Step 2: Outfit Photo',
        description: 'Provide a photo of the clothing item to try on.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2t0XxYZswPziOYDACkpfxoT3QXNJn16sucF9g',
      },
      {
        title: 'Step 3: Final Result',
        description: 'The AI generates a new image with the model wearing the outfit.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2dCadLXoclmpyPb1ra9OnSwgekViBzqIdho0x',
        isFinal: true,
      },
    ],
  },
  {
    id: 'apparel-extraction-workflow',
    title: 'Outfit Extraction',
    description: 'Isolate individual clothing items from a single photo to create a digital wardrobe or prepare items for a virtual try-on.',
    studio: 'apparel',
    steps: [
       {
        title: 'Step 1: Input Image',
        description: 'Start with a full-body photo of an outfit.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2zwhjhAone3TMFrw4UIpvS96BPq2Q57ObKdcL',
      },
      {
        title: 'Step 2: Extracted Top',
        description: 'The AI identifies and extracts the top as a separate image.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2j4nPnTkuOElvXQ78xZeJG9yR3brsmBdqtMH6',
      },
      {
        title: 'Step 3: Extracted Bottom',
        description: 'It also isolates the bottoms, creating another clean asset.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2YosUjvC4udg3rVR1I9UkNElM8SFftzOaiGpK',
        isFinal: true,
      },
    ],
  },
  {
    id: 'eyewear-workflow',
    title: 'Full Eyewear Workflow',
    description: 'From a single product photo to a virtual try-on, see how different AI modes can be chained together for a complete experience.',
    studio: 'eyewear',
    steps: [
      {
        title: 'Step 1: Initial Photo',
        description: 'Start with a single image of the product.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo24JT2DLc90dFxGpqjL5biDlhPn4HR3WfevzEc',
      },
      {
        title: 'Step 2: Generate Style Sheet',
        description: 'Use the 3D View Generator to create multiple angles.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2AurTsaiBYQS8Og3RWMxNUlcqtGpK0fviuHL5',
      },
      {
        title: 'Step 3: Prepare for Try-On',
        description: 'Use the generated sheet and a model photo in the Glasses Try-On mode.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2w4w8zLv8eotfLERN02bZ9WkiXg1QqKYpP5cl',
      },
      {
        title: 'Step 4: Final Result',
        description: 'The final, photorealistic virtual try-on is generated.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2YKreXI2C4udg3rVR1I9UkNElM8SFftzOaiGp',
        isFinal: true,
      },
    ],
  },
  {
    id: 'quick-try-on',
    title: 'Direct Glasses Try-On',
    description: 'This example shows a direct before-and-after for the Glasses Try-On feature using a multi-angle source image.',
    studio: 'eyewear',
    steps: [
      {
        title: 'Before: Product & Model',
        description: 'Provide a model photo and a multi-angle glasses image.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2VVnBJfb9dSNQPfT7zsviOEoc0IaWGeHXuy5m',
      },
      {
        title: 'After: Generated Result',
        description: 'The AI generates realistic images of the model wearing the glasses.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2QPcbBMaRhD1WUzgybSPEdkNGI2ea5BCcHX7L',
        isFinal: true,
      },
    ],
  },
  {
    id: 'interior-workflow',
    title: '2D Floor Plan to First-Person View',
    description: 'Transform a 2D floor plan into a fully furnished 3D rendering, then generate a photorealistic first-person view of a selected area.',
    studio: 'interior',
    steps: [
      {
        title: 'Step 1: 2D Floor Plan',
        description: 'Start with a 2D floor plan image.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2yCnrkhGu2Fis9RvESfZQ7WJTjYAPVXNcBn5w',
      },
      {
        title: 'Step 2: Generate & Select',
        description: 'Generate a fully furnished top-down view from the floor plan, then select an area for the first-person perspective.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2v3RFh1S9FBrReOdE4cbk6lxMyfCoNXVGP5iK',
      },
      {
        title: 'Step 3: Final First-Person View',
        description: 'The final, photorealistic eye-level view of the selected area is generated.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2yJ80Y2Gu2Fis9RvESfZQ7WJTjYAPVXNcBn5w',
        isFinal: true,
      },
    ]
  }
];


const StepCard: React.FC<{ step: ShowcaseStep, isLast: boolean }> = ({ step, isLast }) => (
    <div className="flex items-center gap-4 md:gap-6">
        <div className="flex-shrink-0 w-full md:w-64">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 flex flex-col h-full">
                <h4 className="font-bold text-lg text-white mb-2">{step.title}</h4>
                <div className="rounded-md overflow-hidden mb-3 border border-gray-600">
                    <img src={step.image} alt={step.title} className="w-full h-auto object-contain bg-gray-700" />
                </div>
                <p className="text-gray-400 text-sm flex-grow">{step.description}</p>
            </div>
        </div>
        {!isLast && (
            <div className="flex-grow hidden md:flex justify-center">
                <ArrowLongRightIcon className="w-12 h-12 text-gray-600" />
            </div>
        )}
    </div>
);

const Showcase: React.FC<{ example: ShowcaseExample }> = ({ example }) => (
    <div className="mb-12 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm">
        <h3 className="text-2xl font-bold text-white mb-2">{example.title}</h3>
        <p className="text-gray-400 mb-6 max-w-3xl">{example.description}</p>
        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-0">
            {example.steps.map((step, index) => (
                <StepCard key={index} step={step} isLast={index === example.steps.length - 1} />
            ))}
        </div>
    </div>
);

interface ExamplesPageProps {
  onBack: () => void;
}

export const ExamplesPage: React.FC<ExamplesPageProps> = ({ onBack }) => {
    const [activeStudio, setActiveStudio] = useState<Studio>('apparel');

    const filteredExamples = examples.filter(e => e.studio === activeStudio);

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50">
                        <ArrowLeftIcon className="w-6 h-6" />
                        <span className="font-semibold">Back to Studio</span>
                    </button>
                </div>
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                        Example Workflows
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
                        Discover how to chain different AI tools together to create powerful results.
                    </p>
                </div>

                <div className="flex justify-center items-center bg-gray-800/50 border border-gray-700 rounded-full p-1.5 max-w-lg mx-auto mb-12 backdrop-blur-sm">
                    <button onClick={() => setActiveStudio('apparel')} className={`w-1/3 py-2.5 rounded-full font-bold transition-colors ${activeStudio === 'apparel' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Apparel</button>
                    <button onClick={() => setActiveStudio('eyewear')} className={`w-1/3 py-2.5 rounded-full font-bold transition-colors ${activeStudio === 'eyewear' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Eyewear</button>
                    <button onClick={() => setActiveStudio('interior')} className={`w-1/3 py-2.5 rounded-full font-bold transition-colors ${activeStudio === 'interior' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Interior</button>
                </div>

                <div>
                    {filteredExamples.length > 0 ? (
                        filteredExamples.map((example) => (
                            <Showcase key={example.id} example={example} />
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-20">
                            <h3 className="text-2xl font-semibold text-gray-400">Coming Soon!</h3>
                            <p className="mt-2">Examples for the {activeStudio} studio are being prepared.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};
