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

    // Ana gösterge (Living Room üzerindeki)
    const mainDisplay = document.getElementById('temp-display');
    if (mainDisplay) {
        mainDisplay.textContent = tempValue.toFixed(1);
    }

    // Kontrol paneli göstergesi
    const controlDisplay = document.getElementById('temp-control-display');
    if (controlDisplay) {
        controlDisplay.textContent = tempValue.toFixed(1) + '°C';
    }

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

let doorTimeout; // Kapı zamanlayıcısı için değişken

function toggleDoor() {
    initAudio();
    doorState = !doorState;

    // Eğer önceki bir zamanlayıcı varsa iptal et
    if (doorTimeout) {
        clearTimeout(doorTimeout);
        doorTimeout = null;
    }

    updateDoorUI(doorState);
    if (doorState) {
        playSound('success');
        // 3 saniye sonra otomatik kapan
        doorTimeout = setTimeout(() => {
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
    const doorPanel = document.getElementById('door-panel');

    // Kapı durumu için görsel bildirim elementi oluştur (eğer yoksa)
    let doorStatusLabel = document.getElementById('door-status-label');
    if (!doorStatusLabel) {
        doorStatusLabel = document.createElement('div');
        doorStatusLabel.id = 'door-status-label';
        doorStatusLabel.className = 'absolute top-1/2 left-10 transform -translate-y-1/2 bg-green-500/90 text-white px-6 py-3 rounded-xl font-bold text-xl shadow-lg transition-all duration-500 opacity-0 translate-x-[-20px] z-20';
        // Living room container'ına ekle
        const container = document.querySelector('.lg\\:col-span-8.relative');
        if (container) container.appendChild(doorStatusLabel);
    }

    if (state) {
        icon.textContent = 'door_open';
        icon.classList.remove('text-green-400');
        icon.classList.add('text-green-300');
        btn.classList.add('bg-green-500/20', 'border-green-500/50');

        // Kapı açılma animasyonu (3D Rotate)
        if (doorPanel) {
            doorPanel.classList.add('door-open');
        }

        // Kapı açık etiketini göster
        if (doorStatusLabel) {
            doorStatusLabel.innerHTML = '<div class="flex items-center gap-3"><span class="material-symbols-outlined">door_open</span>KAPI AÇIK</div>';
            doorStatusLabel.classList.remove('opacity-0', 'translate-x-[-20px]', 'bg-gray-500/90');
            doorStatusLabel.classList.add('opacity-100', 'translate-x-0', 'bg-green-500/90');
        }

    } else {
        icon.textContent = 'door_front';
        icon.classList.remove('text-green-300');
        icon.classList.add('text-green-400');
        btn.classList.remove('bg-green-500/20', 'border-green-500/50');

        // Kapı kapanma animasyonu
        if (doorPanel) {
            doorPanel.classList.remove('door-open');
        }

        // Kapı kapalı etiketini göster
        if (doorStatusLabel) {
            doorStatusLabel.innerHTML = '<div class="flex items-center gap-3"><span class="material-symbols-outlined">door_front</span>KAPI KAPALI</div>';
            doorStatusLabel.classList.remove('bg-green-500/90');
            doorStatusLabel.classList.add('bg-gray-500/90');

            // Etiketi gizle
            setTimeout(() => {
                if (!doorState) {
                    doorStatusLabel.classList.remove('opacity-100', 'translate-x-0');
                    doorStatusLabel.classList.add('opacity-0', 'translate-x-[-20px]');
                }
            }, 2000);
        }
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
    const tvScreenOn = document.getElementById('tv-screen-on');
    const tvContainer = document.getElementById('tv-container');

    if (state) {
        // Ortamı karart
        if (overlay) {
            overlay.classList.remove('bg-black/40');
            overlay.classList.add('bg-black/90');
        }

        icon.classList.add('text-purple-300');
        btn.classList.add('bg-purple-500/20', 'border-purple-500/50');

        // TV'yi Aç
        if (tvScreenOn) tvScreenOn.classList.remove('opacity-0');
        if (tvContainer) tvContainer.classList.add('tv-glow');

    } else {
        // Ortamı normal aydınlığa döndür
        if (overlay) {
            overlay.classList.remove('bg-black/90');
            overlay.classList.add('bg-black/40');
        }

        icon.classList.remove('text-purple-300');
        btn.classList.remove('bg-purple-500/20', 'border-purple-500/50');

        // TV'yi Kapat
        if (tvScreenOn) tvScreenOn.classList.add('opacity-0');
        if (tvContainer) tvContainer.classList.remove('tv-glow');
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
