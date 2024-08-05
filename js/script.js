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
    const shift = document.getElementById('shift').value;
    let intShift = Number(shift); // Converts String 'shift' to a number.

    if (input.trim() === '') {
        showError('You must enter some text to encode/decode.');
        return;
    } else if (shift === '0') {
        showError('Please enter a shift that is not zero.')
        return;
    } else if (shift < -26 || shift > 26) {
        showError('Please enter a shift between -26 and 26.');
        return;
    } else if (shift === '' || isNaN(intShift)) {
        showError('Please enter a valid shift.');
        return;
    }

    document.getElementById('output').textContent = caesar(input, intShift);
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

// event listeners
document.getElementById('input').addEventListener('input', () => updateWordCount('input'));

// init word count update
updateWordCount('input');
updateWordCount('output');