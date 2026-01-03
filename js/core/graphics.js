/* ============================================
   СИСТЕМА НАСТРОЕК ГРАФИКИ
   ============================================
   Управление качеством графики для оптимизации
   производительности на слабых устройствах.
   ============================================ */

// ===== КЛЮЧ ХРАНЕНИЯ =====
const GRAPHICS_KEY = 'zombie_survival_graphics';

// ===== УРОВНИ КАЧЕСТВА ГРАФИКИ =====
/**
 * Уровни качества графики
 * Каждый уровень определяет, какие эффекты включены/выключены
 */
const GRAPHICS_QUALITY = {
    LOW: 'low',           // Низкое качество (максимальная производительность)
    MEDIUM: 'medium',     // Среднее качество (баланс)
    HIGH: 'high'          // Высокое качество (максимальная красота)
};

// ===== НАСТРОЙКИ ПО УРОВНЯМ =====
const GRAPHICS_SETTINGS = {
    [GRAPHICS_QUALITY.LOW]: {
        name: 'Низкое',
        description: 'Максимальная производительность',
        // Эффекты
        footprints: false,           // Следы отключены
        zombieFootprints: false,     // Следы зомби отключены
        blood: true,                 // Кровь включена (минимально)
        fog: false,                  // Туман отключен
        vignette: false,             // Виньетка отключена
        lightFlicker: false,        // Мерцание света отключено
        cameraShake: true,          // Дрожание камеры включено (важно для геймплея)
        muzzleFlash: false,         // Вспышка выстрела отключена
        shootRadius: false,         // Радиус стрельбы не показывается
        // Ограничения
        maxFootprints: 0,            // Максимум следов
        maxBlood: 50,                // Максимум частиц крови
        maxZombieFootprints: 0,      // Максимум следов зомби
        // Оптимизации рендеринга
        skipFrameRender: 1,          // Пропускать каждый N кадр (1 = не пропускать)
        reduceParticleUpdates: 2,    // Обновлять частицы каждый N кадр
        // Анимации
        zombieStepAnimation: false,  // Анимация шага зомби отключена
        heartPulse: false,           // Пульсация сердец отключена
        coinPulse: false,            // Пульсация монет отключена
        buffPulse: false            // Пульсация баффов отключена
    },
    [GRAPHICS_QUALITY.MEDIUM]: {
        name: 'Среднее',
        description: 'Баланс качества и производительности',
        // Эффекты
        footprints: true,
        zombieFootprints: false,
        blood: true,
        fog: true,
        vignette: true,
        lightFlicker: true,
        cameraShake: true,
        muzzleFlash: true,
        shootRadius: true,
        // Ограничения
        maxFootprints: 100,
        maxBlood: 200,
        maxZombieFootprints: 0,
        // Оптимизации рендеринга
        skipFrameRender: 1,
        reduceParticleUpdates: 1,
        // Анимации
        zombieStepAnimation: true,
        heartPulse: true,
        coinPulse: true,
        buffPulse: true
    },
    [GRAPHICS_QUALITY.HIGH]: {
        name: 'Высокое',
        description: 'Максимальное качество графики',
        // Эффекты
        footprints: true,
        zombieFootprints: true,
        blood: true,
        fog: true,
        vignette: true,
        lightFlicker: true,
        cameraShake: true,
        muzzleFlash: true,
        shootRadius: true,
        // Ограничения
        maxFootprints: 200,
        maxBlood: 400,
        maxZombieFootprints: 100,
        // Оптимизации рендеринга
        skipFrameRender: 1,
        reduceParticleUpdates: 1,
        // Анимации
        zombieStepAnimation: true,
        heartPulse: true,
        coinPulse: true,
        buffPulse: true
    }
};

// ===== ТЕКУЩИЕ НАСТРОЙКИ =====
/**
 * Текущий уровень качества графики
 * По умолчанию определяется автоматически на основе устройства
 */
let currentGraphicsQuality = GRAPHICS_QUALITY.MEDIUM;

/**
 * Текущие настройки графики
 * Обновляются при изменении уровня качества
 */
