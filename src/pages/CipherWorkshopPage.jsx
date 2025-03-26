import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { useTheme } from '../contexts/ThemeContext';
import CipherInput from '../components/CipherInput';
import CipherOutput from '../components/CipherOutput';
import { caesar, vigenere, atbash, railFence } from '../utils/cipher';

const CipherWorkshopPage = () => {
  const { isDarkMode } = useTheme();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [cipherAnalysis, setCipherAnalysis] = useState(''); // State for analysis details
  
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
      setCipherAnalysis(generateCipherAnalysis(customCipher)); // Generate and set analysis
    } catch (err) {
      setError(err.message || 'An error occurred during encoding.');
      setOutput(''); // Clear output on error
      setCipherAnalysis(''); // Clear analysis on error
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

  // Generate a description of how the current cipher works
  const generateCipherAnalysis = (cipherConfig) => {
    let analysis = `**Cipher Type:** ${cipherConfig.type.charAt(0).toUpperCase() + cipherConfig.type.slice(1)}\n`;
    analysis += `**Description:** ${cipherConfig.description || 'No description provided.'}\n`;
    analysis += `**Perceived Complexity:** ${cipherConfig.complexity}/5\n`;

    switch (cipherConfig.type) {
      case 'substitution':
        const mapSize = Object.keys(cipherConfig.characterMap).length;
        analysis += `**Mapping:** ${mapSize} character${mapSize !== 1 ? 's' : ''} mapped.\n`;
        if (mapSize > 0) {
          const mapPreview = Object.entries(cipherConfig.characterMap)
            .slice(0, 5) // Show first 5 mappings as preview
            .map(([k, v]) => `${k} -> ${v}`)
            .join(', ');
          analysis += `*Preview:* ${mapPreview}${mapSize > 5 ? '...' : ''}\n`;
        } else {
          analysis += `*Warning:* No character map defined!\n`;
        }
        break;
      case 'transposition':
        analysis += `**Method:** Rail Fence\n`;
        analysis += `**Rails:** ${cipherConfig.rails}\n`;
        break;
      case 'polyalphabetic':
        analysis += `**Method:** Vigenère\n`;
        analysis += `**Keyword:** ${cipherConfig.key || 'Not set'}\n`;
        analysis += `**Key Length:** ${cipherConfig.key?.length || 0}\n`;
        break;
      case 'hybrid':
        const steps = cipherConfig.steps || [];
        analysis += `**Steps (${steps.length}):**\n`;
        if (steps.length > 0) {
          steps.forEach((step, index) => {
            analysis += `  ${index + 1}. ${step.type.charAt(0).toUpperCase() + step.type.slice(1)}`;
            if (step.type === 'caesar') analysis += ` (Shift: ${step.shift || 'default'})`;
            if (step.type === 'vigenere') analysis += ` (Key: ${step.key || 'default'})`;
            if (step.type === 'railfence') analysis += ` (Rails: ${step.rails || 'default'})`;
            analysis += '\n';
          });
        } else {
          analysis += `*Warning:* No steps defined for hybrid cipher!\n`;
        }
        break;
    }

    analysis += `**Estimated Security:** ${calculateSecurityStrength()}/10\n`;
    return analysis;
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
          {/* Add Return to Home link */}
          <Link
            to="/"
            className={`mt-2 text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} underline`}
          >
            &larr; Return to Home
          </Link>
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

            {/* --- cipher specific settings --- */}
            <div className="mt-6 space-y-4">
              {/* sub settings */}
              {customCipher.type === 'substitution' && (
                <div>
                  <h3 className={`text-md font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Character Mapping
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="charMapInput" className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Input Characters (e.g., ABC)
                      </label>
                      <input
                        id="charMapInput"
                        type="text"
                        value={characterMapInput}
                        onChange={(e) => setCharacterMapInput(e.target.value.toUpperCase())}
                        placeholder="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                        className={`w-full px-2 py-1 rounded-md border text-xs ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-200'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-1 ${
                          isDarkMode ? 'focus:ring-blue-600' : 'focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label htmlFor="charMapOutput" className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Output Characters (e.g., XYZ)
                      </label>
                      <input
                        id="charMapOutput"
                        type="text"
                        value={characterMapOutput}
                        onChange={(e) => setCharacterMapOutput(e.target.value.toUpperCase())}
                        placeholder="ZYXWVUTSRQPONMLKJIHGFEDCBA"
                        className={`w-full px-2 py-1 rounded-md border text-xs ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-200'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-1 ${
                          isDarkMode ? 'focus:ring-blue-600' : 'focus:ring-blue-500'
                        }`}
                      />
                    </div>
                  </div>
                  <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Define the substitution mapping. Characters at the same position correspond (e.g., A maps to Z if they are first).
                  </p>
                </div>
              )}

              {/* Transposition Settings */}
              {customCipher.type === 'transposition' && (
                <div>
                  <label htmlFor="rails" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Number of Rails (for Rail Fence)
                  </label>
                  <input
                    id="rails"
                    type="number"
                    min="2"
                    value={customCipher.rails}
                    onChange={(e) => setCustomCipher(prev => ({ ...prev, rails: parseInt(e.target.value, 10) || 2 }))}
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

              {/* Polyalphabetic Settings */}
              {customCipher.type === 'polyalphabetic' && (
                <div>
                  <label htmlFor="polyKey" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Keyword (for Vigenère)
                  </label>
                  <input
                    id="polyKey"
                    type="text"
                    value={customCipher.key}
                    onChange={(e) => setCustomCipher(prev => ({ ...prev, key: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') }))}
                    placeholder="SECRETKEY"
                    className={`w-full px-3 py-2 rounded-md border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 ${
                      isDarkMode ? 'focus:ring-blue-600' : 'focus:ring-blue-500'
                    }`}
                  />
                   <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Enter an uppercase alphabetic key. Non-alphabetic characters will be removed.
                  </p>
                </div>
              )}

              {/* hybrid settings, placeholder for now...  */}
              {customCipher.type === 'hybrid' && (
                <div>
                  <h3 className={`text-md font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Hybrid Steps Configuration
                  </h3>
                  
                  {/* list of the current steps */}
                  <div className="space-y-3 mb-4">
                    {(customCipher.steps || []).map((step, index) => (
                      <div key={index} className={`p-3 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`font-medium text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            Step {index + 1}: {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                          </span>
                          <button
                            onClick={() => removeHybridStep(index)}
                            className={`text-xs px-2 py-0.5 rounded ${isDarkMode ? 'bg-red-800 hover:bg-red-700 text-red-100' : 'bg-red-100 hover:bg-red-200 text-red-700'}`}
                          >
                            Remove
                          </button>
                        </div>
                        {/* Step-specific parameters */}
                        <div className="space-y-2 text-xs">
                          {step.type === 'caesar' && (
                            <div>
                              <label className={`block mb-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Shift:</label>
                              <input
                                type="number"
                                value={step.shift || 3}
                                onChange={(e) => updateHybridStep(index, 'shift', parseInt(e.target.value, 10) || 0)}
                                className={`w-full px-2 py-1 rounded border text-xs ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-white border-gray-300 text-gray-900'}`}
                              />
                            </div>
                          )}
                          {step.type === 'vigenere' && (
                            <div>
                              <label className={`block mb-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Key:</label>
                              <input
                                type="text"
                                value={step.key || 'KEY'}
                                onChange={(e) => updateHybridStep(index, 'key', e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                                className={`w-full px-2 py-1 rounded border text-xs ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-white border-gray-300 text-gray-900'}`}
                              />
                            </div>
                          )}
                          {step.type === 'railfence' && (
                            <div>
                              <label className={`block mb-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rails:</label>
                              <input
                                type="number"
                                min="2"
                                value={step.rails || 3}
                                onChange={(e) => updateHybridStep(index, 'rails', parseInt(e.target.value, 10) || 2)}
                                className={`w-full px-2 py-1 rounded border text-xs ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-white border-gray-300 text-gray-900'}`}
                              />
                            </div>
                          )}
                          {step.type === 'atbash' && (
                             <p className={`italic ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Atbash has no parameters.</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!customCipher.steps || customCipher.steps.length === 0) && (
                      <p className={`text-sm italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No steps added yet.</p>
                    )}
                  </div>

                  {/* Add step buttons */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Add a Cipher Step:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['caesar', 'vigenere', 'atbash', 'railfence'].map(stepType => (
                        <button
                          key={stepType}
                          onClick={() => addHybridStep(stepType)}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors duration-150 ${
                            isDarkMode
                              ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          + {stepType.charAt(0).toUpperCase() + stepType.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Complexity Slider */}
               <div>
                 <label htmlFor="complexity" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                   Perceived Complexity ({customCipher.complexity})
                 </label>
                 <input
                   id="complexity"
                   type="range"
                   min="1"
                   max="5"
                   step="1"
                   value={customCipher.complexity}
                   onChange={(e) => setCustomCipher(prev => ({ ...prev, complexity: parseInt(e.target.value, 10) }))}
                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                 />
                  <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Rate the conceptual complexity (1=Simple, 5=Very Complex). Affects estimated security.
                  </p>
               </div>
            </div>
            {/* --- End Cipher Specific Settings --- */}

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
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
              
              {/* CIPHER ANALYSIS DISPLAY */}
              {cipherAnalysis && (
                <div className={`mt-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-md font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Cipher Analysis
                  </h3>
                  {/* Using ReactMarkdown or similar would be better for rich text, but pre works for now */}
                  <pre className={`text-sm whitespace-pre-wrap font-sans ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {cipherAnalysis}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CipherWorkshopPage;
