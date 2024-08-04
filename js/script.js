function rot13(str) {
    return str.replace(/[a-zA-Z]/g, function(char) {
        return String.fromCharCode((char <= 'Z' ? 90 : 122) >= (char = char.charCodeAt(0) + 13) ? char : char - 26);
    });
}

function processText() {
    const input = document.getElementById('input').value;
    if (input.trim() === '') {
        showError('You must enter some text to encode/decode.');
        return;
    }
    const output = rot13(input);
    document.getElementById('output').textContent = output;
    updateWordCount('output');
    hideError();
}

function clearText() {
    document.getElementById('input').value = '';
    document.getElementById('output').textContent = '';
    updateWordCount('input');
    updateWordCount('output');
    hideError();
}

function updateWordCount(elementId) {
    const text = document.getElementById(elementId).value || document.getElementById(elementId).textContent;
    const charCount = text.length;
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    document.getElementById(`${elementId}Count`).textContent = `${charCount} characters, ${wordCount} words`;
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
}

// event listeners
document.getElementById('input').addEventListener('input', () => updateWordCount('input'));

// init word count update
updateWordCount('input');
updateWordCount('output');