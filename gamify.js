/* gamify.js - The "Brain" of Li'l Champs */

// ==================================================
// PART 1: CONFIGURATION (KEYS MUST BE AT THE TOP)
// ==================================================

const SUPABASE_URL = "https://ipakwgzbbjywzccoahiw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwYWt3Z3piYmp5d3pjY29haGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTAyMjQsImV4cCI6MjA3Nzc2NjIyNH0.VNjAhpbMzv9c19-IAg8UF2u28aIhh5OYCjAhcec9dRk"; 
let supabaseClient;

// ==================================================
// PART 2: INITIALIZATION LOGIC
// ==================================================

function initSupabase() {
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("✅ Supabase Connected");
    }
}

if (typeof supabase === 'undefined') {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = () => initSupabase();
    document.head.appendChild(script);
} else {
    initSupabase();
}

const confettiScript = document.createElement('script');
confettiScript.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
document.head.appendChild(confettiScript);

// ==================================================
// PART 3: SOUNDS & UTILS
// ==================================================

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start(); osc.stop(audioCtx.currentTime + 0.3);
    } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start(); osc.stop(audioCtx.currentTime + 0.2);
    }
}

function triggerWinConfetti() {
    if (typeof confetti === 'function') {
        confetti({ origin: { x: 0, y: 0.7 }, angle: 60, spread: 55, colors: ['#4f46e5', '#ff7e67'] });
        confetti({ origin: { x: 1, y: 0.7 }, angle: 120, spread: 55, colors: ['#4f46e5', '#ff7e67'] });
    }
}

// ==================================================
// PART 4: THE SAVE ENGINE (NOW WITH INDIAN TIME)
// ==================================================

async function saveExamResult(data) {
    console.log("🚀 Saving...", data);
    
    if (!supabaseClient && window.supabase) initSupabase();
    if (!supabaseClient) { 
        alert("Database connecting... Please wait 2 seconds and click Submit again."); 
        return; 
    }

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) { 
        alert("⚠️ Not Logged In! Please go to the login page."); 
        return; 
    }

    const studentName = sessionStorage.getItem('studentIdentifier') || session.user.email.split('@')[0];
    const numericScore = typeof data.score === 'string' ? parseInt(data.score) : data.score;

    // CAPTURE LOCAL INDIAN TIME
    const indianTime = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata", 
        dateStyle: "medium", 
        timeStyle: "short"
    });

    const { data: reportData, error } = await supabaseClient
        .from('reports')
        .insert({
            user_id: session.user.id,
            student_name: studentName,
            challenge_type: data.challenge,
            score_text: `${data.score}/${data.total}`,
            score_val: numericScore,
            total_val: data.total,
            time_taken: data.time,
            accuracy: data.accuracy,
            mistakes_summary: data.mistakes ? data.mistakes.map(m => m.question).join(', ') : "",
            indian_time: indianTime // <--- NEW FIELD SAVES READABLE TIME
        })
        .select()
        .single();

    if (error) { 
        console.error(error); 
        alert("Save Error: " + error.message); 
        return; 
    }

    if (data.mistakes && data.mistakes.length > 0) {
        const mistakeRows = data.mistakes.map(m => ({
            report_id: reportData.id,
            question: m.question,
            wrong_answer: String(m.wrong),
            correct_answer: String(m.correct)
        }));
        await supabaseClient.from('mistakes').insert(mistakeRows);
    }
    
    console.log("✅ Saved!");
    triggerWinConfetti();
    alert("✅ Report Saved Successfully!");
}

window.lilChampUtils = {
    playCorrect: () => playSound('correct'),
    playWrong: () => playSound('wrong'),
    celebrate: triggerWinConfetti,
    saveResult: saveExamResult 
};

// ==================================================
// PART 5: MATH GENERATOR ENGINE
// ==================================================

