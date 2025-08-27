
import React from 'react';
import { ArrowLongRightIcon } from './icons/ArrowLongRightIcon';

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
  steps: ShowcaseStep[];
}

const examples: ShowcaseExample[] = [
  {
    id: 'eyewear-workflow',
    title: 'Full Eyewear Workflow',
    description: 'From a single product photo to a virtual try-on, see how different AI modes can be chained together for a complete experience.',
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
    title: 'short example of another glasses try on',
    description: 'This example shows a direct before-and-after for the Glasses Try-On feature using a multi-angle source image.',
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
    <div className="mb-12">
        <h3 className="text-2xl font-bold text-white mb-2">{example.title}</h3>
        <p className="text-gray-400 mb-6 max-w-3xl">{example.description}</p>
        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-0">
            {example.steps.map((step, index) => (
                <StepCard key={index} step={step} isLast={index === example.steps.length - 1} />
            ))}
        </div>
    </div>
);

export const Examples: React.FC = () => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm mt-8">
      <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500 mb-6">
        Explore Workflows
      </h2>
      {examples.map((example) => (
        <Showcase key={example.id} example={example} />
      ))}
    </div>
  );
};