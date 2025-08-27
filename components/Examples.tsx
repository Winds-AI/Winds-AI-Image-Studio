import React from 'react';

type Step = {
  title: string;
  img: string;
  caption: string;
};

type ExampleSet = {
  id: string;
  title: string;
  steps: Step[];
};

const makeDefaultSteps = (basePath: string): Step[] => [
  {
    title: 'Initial product image',
    img: `${basePath}/initial_image.jpg`,
    caption: 'Source product photo used as input.',
  },
  {
    title: 'Generated style sheet (3D views)',
    img: `${basePath}/generated_style_sheet.png`,
    caption: 'Multi-angle generated views from the 3D View Generator.',
  },
  {
    title: 'Initial model picture',
    img: `${basePath}/model_picture.jpg`,
    caption: 'Model photo before try-on.',
  },
  {
    title: 'Virtual try-on result',
    img: `${basePath}/final_picture.png`,
    caption: 'AI-applied product on the model photo.',
  },
];

const exampleSets: ExampleSet[] = [
  {
    id: 'example-1',
    title: 'Example 1',
    steps: makeDefaultSteps('/examples/example-1'),
  },
  {
    id: 'example-2',
    title: 'Example 2',
    steps: [
      {
        title: 'Initial product image',
        img: '/examples/example-2/initial.jpeg',
        caption: 'Source product photo used as input.',
      },
      {
        title: 'Virtual try-on result',
        img: '/examples/example-2/final.jpeg',
        caption: 'AI-applied product on a model or scene.',
      },
    ],
  }
];

const StepCard: React.FC<{ step: Step; index: number }> = ({ step, index }) => {
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-3 flex items-center">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-600 text-white text-sm font-bold">
          {index + 1}
        </span>
        <h4 className="ml-2 text-sm font-medium text-white flex-1 leading-tight">{step.title}</h4>
      </div>
      <div className="bg-black">
        <img src={step.img} alt={step.title} className="w-full h-48 md:h-56 lg:h-64 object-contain" />
      </div>
      <div className="p-3 text-xs text-gray-400">{step.caption}</div>
    </div>
  );
};

export const Examples: React.FC = () => {
  return (
    <section className="mt-14">
      <h2 className="text-3xl font-extrabold text-white text-center mb-2">Examples</h2>
      <p className="text-center text-gray-400 mb-8">Explore multiple end-to-end example flows.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {exampleSets.map((set) => (
          <div key={set.id} className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-gray-700/60">
              <h3 className="text-xl font-semibold text-white">{set.title}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-purple-600/20 text-purple-300 border border-purple-600/40">
                {set.steps.length} steps
              </span>
            </div>

            {/* Mobile: horizontal scroll steps */}
            <div className="sm:hidden -mx-5 px-5 pt-4 pb-2 flex gap-4 overflow-x-auto snap-x snap-mandatory">
              {set.steps.map((s, idx) => (
                <div key={`${set.id}-${idx}`} className="snap-start shrink-0 w-72">
                  <StepCard step={s} index={idx} />
                </div>
              ))}
            </div>

            {/* Tablet+ : grid layout */}
            <div className="hidden sm:grid grid-cols-2 gap-4 p-4">
              {set.steps.map((s, idx) => (
                <StepCard key={`${set.id}-${idx}`} step={s} index={idx} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
