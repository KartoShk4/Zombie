/* ============================================
   СИСТЕМА СОХРАНЕНИЯ ИГРЫ
   ============================================
   Сохранение и загрузка прогресса игры
   в localStorage.
   ============================================ */

const SAVE_KEY = 'zombie_survival_save';

/**
 * Сохранение текущего состояния игры
 */
function saveGame() {
    try {
        const saveData = {
            // Метаданные
            version: '1.0',
            timestamp: Date.now(),
            
            // Состояние игрока
            player: {
                x: player.x,
                y: player.y,
                health: player.health,
                speed: player.speed
            },
            
            // Игровые данные
            wave: wave,
            score: score,
            zombiesKilled: zombiesKilled,
            // НЕ сохраняем isWaveActive и isWaveCooldown - они всегда сбрасываются при загрузке
            waveTimer: waveTimer,
            
            // Зомби (сохраняем только важные данные)
            zombies: zombies.map(z => ({
                id: z.id,
                x: z.x,
                y: z.y,
                size: z.size,
                width: z.width,
                height: z.height,
                bodyColor: z.bodyColor,
                headColor: z.headColor,
                eyeColor: z.eyeColor,
                health: z.health,
                maxHealth: z.maxHealth,
                speed: z.speed,
                damage: z.damage,
                step: z.step,
                hasHair: z.hasHair,
                hasWounds: z.hasWounds,
                woundCount: z.woundCount,
                type: z.type
            })),
            
            // Пули
            bullets: bullets.map(b => ({
                x: b.x,
                y: b.y,
                radius: b.radius,
                speed: b.speed,
                dx: b.dx,
                dy: b.dy
            })),
            
            // Камера
            camera: {
                x: camera.x,
                y: camera.y
            },
            
            // Эффекты
            footprints: footprints.map(f => ({
                x: f.x,
                y: f.y,
                alpha: f.alpha,
                size: f.size,
                rotation: f.rotation
            })),
            
            blood: blood.map(b => ({
                x: b.x,
                y: b.y,
                size: b.size,
                alpha: b.alpha
            })),
            
            // Сердечки (если система доступна)
            hearts: (typeof hearts !== 'undefined' && hearts) ? hearts.map(h => ({
                x: h.x,
                y: h.y,
                size: h.size,
                healAmount: h.healAmount,
                pulse: h.pulse,
                lifetime: h.lifetime
            })) : [],
            
            // Монетки (если система доступна)
            coins: (typeof coins !== 'undefined' && coins) ? coins.map(c => ({
                x: c.x,
                y: c.y,
                size: c.size,
                value: c.value,
                rotation: c.rotation,
                pulse: c.pulse,
                lifetime: c.lifetime
            })) : []
        };
        
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        console.log('Игра сохранена');
        return true;
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        return false;
    }
}

/**
 * Загрузка сохраненной игры
 * @returns {Object|null} Данные сохранения или null
 */
function loadGame() {
    try {
        const saveDataStr = localStorage.getItem(SAVE_KEY);
        if (!saveDataStr) {
            return null;
        }
        
        const saveData = JSON.parse(saveDataStr);
        
        // Проверяем версию (можно использовать для миграций в будущем)
        if (!saveData.version) {
            console.warn('Старое сохранение, может быть несовместимо');
        }
        
        // Удаляем старые флаги волны из сохранения, если они есть
        // Это нужно для совместимости со старыми сохранениями
        if (saveData.hasOwnProperty('isWaveActive')) {
            delete saveData.isWaveActive;
        }
        if (saveData.hasOwnProperty('isWaveCooldown')) {
            delete saveData.isWaveCooldown;
        }
        
        return saveData;
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        localStorage.removeItem(SAVE_KEY); // Удаляем поврежденное сохранение
        return null;
    }
}

/**
 * Восстановление состояния игры из сохранения
 * @param {Object} saveData - Данные сохранения
 */
function restoreGame(saveData) {
    // Восстанавливаем игрока
    player.x = saveData.player.x;
    player.y = saveData.player.y;
    player.health = saveData.player.health;
    player.speed = saveData.player.speed;
    
    // Восстанавливаем игровые данные
    wave = saveData.wave;
    score = saveData.score;
    zombiesKilled = saveData.zombiesKilled;
    waveTimer = saveData.waveTimer || 0;
    
    // Восстанавливаем зомби
    zombies = saveData.zombies || [];
    if (zombies.length > 0) {
        nextZombieId = Math.max(...zombies.map(z => z.id)) + 1;
    } else {
        nextZombieId = 1;
    }
    
    // ВАЖНО: Всегда сбрасываем флаги волны при загрузке, чтобы не блокировать спавн
    // Эти флаги не сохраняются в localStorage, но на всякий случай сбрасываем их
    isWaveActive = false;
    isWaveCooldown = false;
    waveTimer = 0; // Также сбрасываем таймер
    
    // Если зомби нет или их очень мало, запускаем новую волну
    if (zombies.length === 0) {
        console.log('При загрузке сохранения зомби не найдено, запускаем новую волну');
        // Небольшая задержка, чтобы игра успела инициализироваться
        setTimeout(() => {
            if (typeof spawnWave === 'function') {
                spawnWave(wave);
            }
        }, 100);
    } else {
        console.log(`При загрузке сохранения найдено ${zombies.length} зомби`);
    }
    
    // Восстанавливаем пули
    bullets = saveData.bullets || [];
    
    // Восстанавливаем камеру
    camera.x = saveData.camera.x;
    camera.y = saveData.camera.y;
    
    // Восстанавливаем эффекты
    footprints = saveData.footprints || [];
    blood = saveData.blood || [];
    
    // Восстанавливаем сердечки (если система доступна)
    if (typeof hearts !== 'undefined' && saveData.hearts) {
        hearts = saveData.hearts;
    }
    
    // Восстанавливаем монетки (если система доступна)
    if (typeof coins !== 'undefined' && saveData.coins) {
        coins = saveData.coins;
    }
    
    console.log('Игра загружена');
}

/**
 * Удаление сохранения
 */
function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
    console.log('Сохранение удалено');
}

/**
 * Проверка наличия сохранения
 * @returns {boolean} true если есть сохранение
 */
function hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

