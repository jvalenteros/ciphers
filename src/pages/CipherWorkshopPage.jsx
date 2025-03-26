import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import CipherInput from '../components/CipherInput';
import CipherOutput from '../components/CipherOutput';
import { caesar, vigenere, atbash, railFence } from '../utils/cipher';

const CipherWorkshopPage = () => {
  const { isDarkMode } = useTheme();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  
  // Custom cipher configuration
  const [customCipher, setCustomCipher] = useState({
    name: 'My Custom Cipher',
    description: 'A personalized encryption system',
    type: 'substitution', // substitution, transposition, polyalphabetic, hybrid
    characterMap: {}, // For substitution ciphers
    key: 'SECRET', // For polyalphabetic ciphers
    rails: 3, // For rail fence transposition
    complexity: 1, // 1-5 scale
    steps: [], // Array of cipher operations for hybrid approaches
  });
  
  // Library of saved ciphers
  const [savedCiphers, setSavedCiphers] = useState([]);
  
  // Load saved ciphers from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('customCiphers');
    if (saved) {
      try {
        setSavedCiphers(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved ciphers:', e);
      }
    }
  }, []);
  
  // Save ciphers to localStorage when they change
  useEffect(() => {
    if (savedCiphers.length > 0) {
      localStorage.setItem('customCiphers', JSON.stringify(savedCiphers));
    }
  }, [savedCiphers]);
  
  // Character mapping for substitution ciphers
  const [characterMapInput, setCharacterMapInput] = useState('');
  const [characterMapOutput, setCharacterMapOutput] = useState('');
  
  // Update character map when inputs change
  useEffect(() => {
    if (customCipher.type === 'substitution' && 
        characterMapInput.length > 0 && 
        characterMapOutput.length > 0) {
      
      const newMap = {};
      const minLength = Math.min(characterMapInput.length, characterMapOutput.length);
      
      for (let i = 0; i < minLength; i++) {
        newMap[characterMapInput[i]] = characterMapOutput[i];
      }
      
      setCustomCipher(prev => ({
        ...prev,
        characterMap: newMap
      }));
    }
  }, [characterMapInput, characterMapOutput, customCipher.type]);
  
  // Apply the custom cipher to the input text
  const applyCustomCipher = () => {
    if (input.trim() === '') {
      setError('You must enter some text to encode.');
      return;
    }
    
    try {
      let result = input;
      
      switch (customCipher.type) {
        case 'substitution':
          result = applySubstitutionCipher(input);
          break;
        case 'transposition':
          result = railFence(input, customCipher.rails, false);
          break;
        case 'polyalphabetic':
          result = vigenere(input, customCipher.key, false);
          break;
        case 'hybrid':
          result = applyHybridCipher(input);
          break;
        default:
          result = input;
      }
      
      setOutput(result);
      setError('');
    } catch (err) {
      setError(err.message || 'An error occurred during encoding.');
    }
  };
  
  // Apply substitution cipher using the character map
  const applySubstitutionCipher = (text) => {
    if (Object.keys(customCipher.characterMap).length === 0) {
      throw new Error('Character mapping is not defined.');
    }
    
    return text.split('').map(char => {
      return customCipher.characterMap[char] || char;
    }).join('');
  };
  
  // Apply hybrid cipher by chaining multiple cipher operations
  const applyHybridCipher = (text) => {
    if (!customCipher.steps || customCipher.steps.length === 0) {
      throw new Error('No steps defined for hybrid cipher.');
    }
    
    let result = text;
    
    for (const step of customCipher.steps) {
      switch (step.type) {
        case 'caesar':
          result = caesar(result, step.shift || 3, false);
          break;
        case 'vigenere':
          result = vigenere(result, step.key || 'KEY', false);
          break;
        case 'atbash':
          result = atbash(result);
          break;
        case 'railfence':
          result = railFence(result, step.rails || 3, false);
          break;
        default:
          // Skip unknown step types
          break;
      }
    }
    
    return result;
  };
  
  // Calculate estimated security strength (1-10 scale)
  const calculateSecurityStrength = () => {
    let strength = 0;
    
    // Base strength by cipher type
    switch (customCipher.type) {
      case 'substitution':
        strength += Object.keys(customCipher.characterMap).length > 20 ? 3 : 1;
        break;
      case 'transposition':
        strength += customCipher.rails > 5 ? 2 : 1;
        break;
      case 'polyalphabetic':
        strength += customCipher.key.length > 10 ? 4 : 2;
        break;
      case 'hybrid':
        strength += customCipher.steps.length * 2;
        break;
    }
    
    // Add complexity factor
    strength += customCipher.complexity;
    
    // Cap at 10
    return Math.min(10, strength);
  };
  
  // Save the current custom cipher to the library
  const saveCipher = () => {
    if (!customCipher.name.trim()) {
      setError('Please provide a name for your cipher.');
      return;
    }
    
    const newCipher = {
      ...customCipher,
      id: Date.now().toString(),
      created: new Date().toISOString(),
      securityStrength: calculateSecurityStrength()
    };
    
    setSavedCiphers(prev => [...prev, newCipher]);
    setError('');
  };
  
  // Load a saved cipher from the library
  const loadCipher = (cipherId) => {
    const cipher = savedCiphers.find(c => c.id === cipherId);
    if (cipher) {
      setCustomCipher(cipher);
      
      // Reset character map inputs if it's a substitution cipher
      if (cipher.type === 'substitution') {
        const mapEntries = Object.entries(cipher.characterMap);
        if (mapEntries.length > 0) {
          setCharacterMapInput(mapEntries.map(([k]) => k).join(''));
          setCharacterMapOutput(mapEntries.map(([_, v]) => v).join(''));
        }
      }
    }
  };
  
  // Delete a saved cipher from the library
  const deleteCipher = (cipherId) => {
    setSavedCiphers(prev => prev.filter(c => c.id !== cipherId));
  };
  
  // Add a step to the hybrid cipher
  const addHybridStep = (stepType) => {
    const newStep = { type: stepType };
    
    // Add default parameters based on step type
    switch (stepType) {
      case 'caesar':
        newStep.shift = 3;
        break;
      case 'vigenere':
        newStep.key = 'KEY';
        break;
      case 'railfence':
        newStep.rails = 3;
        break;
    }
    
    setCustomCipher(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep]
    }));
  };
  
  // Remove a step from the hybrid cipher
  const removeHybridStep = (index) => {
    setCustomCipher(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };
  
  // Update a hybrid step's parameters
  const updateHybridStep = (index, paramName, value) => {
    setCustomCipher(prev => {
      const newSteps = [...prev.steps];
      newSteps[index] = {
        ...newSteps[index],
        [paramName]: value
      };
      return {
        ...prev,
        steps: newSteps
      };
    });
  };
  
  return (
    <div className="note-container">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Cipher Workshop
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Create and test your own custom encryption systems
          </p>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: Cipher configuration */}
        <div className="space-y-6">
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-xl font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Cipher Configuration
            </h2>
            
            {/* Cipher name and description */}
            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="cipherName"
                  className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Cipher Name
                </label>
                <input
                  id="cipherName"
                  type="text"
                  value={customCipher.name}
                  onChange={(e) => setCustomCipher(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 ${
                    isDarkMode ? 'focus:ring-blue-600' : 'focus:ring-blue-500'
                  }`}
                />
              </div>
              
              <div>
                <label
                  htmlFor="cipherDescription"
                  className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Description
                </label>
                <textarea
                  id="cipherDescription"
                  value={customCipher.description}
                  onChange={(e) => setCustomCipher(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 ${
                    isDarkMode ? 'focus:ring-blue-600' : 'focus:ring-blue-500'
                  }`}
                />
              </div>
            </div>
            
            {/* Cipher type selection */}
            <div className="mb-6">
              <label
                className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Cipher Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['substitution', 'transposition', 'polyalphabetic', 'hybrid'].map(type => (
                  <button
                    key={type}
                    onClick={() => setCustomCipher(prev => ({ ...prev, type }))}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      customCipher.type === type
                        ? isDarkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-800'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
              
              {/* Tooltip for the selected cipher type */}
              <div className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {customCipher.type === 'substitution' &&
                  'Substitution ciphers replace each character with another character.'}
                {customCipher.type === 'transposition' &&
                  'Transposition ciphers rearrange the characters without changing them.'}
                {customCipher.type === 'polyalphabetic' &&
                  'Polyalphabetic ciphers use multiple substitution alphabets based on a key.'}
                {customCipher.type === 'hybrid' &&
                  'Hybrid ciphers combine multiple encryption techniques for increased security.'}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={applyCustomCipher}
                className="note-button note-button-primary flex-grow"
              >
                Apply Cipher
              </button>
              <button
                onClick={saveCipher}
                className="note-button note-button-secondary"
              >
                Save Cipher
              </button>
            </div>
          </div>
        </div>
        
        {/* Right column: Testing environment */}
        <div className="space-y-6">
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-xl font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Testing Environment
            </h2>
            
            <div className="space-y-6">
              {/* Input */}
              <div>
                <label
                  htmlFor="testInput"
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Plaintext
                </label>
                <CipherInput
                  value={input}
                  onChange={setInput}
                />
              </div>
              
              {/* Output */}
              <div>
                <label
                  htmlFor="testOutput"
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Ciphertext
                </label>
                <CipherOutput value={output} />
              </div>
              
              {/* Error message */}
              {error && (
                <div className="mt-4 text-sm text-red-500">{error}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CipherWorkshopPage;
