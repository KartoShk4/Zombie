/* ============================================
   СИСТЕМА ПОЛЬЗОВАТЕЛЯ
   ============================================
   Управление никнеймом, рейтингом и званиями
   ============================================ */

// ===== ХРАНЕНИЕ ДАННЫХ =====
const USER_DATA_KEY = 'zombie_survival_user';
const LEADERBOARD_KEY = 'zombie_survival_leaderboard';

// ===== СОСТОЯНИЕ ПОЛЬЗОВАТЕЛЯ =====
let userNickname = '';
let userCoins = 0;

// ===== СИСТЕМА ЗВАНИЙ =====
const ranks = [
    { name: 'Новичок', minScore: 0, color: '#888' },
    { name: 'Ученик', minScore: 100, color: '#aaa' },
    { name: 'Охотник', minScore: 250, color: '#4a4' },
    { name: 'Ветеран', minScore: 500, color: '#4a8' },
    { name: 'Убийца', minScore: 1000, color: '#48a' },
    { name: 'Мастер', minScore: 2000, color: '#84a' },
    { name: 'Элитный убийца', minScore: 3500, color: '#a48' },
    { name: 'Легендарный убийца', minScore: 5000, color: '#fa4' },
    { name: 'Божественный убийца', minScore: 7500, color: '#ff4' },
    { name: 'Легенда', minScore: 10000, color: '#f44' },
    { name: 'Бессмертный', minScore: 15000, color: '#f88' },
    { name: 'Бог войны', minScore: 20000, color: '#faf' },
];

/**
 * Получить звание по количеству очков
 * @param {number} score - Количество очков
 * @returns {Object} Объект звания {name, color}
 */
function getRankByScore(score) {
    let currentRank = ranks[0];
    for (let rank of ranks) {
        if (score >= rank.minScore) {
            currentRank = rank;
        } else {
            break;
        }
    }
    return currentRank;
}

/**
 * Получить текущее звание пользователя
 * @returns {Object} Объект звания
 */
function getCurrentRank() {
    const userData = loadUserData();
    const bestScore = userData.bestScore || 0;
    return getRankByScore(bestScore);
}

/**
 * Сохранение данных пользователя
 */
function saveUserData() {
    try {
        const data = {
            nickname: userNickname,
            coins: userCoins,
            bestScore: loadLeaderboard()[0]?.score || 0,
            bestWave: loadLeaderboard()[0]?.wave || 0
        };
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Ошибка сохранения данных пользователя:', e);
    }
}

/**
 * Загрузка данных пользователя
 * @returns {Object} Данные пользователя
 */
function loadUserData() {
    try {
        const data = localStorage.getItem(USER_DATA_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            userNickname = parsed.nickname || '';
            userCoins = parsed.coins || 0;
            return parsed;
        }
    } catch (e) {
        console.error('Ошибка загрузки данных пользователя:', e);
    }
    return { nickname: '', coins: 0, bestScore: 0, bestWave: 0 };
}

/**
 * Сохранение рейтинга
 * @param {number} score - Очки
 * @param {number} wave - Волна
 */
function saveToLeaderboard(score, wave) {
    try {
        const leaderboard = loadLeaderboard();
        const rank = getRankByScore(score);
        
        // Добавляем новую запись
        leaderboard.push({
            nickname: userNickname || 'Без имени',
            score: score,
            wave: wave,
            rank: rank.name,
            timestamp: Date.now()
        });
        
        // Сортируем по очкам (от большего к меньшему)
        leaderboard.sort((a, b) => b.score - a.score);
        
        // Оставляем только топ 100
        const topLeaderboard = leaderboard.slice(0, 100);
        
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topLeaderboard));
        saveUserData();
    } catch (e) {
        console.error('Ошибка сохранения рейтинга:', e);
    }
}

/**
 * Загрузка рейтинга
 * @returns {Array} Массив записей рейтинга
 */
function loadLeaderboard() {
    try {
        const data = localStorage.getItem(LEADERBOARD_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Ошибка загрузки рейтинга:', e);
    }
    return [];
}

/**
 * Установка никнейма
 * @param {string} nickname - Никнейм
 */
function setNickname(nickname) {
    userNickname = nickname.trim() || 'Без имени';
    saveUserData();
}

/**
 * Получение никнейма
 * @returns {string} Никнейм
 */
function getNickname() {
    return userNickname || 'Без имени';
}

/**
 * Добавить монеты
 * @param {number} amount - Количество монет
 */
function addCoins(amount) {
    userCoins += amount;
    saveUserData();
}

/**
 * Получить количество монет
 * @returns {number} Количество монет
 */
function getCoins() {
    return userCoins;
}

