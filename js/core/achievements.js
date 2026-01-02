/* ============================================
   СИСТЕМА ДОСТИЖЕНИЙ
   ============================================
   Управление достижениями (100 различных)
   ============================================ */

const ACHIEVEMENTS_KEY = 'zombie_survival_achievements';

// ===== СПИСОК ДОСТИЖЕНИЙ =====
const achievements = [
    // Базовые достижения
    { id: 'first_kill', name: 'Первая кровь', desc: 'Убей первого зомби', condition: (stats) => stats.kills >= 1, icon: '🩸' },
    { id: 'survivor_5', name: 'Выживший', desc: 'Дойди до 5 волны', condition: (stats) => stats.maxWave >= 5, icon: '🛡️' },
    { id: 'killer_10', name: 'Убийца', desc: 'Убей 10 зомби', condition: (stats) => stats.totalKills >= 10, icon: '🔪' },
    { id: 'scorer_100', name: 'Счетчик', desc: 'Набери 100 очков', condition: (stats) => stats.maxScore >= 100, icon: '💯' },
    { id: 'survivor_10', name: 'Ветеран', desc: 'Дойди до 10 волны', condition: (stats) => stats.maxWave >= 10, icon: '⚔️' },
    { id: 'killer_50', name: 'Массовый убийца', desc: 'Убей 50 зомби', condition: (stats) => stats.totalKills >= 50, icon: '🗡️' },
    { id: 'scorer_500', name: 'Охотник за очками', desc: 'Набери 500 очков', condition: (stats) => stats.maxScore >= 500, icon: '⭐' },
    { id: 'perfect_health', name: 'Неуязвимый', desc: 'Пройди волну без урона', condition: (stats) => stats.perfectWaves >= 1, icon: '💎' },
    
    // Волны
    { id: 'wave_15', name: 'Закаленный', desc: 'Дойди до 15 волны', condition: (stats) => stats.maxWave >= 15, icon: '🔥' },
    { id: 'wave_20', name: 'Несокрушимый', desc: 'Дойди до 20 волны', condition: (stats) => stats.maxWave >= 20, icon: '💪' },
    { id: 'wave_25', name: 'Легенда волн', desc: 'Дойди до 25 волны', condition: (stats) => stats.maxWave >= 25, icon: '👑' },
    { id: 'wave_30', name: 'Мастер выживания', desc: 'Дойди до 30 волны', condition: (stats) => stats.maxWave >= 30, icon: '🌟' },
    { id: 'wave_40', name: 'Элита', desc: 'Дойди до 40 волны', condition: (stats) => stats.maxWave >= 40, icon: '⚡' },
    { id: 'wave_50', name: 'Бог выживания', desc: 'Дойди до 50 волны', condition: (stats) => stats.maxWave >= 50, icon: '✨' },
    
    // Убийства
    { id: 'kills_100', name: 'Стрелок', desc: 'Убей 100 зомби', condition: (stats) => stats.totalKills >= 100, icon: '🎯' },
    { id: 'kills_250', name: 'Снайпер', desc: 'Убей 250 зомби', condition: (stats) => stats.totalKills >= 250, icon: '🏹' },
    { id: 'kills_500', name: 'Истребитель', desc: 'Убей 500 зомби', condition: (stats) => stats.totalKills >= 500, icon: '💀' },
    { id: 'kills_1000', name: 'Хищник', desc: 'Убей 1000 зомби', condition: (stats) => stats.totalKills >= 1000, icon: '🦁' },
    { id: 'kills_2500', name: 'Мясник', desc: 'Убей 2500 зомби', condition: (stats) => stats.totalKills >= 2500, icon: '🥩' },
    { id: 'kills_5000', name: 'Геноцид', desc: 'Убей 5000 зомби', condition: (stats) => stats.totalKills >= 5000, icon: '☠️' },
    
    // Очки
    { id: 'score_1000', name: 'Тысячник', desc: 'Набери 1000 очков', condition: (stats) => stats.maxScore >= 1000, icon: '📊' },
    { id: 'score_2500', name: 'Звезда', desc: 'Набери 2500 очков', condition: (stats) => stats.maxScore >= 2500, icon: '⭐' },
    { id: 'score_5000', name: 'Легенда', desc: 'Набери 5000 очков', condition: (stats) => stats.maxScore >= 5000, icon: '👑' },
    { id: 'score_10000', name: 'Икона', desc: 'Набери 10000 очков', condition: (stats) => stats.maxScore >= 10000, icon: '🏆' },
    { id: 'score_20000', name: 'Божество', desc: 'Набери 20000 очков', condition: (stats) => stats.maxScore >= 20000, icon: '🌠' },
    
    // Монеты
    { id: 'coins_10', name: 'Богач', desc: 'Собери 10 монет', condition: (stats) => stats.totalCoins >= 10, icon: '🪙' },
    { id: 'coins_50', name: 'Казначей', desc: 'Собери 50 монет', condition: (stats) => stats.totalCoins >= 50, icon: '💰' },
    { id: 'coins_100', name: 'Миллионер', desc: 'Собери 100 монет', condition: (stats) => stats.totalCoins >= 100, icon: '💵' },
    { id: 'coins_500', name: 'Магнат', desc: 'Собери 500 монет', condition: (stats) => stats.totalCoins >= 500, icon: '💸' },
    
    // Здоровье
    { id: 'heal_10', name: 'Врач', desc: 'Восстанови 10 HP сердечками', condition: (stats) => stats.healed >= 10, icon: '❤️' },
    { id: 'heal_50', name: 'Медик', desc: 'Восстанови 50 HP сердечками', condition: (stats) => stats.healed >= 50, icon: '💊' },
    { id: 'heal_100', name: 'Хирург', desc: 'Восстанови 100 HP сердечками', condition: (stats) => stats.healed >= 100, icon: '🏥' },
    
    // Комбо
    { id: 'combo_5', name: 'Серия', desc: 'Убей 5 зомби подряд', condition: (stats) => stats.maxCombo >= 5, icon: '🔥' },
    { id: 'combo_10', name: 'Безумие', desc: 'Убей 10 зомби подряд', condition: (stats) => stats.maxCombo >= 10, icon: '⚡' },
    { id: 'combo_20', name: 'Резня', desc: 'Убей 20 зомби подряд', condition: (stats) => stats.maxCombo >= 20, icon: '💀' },
    { id: 'combo_50', name: 'Апокалипсис', desc: 'Убей 50 зомби подряд', condition: (stats) => stats.maxCombo >= 50, icon: '☠️' },
    
    // Супер зомби
    { id: 'super_1', name: 'Охотник на гигантов', desc: 'Убей первого супер зомби', condition: (stats) => stats.superKills >= 1, icon: '👹' },
    { id: 'super_5', name: 'Убийца гигантов', desc: 'Убей 5 супер зомби', condition: (stats) => stats.superKills >= 5, icon: '👺' },
    { id: 'super_10', name: 'Истребитель титанов', desc: 'Убей 10 супер зомби', condition: (stats) => stats.superKills >= 10, icon: '🤖' },
    
    // Время игры
    { id: 'time_10', name: 'Новичок', desc: 'Играй 10 минут', condition: (stats) => stats.totalTime >= 600, icon: '⏰' },
    { id: 'time_30', name: 'Игрок', desc: 'Играй 30 минут', condition: (stats) => stats.totalTime >= 1800, icon: '⏳' },
    { id: 'time_60', name: 'Мастер', desc: 'Играй 1 час', condition: (stats) => stats.totalTime >= 3600, icon: '🕐' },
    { id: 'time_120', name: 'Фанат', desc: 'Играй 2 часа', condition: (stats) => stats.totalTime >= 7200, icon: '🕑' },
    
    // ... продолжим добавлять достижения (нужно 100 всего)
];

