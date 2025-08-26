import React from 'react';

const steps = [
  {
    number: 1,
    title: 'Initial glasses product image',
    img: '/examples/initial_image.jpg',
    caption: 'Source product photo used as input.',
  },
  {
    number: 2,
    title: 'Generated style sheet using the Glasses 3D View Generator',
    img: '/examples/generated_style_sheet.png',
    caption: 'Multi-angle generated views from the 3D View Generator.',
  },
  {
    number: 3,
    title: 'Initial model picture',
    img: '/examples/model_picture.jpg',
    caption: 'Model photo before try-on.',
  },
  {
    number: 4,
    title: 'Model with glasses on (different views)',
    img: '/examples/final_picture.png',
    caption: 'Virtual try-on results applied to the model photo.',
  },
];

export const Examples: React.FC = () => {
  return (
    <section className="mt-14">
      <h2 className="text-3xl font-extrabold text-white text-center mb-2">Examples</h2>
      <p className="text-center text-gray-400 mb-8">An end-to-end example using different parts of this project in order.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((s) => (
          <div key={s.number} className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold">{s.number}</span>
              <h3 className="ml-3 text-lg font-semibold text-white flex-1">{s.title}</h3>
            </div>
            <div className="bg-black">
              <img src={s.img} alt={s.title} className="w-full h-auto object-contain" />
            </div>
            <div className="p-4 text-sm text-gray-400">{s.caption}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
