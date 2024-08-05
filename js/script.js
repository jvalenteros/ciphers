function rot13(str) {
    return str.replace(/[a-zA-Z]/g, function(char) {
        return String.fromCharCode((char <= 'Z' ? 90 : 122) >= (char = char.charCodeAt(0) + 13) ? char : char - 26);
    });
}

function caesar(str, shift) {
    return str.replace(/[a-zA-Z]/g, function(char) {
        if (shift > 0) { // Positive shift (1 through 25)
            const range = char <= 'Z' ? 90 : 122;
            return String.fromCharCode(range >= (char = char.charCodeAt(0) + shift) ? char : char - 26);
        } else if (shift < 0) { // Negative shift (-1 through -25)
            const range = char <= 'Z' ? 65 : 97;
            return String.fromCharCode((char.charCodeAt(0) - range + shift + 26) % 26 + range);
        }
    });
}

function processText() {
    const input = document.getElementById('input').value;
    const cipherType = document.getElementById('cipherType').value;
    let output = '';

    if (input.trim() === '') {
        showError('You must enter some text to encode/decode.');
        return;
    }

    if (cipherType === 'caesar') {
        const shift = document.getElementById('shift').value;
        let intShift = Number(shift);

        if (shift === '0') {
            showError('Please enter a shift that is not zero.');
            return;
        } else if (shift < -25 || shift > 25) {
            showError('Please enter a shift between -25 and 25.');
            return;
        } else if (shift === '' || isNaN(intShift)) {
            showError('Please enter a valid shift.');
            return;
        }

        output = caesar(input, intShift);
    } else if (cipherType === 'rot13') {
        output = rot13(input);
    }

    document.getElementById('output').textContent = output;
    updateWordCount('output');
    hideError();
}

function clearText() {
    document.getElementById('input').value = '';
    document.getElementById('shift').value = '';
    document.getElementById('output').textContent = '';
    updateWordCount('input');
    updateWordCount('output');
    hideError();
}

function updateWordCount(elementId) {
    const text = document.getElementById(elementId).value || document.getElementById(elementId).textContent;
    const charCount = text.length;
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    let charString = "characters", wordString = "words"

    if (charCount === 1) {
        charString = "character"
    }

    if (wordCount === 1) {
        wordString = "word"
    }

    document.getElementById(`${elementId}Count`).textContent =
    `${charCount} ${charString}, ${wordCount} ${wordString}`;
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

function hideError() {
    document.getElementById('errorMessage').classList.add('hidden');
}

function copyToClipboard() {
    const copiedText = document.getElementById('output').innerText;
    navigator.clipboard.writeText(copiedText);

    // Printing the message "Copied to clipboard!"
    const copyMessage = document.getElementById('copyMessage');
    copyMessage.classList.remove('hidden');
    setTimeout(() => copyMessage.classList.add('hidden'), 2000);
}

function toggleShiftContainer() {
    const cipherType = document.getElementById('cipherType').value;
    const shiftContainer = document.getElementById('shiftContainer');
    const cipherTypeContainer = document.getElementById('cipherType').parentNode;
    
    if (cipherType === 'caesar') {
        shiftContainer.classList.remove('invisible');
        shiftContainer.classList.remove('h-0', 'mb-0');
        shiftContainer.classList.add('mb-4');
        cipherTypeContainer.classList.remove('mb-6');
        cipherTypeContainer.classList.add('mb-4');
    } else {
        shiftContainer.classList.add('invisible', 'h-0', 'mb-0');
        shiftContainer.classList.remove('mb-4');
        cipherTypeContainer.classList.remove('mb-4');
        cipherTypeContainer.classList.add('mb-6');
    }
}

// event listeners
// load html contents first before js runs
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('input').addEventListener('input', () => updateWordCount('input'));
    document.getElementById('cipherType').addEventListener('change', toggleShiftContainer);

    // init word count update
    updateWordCount('input');
    updateWordCount('output');

    // init call to set correct visibility of shift container
    toggleShiftContainer();
});