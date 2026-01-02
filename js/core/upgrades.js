/* ============================================
   СИСТЕМА УЛУЧШЕНИЙ
   ============================================
   Управление улучшениями игрока, которые
   можно купить в магазине за монетки.
   ============================================ */

// ===== ХРАНЕНИЕ УЛУЧШЕНИЙ =====
const UPGRADES_KEY = 'zombie_survival_upgrades';

// ===== ТИПЫ УЛУЧШЕНИЙ =====
const UPGRADE_TYPES = {
    FIRE_RATE: 'fireRate',           // Скорость стрельбы
    RANGE: 'range',                  // Дальность стрельбы
    MOVEMENT_SPEED: 'movementSpeed', // Скорость передвижения
    PUSH_BACK: 'pushBack',           // Отталкивание зомби
    PIERCE: 'pierce'                 // Прострел насквозь (2 зомби)
};

// ===== УЛУЧШЕНИЯ =====
const upgrades = [
    {
        id: UPGRADE_TYPES.RANGE,
        name: 'Дальность стрельбы',
        desc: 'Увеличивает дальность стрельбы',
        icon: '🎯',
        baseCost: 40,
        maxLevel: 5,
        effect: (level) => 1 + level * 0.15  // +15% за уровень
    },
    {
        id: UPGRADE_TYPES.PUSH_BACK,
        name: 'Отталкивание зомби',
        desc: 'Отталкивает зомби при попадании',
        icon: '💨',
        baseCost: 50,
        maxLevel: 3,
        effect: (level) => level * 5  // Сила отталкивания
    },
    {
        id: UPGRADE_TYPES.PIERCE,
        name: 'Прострел насквозь',
        desc: 'Пули проходят сквозь 2 зомби',
        icon: '🔫',
        baseCost: 60,
        maxLevel: 1,
        effect: (level) => level > 0 ? 2 : 1  // Количество зомби на выстрел
    },
    {
        id: 'permanentMovementSpeed',
        name: 'Скорость передвижения',
        desc: 'Постоянно увеличивает скорость передвижения',
        icon: '🏃',
        baseCost: 40,
        maxLevel: 5,
        effect: (level) => 1 + level * 0.15  // +15% за уровень
    },
    {
        id: 'permanentFireRate',
        name: 'Скорость атаки',
        desc: 'Постоянно увеличивает скорость атаки',
        icon: '⚡',
        baseCost: 50,
        maxLevel: 5,
        effect: (level) => 1 + level * 0.2  // +20% за уровень
    },
    {
        id: 'permanentMultiShot',
        name: 'Множественные пули',
        desc: 'Стреляет несколькими пулями одновременно',
        icon: '🔫',
        baseCost: 60,
        maxLevel: 3,
        effect: (level) => level + 1  // 2, 3, 4 пули
    },
    {
        id: 'permanentTripleShot',
        name: 'Тройной выстрел',
        desc: 'Стреляет 3 пулями подряд',
        icon: '🎯',
        baseCost: 70,
        maxLevel: 1,
        effect: (level) => level > 0 ? 3 : 1
    },
    {
        id: 'permanentRicochet',
        name: 'Рикошет',
        desc: 'Пули рикошетят между зомби',
        icon: '💫',
        baseCost: 80,
        maxLevel: 3,
        effect: (level) => level  // Количество рикошетов
    }
];

// ===== СОСТОЯНИЕ УЛУЧШЕНИЙ =====
let playerUpgrades = {};

/**
 * Загрузка улучшений
 */
function loadUpgrades() {
    try {
        const data = localStorage.getItem(UPGRADES_KEY);
        if (data) {
            playerUpgrades = JSON.parse(data);
        }
    } catch (e) {
        console.error('Ошибка загрузки улучшений:', e);
        playerUpgrades = {};
    }
}

/**
 * Сохранение улучшений
 */
function saveUpgrades() {
    try {
        localStorage.setItem(UPGRADES_KEY, JSON.stringify(playerUpgrades));
    } catch (e) {
        console.error('Ошибка сохранения улучшений:', e);
    }
}

/**
 * Получить уровень улучшения
 * @param {string} upgradeId - ID улучшения
 * @returns {number} Уровень улучшения
 */
function getUpgradeLevel(upgradeId) {
    return playerUpgrades[upgradeId] || 0;
}

/**
 * Получить стоимость улучшения
 * @param {string} upgradeId - ID улучшения
 * @returns {number} Стоимость улучшения
 */
function getUpgradeCost(upgradeId) {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return Infinity;
    
    const level = getUpgradeLevel(upgradeId);
    if (level >= upgrade.maxLevel) return Infinity;
    
    return upgrade.baseCost * (level + 1); // Стоимость растет с уровнем
}

/**
 * Купить улучшение
 * @param {string} upgradeId - ID улучшения
 * @returns {boolean} true если покупка успешна
 */
function buyUpgrade(upgradeId) {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return false;
    
    const level = getUpgradeLevel(upgradeId);
    if (level >= upgrade.maxLevel) return false;
    
    const cost = getUpgradeCost(upgradeId);
    if (typeof getCoins === 'function' && getCoins() < cost) return false;
    
    // Покупаем улучшение
    if (typeof addCoins === 'function') {
        addCoins(-cost);
    }
    
    playerUpgrades[upgradeId] = level + 1;
    saveUpgrades();
    
    // Применяем улучшение к игроку
    applyUpgrades();
    
    return true;
}

/**
 * Применить улучшения к игроку
 */
function applyUpgrades() {
    // Дальность стрельбы
    if (typeof config !== 'undefined' && config.bullet) {
        const baseRange = 100;
        const rangeLevel = getUpgradeLevel('range');
        const upgrade = upgrades.find(u => u.id === 'range');
        if (upgrade) {
            config.bullet.maxRange = baseRange * upgrade.effect(rangeLevel);
        }
    }
    
    // Постоянные улучшения применяются динамически в updatePlayer
}

/**
 * Получить все улучшения
 * @returns {Array} Массив улучшений
 */
function getAllUpgrades() {
    return upgrades;
}

