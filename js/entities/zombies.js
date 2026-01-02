/* ============================================
   ЗОМБИ
   ============================================
   Управление зомби: спавн, движение, ИИ,
   отрисовка и обработка смерти.
   ============================================ */

// ===== ДАННЫЕ ЗОМБИ =====
let zombies = [];        // Массив всех зомби на карте
let blood = [];          // Массив частиц крови
let nextZombieId = 1;    // Счетчик ID для зомби

// ===== СПАВН ВОЛНЫ =====

/**
 * Создание волны зомби
 * @param {number} wave - Номер волны
 */
function spawnWave(wave) {
    // Базовые типы зомби (появляются с первой волны)
    const baseTypes = [
        {
            name: "walker",
            bodyColor: "#4f6f4f",
            headColor: "#3a4a3a",
            size: 40,
            speed: 0.7,
            health: 3,
            damage: 5,
            eyeColor: "#ff2b2b",
            hasHair: false,
            hasWounds: true
        },
        {
            name: "runner",
            bodyColor: "#7a7a7a",
            headColor: "#5a5a5a",
            size: 30,
            speed: 1.4,
            health: 2,
            damage: 3,
            eyeColor: "#ff0000",
            hasHair: false,
            hasWounds: false
        }
    ];

    // Продвинутые типы (появляются с 3 волны)
    const advancedTypes = [
        {
            name: "tank",
            bodyColor: "#3b4f3b",
            headColor: "#2a3a2a",
            size: 35,  // Уменьшено с 55
            speed: 0.4,
            health: 8,
            damage: 8,
            eyeColor: "#ff4444",
            hasHair: false,
            hasWounds: true
        },
        {
            name: "crawler",
            bodyColor: "#5a4a3a",
            headColor: "#4a3a2a",
            size: 25,
            speed: 1.8,
            health: 1,
            damage: 2,
            eyeColor: "#ff6666",
            hasHair: false,
            hasWounds: true
        }
    ];

    // Элитные типы (появляются с 5 волны)
    const eliteTypes = [
        {
            name: "spitter",
            bodyColor: "#6f4f4f",
            headColor: "#5a3a3a",
            size: 45,
            speed: 0.9,
            health: 5,
            damage: 6,
            eyeColor: "#00ff00",
            hasHair: true,
            hasWounds: true
        },
        {
            name: "brute",
            bodyColor: "#2a2a2a",
            headColor: "#1a1a1a",
            size: 40,  // Уменьшено с 60
            speed: 0.6,
            health: 12,
            damage: 10,
            eyeColor: "#ff0000",
            hasHair: false,
            hasWounds: true
        }
    ];

    // Устанавливаем флаг активности волны (если переменная доступна)
    // ВАЖНО: Проверка isWaveActive/isWaveCooldown убрана, чтобы не блокировать спавн
    // Управление этими флагами должно происходить в main.js
    if (typeof isWaveActive !== 'undefined') {
        isWaveActive = true;
    }

    const SAFE_RADIUS = 200;  // Безопасная зона вокруг игрока
    
    // Проверяем доступность config
    if (typeof config === 'undefined' || !config.wave || typeof config.wave.baseZombies === 'undefined') {
        console.error('Конфигурация волны недоступна! Используем значение по умолчанию: 5');
        var count = 5 + wave;
    } else {
        var count = config.wave.baseZombies + wave;  // Количество зомби
    }
    
    console.log(`Спавн волны ${wave}, количество зомби: ${count}`);

    // Определяем доступные типы в зависимости от волны
    let availableTypes = [...baseTypes];
    if (wave >= 3) availableTypes = [...availableTypes, ...advancedTypes];
    if (wave >= 5) availableTypes = [...availableTypes, ...eliteTypes];

    // Создаем каждого зомби
    for (let i = 0; i < count; i++) {
        // Выбираем случайный тип
        const baseType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        
        // Усиливаем зомби в зависимости от волны
        const waveMultiplier = 1 + (wave - 1) * 0.15;  // +15% за каждую волну
        const t = {
            ...baseType,
            health: Math.floor(baseType.health * waveMultiplier),
            speed: baseType.speed * (1 + (wave - 1) * 0.05),  // +5% скорости за волну
            damage: Math.floor(baseType.damage * waveMultiplier)
        };

        let x, y;
        let attempts = 0;

        // Ищем безопасную позицию (не слишком близко к игроку)
        // Определяем размеры мира
        const worldWidth = typeof WORLD_WIDTH !== 'undefined' ? WORLD_WIDTH : 3000;
        const worldHeight = typeof WORLD_HEIGHT !== 'undefined' ? WORLD_HEIGHT : 3000;
        
        do {
            x = Math.random() * worldWidth;
            y = Math.random() * worldHeight;

            // Проверяем расстояние до игрока (если игрок доступен)
            if (typeof player !== 'undefined' && player && typeof player.x === 'number' && typeof player.y === 'number') {
                const dx = x - player.x;
                const dy = y - player.y;
                const dist = Math.hypot(dx, dy);

                if (dist > SAFE_RADIUS) {
                    break;  // Нашли безопасную позицию
                }
            } else {
                // Если player недоступен, используем первую случайную позицию
                break;
            }

            attempts++;
        } while (attempts < 50);

        // Создаем зомби с уникальными характеристиками
        const zombie = {
            id: nextZombieId++,
            size: t.size,
            width: t.size,
            height: t.size,
            x,
            y,
            bodyColor: t.bodyColor,
            headColor: t.headColor,
            eyeColor: t.eyeColor,
            health: t.health,
            maxHealth: t.health,
            speed: t.speed,
            damage: t.damage,
            step: 0,  // Фаза шага (для анимации)
            hasHair: t.hasHair,
            hasWounds: t.hasWounds,
            woundCount: t.hasWounds ? Math.floor(Math.random() * 3) + 1 : 0,  // Количество ран
            type: t.name
        };
        
        // ВРЕМЕННО ОТКЛЮЧЕНО: Применение сложности к зомби
        // Применяем сложность к зомби (если функция доступна)
        // ВАЖНО: Если функция недоступна или вызывает ошибку, просто добавляем зомби без изменений
        // if (typeof applyDifficultyToZombie === 'function') {
        //     try {
        //         const modifiedZombie = applyDifficultyToZombie(zombie);
        //         // Проверяем, что функция вернула валидный объект
        //         if (modifiedZombie && typeof modifiedZombie === 'object' && modifiedZombie.id !== undefined) {
        //             zombies.push(modifiedZombie);
        //         } else {
        //             // Если функция вернула невалидный объект, добавляем исходного зомби
        //             console.warn('applyDifficultyToZombie вернула невалидный объект, используем исходного зомби');
        //             zombies.push(zombie);
        //         }
        //     } catch (error) {
        //         // В случае ошибки добавляем исходного зомби
        //         console.error('Ошибка при применении сложности к зомби:', error);
        //         zombies.push(zombie);
        //     }
        // } else {
        //     // Если функция недоступна, просто добавляем зомби без применения сложности
        //     zombies.push(zombie);
        // }
        
        // Временно добавляем зомби без применения сложности
        zombies.push(zombie);
        
        // Увеличиваем счетчик общего количества заспавненных зомби
        if (typeof totalZombiesSpawned !== 'undefined') {
            totalZombiesSpawned++;
        }
    }
    
    // Сохраняем количество зомби в волне
    if (typeof zombiesInWave !== 'undefined') {
        zombiesInWave = zombies.length;
    }
    
    console.log(`Волна ${wave} создана, зомби в массиве: ${zombies.length}`);
}

