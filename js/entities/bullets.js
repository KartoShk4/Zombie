/* ============================================
   ПУЛИ
   ============================================
   Управление пулями: создание, движение,
   столкновения и отрисовка.
   ============================================ */

// ===== ДАННЫЕ ПУЛЬ =====
let bullets = [];           // Массив всех пуль
let score = 0;              // Счет игрока
let zombiesKilled = 0;      // Количество убитых зомби

// Примечание: muzzleFlash объявлена в main.js

// ===== СИСТЕМА СТРЕЛЬБЫ =====
let fireRate = 2;           // Количество выстрелов в секунду (уменьшено)
let lastShotTime = 0;        // Время последнего выстрела
let currentTargetIndex = 0;  // Индекс текущей цели в отсортированном массиве зомби

// ===== СОЗДАНИЕ ПУЛЬ =====

/**
 * Попытка выстрела с ограничением по темпу стрельбы
 * Автоматически нацеливается на зомби по очереди (от ближайшего к дальнему)
 */
function tryShootBullet() {
    const now = performance.now() / 1000;
    
    // Применяем бафф скорости атаки
    let currentFireRate = fireRate;
    if (typeof hasBuff === 'function' && typeof buffConfig !== 'undefined') {
        if (hasBuff('fireRate')) {
            const level = typeof getBuffLevel === 'function' ? getBuffLevel('fireRate') : 1;
            const buff = buffConfig['fireRate'];
            if (buff && buff.effect) {
                currentFireRate = fireRate * buff.effect(level);
            }
        }
    }
    
    // Применяем постоянное улучшение скорости атаки
    if (typeof getUpgradeLevel === 'function') {
        const fireRateLevel = getUpgradeLevel('permanentFireRate');
        if (fireRateLevel > 0) {
            const upgrade = typeof getAllUpgrades === 'function' ? getAllUpgrades().find(u => u.id === 'permanentFireRate') : null;
            if (upgrade && upgrade.effect) {
                currentFireRate = fireRate * upgrade.effect(fireRateLevel);
            }
        }
    }
    
    const timeSinceLastShot = now - lastShotTime;

    // Проверка кулдауна стрельбы
    if (timeSinceLastShot < 1 / currentFireRate) {
        return;  // Слишком рано для следующего выстрела
    }

    // Если зомби нет - не стреляем
    if (zombies.length === 0) {
        return;
    }

    // Фильтруем зомби по дальности стрельбы (только те, что в пределах видимости)
    const maxRange = config.bullet.maxRange;
    const zombiesInRange = zombies.filter(z => {
        const dist = Math.hypot(player.x - z.x, player.y - z.y);
        return dist <= maxRange;
    });

    // Если нет зомби в пределах дальности - не стреляем
    if (zombiesInRange.length === 0) {
        return;
    }

    // Сортируем зомби по расстоянию от игрока (от ближайшего к дальнему)
    const sortedZombies = zombiesInRange.sort((a, b) => {
        const distA = Math.hypot(player.x - a.x, player.y - a.y);
        const distB = Math.hypot(player.x - b.x, player.y - b.y);
        return distA - distB;
    });

    // Выбираем цель по текущему индексу (по очереди от ближайшего к дальнему)
    if (currentTargetIndex >= sortedZombies.length) {
        currentTargetIndex = 0;  // Если индекс вышел за границы, начинаем с начала
    }

    const target = sortedZombies[currentTargetIndex];
    
    // Вычисляем направление к цели
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0.01) {  // Если цель существует
        // Переходим к следующей цели для следующего выстрела
        currentTargetIndex++;
        if (currentTargetIndex >= sortedZombies.length) {
            currentTargetIndex = 0;  // Начинаем цикл заново
        }

        lastShotTime = now;
        
        // Проверяем баффы для множественных пуль
        if (typeof hasBuff === 'function' && typeof buffConfig !== 'undefined') {
            // Тройной выстрел (3 пули в разные стороны)
            if (hasBuff('tripleShot')) {
                const angle = Math.atan2(dy, dx);
                const spread = Math.PI / 6; // 30 градусов между пулями
                shootBullet(Math.cos(angle - spread), Math.sin(angle - spread));
                shootBullet(Math.cos(angle), Math.sin(angle));
                shootBullet(Math.cos(angle + spread), Math.sin(angle + spread));
            }
            // Множественные пули (2, 4, 6)
            else if (hasBuff('multiShot2') || hasBuff('multiShot4') || hasBuff('multiShot6')) {
                let bulletCount = 2;
                if (hasBuff('multiShot4')) bulletCount = 4;
                else if (hasBuff('multiShot6')) bulletCount = 6;
                
                const angle = Math.atan2(dy, dx);
                const spread = Math.PI / (bulletCount + 1); // Распределение пуль
                for (let i = 0; i < bulletCount; i++) {
                    const bulletAngle = angle - (spread * (bulletCount - 1) / 2) + (spread * i);
                    shootBullet(Math.cos(bulletAngle), Math.sin(bulletAngle));
                }
            }
            // Обычный выстрел
            else {
                shootBullet(dx / dist, dy / dist);
            }
        } else {
            shootBullet(dx / dist, dy / dist);
        }
    }
}