let currentGraphicsSettings = GRAPHICS_SETTINGS[GRAPHICS_QUALITY.MEDIUM];

/**
 * Счетчик кадров для пропуска рендеринга
 */
let frameSkipCounter = 0;

/**
 * Счетчик кадров для обновления частиц
 */
let particleUpdateCounter = 0;

// ===== УПРАВЛЕНИЕ НАСТРОЙКАМИ =====
/**
 * Автоматическое определение качества графики
 * На мобильных устройствах по умолчанию устанавливается низкое качество
 */
function autoDetectGraphicsQuality() {
    if (isMobile) {
        // На мобильных устройствах проверяем производительность
        // Можно добавить более сложную логику определения
        return GRAPHICS_QUALITY.LOW;
    }
    return GRAPHICS_QUALITY.MEDIUM;
}

/**
 * Установка уровня качества графики
 * @param {string} quality - Уровень качества ('low', 'medium', 'high')
 */
function setGraphicsQuality(quality) {
    if (GRAPHICS_SETTINGS[quality]) {
        currentGraphicsQuality = quality;
        currentGraphicsSettings = GRAPHICS_SETTINGS[quality];
        localStorage.setItem(GRAPHICS_KEY, quality);
        console.log('Качество графики установлено:', currentGraphicsSettings.name);
        return true;
    }
    return false;
}

/**
 * Получение текущего уровня качества графики
 * @returns {string} Текущий уровень качества
 */
function getGraphicsQuality() {
    return currentGraphicsQuality;
}

/**
 * Получение текущих настроек графики
 * @returns {Object} Текущие настройки графики
 */
function getGraphicsSettings() {
    return currentGraphicsSettings;
}

/**
 * Загрузка сохраненных настроек графики
 */
function loadGraphicsSettings() {
    try {
        const saved = localStorage.getItem(GRAPHICS_KEY);
        if (saved && GRAPHICS_SETTINGS[saved]) {
            setGraphicsQuality(saved);
        } else {
            // Автоматическое определение при первом запуске
            const autoQuality = autoDetectGraphicsQuality();
            setGraphicsQuality(autoQuality);
        }
    } catch (e) {
        console.error('Ошибка загрузки настроек графики:', e);
        const autoQuality = autoDetectGraphicsQuality();
        setGraphicsQuality(autoQuality);
    }
}

/**
 * Проверка, нужно ли пропустить этот кадр рендеринга
 * @returns {boolean} true если кадр нужно пропустить
 */
function shouldSkipFrame() {
    if (currentGraphicsSettings.skipFrameRender > 1) {
        frameSkipCounter++;
        if (frameSkipCounter >= currentGraphicsSettings.skipFrameRender) {
            frameSkipCounter = 0;
            return true;
        }
    }
    return false;
}

/**
 * Проверка, нужно ли обновлять частицы в этом кадре
 * @returns {boolean} true если частицы нужно обновить
 */
function shouldUpdateParticles() {
    if (currentGraphicsSettings.reduceParticleUpdates > 1) {
        particleUpdateCounter++;
        if (particleUpdateCounter >= currentGraphicsSettings.reduceParticleUpdates) {
            particleUpdateCounter = 0;
            return true;
        }
        return false;
    }
    return true;
}

/**
 * Ограничение количества следов
 * @param {Array} footprintsArray - Массив следов
 * @param {number} maxCount - Максимальное количество
 */
function limitFootprints(footprintsArray, maxCount) {
    if (maxCount > 0 && footprintsArray.length > maxCount) {
        footprintsArray.splice(0, footprintsArray.length - maxCount);
    }
}

/**
 * Ограничение количества частиц крови
 * @param {Array} bloodArray - Массив частиц крови
 * @param {number} maxCount - Максимальное количество
 */
function limitBlood(bloodArray, maxCount) {
    if (maxCount > 0 && bloodArray.length > maxCount) {
        bloodArray.splice(0, bloodArray.length - maxCount);
    }
}

// Инициализация при загрузке
loadGraphicsSettings();

