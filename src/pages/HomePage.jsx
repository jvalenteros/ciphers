import { useState } from 'react';
import CipherInput from '../components/CipherInput';
import CipherControls from '../components/CipherControls';
import CipherOutput from '../components/CipherOutput';
import { caesar, rot13, vigenere, atbash, railFence, beaufort } from '../utils/cipher';
import { useTheme } from '../contexts/ThemeContext';

function HomePage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [cipherType, setCipherType] = useState('caesar');
  const [isDecoding, setIsDecoding] = useState(false);
  const [cipherParams, setCipherParams] = useState({
    shift: 3,
    key: 'SECRET',
    rails: 3
  });
  const { isDarkMode } = useTheme();

  const handleEncodeDecode = () => {
    if (input.trim() === '') {
      setError('You must enter some text to encode/decode.');
      return;
    }
    
    try {
      let result = '';
      
      switch (cipherType) {
        case 'caesar':
          result = caesar(input, cipherParams.shift, isDecoding);
          break;
        case 'rot13':
          result = rot13(input);
          break;
        case 'vigenere':
          if (!cipherParams.key || cipherParams.key.trim() === '') {
            setError('You must provide a key for the Vigenère cipher.');
            return;
          }
          result = vigenere(input, cipherParams.key, isDecoding);
          break;
        case 'atbash':
          result = atbash(input);
          break;
        case 'railfence':
          result = railFence(input, cipherParams.rails, isDecoding);
          break;
        case 'beaufort':
          if (!cipherParams.key || cipherParams.key.trim() === '') {
            setError('You must provide a key for the Beaufort cipher.');
            return;
          }
          result = beaufort(input, cipherParams.key);
          break;
        default:
          result = input;
      }
      
      setOutput(result);
      setError('');
    } catch (err) {
      setError(err.message || 'An error occurred during encoding/decoding.');
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  // Get the title based on the current cipher type
  const getCipherTitle = () => {
    switch (cipherType) {
      case 'caesar': return 'Caesar Cipher';
      case 'rot13': return 'ROT13 Cipher';
      case 'vigenere': return 'Vigenère Cipher';
      case 'atbash': return 'Atbash Cipher';
      case 'railfence': return 'Rail Fence Cipher';
      case 'beaufort': return 'Beaufort Cipher';
      default: return 'Cipher Tool';
    }
  };

  // Get the description based on the current cipher type
  const getCipherDescription = () => {
    switch (cipherType) {
      case 'caesar':
        return `A substitution cipher where each letter is shifted by a fixed number (${cipherParams.shift}) of positions.`;
      case 'rot13':
        return 'A special case of the Caesar cipher with a fixed shift of 13 places.';
      case 'vigenere':
        return 'A method of encrypting text using a series of interwoven Caesar ciphers based on a keyword.';
      case 'atbash':
        return 'A substitution cipher where each letter is mapped to its reverse (A→Z, B→Y, etc.).';
      case 'railfence':
        return `A transposition cipher that arranges text in a zigzag pattern across ${cipherParams.rails} rails.`;
      case 'beaufort':
        return 'A polyalphabetic cipher similar to Vigenère but using a different formula.';
      default:
        return 'A tool to encode and decode text using various cipher methods.';
    }
  };

  return (
    <div className="note-container">
      <header className="mb-8">
        <h1 className={`text-3xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {getCipherTitle()}
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {getCipherDescription()}
        </p>
      </header>
      
      <div className="space-y-6">
        <CipherInput
          value={input}
          onChange={setInput}
        />
        
        <CipherControls
          onEncodeDecode={handleEncodeDecode}
          onClear={handleClear}
          cipherType={cipherType}
          onCipherTypeChange={setCipherType}
          cipherParams={cipherParams}
          onCipherParamsChange={setCipherParams}
          isDecoding={isDecoding}
          onDecodingChange={setIsDecoding}
        />
        
        <div className={`h-px my-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        
        <CipherOutput value={output} />
        
        {error && (
          <div className="mt-4 text-sm text-red-500">{error}</div>
        )}
      </div>
    </div>
  );
}

export default HomePage;