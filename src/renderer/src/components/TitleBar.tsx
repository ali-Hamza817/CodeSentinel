import React from 'react';
import { Minus, Square, X } from 'lucide-react';

export const TitleBar: React.FC = () => {
  const handleMinimize = () => (window as any).api.minimize();
  const handleMaximize = () => (window as any).api.maximize();
  const handleClose = () => (window as any).api.close();

  return (
    <div className="h-10 bg-white border-b border-gray-100 flex items-center justify-between px-4 select-none" style={{ WebkitAppRegion: 'drag' } as any}>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-indigo-600 rounded-md flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </div>
        <span className="text-sm font-semibold text-gray-800 tracking-tight">CodeSentinel</span>
      </div>

      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button
          onClick={handleMinimize}
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-gray-800"
          title="Minimize"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={handleMaximize}
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-gray-800"
          title="Maximize"
        >
          <Square size={12} />
        </button>
        <button
          onClick={handleClose}
          className="p-1.5 hover:bg-red-50 rounded-md transition-colors text-gray-500 hover:text-red-600"
          title="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
