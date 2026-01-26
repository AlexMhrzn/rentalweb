import React from 'react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-200 via-teal-300 to-teal-500">
      {/* Soft glow behind logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
      </div>

      {/* Logo Container with House and Mountain */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Combined House and Mountain Icon */}
        <div className="relative mb-6">
          {/* Soft glow effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-white/30 rounded-full blur-2xl"></div>
          </div>
          
          {/* Main Logo Container */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 200 200"
              className="w-full h-full drop-shadow-2xl"
            >
              {/* Mountain Outline (Nepal representation) */}
              <path
                d="M 20 120 L 60 60 L 100 80 L 140 40 L 180 100 L 180 160 L 20 160 Z"
                fill="none"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />
              
              {/* House Icon */}
              <path
                d="M 70 120 L 70 160 L 130 160 L 130 120 L 100 90 Z"
                fill="white"
                opacity="0.95"
              />
              <path
                d="M 70 120 L 100 90 L 130 120"
                fill="none"
                stroke="white"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="85"
                y="130"
                width="30"
                height="30"
                fill="rgba(255,255,255,0.3)"
                stroke="white"
                strokeWidth="3"
                rx="2"
              />
            </svg>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 drop-shadow-lg tracking-tight">
          GharBhada Nepal
        </h1>

        {/* Tagline */}
        <p className="text-base sm:text-lg text-white/90 font-medium mb-12 drop-shadow-md text-center px-4">
          Find your perfect home, anywhere in Nepal
        </p>

        {/* Animated Loading Indicator - Three Dots */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.4s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
