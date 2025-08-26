// Loader.js
import React from 'react';

export default function Loader() {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <div className="w-20 h-20 sm:w-32 sm:h-32 lg:w-30 lg:h-30 border-[6px] sm:border-[8px] lg:border-[10px] border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
}