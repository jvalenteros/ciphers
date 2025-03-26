/**
 * Applies Caesar cipher to a string with a specified shift
 * @param {string} str - The string to encode/decode
 * @param {number} shift - The shift value (1-25)
 * @param {boolean} decode - Whether to decode (if true, shift is reversed)
 * @returns {string} - The encoded/decoded string
 */
export function caesar(str, shift = 13, decode = false) {
  // Normalize shift to be between 0-25
  shift = ((shift % 26) + 26) % 26;
  
  // If decoding, reverse the shift
  if (decode) {
    shift = (26 - shift) % 26;
  }
  
  return str.replace(/[a-zA-Z]/g, function(char) {
    const code = char.charCodeAt(0);
    const isUpperCase = code >= 65 && code <= 90;
    const base = isUpperCase ? 65 : 97;
    
    // Apply shift and wrap around if necessary
    return String.fromCharCode(((code - base + shift) % 26) + base);
  });
}

/**
 * Applies ROT13 cipher to a string (Caesar cipher with shift of 13)
 * @param {string} str - The string to encode/decode
 * @returns {string} - The encoded/decoded string
 */
export function rot13(str) {
  return caesar(str, 13);
}

/**
 * Applies Vigenère cipher to a string
 * @param {string} str - The string to encode/decode
 * @param {string} key - The key for the Vigenère cipher
 * @param {boolean} decode - Whether to decode (if true, operation is reversed)
 * @returns {string} - The encoded/decoded string
 */
export function vigenere(str, key, decode = false) {
  if (!key || key.trim() === '') {
    throw new Error('A key is required for the Vigenère cipher');
  }
  
  // Remove non-alphabetic characters from the key and convert to uppercase
  const cleanKey = key.replace(/[^a-zA-Z]/g, '').toUpperCase();
  
  if (cleanKey.length === 0) {
    throw new Error('Key must contain at least one letter');
  }
  
  let result = '';
  let keyIndex = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    
    // Only process alphabetic characters
    if (/[a-zA-Z]/.test(char)) {
      const isUpperCase = char === char.toUpperCase();
      const base = isUpperCase ? 65 : 97;
      const charCode = char.charCodeAt(0) - base;
      
      // Get the current key character and its value (0-25)
      const keyChar = cleanKey[keyIndex % cleanKey.length];
      const keyValue = keyChar.charCodeAt(0) - 65;
      
      // Apply Vigenère formula
      let newCharCode;
      if (decode) {
        // Decoding: subtract key value and add 26 if negative
        newCharCode = (charCode - keyValue + 26) % 26;
      } else {
        // Encoding: add key value and mod 26
        newCharCode = (charCode + keyValue) % 26;
      }
      
      // Convert back to character and add to result
      result += String.fromCharCode(newCharCode + base);
      
      // Move to next key character
      keyIndex++;
    } else {
      // Non-alphabetic characters remain unchanged
      result += char;
    }
  }
  
  return result;
}

/**
 * Applies Atbash cipher to a string (reverses the alphabet)
 * @param {string} str - The string to encode/decode
 * @returns {string} - The encoded/decoded string
 */
export function atbash(str) {
  return str.replace(/[a-zA-Z]/g, function(char) {
    const code = char.charCodeAt(0);
    const isUpperCase = code >= 65 && code <= 90;
    const base = isUpperCase ? 65 : 97;
    
    // For Atbash, we reverse the position in the alphabet
    // If 'A' is 0, 'Z' is 25, so the formula is 25 - position
    return String.fromCharCode(base + 25 - (code - base));
  });
}

/**
 * Applies Rail Fence cipher to a string
 * @param {string} str - The string to encode/decode
 * @param {number} rails - The number of rails (rows)
 * @param {boolean} decode - Whether to decode (if true, operation is reversed)
 * @returns {string} - The encoded/decoded string
 */
export function railFence(str, rails = 3, decode = false) {
  if (rails < 2) {
    throw new Error('Rail Fence cipher requires at least 2 rails');
  }
  
  if (str.length <= rails) {
    return str;
  }
  
  if (decode) {
    // Decoding
    const fence = Array(rails).fill().map(() => Array(str.length).fill(''));
    
    // Determine the pattern of the fence
    let rail = 0;
    let direction = 1;
    
    for (let i = 0; i < str.length; i++) {
      fence[rail][i] = '*'; // Mark positions where characters will go
      
      rail += direction;
      if (rail === 0 || rail === rails - 1) {
        direction *= -1;
      }
    }
    
    // Fill the fence with characters from the input string
    let index = 0;
    for (let i = 0; i < rails; i++) {
      for (let j = 0; j < str.length; j++) {
        if (fence[i][j] === '*' && index < str.length) {
          fence[i][j] = str[index++];
        }
      }
    }
    
    // Read off the fence
    let result = '';
    rail = 0;
    direction = 1;
    
    for (let i = 0; i < str.length; i++) {
      result += fence[rail][i];
      
      rail += direction;
      if (rail === 0 || rail === rails - 1) {
        direction *= -1;
      }
    }
    
    return result;
  } else {
    // Encoding
    const fence = Array(rails).fill().map(() => []);
    
    let rail = 0;
    let direction = 1;
    
    // Place characters in the fence
    for (let i = 0; i < str.length; i++) {
      fence[rail].push(str[i]);
      
      rail += direction;
      if (rail === 0 || rail === rails - 1) {
        direction *= -1;
      }
    }
    
    // Combine all rails to get the encoded string
    return fence.flat().join('');
  }
}

/**
 * Applies Beaufort cipher to a string
 * @param {string} str - The string to encode/decode
 * @param {string} key - The key for the Beaufort cipher
 * @returns {string} - The encoded/decoded string (Beaufort is its own inverse)
 */
export function beaufort(str, key) {
  if (!key || key.trim() === '') {
    throw new Error('A key is required for the Beaufort cipher');
  }
  
  // Remove non-alphabetic characters from the key and convert to uppercase
  const cleanKey = key.replace(/[^a-zA-Z]/g, '').toUpperCase();
  
  if (cleanKey.length === 0) {
    throw new Error('Key must contain at least one letter');
  }
  
  let result = '';
  let keyIndex = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    
    // Only process alphabetic characters
    if (/[a-zA-Z]/.test(char)) {
      const isUpperCase = char === char.toUpperCase();
      const base = isUpperCase ? 65 : 97;
      const charCode = char.toUpperCase().charCodeAt(0) - 65;
      
      // Get the current key character and its value (0-25)
      const keyChar = cleanKey[keyIndex % cleanKey.length];
      const keyValue = keyChar.charCodeAt(0) - 65;
      
      // Apply Beaufort formula: (key - plaintext) mod 26
      // Note: Beaufort is its own inverse, so encoding and decoding are the same
      const newCharCode = (keyValue - charCode + 26) % 26;
      
      // Convert back to character and add to result
      result += isUpperCase
        ? String.fromCharCode(newCharCode + 65)
        : String.fromCharCode(newCharCode + 97);
      
      // Move to next key character
      keyIndex++;
    } else {
      // Non-alphabetic characters remain unchanged
      result += char;
    }
  }
  
  return result;
}