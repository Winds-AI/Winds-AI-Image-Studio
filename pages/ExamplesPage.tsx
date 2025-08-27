
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
    title: 'Full Apparel Workflow',
    description: 'From a full outfit photo, extract a single item and place it on a new model.',
    studio: 'apparel',
    steps: [
       {
        title: 'Step 1: Source Outfit',
        description: 'Start with a photo containing multiple clothing items.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2w4w8zLv8eotfLERN02bZ9WkiXg1QqKYpP5cl',
      },
      {
        title: 'Step 2: Extract Items',
        description: 'Use the "Outfit Extractor" to isolate individual items.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2AurTsaiBYQS8Og3RWMxNUlcqtGpK0fviuHL5',
      },
      {
        title: 'Step 3: Prepare for Try-On',
        description: 'Use an extracted item and a new model photo in the "Clothing Try-On" mode.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2VVnBJfb9dSNQPfT7zsviOEoc0IaWGeHXuy5m',
      },
      {
        title: 'Step 4: Final Result',
        description: 'A new, photorealistic virtual try-on is generated.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2YKreXI2C4udg3rVR1I9UkNElM8SFftzOaiGp',
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
    title: 'Full Interior Design Workflow',
    description: 'From a 2D floor plan, generate a furnished 3D top-down view, and then create a photorealistic first-person perspective of a specific room.',
    studio: 'interior',
    steps: [
      {
        title: 'Step 1: 2D Floor Plan',
        description: 'Start with a simple black and white floor plan.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo24JT2DLc90dFxGpqjL5biDlhPn4HR3WfevzEc',
      },
      {
        title: 'Step 2: Generate 3D Top-Down',
        description: 'Use the "Interior Designer" to create a furnished, colored top-down rendering.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2AurTsaiBYQS8Og3RWMxNUlcqtGpK0fviuHL5',
      },
       {
        title: 'Step 3: Select a Room',
        description: 'Highlight a specific room (e.g., the living room) to generate a perspective view.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2VVnBJfb9dSNQPfT7zsviOEoc0IaWGeHXuy5m',
      },
      {
        title: 'Step 4: Final First-Person View',
        description: 'The final, photorealistic eye-level view of the selected room.',
        image: 'https://ae5j3j4r08.ufs.sh/f/LyvZ1fF3cXo2QPcbBMaRhD1WUzgybSPEdkNGI2ea5BCcHX7L',
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
