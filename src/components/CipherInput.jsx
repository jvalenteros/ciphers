import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const CipherInput = ({ value, onChange }) => {
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [prevCharCount, setPrevCharCount] = useState(0);
  const [prevWordCount, setPrevWordCount] = useState(0);
  const [isCountUpdated, setIsCountUpdated] = useState(false);
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

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label
          htmlFor="input"
          className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
        >
          Input
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
      <div className="note-card overflow-hidden">
        <textarea
          id="input"
          placeholder="Enter text to encode/decode..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="note-textarea p-4"
          rows={6}
        />
      </div>
    </div>
  );
};

export default CipherInput;