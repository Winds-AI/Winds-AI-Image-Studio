
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
        image: 'examples/example-1-initial.jpg',
      },
      {
        title: 'Step 2: Generate Style Sheet',
        description: 'Use the 3D View Generator to create multiple angles.',
        image: 'examples/example-1-sheet.png',
      },
      {
        title: 'Step 3: Prepare for Try-On',
        description: 'Use the generated sheet and a model photo in the Glasses Try-On mode.',
        image: 'examples/example-1-model.jpg',
      },
      {
        title: 'Step 4: Final Result',
        description: 'The final, photorealistic virtual try-on is generated.',
        image: 'examples/example-1-final.png',
        isFinal: true,
      },
    ],
  },
  {
    id: 'quick-try-on',
    title: 'Quick Glasses Try-On',
    description: 'This example shows a direct before-and-after for the Glasses Try-On feature using a multi-angle source image.',
    steps: [
      {
        title: 'Before: Product & Model',
        description: 'Provide a model photo and a multi-angle glasses image.',
        image: 'examples/example-2-initial.jpg',
      },
      {
        title: 'After: Generated Result',
        description: 'The AI generates realistic images of the model wearing the glasses.',
        image: 'examples/example-2-final.png',
        isFinal: true,
      },
    ],
  },
];

const StepCard: React.FC<{ step: ShowcaseStep, isLast: boolean }> = ({ step, isLast }) => (
    <div className="flex items-center gap-4 md:gap-6">
        <div className="flex-shrink-0 w-full md:w-64">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 flex flex-col">
                <h4 className="font-bold text-lg text-white mb-2">{step.title}</h4>
                <div className="aspect-video rounded-md overflow-hidden mb-3 border-2 border-gray-600">
                    <img src={step.image} alt={step.title} className="w-full h-full object-cover"/>
                </div>
                <p className="text-gray-400 text-sm flex-grow">{step.description}</p>
            </div>
        </div>
        {!isLast && (
            <div className="hidden md:block">
                <ArrowLongRightIcon className="w-10 h-10 text-gray-500" />
            </div>
        )}
    </div>
);


export const Examples: React.FC = () => {
    return (
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm mt-8">
            <h3 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-6">
                Explore Workflows
            </h3>
            <div className="flex flex-col gap-12">
                {examples.map((example) => (
                    <div key={example.id}>
                        <h4 className="text-2xl font-bold text-white mb-2">{example.title}</h4>
                        <p className="text-gray-400 mb-6 max-w-3xl">{example.description}</p>
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center overflow-x-auto pb-4 -mb-4">
                            {example.steps.map((step, index) => (
                                <StepCard key={index} step={step} isLast={index === example.steps.length - 1} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
