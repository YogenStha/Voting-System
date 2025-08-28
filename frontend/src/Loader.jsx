// Loader.js
import React from 'react';

// export default function Loader() {
//   return (
//     <div className="flex justify-center items-center h-screen w-screen">
//       <div className="w-20 h-20 sm:w-32 sm:h-32 lg:w-30 lg:h-30 border-[6px] sm:border-[8px] lg:border-[10px] border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
//     </div>
//   );
// }

export default function Loader() {
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Loading ...</p>
        </div>
      </div>
    );
}