/**
 * Создание пули
 * @param {number} dx - Направление X
 * @param {number} dy - Направление Y
 */
function shootBullet(dx, dy) {
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;  // Нет направления

    // Сохраняем угол выстрела для вспышки и пистолета
    lastShotAngle = Math.atan2(dy, dx);

    // Позиция дула пистолета (рассчитывается как в renderPlayer)
    const w = player.width;
    const h = player.height;
    const armWidth = w * 0.2;
    const gunX = w/2 - armWidth * 0.2; // Позиция относительно центра игрока (как в renderPlayer)
    const gunY = -h * 0.1;
    const barrelLength = 12; // Длина ствола
    
    // Мировые координаты дула
    const gunWorldX = player.x + Math.cos(lastShotAngle) * gunX - Math.sin(lastShotAngle) * gunY;
    const gunWorldY = player.y + Math.sin(lastShotAngle) * gunX + Math.cos(lastShotAngle) * gunY;
    
    // Позиция спавна пули (на конце ствола)
    const spawnX = gunWorldX + Math.cos(lastShotAngle) * barrelLength;
    const spawnY = gunWorldY + Math.sin(lastShotAngle) * barrelLength;

    // Создаем пулю
    const bullet = {
        x: spawnX,
        y: spawnY,
        radius: config.bullet.radius,
        speed: config.bullet.speed,
        dx: dx / dist,  // Нормализованное направление X
        dy: dy / dist,  // Нормализованное направление Y
        bounces: 0,     // Количество рикошетов
        maxBounces: 0   // Максимальное количество рикошетов
    };
    
    // Проверяем постоянное улучшение рикошета
    if (typeof getUpgradeLevel === 'function') {
        const ricochetLevel = getUpgradeLevel('permanentRicochet');
        if (ricochetLevel > 0) {
            const upgrade = typeof getAllUpgrades === 'function' ? getAllUpgrades().find(u => u.id === 'permanentRicochet') : null;
            if (upgrade && upgrade.effect) {
                bullet.maxBounces = upgrade.effect(ricochetLevel);
            }
        }
    }
    
    // Проверяем временный бафф рикошета (имеет приоритет)
    if (typeof hasBuff === 'function' && hasBuff('ricochet')) {
        const buff = typeof buffConfig !== 'undefined' ? buffConfig['ricochet'] : null;
        if (buff) {
            bullet.maxBounces = buff.maxBounces || 3;
        }
    }
    
    bullets.push(bullet);

    // Активируем вспышку
    muzzleFlash = 3;
}

// ===== ОБНОВЛЕНИЕ ПУЛЬ =====

/**
 * Обновление всех пуль каждый кадр
 * Обрабатывает движение и столкновения
 */