window.generateQuestions = function(code, countParam) {
    console.log("Generating questions for:", code);
    var questions = [];
    var uniqueKeys = {}; 
    var defaultCount = 30;
    
    if (code.startsWith('add-') || code.startsWith('dec-') || code.startsWith('neg-')) {
        defaultCount = 20;
    }

    var COUNT = countParam ? parseInt(countParam) : defaultCount;
    var maxTries = COUNT * 30; 
    var tries = 0;

    // --- A. NEGATIVE SUMS ---
    if (code.startsWith('neg-')) {
        var digits = 2; var rows = 10;
        if (code.indexOf('1d') > -1) digits = 1;
        if (code.indexOf('2d') > -1) digits = 2;
        if (code.indexOf('3d') > -1) digits = 3;
        if (code.indexOf('4d') > -1) digits = 4;
        if (code.indexOf('5d') > -1) digits = 5;

        while (questions.length < COUNT && tries < maxTries) {
            tries++;
            var nums = generateNegativeSum(digits, rows);
            var key = nums.join(",");
            if (!uniqueKeys[key]) { 
                uniqueKeys[key] = true; 
                questions.push({ numbers: nums, type: 'addition' }); 
            }
        }
        while (questions.length < COUNT) { 
            questions.push({ numbers: generateNegativeSum(digits, rows), type: 'addition' }); 
        }
    }
    // --- B. DECIMALS ---
    else if (code.startsWith('dec-')) {
        while (questions.length < COUNT && tries < maxTries) {
            tries++;
            var nums = generateDecimalSum(code); 
            var key = nums.join("|");
            if (!uniqueKeys[key]) {
                uniqueKeys[key] = true;
                questions.push({ numbers: nums, type: 'addition' });
            }
        }
        while (questions.length < COUNT) {
            questions.push({ numbers: generateDecimalSum(code), type: 'addition' });
        }
    }
    // --- C. STANDARD ADD/SUB ---
    else if (code.startsWith('add-')) {
        var digits = 1; var rows = 10;
        if (code.indexOf('1d') > -1) digits = 1;
        if (code.indexOf('2d') > -1) digits = 2;
        if (code.indexOf('3d') > -1) digits = 3;
        if (code.indexOf('4d') > -1) digits = 4;
        if (code.indexOf('5d') > -1) digits = 5;

        while (questions.length < COUNT && tries < maxTries) {
            tries++;
            var nums = generateAdditionSum(digits, rows);
            var key = nums.join(",");
            if (!uniqueKeys[key]) { uniqueKeys[key] = true; questions.push({ numbers: nums, type: 'addition' }); }
        }
        while (questions.length < COUNT) { questions.push({ numbers: generateAdditionSum(digits, rows), type: 'addition' }); }
    }
    // --- D. MULTIPLICATION / DIVISION ---
    else {
        while (questions.length < COUNT && tries < maxTries) {
            tries++;
            var q = generateMathQuestion(code);
            var key = q.type + "-" + q.x + "-" + q.y;
            if (!uniqueKeys[key]) { uniqueKeys[key] = true; questions.push(q); }
        }
        while (questions.length < COUNT) { questions.push(generateMathQuestion(code)); }
    }
    return questions;
};

// --- HELPER FUNCTIONS ---

function generateNegativeSum(digits, rows) {
    var min = digits === 1 ? 1 : Math.pow(10, digits - 1);
    var max = Math.pow(10, digits) - 1;
    var limit = Math.pow(10, digits); 
    var nums = [];
    var isValid = false;
    while (!isValid) {
        nums = [];
        var sum = 0;
        for (var i = 0; i < rows; i++) {
            var n = Math.floor(Math.random() * (max - min + 1)) + min;
            if (Math.random() > 0.4) { n = -n; }
            nums.push(n);
            sum += n;
        }
        if (sum < 0 && sum > -limit) { isValid = true; }
    }
    return nums;
}