// ===== ОБНОВЛЕНИЕ ЗОМБИ =====

/**
 * Обновление всех зомби каждый кадр
 * Обрабатывает движение, ИИ и урон игроку
 */
function updateZombies(dt = 1/60) {
    let hitsThisFrame = 0;
    const MAX_HITS_PER_FRAME = 1;  // Максимум ударов за кадр

    for (let z of zombies) {
        // Вычисляем расстояние до игрока
        const dx = player.x - z.x;
        const dy = player.y - z.y;
        const dist = Math.hypot(dx, dy);

        if (dist === 0) continue;

        // === 1. ОТТАЛКИВАНИЕ ЗОМБИ ДРУГ ОТ ДРУГА ===
        // Предотвращает скопление зомби в одном месте
        for (let other of zombies) {
            if (other === z) continue;

            const dx2 = z.x - other.x;
            const dy2 = z.y - other.y;
            const dist2 = Math.hypot(dx2, dy2);

            const minDistZ = (z.width / 2 + other.width / 2) * 0.8;

            if (dist2 < minDistZ && dist2 > 0) {
                const push = (minDistZ - dist2) * 0.05;
                z.x += (dx2 / dist2) * push;
                z.y += (dy2 / dist2) * push;
            }
        }

        // === 2. ПОДХОД К ИГРОКУ (с ограничением дистанции) ===
        const minDist = (player.width / 2 + z.width / 2) * 0.7;

        if (dist > minDist) {
            // Зомби двигается к игроку
            z.x += (dx / dist) * z.speed;
            z.y += (dy / dist) * z.speed;
            
            // Создаем следы при движении зомби
            if (Math.random() < 0.08) {  // Реже чем у игрока
                const moveAngle = Math.atan2(dy, dx);
                const footOffset = (typeof zombieFootprints !== 'undefined' && zombieFootprints.length % 2 === 0 ? -1 : 1) * z.width * 0.15;
                const perpAngle = moveAngle + Math.PI / 2;
                const footX = Math.cos(perpAngle) * footOffset;
                const footY = Math.sin(perpAngle) * footOffset;
                
                if (typeof zombieFootprints !== 'undefined') {
                    zombieFootprints.push({
                        x: z.x + footX,
                        y: z.y + footY + z.height * 0.2,
                        alpha: 0.6,  // Более темные следы
                        size: 6 + Math.random() * 2,  // Немного меньше следов игрока
                        rotation: moveAngle + Math.PI / 2,
                        isZombie: true  // Флаг для отличия от следов игрока
                    });
                }
            }
        } else {
            // Зомби слишком близко — слегка отталкиваем назад
            const push = (minDist - dist) * 0.1;
            z.x -= (dx / dist) * push;
            z.y -= (dy / dist) * push;
        }

        // === 3. АНИМАЦИЯ ШАГА ===
        // Вертикальное покачивание при ходьбе
        z.step += 0.1;
        z.y += Math.sin(z.step) * 0.3;

        // === 4. УРОН ИГРОКУ ===
        // Если зомби касается игрока, наносим урон
        if (dist < (player.width / 2 + z.width / 2)) {
            if (hitsThisFrame < MAX_HITS_PER_FRAME) {
                damagePlayer(z.damage);
                hitsThisFrame++;
            }
        }
    }
}

