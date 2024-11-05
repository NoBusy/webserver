import React from 'react';

const DotSpinner = ({ size = 'lg' }) => {
  const spinnerSize = size === 'lg' ? 52 : 24;
  
  return (
    <div className="relative" style={{ width: spinnerSize, height: spinnerSize }}>
      <svg 
        width={spinnerSize} 
        height={spinnerSize} 
        viewBox="-10 -10 72 72" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Статичные серые точки */}
        <circle cx="25.6232" cy="2.26087" r="2.26087" fill="#A0A0B3"/>
        <circle cx="25.6232" cy="49.7391" r="2.26087" fill="#A0A0B3"/>
        <circle cx="2.26087" cy="25.6232" r="2.26087" fill="#A0A0B3"/>
        <circle cx="49.7391" cy="25.6232" r="2.26087" fill="#A0A0B3"/>
        <circle cx="9.22628" cy="9.04346" r="2.26087" fill="#A0A0B3"/>
        <circle cx="42.7984" cy="42.6157" r="2.26087" fill="#A0A0B3"/>
        <circle cx="42.9565" cy="9.22634" r="2.26087" fill="#A0A0B3"/>
        <circle cx="9.3844" cy="42.7985" r="2.26087" fill="#A0A0B3"/>
        
        {/* Анимированная синяя точка */}
        <circle 
          r="6.78261" 
          fill="#007AFF"
          className="blue-dot"
        />
      </svg>

      <style jsx>{`
        .blue-dot {
          animation: moveDot 2s steps(1) infinite;
        }

        @keyframes moveDot {
          0% {
            transform: translate(25.6232px, 7.26088px);
          }
          12.5% {
            transform: translate(42.7515px, 9.59206px);
          }
          25% {
            transform: translate(49.7392px, 26.3768px);
          }
          37.5% {
            transform: translate(42.7515px, 41.2443px);
          }
          50% {
            transform: translate(25.6232px, 51.2464px);
          }
          62.5% {
            transform: translate(9.59204px, 42.7514px);
          }
          75% {
            transform: translate(7.26088px, 27.1304px);
          }
          87.5% {
            transform: translate(7.33119px, 8.83842px);
          }
          100% {
            transform: translate(25.6232px, 7.26088px);
          }
        }
      `}</style>
    </div>
  );
};

export default DotSpinner;