
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardTemplateProps {
  logo?: React.ReactNode;
  title?: string;
  gradientColors?: string;
  name?: string;
  username?: string;
  expirationDate?: string;
  backgroundPattern?: 'dots' | 'bokeh' | 'clean';
  className?: string;
}

export const CardTemplate = ({
  logo,
  title = "PREMIUM CARD",
  gradientColors = "from-gray-800 to-black",
  name = "John Doe",
  username = "@johndoe",
  expirationDate = "12/28",
  backgroundPattern = 'bokeh',
  className
}: CardTemplateProps) => {
  const getBackgroundPattern = () => {
    switch (backgroundPattern) {
      case 'dots':
        return 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 1px, transparent 1px), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 1px, transparent 1px)';
      case 'bokeh':
        return 'radial-gradient(ellipse at top left, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)';
      default:
        return 'none';
    }
  };

  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Background with pattern */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-30"
          style={{
            background: getBackgroundPattern(),
            backgroundSize: '100px 100px, 150px 150px, 200px 200px'
          }}
        />
        
        {/* Main card container */}
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 shadow-2xl">
          {/* Logo section */}
          <div className="flex justify-between items-start mb-8">
            <div className="text-black">
              {logo || (
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h2 className="text-gray-800 text-lg font-bold tracking-wider">
              {title}
            </h2>
          </div>

          {/* Card display */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "bg-gradient-to-r rounded-2xl p-6 mb-6 shadow-lg relative overflow-hidden",
              gradientColors
            )}
          >
            {/* Card inner pattern */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)'
              }}
            />
            
            {/* Card logo */}
            <div className="relative flex justify-between items-start mb-8">
              <div className="text-white opacity-90">
                {logo || (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                )}
              </div>
            </div>

            {/* Card details */}
            <div className="relative space-y-2">
              <div className="text-white text-sm font-medium opacity-90">
                {name}
              </div>
              <div className="text-white text-xs opacity-75">
                {username}
              </div>
              <div className="text-white text-xs opacity-75 pt-2">
                {expirationDate}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CardTemplate;
