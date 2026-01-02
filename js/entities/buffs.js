/* ============================================
   ВРЕМЕННЫЕ БАФФЫ
   ============================================
   Управление временными баффами: спавн,
   сбор, применение эффектов.
   ============================================ */

// ===== ДАННЫЕ БАФФОВ =====
let buffs = [];  // Массив всех баффов на карте
let activeBuffs = {};  // Активные баффы игрока {buffId: {timeLeft, level}}

// ===== ТИПЫ БАФФОВ =====
const BUFF_TYPES = {
    MOVEMENT_SPEED: 'movementSpeed',    // Скорость передвижения
    MOVEMENT_SLOW: 'movementSlow',      // Медленное передвижение
    FIRE_RATE: 'fireRate',              // Скорость атаки
    MULTI_SHOT_2: 'multiShot2',        // 2 пули
    MULTI_SHOT_4: 'multiShot4',        // 4 пули
    MULTI_SHOT_6: 'multiShot6',        // 6 пуль
    TRIPLE_SHOT: 'tripleShot',         // 3 пули в разные стороны
    RICOCHET: 'ricochet'               // Рикошет (макс 3 зомби)
};

// Делаем BUFF_TYPES доступным глобально для других модулей
if (typeof window !== 'undefined') {
    window.BUFF_TYPES = BUFF_TYPES;
}

// ===== КОНФИГУРАЦИЯ БАФФОВ =====
const buffConfig = {
    [BUFF_TYPES.MOVEMENT_SPEED]: {
        name: 'Скорость передвижения',
        icon: '🏃',
        color: '#4a8',
        getDuration: () => 5 + Math.random() * 5,  // 5-10 секунд (случайная длительность при применении)
        effect: (level) => 1 + level * 0.3  // +30% за уровень
    },
    [BUFF_TYPES.MOVEMENT_SLOW]: {
        name: 'Медленное передвижения',
        icon: '🏃',
        color: '#4a8',
        getDuration: () => 5 + Math.random() * 5,  // 5-10 секунд (случайная длительность при применении)
        effect: (level) => 1 + level - 0.3  // -30% за уровень
    },
    [BUFF_TYPES.FIRE_RATE]: {
        name: 'Скорость атаки',
        icon: '⚡',
        color: '#fa4',
        getDuration: () => 5 + Math.random() * 5,  // 5-10 секунд (случайная длительность при применении)
        effect: (level) => 1 + level * 0.4  // +40% за уровень
    },
    [BUFF_TYPES.MULTI_SHOT_2]: {
        name: 'Двойной выстрел',
        icon: '🔫',
        color: '#48a',
        getDuration: () => 5 + Math.random() * 5,  // 5-10 секунд (случайная длительность при применении)
        bullets: 2
    },
    [BUFF_TYPES.MULTI_SHOT_4]: {
        name: 'Четверной выстрел',
        icon: '🔫',
        color: '#84a',
        getDuration: () => 5 + Math.random() * 5,  // 5-10 секунд (случайная длительность при применении)
        bullets: 4
    },
    [BUFF_TYPES.MULTI_SHOT_6]: {
        name: 'Шестерной выстрел',
        icon: '🔫',
        color: '#a48',
        getDuration: () => 5 + Math.random() * 5,  // 5-10 секунд (случайная длительность при применении)
        bullets: 6
    },
    [BUFF_TYPES.TRIPLE_SHOT]: {
        name: 'Тройной выстрел',
        icon: '🎯',
        color: '#f44',
        getDuration: () => 5 + Math.random() * 5,  // 5-10 секунд (случайная длительность при применении)
        bullets: 3,
        spread: true  // Пули в разные стороны
    },
    [BUFF_TYPES.RICOCHET]: {
        name: 'Рикошет',
        icon: '💫',
        color: '#ff4',
        getDuration: () => 5 + Math.random() * 5,  // 5-10 секунд (случайная длительность при применении)
        maxBounces: 3
    }
};

// Делаем BUFF_TYPES доступным глобально для других модулей
if (typeof window !== 'undefined') {
    window.BUFF_TYPES = BUFF_TYPES;
}

/**
 * Спавн баффа на карте
 * @param {string} buffType - Тип баффа
 * @param {number} x - Позиция X
 * @param {number} y - Позиция Y
 */
function spawnBuff(buffType, x, y) {
    const config = buffConfig[buffType];
    if (!config) {
        console.warn('Попытка заспавнить бафф с неверным типом:', buffType);
        return;
    }
    
    const newBuff = {
        type: buffType,
        x: x,
        y: y,
        size: 24,  // Увеличено с 16 до 24 для лучшей видимости
        rotation: 0,
        pulse: 0,
        lifetime: 120,  // 120 секунд на карте (увеличено)
        color: config.color,
        icon: config.icon
    };
    
    buffs.push(newBuff);
    console.log('Бафф добавлен в массив. Всего баффов:', buffs.length, 'Тип:', buffType, 'Позиция:', x, y);
}

/**
 * Случайный спавн баффов на карте
 */