function generateDecimalSum(code) {
    var minGen, maxGen, minStart, maxStart;
    if (code === 'dec-2d10r') { minGen = 10; maxGen = 99; minStart = 55; maxStart = 99; } 
    else if (code === 'dec-3d10r') { minGen = 100; maxGen = 999; minStart = 555; maxStart = 999; } 
    else if (code === 'dec-4d10r') { minGen = 1000; maxGen = 9999; minStart = 5555; maxStart = 9999; } 
    else { minGen = 10; maxGen = 99; minStart = 55; maxStart = 99; }
    var nums = [];
    var isValid = false;
    while (!isValid) {
        nums = [];
        var runningSum = 0;
        for (var i = 0; i < 10; i++) { 
            var n = 0;
            if (i === 0 || i === 1) { n = Math.floor(Math.random() * (maxStart - minStart + 1)) + minStart; } 
            else { n = Math.floor(Math.random() * (maxGen - minGen + 1)) + minGen; }
            if (i === 2 || i === 5 || i === 8) { n = -n; }
            nums.push(n);
            runningSum += n;
        }
        if (runningSum >= 0) { isValid = true; }
    }
    return nums.map(function(num) { return parseFloat((num / 100).toFixed(2)); });
}

function generateAdditionSum(digits, rows) {
    var nums = [];
    var sum = 0;
    var min = digits === 1 ? 1 : Math.pow(10, digits - 1);
    var max = Math.pow(10, digits) - 1;
    for (var i = 0; i < rows; i++) {
        var n = Math.floor(Math.random() * (max - min + 1)) + min;
        if (i > 0 && Math.random() > 0.5 && sum - n >= 0) n = -n; 
        nums.push(n);
        sum += n;
    }
    return nums;
}

function generateMathQuestion(code) {
    var xD=[1,1], yD=[1,1], type='mul';
    var minVal = 2; 
    if (code === 'mul-1x1') { xD=[1,1]; yD=[1,1]; }
    else if (code === 'mul-2x1') { xD=[2,2]; yD=[1,1]; }
    else if (code === 'mul-3x1') { xD=[3,3]; yD=[1,1]; }
    else if (code === 'mul-4x1') { xD=[4,4]; yD=[1,1]; }
    else if (code === 'mul-2x2') { xD=[2,2]; yD=[2,2]; }
    else if (code === 'mul-3x2') { xD=[3,3]; yD=[2,2]; }
    else if (code === 'mul-4x2') { xD=[4,4]; yD=[2,2]; }
    else if (code === 'mul-5x1') { xD=[5,5]; yD=[1,1]; }
    else if (code.startsWith('div-')) {
        type = 'div';
        yD=[1,1]; xD=[3,3]; 
        if (code === 'div-3d1d') { xD=[3,3]; yD=[1,1]; }
        else if (code === 'div-4d1d') { xD=[4,4]; yD=[1,1]; }
        else if (code === 'div-5d1d') { xD=[5,5]; yD=[1,1]; }
        else if (code === 'div-4d2d') { xD=[4,4]; yD=[2,2]; }
        else if (code === 'div-4d3d') { xD=[4,4]; yD=[3,3]; } 
        else if (code === 'div-5d2d') { xD=[5,5]; yD=[2,2]; }
        else if (code === 'div-5d3d') { xD=[5,5]; yD=[3,3]; } 
    }
    var x, y, q;
    if (type === 'mul') {
        x = getRand(xD, minVal); 
        y = getRand(yD, minVal);
        if(y > x) { var t=x; x=y; y=t; }
        return { x: x, y: y, type: 'mul' };
    } else {
        y = getRand(yD, 2); 
        var minDividend = Math.pow(10, xD[0]-1);
        var maxDividend = Math.pow(10, xD[1])-1;
        var minQ = Math.ceil(minDividend / y);
        var maxQ = Math.floor(maxDividend / y);
        if (maxQ < minQ) { q = minQ; }
        else { q = Math.floor(Math.random() * (maxQ - minQ + 1)) + minQ; }
        x = q * y; 
        return { x: x, y: y, quotient: q, type: 'div' };
    }
}

function getRand(r, minOverride) {
    var min = Math.pow(10, r[0]-1);
    if (minOverride && minOverride > min) min = minOverride;
    var max = Math.pow(10, r[1])-1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