// ===== ОТРИСОВКА КРОВИ =====

/**
 * Отрисовка частиц крови
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderBlood(ctx) {
    blood.forEach(b => {
        ctx.save();
        ctx.globalAlpha = b.alpha;

        ctx.fillStyle = "#7a0000";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        b.alpha -= 0.02;  // Постепенное исчезновение
    });

    // Удаляем полностью прозрачные частицы
    blood = blood.filter(b => b.alpha > 0);
}

// ===== ОТРИСОВКА ЗОМБИ =====

/**
 * Отрисовка всех зомби на canvas (квадратный пиксельный стиль)
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderZombies(ctx) {
    zombies.forEach(z => {
        ctx.save();
        ctx.translate(z.x, z.y);

        const w = z.width;
        const headSize = w * 1.0; // Голова равна размеру зомби (уменьшено)

        // === ГОЛОВА (квадрат) ===
        ctx.fillStyle = z.headColor || "#3a4a3a";
        ctx.fillRect(-headSize/2, -headSize/2, headSize, headSize);

        // === ВОЛОСЫ (если есть) ===
        if (z.hasHair) {
            ctx.fillStyle = "#2a2a2a";
            ctx.fillRect(-headSize/2, -headSize/2 - headSize * 0.15, headSize, headSize * 0.2);
        }

        // === ГЛАЗА (светящиеся квадраты) ===
        const eyeSize = headSize * 0.2;
        const eyeOffsetX = headSize * 0.25;
        const eyeOffsetY = -headSize * 0.15;
        
        ctx.fillStyle = z.eyeColor || "#ff2b2b";
        ctx.fillRect(-eyeOffsetX - eyeSize/2, eyeOffsetY - eyeSize/2, eyeSize, eyeSize);
        ctx.fillRect(eyeOffsetX - eyeSize/2, eyeOffsetY - eyeSize/2, eyeSize, eyeSize);

        // Зрачки — смотрят на игрока
        const angle = Math.atan2(player.y - z.y, player.x - z.x);
        const px = Math.cos(angle) * eyeSize * 0.3;
        const py = Math.sin(angle) * eyeSize * 0.3;

        ctx.fillStyle = "#000";
        const pupilSize = eyeSize * 0.5;
        ctx.fillRect(-eyeOffsetX - pupilSize/2 + px, eyeOffsetY - pupilSize/2 + py, pupilSize, pupilSize);
        ctx.fillRect(eyeOffsetX - pupilSize/2 + px, eyeOffsetY - pupilSize/2 + py, pupilSize, pupilSize);

        // === РОТ (открытый, страшный) ===
        const mouthY = eyeOffsetY + eyeSize * 1.3;
        ctx.fillStyle = "#000";
        ctx.fillRect(-headSize * 0.25, mouthY, headSize * 0.5, headSize * 0.18);

        // === ЗУБЫ (острые квадраты) ===
        ctx.fillStyle = "#ffffff";
        const toothCount = 5;
        const toothWidth = (headSize * 0.5) / toothCount;
        for (let i = 0; i < toothCount; i++) {
            const toothX = -headSize * 0.25 + i * toothWidth;
            ctx.fillRect(toothX, mouthY, toothWidth * 0.8, headSize * 0.12);
        }

        // === РАНЫ НА ЛИЦЕ (страшные) ===
        if (z.hasWounds) {
            ctx.fillStyle = "#7a0000";
            // Ранa на щеке
            ctx.fillRect(eyeOffsetX + eyeSize * 0.5, eyeOffsetY, headSize * 0.15, headSize * 0.15);
            // Ранa на лбу
            ctx.fillRect(-headSize * 0.1, -headSize * 0.3, headSize * 0.2, headSize * 0.1);
            // Кровь из ран
            ctx.fillStyle = "#aa0000";
            ctx.globalAlpha = 0.7;
            ctx.fillRect(eyeOffsetX + eyeSize * 0.5, eyeOffsetY + headSize * 0.15, headSize * 0.1, headSize * 0.2);
            ctx.globalAlpha = 1.0;
        }

        // === ШРАМЫ (темные линии) ===
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-headSize * 0.3, eyeOffsetY - eyeSize);
        ctx.lineTo(-headSize * 0.1, eyeOffsetY + eyeSize);
        ctx.stroke();

        ctx.restore();
    });
}

