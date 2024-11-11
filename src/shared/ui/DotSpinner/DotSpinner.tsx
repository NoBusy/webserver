import React from 'react';

const DotSpinner = ({ size = 'lg' }) => {
  // Увеличим размер спиннера
  const spinnerSize = size === 'lg' ? 80 : 24;
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: spinnerSize, height: spinnerSize }}>
      <svg
        width={spinnerSize}
        height={spinnerSize}
        viewBox="0 0 80 80"  // Новый viewBox с равномерными отступами
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Статичные серые точки - пересчитанные позиции для центра */}
        <circle cx="40" cy="8" r="3" fill="#A0A0B3"/>
        <circle cx="40" cy="72" r="3" fill="#A0A0B3"/>
        <circle cx="8" cy="40" r="3" fill="#A0A0B3"/>
        <circle cx="72" cy="40" r="3" fill="#A0A0B3"/>
        <circle cx="17" cy="17" r="3" fill="#A0A0B3"/>
        <circle cx="63" cy="63" r="3" fill="#A0A0B3"/>
        <circle cx="63" cy="17" r="3" fill="#A0A0B3"/>
        <circle cx="17" cy="63" r="3" fill="#A0A0B3"/>
        {/* Анимированная синяя точка */}
        <circle
          r="8"
          fill="#007AFF"
          className="blue-dot"
        />
      </svg>
      <style jsx>{`
        .blue-dot {
          animation: moveDot 0.6s steps(1) infinite;
        }
        @keyframes moveDot {
          0% {
            transform: translate(40px, 8px);
          }
          12.5% {
            transform: translate(63px, 17px);
          }
          25% {
            transform: translate(72px, 40px);
          }
          37.5% {
            transform: translate(63px, 63px);
          }
          50% {
            transform: translate(40px, 72px);
          }
          62.5% {
            transform: translate(17px, 63px);
          }
          75% {
            transform: translate(8px, 40px);
          }
          87.5% {
            transform: translate(17px, 17px);
          }
          100% {
            transform: translate(40px, 8px);
          }
        }
      `}</style>
    </div>
  );
};

export default DotSpinner;