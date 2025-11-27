// OGVision - Ana JavaScript Dosyası

let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');
const totalSlides = slides.length;
let lightState = false, cinemaState = false, tempValue = 21.5, securityState = false, doorState = false;
let synth, isAudioInit = false;

// Audio Initialization
async function initAudio() {
    if (isAudioInit) return;
    try {
        await Tone.start();
        synth = new Tone.Synth({
            oscillator: { type: "sine" },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 1 }
        }).toDestination();
        isAudioInit = true;
    } catch (e) { console.warn("Audio init blocked", e); }
}

// Sound Effects
function playSound(type) {
    if (!isAudioInit) return;
    const now = Tone.now();
    const poly = new Tone.PolySynth(Tone.Synth).toDestination();
    poly.volume.value = -10;
    if (type === 'click') synth.triggerAttackRelease("C5", "64n", now);
    else if (type === 'success') poly.triggerAttackRelease(["C5", "E5", "G5"], "16n", now);
    else if (type === 'cinema') { const low = new Tone.MembraneSynth().toDestination(); low.triggerAttackRelease("C2", "0.5"); }
}

// Slide Navigation
function updateSlides() {
    slides.forEach((slide, index) => {
        slide.classList.remove('active', 'prev');
        slide.style.opacity = '0'; slide.style.pointerEvents = 'none';
        if (index === currentSlide) { slide.classList.add('active'); slide.style.opacity = '1'; slide.style.pointerEvents = 'auto'; }
        else if (index < currentSlide) slide.classList.add('prev');
    });
    indicators.forEach((ind, idx) => {
        ind.classList.remove('bg-white/20', 'bg-ek-primary', 'scale-150', 'shadow-lg');
        if (idx === currentSlide) ind.classList.add('bg-ek-primary', 'scale-150', 'shadow-lg');
        else ind.classList.add('bg-white/20');
    });
    document.getElementById('progressBar').style.width = `${((currentSlide + 1) / totalSlides) * 100}%`;
}

function nextSlide() { if (currentSlide < totalSlides - 1) { playSound('click'); currentSlide++; updateSlides(); } }
function prevSlide() { if (currentSlide > 0) { playSound('click'); currentSlide--; updateSlides(); } }
function goToSlide(idx) { playSound('click'); currentSlide = idx; updateSlides(); }

// Demo Controls
function toggleLight() {
    initAudio();
    lightState = !lightState;
    if (cinemaState) { cinemaState = false; updateCinemaUI(false); }
    updateLightUI(lightState);
    if (lightState) playSound('success'); else playSound('click');
}

function toggleCinema() {
    initAudio();
    cinemaState = !cinemaState;
    if (cinemaState) {
        if (lightState) { lightState = false; updateLightUI(false); }
        updateCinemaUI(true);
        playSound('cinema');
    } else {
        updateCinemaUI(false);
        playSound('click');
    }
}

function changeTemp(delta) {
    initAudio();
    tempValue = Math.max(16, Math.min(30, tempValue + delta));
    const tempStr = tempValue.toFixed(1) + '°C';
    // Her iki göstergeyi de güncelle
    const mainDisplay = document.getElementById('temp-display');
    const controlDisplay = document.getElementById('temp-control-display');

    if (mainDisplay) mainDisplay.textContent = tempValue.toFixed(1);
    if (controlDisplay) controlDisplay.textContent = tempStr;

    playSound('click');
}

function toggleSecurity() {
    initAudio();
    const checkbox = document.getElementById('security-toggle');
    // Checkbox'ın kendi durumunu kullan (source of truth)
    securityState = checkbox.checked;

    const overlay = document.getElementById('security-overlay');
    const status = document.getElementById('security-status');

    if (securityState) {
        overlay.classList.add('border-ek-primary');
        status.textContent = 'AKTİF';
        status.classList.remove('text-ek-primary');
        status.classList.add('text-green-500');
        playSound('success');
    } else {
        overlay.classList.remove('border-ek-primary');
        status.textContent = 'DEVRE DIŞI';
        status.classList.remove('text-green-500');
        status.classList.add('text-ek-primary');
        playSound('click');
    }
}

function toggleDoor() {
    initAudio();
    doorState = !doorState;
    updateDoorUI(doorState);
    if (doorState) {
        playSound('success');
        // 3 saniye sonra otomatik kapan
        setTimeout(() => {
            doorState = false;
            updateDoorUI(false);
        }, 3000);
    } else {
        playSound('click');
    }
}

function updateDoorUI(state) {
    const icon = document.getElementById('icon-door');
    const btn = document.getElementById('btn-door');
    const doorOverlay = document.getElementById('door-overlay');

    if (state) {
        icon.textContent = 'door_open';
        icon.classList.remove('text-green-400');
        icon.classList.add('text-green-300');
        btn.classList.add('bg-green-500/20', 'border-green-500/50');

        // Kapı açıldığında sol taraftan yeşil ışık hüzmesi (Kapı efekti)
        doorOverlay.classList.remove('border-transparent');
        // Mavi yerine Yeşil Gradient
        doorOverlay.className = 'absolute inset-0 transition-all duration-700 pointer-events-none z-10 bg-gradient-to-r from-green-500/40 via-green-500/10 to-transparent border-l-8 border-green-500';
    } else {
        icon.textContent = 'door_front';
        icon.classList.remove('text-green-300');
        icon.classList.add('text-green-400');
        btn.classList.remove('bg-green-500/20', 'border-green-500/50');

        // Kapı kapandığında efekti kaldır
        doorOverlay.className = 'absolute inset-0 transition-all duration-700 bg-transparent border-8 border-transparent pointer-events-none z-10';
    }
}

function updateLightUI(state) {
    const overlay = document.getElementById('light-overlay');
    const icon = document.getElementById('icon-light');
    const btn = document.getElementById('btn-light');
    if (state) {
        overlay.style.backgroundColor = 'rgba(255, 223, 186, 0.3)';
        icon.classList.add('text-yellow-400');
        btn.classList.add('bg-yellow-500/20', 'border-yellow-500/50');
    } else {
        overlay.style.backgroundColor = 'transparent';
        icon.classList.remove('text-yellow-400');
        btn.classList.remove('bg-yellow-500/20', 'border-yellow-500/50');
    }
}

function updateCinemaUI(state) {
    const overlay = document.getElementById('light-overlay');
    const icon = document.getElementById('icon-cinema');
    const btn = document.getElementById('btn-cinema');
    const projection = document.getElementById('projection-overlay');

    if (state) {
        overlay.style.backgroundColor = 'rgba(75, 0, 130, 0.5)';
        icon.classList.add('text-purple-300');
        btn.classList.add('bg-purple-500/20', 'border-purple-500/50');

        // Projeksiyon efekti göster
        projection.style.opacity = '1';
    } else {
        overlay.style.backgroundColor = 'transparent';
        icon.classList.remove('text-purple-300');
        btn.classList.remove('bg-purple-500/20', 'border-purple-500/50');

        // Projeksiyon efekti gizle
        projection.style.opacity = '0';
    }
}

// Download Function
function downloadSource() {
    window.location.href = window.location.href;
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    else if (e.key === 'ArrowLeft') prevSlide();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateSlides();
});
