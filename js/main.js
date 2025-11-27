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
            envelope: { attack: 0.02, decay: 0.2, sustain: 0.1, release: 0.8 }
        }).toDestination();
        synth.volume.value = -12; // Daha düşük ses seviyesi
        isAudioInit = true;
    } catch (e) { console.warn("Audio init blocked", e); }
}

// Sound Effects
function playSound(type) {
    if (!isAudioInit) return;
    const now = Tone.now();

    if (type === 'click') {
        // Yumuşak, tok bir tıklama sesi
        synth.triggerAttackRelease("A4", "32n", now);
    }
    else if (type === 'success') {
        // Kibar, pozitif bir onay sesi (hafif akor)
        const poly = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sine" },
            envelope: { attack: 0.05, decay: 0.3, sustain: 0.1, release: 1.5 }
        }).toDestination();
        poly.volume.value = -15;
        poly.triggerAttackRelease(["C5", "E5"], "8n", now);
    }
    else if (type === 'cinema') {
        // Sinema modu için derin ama yumuşak bas
        const low = new Tone.MembraneSynth({
            volume: -20,
            envelope: { attack: 0.02, decay: 0.5, sustain: 0, release: 1 }
        }).toDestination();
        low.triggerAttackRelease("C2", "0.8");
    }
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
    if (!checkbox) return;

    // Checkbox'ın kendi durumunu kullan (source of truth)
    securityState = checkbox.checked;

    const overlay = document.getElementById('security-overlay');
    const status = document.getElementById('security-status');

    if (securityState) {
        if (overlay) overlay.classList.add('border-ek-primary');
        if (status) {
            status.textContent = 'AKTİF';
            status.classList.remove('text-ek-primary');
            status.classList.add('text-green-500');
        }
        playSound('success');
    } else {
        if (overlay) overlay.classList.remove('border-ek-primary');
        if (status) {
            status.textContent = 'DEVRE DIŞI';
            status.classList.remove('text-green-500');
            status.classList.add('text-ek-primary');
        }
        playSound('click');
    }
}

let doorTimeout;

function toggleDoor() {
    initAudio();
    doorState = !doorState;
    console.log("Door State:", doorState); // Debug için

    if (doorTimeout) {
        clearTimeout(doorTimeout);
        doorTimeout = null;
    }

    updateDoorUI(doorState);
    if (doorState) {
        playSound('success');
    } else {
        playSound('click');
    }
}

function updateDoorUI(state) {
    const icon = document.getElementById('icon-door');
    const btn = document.getElementById('btn-door');
    const doorStatusLabel = document.getElementById('door-status-label');
    const doorStatusText = document.getElementById('door-status-text');

    if (state) {
        // KAPI AÇIK DURUMU (YEŞİL)
        if (icon) {
            icon.textContent = 'door_open';
            icon.classList.remove('text-red-400', 'text-red-500');
            icon.classList.add('text-green-500');
        }

        if (btn) {
            btn.classList.remove('bg-red-500/20', 'border-red-500/50');
            btn.classList.add('bg-green-500/20', 'border-green-500/50');
        }

        // Bildirim Göster
        if (doorStatusLabel && doorStatusText) {
            doorStatusText.textContent = 'KAPI AÇIK';
            doorStatusLabel.classList.remove('text-red-500', 'border-red-500/30');
            doorStatusLabel.classList.add('text-green-500', 'border-green-500/30');

            doorStatusLabel.classList.remove('opacity-0', 'scale-90');
            doorStatusLabel.classList.add('opacity-100', 'scale-100');
        }

    } else {
        // KAPI KAPALI DURUMU (KIRMIZI)
        if (icon) {
            icon.textContent = 'door_front';
            icon.classList.remove('text-green-500');
            icon.classList.add('text-red-500');
        }

        if (btn) {
            btn.classList.remove('bg-green-500/20', 'border-green-500/50');
        }

        // Bildirim Göster (Kapalı yazısı - Kırmızı)
        if (doorStatusLabel && doorStatusText) {
            doorStatusText.textContent = 'KAPI KAPALI';
            doorStatusLabel.classList.remove('text-green-500', 'border-green-500/30');
            doorStatusLabel.classList.add('text-red-500', 'border-red-500/30');

            doorStatusLabel.classList.remove('opacity-0', 'scale-90');
            doorStatusLabel.classList.add('opacity-100', 'scale-100');

            // 2 saniye sonra bildirimi gizle
            doorTimeout = setTimeout(() => {
                if (!doorState) { // Hala kapalıysa gizle
                    doorStatusLabel.classList.remove('opacity-100', 'scale-100');
                    doorStatusLabel.classList.add('opacity-0', 'scale-90');
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
        // Sadece ortamı hafif karart (Siyah hare yok)
        if (overlay) {
            overlay.classList.remove('bg-black/40');
            overlay.classList.add('bg-black/80');
        }

        icon.classList.add('text-purple-300');
        btn.classList.add('bg-purple-500/20', 'border-purple-500/50');

        // TV'yi Aç (Bu kısım orijinalde vardı, yeni kodda yoktu ama korunmalı)
        if (tvScreenOn) tvScreenOn.classList.remove('opacity-0');
        if (tvContainer) tvContainer.classList.add('tv-glow');

    } else {
        // Ortamı normal aydınlığa döndür
        if (overlay) {
            overlay.classList.remove('bg-black/80');
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