function updateBullets(dt = 1/60) {
    // Проходим по всем пулям (в обратном порядке для безопасного удаления)
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];

        // Движение пули
        b.x += b.dx * b.speed * dt * 60; // Нормализуем к 60 FPS
        b.y += b.dy * b.speed * dt * 60;

        // Если пуля вышла за границы мира — удалить
        if (b.x < 0 || b.x > WORLD_WIDTH || b.y < 0 || b.y > WORLD_HEIGHT) {
            bullets.splice(i, 1);
            continue;
        }

        // Проверка попадания в зомби
        let hit = false;
        let hitCount = 0; // Счетчик попаданий для прострела насквозь
        // Проверяем улучшение прострела насквозь
        let maxHits = 1;
        if (typeof getUpgradeLevel === 'function') {
            // Используем строку 'pierce' напрямую, так как UPGRADE_TYPES может быть недоступен
            const pierceLevel = getUpgradeLevel('pierce');
            if (pierceLevel > 0) {
                maxHits = 2;
            }
        }

        for (let j = zombies.length - 1; j >= 0; j--) {
            let z = zombies[j];

            // Круглый хитбокс
            const dist = Math.hypot(b.x - z.x, b.y - z.y);

            if (dist < z.size / 2) {
                // Попадание!
                hitCount++;

                // Наносим урон
                z.health -= config.bullet.damage;

                // Отталкивание зомби (если улучшение куплено)
                if (typeof getUpgradeLevel === 'function') {
                    // Используем строку 'pushBack' напрямую
                    const pushLevel = getUpgradeLevel('pushBack');
                    if (pushLevel > 0) {
                        const pushPower = 5 * pushLevel; // Сила отталкивания
                        const pushAngle = Math.atan2(z.y - b.y, z.x - b.x);
                        z.x += Math.cos(pushAngle) * pushPower;
                        z.y += Math.sin(pushAngle) * pushPower;
                    }
                }

                // Создаем частицу крови при попадании
                blood.push({
                    x: z.x,
                    y: z.y,
                    size: Math.random() * 12 + 8,
                    alpha: 1
                });

                // Проверка смерти зомби
                if (z.health <= 0) {
                    // Большая лужа крови при смерти
                    blood.push({
                        x: z.x,
                        y: z.y,
                        size: 20,
                        alpha: 1
                    });

                    // Спавн сердечка с вероятностью 30%
                    if (typeof spawnHeart === 'function' && Math.random() < 0.3) {
                        spawnHeart(z.x, z.y);
                    }
                    
                    // Спавн монетки с вероятностью 50%
                    // Более сложные зомби дают больше монет (2-5)
                    if (typeof spawnCoin === 'function' && Math.random() < 0.5) {
                        let coinValue = 1; // По умолчанию 1 монета
                        
                        // Определяем стоимость монетки в зависимости от типа зомби
                        if (z.name === 'tank' || z.name === 'brute') {
                            // Элитные зомби дают 3-5 монет
                            coinValue = 3 + Math.floor(Math.random() * 3); // 3, 4 или 5
                        } else if (z.name === 'spitter' || z.name === 'crawler') {
                            // Продвинутые зомби дают 2-3 монеты
                            coinValue = 2 + Math.floor(Math.random() * 2); // 2 или 3
                        } else {
                            // Обычные зомби дают 1 монету
                            coinValue = 1;
                        }
                        
                        spawnCoin(z.x, z.y, coinValue);
                    }
                    
                    // Спавн баффа с вероятностью 15%
                    if (typeof spawnBuff === 'function') {
                        // Проверяем доступность BUFF_TYPES через window или глобально
                        const buffTypesAvailable = typeof BUFF_TYPES !== 'undefined' || (typeof window !== 'undefined' && window.BUFF_TYPES);
                        if (buffTypesAvailable && Math.random() < 0.15) {
                            const buffTypesObj = typeof BUFF_TYPES !== 'undefined' ? BUFF_TYPES : window.BUFF_TYPES;
                            const buffTypes = Object.values(buffTypesObj); // Используем значения, а не ключи
                            if (buffTypes && buffTypes.length > 0) {
                                const buffType = buffTypes[Math.floor(Math.random() * buffTypes.length)];
                                spawnBuff(buffType, z.x, z.y);
                                console.log('Бафф заспавнен:', buffType, 'в позиции', z.x, z.y);
                            }
                        }
                    }

                    // Удаляем зомби
                    zombies.splice(j, 1);
                    score++;
                    zombiesKilled++;
                    
                    // Обновляем счетчик зомби в волне
                    if (typeof zombiesInWave !== 'undefined' && zombiesInWave > 0) {
                        zombiesInWave--;
                    }

                    // Если все зомби убиты, запускаем перерыв между волнами
                    if (zombies.length === 0) {
                        startWaveCooldown();
                    }
                }

                // Проверка рикошета
                if (b.maxBounces > 0 && b.bounces < b.maxBounces && zombies.length > 1) {
                    // Ищем следующего зомби для рикошета
                    let nearestZombie = null;
                    let nearestDist = Infinity;
                    
                    for (let k = 0; k < zombies.length; k++) {
                        if (k === j) continue; // Пропускаем текущего зомби
                        const otherZ = zombies[k];
                        const otherDist = Math.hypot(b.x - otherZ.x, b.y - otherZ.y);
                        if (otherDist < nearestDist && otherDist < config.bullet.maxRange * 0.5) {
                            nearestDist = otherDist;
                            nearestZombie = otherZ;
                        }
                    }
                    
                    if (nearestZombie) {
                        // Рикошет к следующему зомби
                        const ricochetDx = nearestZombie.x - b.x;
                        const ricochetDy = nearestZombie.y - b.y;
                        const ricochetDist = Math.hypot(ricochetDx, ricochetDy);
                        if (ricochetDist > 0) {
                            b.dx = ricochetDx / ricochetDist;
                            b.dy = ricochetDy / ricochetDist;
                            b.bounces++;
                            // Не удаляем пулю, продолжаем движение
                            continue;
                        }
                    }
                }
                
                // Если достигнут лимит попаданий для прострела, удаляем пулю
                if (hitCount >= maxHits) {
                    bullets.splice(i, 1);
                    hit = true;
                    break;  // Выходим из цикла зомби
                }
            }
        }

        if (hit) continue;  // Пропускаем дальнейшую обработку этой пули
    }
}

// ===== ОТРИСОВКА ПУЛЬ =====

/**
 * Отрисовка всех пуль на canvas
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderBullets(ctx) {
    ctx.fillStyle = 'yellow';
    for (let b of bullets) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

