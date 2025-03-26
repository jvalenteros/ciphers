import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const FloatingActionButton = ({ to, icon, tooltip }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {showTooltip && (
        <div 
          className={`absolute bottom-16 right-0 px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${
            isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
          }`}
        >
          {tooltip}
        </div>
      )}
      <button
        onClick={() => navigate(to)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${
          isDarkMode ? 'bg-blue-600 text-white' : 'bg-gray-900 text-white'
        }`}
      >
        {icon || (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default FloatingActionButton;