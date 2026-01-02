// === Менеджер звуков ===

// Эффекты
const sounds = {
    shoot: new Audio("assets/sounds/shoot.ogg"),
    coin: new Audio("assets/sounds/coin.ogg"),
    zombieDie: new Audio("assets/sounds/die.ogg"),
};

// Настройки
let soundEnabled = JSON.parse(localStorage.getItem("soundEnabled") ?? "true");
let effectsVolume = parseFloat(localStorage.getItem("effectsVolume") ?? "0.5");

// Инициализация
function initSounds() {
    setEffectsVolume(effectsVolume);

    // Разблокировка звука на мобильных
    window.addEventListener("pointerdown", unlockAudio, { once: true });
}

function unlockAudio() {
    for (let key in sounds) {
        const s = sounds[key];
        try {
            s.play().then(() => {
                s.pause();
                s.currentTime = 0;
            });
        } catch {}
    }
}

// === Управление громкостью ===

function setEffectsVolume(v) {
    effectsVolume = v;
    localStorage.setItem("effectsVolume", v);

    for (let key in sounds) {
        sounds[key].volume = v;
    }
}

function playSound(name) {
    if (!soundEnabled) return;
    const s = sounds[name];
    if (!s) return;

    s.currentTime = 0;
    s.volume = effectsVolume;
    s.play().catch(()=>{});
    console.log("playSound:", name);

}

// === Mute ===

function muteSound() {
    soundEnabled = false;
    localStorage.setItem("soundEnabled", "false");

    for (let key in sounds) {
        sounds[key].volume = 0;
    }
}

function unmuteSound() {
    soundEnabled = true;
    localStorage.setItem("soundEnabled", "true");

    setEffectsVolume(effectsVolume);
}
