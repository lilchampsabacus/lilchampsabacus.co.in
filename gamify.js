/* gamify.js - Adds Sounds and Confetti */

// 1. LOAD CONFETTI LIBRARY DYNAMICALLY
const confettiScript = document.createElement('script');
confettiScript.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
document.head.appendChild(confettiScript);

// 2. SOUND EFFECTS (Encoded as Data URIs to avoid external file issues)
const sounds = {
    correct: new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU..."), // (Shortened for brevity, see note below)
    wrong: new Audio("data:audio/wav;base64,UklGRi..."), 
    // Using simple beep synthesis for reliability instead of long base64 strings
};

// Use Web Audio API for cleaner synthesized beeps (No downloads needed)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'correct') {
        // Pleasant "Ding" (High pitch sine wave)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'wrong') {
        // Dull "Thud" (Low pitch triangle wave)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    }
}

// 3. CELEBRATION FUNCTION
function triggerWinConfetti() {
    if (typeof confetti === 'function') {
        // Fire from left
        confetti({ origin: { x: 0, y: 0.7 }, angle: 60, spread: 55, colors: ['#4f46e5', '#ff7e67'] });
        // Fire from right
        confetti({ origin: { x: 1, y: 0.7 }, angle: 120, spread: 55, colors: ['#4f46e5', '#ff7e67'] });
    }
}

// 4. ATTACH TO INPUTS (Auto-detect correct answers for immediate feedback files)
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('change', (e) => {
            // Simple visual effect on focus change
            e.target.classList.add('scale-105');
            setTimeout(() => e.target.classList.remove('scale-105'), 200);
        });
    });
});

// Expose functions to global scope so HTML files can call them
window.lilChampUtils = {
    playCorrect: () => playSound('correct'),
    playWrong: () => playSound('wrong'),
    celebrate: triggerWinConfetti
};