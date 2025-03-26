import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const CipherOutput = ({ value }) => {
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [prevCharCount, setPrevCharCount] = useState(0);
  const [prevWordCount, setPrevWordCount] = useState(0);
  const [isCountUpdated, setIsCountUpdated] = useState(false);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Save previous counts to detect changes
    setPrevCharCount(charCount);
    setPrevWordCount(wordCount);
    
    // Update character count
    setCharCount(value.length);
    
    // Update word count
    const trimmedText = value.trim();
    setWordCount(trimmedText === '' ? 0 : trimmedText.split(/\s+/).length);
  }, [value]);

  useEffect(() => {
    // Trigger animation when counts change
    if (charCount !== prevCharCount || wordCount !== prevWordCount) {
      setIsCountUpdated(true);
      const timer = setTimeout(() => setIsCountUpdated(false), 500);
      return () => clearTimeout(timer);
    }
  }, [charCount, wordCount, prevCharCount, prevWordCount]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label
          htmlFor="output"
          className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
        >
          Output
        </label>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
            isCountUpdated
              ? isDarkMode
                ? 'bg-blue-900/30 text-blue-300 scale-105'
                : 'bg-blue-100 text-blue-700 scale-105'
              : isDarkMode
                ? 'bg-gray-800 text-gray-300'
                : 'bg-gray-100 text-gray-700'
          }`}
        >
          <span className="mr-2">{charCount} characters</span>
          <span className="mx-1">•</span>
          <span>{wordCount} words</span>
        </div>
      </div>
      <div className="note-card relative">
        <div
          id="output"
          className={`p-4 min-h-[100px] whitespace-pre-wrap ${
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          }`}
        >
          {value || (
            <span className={`italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Output will appear here...
            </span>
          )}
        </div>
        {value && (
          <div className="absolute top-3 right-3">
            <button
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-200 ${
                isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-blue-900/50 hover:text-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
              }`}
              onClick={copyToClipboard}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              aria-label="Copy to clipboard"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                />
              </svg>
              <span className="text-sm">Copy</span>
            </button>
            {showTooltip && (
              <div className={`absolute right-0 mt-1 px-2 py-1 text-xs rounded ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}>
                Copy to clipboard
              </div>
            )}
          </div>
        )}
      </div>
      {showCopyMessage && (
        <div className="mt-2 flex items-center justify-end">
          <div className={`px-3 py-1.5 rounded-md text-sm font-medium animate-fade-in ${
            isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
          }`}>
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Copied to clipboard
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CipherOutput;