function spawnRandomBuffs() {
    const buffTypes = Object.keys(BUFF_TYPES);
    const worldW = typeof WORLD_WIDTH !== 'undefined' ? WORLD_WIDTH : 3000;
    const worldH = typeof WORLD_HEIGHT !== 'undefined' ? WORLD_HEIGHT : 3000;
    
    // Спавним 5-8 баффов случайно (увеличено для лучшей видимости)
    const count = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
        const buffType = buffTypes[Math.floor(Math.random() * buffTypes.length)];
        // Спавним баффы в области вокруг центра мира (где начинается игрок)
        const centerX = worldW / 2;
        const centerY = worldH / 2;
        const spawnRadius = Math.min(worldW, worldH) * 0.3; // 30% от размера мира
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * spawnRadius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        spawnBuff(buffType, x, y);
    }
    
    console.log(`Спавнено ${count} баффов на карте`);
}

/**
 * Обновление баффов
 * @param {number} dt - Delta time (время с последнего кадра в секундах)
 */
function updateBuffs(dt = 1/60) {
    if (!buffs || buffs.length === 0) return;
    
    for (let i = buffs.length - 1; i >= 0; i--) {
        let b = buffs[i];
        
        // Обновление анимации
        b.rotation += 0.05 * dt * 60; // Нормализуем к 60 FPS
        b.pulse += 0.1 * dt * 60;
        b.lifetime -= dt;
        
        // Удаление истекших баффов
        if (b.lifetime <= 0) {
            buffs.splice(i, 1);
            continue;
        }
        
        // Проверка коллизии с игроком
        if (typeof player !== 'undefined') {
            const dx = player.x - b.x;
            const dy = player.y - b.y;
            const dist = Math.hypot(dx, dy);
            const pickupRadius = (player.width / 2) + (b.size / 2);
            
            if (dist < pickupRadius) {
                // Подбор баффа
                applyBuff(b.type);
                buffs.splice(i, 1);
            }
        }
    }
    
    // Обновление активных баффов
    if (typeof activeBuffs !== 'undefined') {
        for (let buffId in activeBuffs) {
            activeBuffs[buffId].timeLeft -= dt;
            if (activeBuffs[buffId].timeLeft <= 0) {
                removeBuff(buffId);
            }
        }
    }
}

/**
 * Применение баффа
 * @param {string} buffType - Тип баффа
 */
function applyBuff(buffType) {
    const config = buffConfig[buffType];
    if (!config) return;
    
    // Получаем длительность (используем getDuration если есть, иначе duration или 5 по умолчанию)
    const duration = config.getDuration ? config.getDuration() : (config.duration || 5);
    
    // Если бафф уже активен, продлеваем время
    if (activeBuffs[buffType]) {
        activeBuffs[buffType].timeLeft = Math.max(activeBuffs[buffType].timeLeft, duration);
        activeBuffs[buffType].level = (activeBuffs[buffType].level || 1) + 1;
    } else {
        activeBuffs[buffType] = {
            timeLeft: duration,
            level: 1
        };
    }
}

/**
 * Удаление баффа
 * @param {string} buffType - Тип баффа
 */
function removeBuff(buffType) {
    delete activeBuffs[buffType];
}

/**
 * Проверка активного баффа
 * @param {string} buffType - Тип баффа
 * @returns {boolean} true если бафф активен
 */
function hasBuff(buffType) {
    return activeBuffs[buffType] && activeBuffs[buffType].timeLeft > 0;
}

/**
 * Получить уровень баффа
 * @param {string} buffType - Тип баффа
 * @returns {number} Уровень баффа (0 если не активен)
 */
function getBuffLevel(buffType) {
    if (!hasBuff(buffType)) return 0;
    return activeBuffs[buffType].level || 1;
}

/**
 * Получить конфигурацию баффа
 * @param {string} buffType - Тип баффа
 * @returns {Object} Конфигурация баффа
 */
function getBuffConfig(buffType) {
    return buffConfig[buffType] || null;
}

/**
 * Отрисовка баффов
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderBuffs(ctx) {
    if (!buffs || buffs.length === 0) {
        return;
    }
    
    for (let b of buffs) {
        if (!b || !b.x || !b.y) continue; // Пропускаем невалидные баффы
        
        ctx.save();
        ctx.translate(b.x, b.y);
        
        // Пульсация (как у монет и сердец)
        const pulseScale = 1 + Math.sin(b.pulse) * 0.2;
        ctx.scale(pulseScale, pulseScale);
        
        // Вращение
        ctx.rotate(b.rotation);
        
        // Свечение вокруг баффа (для лучшей видимости, как у монет)
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(0, 0, b.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        // Внешняя рамка (более яркая и толстая)
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(-b.size/2 - 3, -b.size/2 - 3, b.size + 6, b.size + 6);
        
        // Внутренняя рамка (белая для контраста)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-b.size/2, -b.size/2, b.size, b.size);
        
        // Фон (полностью непрозрачный)
        ctx.fillStyle = b.color + 'FF';  // Полностью непрозрачный фон
        ctx.fillRect(-b.size/2, -b.size/2, b.size, b.size);
        
        // Иконка (более крупная и яркая, белая)
        ctx.fillStyle = '#ffffff';
        ctx.font = `${b.size * 1.2}px 'Press Start 2P'`;  // Увеличено до 1.2
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Добавляем свечение вокруг иконки
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 15;
        ctx.fillText(b.icon, 0, 0);
        ctx.shadowBlur = 0;
        
        ctx.restore();
    }
}

