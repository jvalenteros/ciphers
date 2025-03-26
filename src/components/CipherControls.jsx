import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const CipherControls = ({
  onEncodeDecode,
  onClear,
  cipherType,
  onCipherTypeChange,
  cipherParams,
  onCipherParamsChange,
  isDecoding,
  onDecodingChange
}) => {
  const { isDarkMode } = useTheme();
  const [showParams, setShowParams] = useState(false);
  
  // Update showParams when cipher type changes
  useEffect(() => {
    setShowParams(cipherType !== 'atbash');
  }, [cipherType]);
  
  const handleParamChange = (paramName, value) => {
    onCipherParamsChange({
      ...cipherParams,
      [paramName]: value
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="cipherType"
            className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            Cipher Type
          </label>
          <select
            id="cipherType"
            value={cipherType}
            onChange={(e) => onCipherTypeChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-md border ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 ${
              isDarkMode ? 'focus:ring-blue-600' : 'focus:ring-blue-500'
            }`}
          >
            <option value="caesar">Caesar</option>
            <option value="rot13">ROT13 (Caesar with shift 13)</option>
            <option value="vigenere">Vigenère</option>
            <option value="atbash">Atbash</option>
            <option value="railfence">Rail Fence</option>
            <option value="beaufort">Beaufort</option>
          </select>
        </div>
        
        <div>
          <label
            htmlFor="operation"
            className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            Operation
          </label>
          <div className="flex">
            <button
              type="button"
              onClick={() => onDecodingChange(false)}
              className={`flex-1 px-3 py-2 rounded-l-md border ${
                !isDecoding
                  ? isDarkMode
                    ? 'bg-blue-900/30 text-blue-300 border-blue-800'
                    : 'bg-blue-100 text-blue-700 border-blue-300'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-300 border-gray-700'
                    : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              Encode
            </button>
            <button
              type="button"
              onClick={() => onDecodingChange(true)}
              className={`flex-1 px-3 py-2 rounded-r-md border ${
                isDecoding
                  ? isDarkMode
                    ? 'bg-blue-900/30 text-blue-300 border-blue-800'
                    : 'bg-blue-100 text-blue-700 border-blue-300'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-300 border-gray-700'
                    : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              Decode
            </button>
          </div>
        </div>
      </div>
      
      {showParams && (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          {cipherType === 'caesar' && (
            <div>
              <label
                htmlFor="shift"
                className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Shift Value (1-25)
              </label>
              <input
                id="shift"
                type="number"
                min="1"
                max="25"
                value={cipherParams.shift || 13}
                onChange={(e) => handleParamChange('shift', parseInt(e.target.value, 10) || 1)}
                className={`w-full px-3 py-2 rounded-md border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 ${
                  isDarkMode ? 'focus:ring-blue-600' : 'focus:ring-blue-500'
                }`}
              />
            </div>
          )}
          
          {(cipherType === 'vigenere' || cipherType === 'beaufort') && (
            <div>
              <label
                htmlFor="key"
                className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Key (letters only)
              </label>
              <input
                id="key"
                type="text"
                value={cipherParams.key || ''}
                onChange={(e) => handleParamChange('key', e.target.value)}
                placeholder="Enter key (e.g., SECRET)"
                className={`w-full px-3 py-2 rounded-md border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 ${
                  isDarkMode ? 'focus:ring-blue-600' : 'focus:ring-blue-500'
                }`}
              />
              {cipherParams.key && !/^[a-zA-Z]+$/.test(cipherParams.key) && (
                <p className="mt-1 text-sm text-red-500">Key should contain only letters.</p>
              )}
            </div>
          )}
          
          {cipherType === 'railfence' && (
            <div>
              <label
                htmlFor="rails"
                className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Number of Rails (2-10)
              </label>
              <input
                id="rails"
                type="number"
                min="2"
                max="10"
                value={cipherParams.rails || 3}
                onChange={(e) => handleParamChange('rails', parseInt(e.target.value, 10) || 2)}
                className={`w-full px-3 py-2 rounded-md border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 ${
                  isDarkMode ? 'focus:ring-blue-600' : 'focus:ring-blue-500'
                }`}
              />
            </div>
          )}
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          className="note-button note-button-primary flex-grow"
          onClick={onEncodeDecode}
        >
          {isDecoding ? 'Decode' : 'Encode'}
        </button>
        <button
          className="note-button note-button-secondary"
          onClick={onClear}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default CipherControls;