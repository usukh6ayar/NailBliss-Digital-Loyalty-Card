
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CardTemplate } from '@/components/ui/card-template';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const cardVariations = [
  {
    title: "BLACK GRADIENT",
    gradientColors: "from-gray-900 via-gray-800 to-black",
    name: "Sato Obata",
    username: "@sato_obata",
    backgroundPattern: 'bokeh' as const
  },
  {
    title: "PASTEL PINK",
    gradientColors: "from-pink-300 via-pink-400 to-purple-500",
    name: "Sato Obata",
    username: "@sato_obata",
    backgroundPattern: 'bokeh' as const
  },
  {
    title: "NORTHERN LIGHTS",
    gradientColors: "from-purple-400 via-pink-300 to-blue-300",
    name: "Sato Obata",
    username: "@sato_obata",
    backgroundPattern: 'bokeh' as const
  },
  {
    title: "GREEN GRADIENT",
    gradientColors: "from-emerald-500 via-green-500 to-green-600",
    name: "Sato Obata",
    username: "@sato_obata",
    backgroundPattern: 'bokeh' as const
  },
  {
    title: "SKY BLUE",
    gradientColors: "from-sky-400 via-blue-500 to-blue-600",
    name: "Sato Obata",
    username: "@sato_obata",
    backgroundPattern: 'bokeh' as const
  },
  {
    title: "SUNSET",
    gradientColors: "from-orange-400 via-red-500 to-red-600",
    name: "Sato Obata",
    username: "@sato_obata",
    backgroundPattern: 'bokeh' as const
  },
  {
    title: "PLATINUM SILVER",
    gradientColors: "from-gray-300 via-gray-200 to-gray-100",
    name: "Sato Obata",
    username: "@sato_obata",
    backgroundPattern: 'clean' as const
  },
  {
    title: "PLATINUM GOLD",
    gradientColors: "from-yellow-400 via-amber-400 to-orange-400",
    name: "Sato Obata",
    username: "@sato_obata",
    backgroundPattern: 'dots' as const
  }
];

export const CardShowcase = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % cardVariations.length);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + cardVariations.length) % cardVariations.length);
  };

  const currentCard = cardVariations[currentIndex];

  // Nike swoosh logo component
  const NikeLogo = () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 7.8L6.442 15.276c-1.456.616-2.679.925-3.668.925-1.456 0-2.064-.693-2.064-1.848 0-.924.154-1.386 1.232-1.694L24 7.8z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-600" />
            Card Design Templates
          </h1>
          <p className="text-gray-600 text-lg">
            Sleek, modern card designs with customizable gradients and patterns
          </p>
        </motion.div>

        {/* Card Display */}
        <div className="relative">
          <CardTemplate
            logo={<NikeLogo />}
            title={currentCard.title}
            gradientColors={currentCard.gradientColors}
            name={currentCard.name}
            username={currentCard.username}
            expirationDate="06/27"
            backgroundPattern={currentCard.backgroundPattern}
          />

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={prevCard}
              className="hover:scale-105 transition-transform"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-2">
              {cardVariations.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex 
                      ? 'bg-purple-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextCard}
              className="hover:scale-105 transition-transform"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Card Info */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mt-6"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {currentCard.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {currentIndex + 1} of {cardVariations.length}
            </p>
          </motion.div>
        </div>

        {/* Usage Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage Example</h2>
          <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre>{`<CardTemplate
  logo={<YourLogo />}
  title="PREMIUM CARD"
  gradientColors="from-purple-500 to-blue-600"
  name="John Doe"
  username="@johndoe"
  expirationDate="12/28"
  backgroundPattern="bokeh"
/>`}</pre>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