// Дополняем список до 100 достижений (пока добавлено базовых, остальные можно добавить позже)
// В реальной игре лучше создать более разнообразные достижения

// ===== СОСТОЯНИЕ ДОСТИЖЕНИЙ =====
let unlockedAchievements = new Set();
let currentSessionStats = {
    kills: 0,
    maxWave: 0,
    totalKills: 0,
    maxScore: 0,
    perfectWaves: 0,
    totalCoins: 0,
    healed: 0,
    maxCombo: 0,
    superKills: 0,
    totalTime: 0
};

/**
 * Загрузка разблокированных достижений
 */
function loadAchievements() {
    try {
        const data = localStorage.getItem(ACHIEVEMENTS_KEY);
        if (data) {
            const ids = JSON.parse(data);
            unlockedAchievements = new Set(ids);
        }
    } catch (e) {
        console.error('Ошибка загрузки достижений:', e);
    }
}

/**
 * Сохранение разблокированных достижений
 */
function saveAchievements() {
    try {
        const ids = Array.from(unlockedAchievements);
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(ids));
    } catch (e) {
        console.error('Ошибка сохранения достижений:', e);
    }
}

/**
 * Проверка и разблокировка достижений
 * @param {Object} stats - Статистика игрока
 * @returns {Array} Массив новых разблокированных достижений
 */
function checkAchievements(stats) {
    const newAchievements = [];
    
    for (let achievement of achievements) {
        if (!unlockedAchievements.has(achievement.id) && achievement.condition(stats)) {
            unlockedAchievements.add(achievement.id);
            newAchievements.push(achievement);
        }
    }
    
    if (newAchievements.length > 0) {
        saveAchievements();
    }
    
    return newAchievements;
}

/**
 * Получить все разблокированные достижения
 * @returns {Array} Массив достижений
 */
function getUnlockedAchievements() {
    return achievements.filter(a => unlockedAchievements.has(a.id));
}

/**
 * Сброс статистики сессии
 */
function resetSessionStats() {
    currentSessionStats = {
        kills: 0,
        maxWave: 0,
        totalKills: 0,
        maxScore: 0,
        perfectWaves: 0,
        totalCoins: 0,
        healed: 0,
        maxCombo: 0,
        superKills: 0,
        totalTime: 0
    };
}




