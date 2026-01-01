/* ============================================
   СИСТЕМА УРОВНЕЙ СЛОЖНОСТИ
   ============================================
   Управление уровнями сложности игры:
   влияет на HP игрока, скорость и урон зомби.
   ============================================ */

const DIFFICULTY_KEY = 'zombie_survival_difficulty';

// ===== УРОВНИ СЛОЖНОСТИ =====
const DIFFICULTIES = {
    easy: {
        name: 'Легкий',
        playerHealthMultiplier: 1.5,    // +50% HP
        zombieSpeedMultiplier: 0.7,      // -30% скорость
        zombieDamageMultiplier: 0.6      // -40% урон
    },
    normal: {
        name: 'Обычный',
        playerHealthMultiplier: 1.0,    // Стандартные значения
        zombieSpeedMultiplier: 1.0,      // Стандартные значения
        zombieDamageMultiplier: 1.0      // Стандартные значения
    },
    hard: {
        name: 'Сложный',
        playerHealthMultiplier: 0.7,     // -30% HP
        zombieSpeedMultiplier: 1.5,      // +50% скорость
        zombieDamageMultiplier: 1.8      // +80% урон
    }
};

// Текущий уровень сложности (по умолчанию обычный)
let currentDifficulty = 'normal';

// ===== УПРАВЛЕНИЕ СЛОЖНОСТЬЮ =====

/**
 * Установка уровня сложности
 * @param {string} difficulty - 'easy', 'normal' или 'hard'
 */
function setDifficulty(difficulty) {
    if (DIFFICULTIES[difficulty]) {
        currentDifficulty = difficulty;
        localStorage.setItem(DIFFICULTY_KEY, difficulty);
        console.log('Сложность установлена:', DIFFICULTIES[difficulty].name);
        return true;
    }
    return false;
}

/**
 * Получение текущего уровня сложности
 * @returns {string} Текущий уровень сложности
 */
function getDifficulty() {
    return currentDifficulty;
}

/**
 * Получение настроек текущего уровня сложности
 * @returns {Object} Настройки сложности
 */
function getDifficultySettings() {
    return DIFFICULTIES[currentDifficulty];
}

/**
 * Загрузка сохраненной сложности из localStorage
 */
function loadDifficulty() {
    const saved = localStorage.getItem(DIFFICULTY_KEY);
    if (saved && DIFFICULTIES[saved]) {
        currentDifficulty = saved;
    }
}

/**
 * Применение сложности к игроку
 */
function applyDifficultyToPlayer() {
    const settings = getDifficultySettings();
    const baseHealth = config.player.health;
    player.health = Math.floor(baseHealth * settings.playerHealthMultiplier);
    
    // Обновляем максимальное здоровье для HUD
    if (player.maxHealth === undefined) {
        player.maxHealth = player.health;
    } else {
        player.maxHealth = player.health;
    }
}

/**
 * Применение сложности к зомби
 * @param {Object} zombie - Объект зомби
 * @returns {Object} Зомби с примененной сложностью (всегда возвращает валидный объект)
 */
function applyDifficultyToZombie(zombie) {
    // Проверяем входные данные
    if (!zombie || typeof zombie !== 'object') {
        console.error('applyDifficultyToZombie: передан невалидный объект зомби', zombie);
        // Возвращаем исходный объект, если он был передан, иначе null
        return zombie;
    }
    
    // Создаем копию объекта, чтобы не изменять исходный
    const modifiedZombie = { ...zombie };
    
    try {
        const settings = getDifficultySettings();
        
        // Если настройки недоступны, возвращаем копию исходного зомби
        if (!settings) {
            console.warn('applyDifficultyToZombie: настройки сложности не найдены, используем стандартные значения');
            return modifiedZombie;
        }
        
        // Проверяем, что у зомби есть необходимые свойства
        if (typeof modifiedZombie.speed === 'number' && typeof modifiedZombie.damage === 'number') {
            // Применяем множители к скорости и урону
            modifiedZombie.speed = modifiedZombie.speed * settings.zombieSpeedMultiplier;
            modifiedZombie.damage = Math.floor(modifiedZombie.damage * settings.zombieDamageMultiplier);
        } else {
            console.warn('applyDifficultyToZombie: у зомби отсутствуют свойства speed или damage');
        }
        
        return modifiedZombie;
    } catch (error) {
        console.error('Ошибка при применении сложности к зомби:', error);
        return modifiedZombie; // Возвращаем копию исходного зомби в случае ошибки
    }
}

// Загружаем сложность при инициализации
loadDifficulty();

