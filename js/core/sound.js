/* ============================================
   СИСТЕМА ЗВУКА
   ============================================
   Управление звуковыми эффектами игры:
   загрузка, воспроизведение, управление
   громкостью и отключение звука.
   ============================================ */

// ===== ЗВУКОВЫЕ ЭФФЕКТЫ =====
/**
 * Объект со всеми звуковыми эффектами игры
 * Каждый звук загружается из файла в assets/sounds/
 */
const sounds = {
    shoot: new Audio("assets/sounds/shoot.ogg"),      // Звук выстрела
    coin: new Audio("assets/sounds/coin.ogg"),        // Звук подбора монетки
    zombieDie: new Audio("assets/sounds/die.ogg"),    // Звук смерти зомби
};

// ===== НАСТРОЙКИ ЗВУКА =====
/**
 * Флаг включения/выключения звука
 * Загружается из localStorage, по умолчанию включен
 */
let soundEnabled = JSON.parse(localStorage.getItem("soundEnabled") ?? "true");

/**
 * Громкость звуковых эффектов (0.0 - 1.0)
 * Загружается из localStorage, по умолчанию 0.5
 */
let effectsVolume = parseFloat(localStorage.getItem("effectsVolume") ?? "0.5");

// ===== ИНИЦИАЛИЗАЦИЯ =====
/**
 * Инициализация звуковой системы
 * Устанавливает громкость и разблокирует звук на мобильных устройствах
 */
function initSounds() {
    setEffectsVolume(effectsVolume);

    // Разблокировка звука на мобильных
    // На мобильных устройствах звук можно воспроизводить только после взаимодействия пользователя
    window.addEventListener("pointerdown", unlockAudio, { once: true });
}

/**
 * Разблокировка звука на мобильных устройствах
 * Воспроизводит и сразу останавливает каждый звук для разблокировки
 */
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

// ===== УПРАВЛЕНИЕ ГРОМКОСТЬЮ =====
/**
 * Установка громкости звуковых эффектов
 * @param {number} v - Громкость (0.0 - 1.0)
 */
function setEffectsVolume(v) {
    effectsVolume = v;
    localStorage.setItem("effectsVolume", v);

    // Применяем громкость ко всем звукам
    for (let key in sounds) {
        sounds[key].volume = v;
    }
}

/**
 * Воспроизведение звукового эффекта
 * @param {string} name - Имя звука (ключ из объекта sounds)
 */
function playSound(name) {
    if (!soundEnabled) return;  // Не воспроизводим если звук выключен
    const s = sounds[name];
    if (!s) return;  // Проверяем существование звука

    s.currentTime = 0;  // Сбрасываем на начало
    s.volume = effectsVolume;  // Устанавливаем текущую громкость
    s.play().catch(()=>{});  // Воспроизводим (игнорируем ошибки)
    console.log("playSound:", name);
}

// ===== УПРАВЛЕНИЕ ВКЛЮЧЕНИЕМ/ВЫКЛЮЧЕНИЕМ =====
/**
 * Выключение звука
 * Устанавливает громкость всех звуков в 0
 */
function muteSound() {
    soundEnabled = false;
    localStorage.setItem("soundEnabled", "false");

    // Устанавливаем громкость всех звуков в 0
    for (let key in sounds) {
        sounds[key].volume = 0;
    }
}

/**
 * Включение звука
 * Восстанавливает громкость всех звуков
 */
function unmuteSound() {
    soundEnabled = true;
    localStorage.setItem("soundEnabled", "true");

    // Восстанавливаем громкость
    setEffectsVolume(effectsVolume);
}
