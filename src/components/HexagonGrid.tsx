
import React from 'react';

const HexagonGrid: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-5 overflow-hidden opacity-20 pointer-events-none">
      <div className="relative w-full h-full">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              opacity: Math.random() * 0.3,
              filter: 'blur(50px)',
              animationDuration: `${Math.random() * 20 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationName: `float-${i}`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HexagonGrid;
