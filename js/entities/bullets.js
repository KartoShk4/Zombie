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

// muzzleFlash объявлена в main.js

// ===== СИСТЕМА СТРЕЛЬБЫ =====
let fireRate = 2;           // Количество выстрелов в секунду
let lastShotTime = 0;       // Время последнего выстрела
let currentTargetIndex = 0; // Индекс текущей цели

// ===== СОЗДАНИЕ ПУЛЬ =====

function tryShootBullet() {
    const now = performance.now() / 1000;

    // Бафф скорости атаки (положительный)
    let currentFireRate = fireRate;
    if (typeof hasBuff === 'function' && typeof buffConfig !== 'undefined') {
        if (hasBuff('fireRate')) {
            const level = typeof getBuffLevel === 'function' ? getBuffLevel('fireRate') : 1;
            const buff = buffConfig['fireRate'];
            if (buff && buff.effect) currentFireRate = fireRate * buff.effect(level);
        }
        
        // Дебафф медленной атаки (негативный)
        if (hasBuff('fireRateSlow')) {
            const level = typeof getBuffLevel === 'function' ? getBuffLevel('fireRateSlow') : 1;
            const buff = buffConfig['fireRateSlow'];
            if (buff && buff.effect) currentFireRate = fireRate * buff.effect(level);
        }
    }

    // Постоянное улучшение скорости атаки
    if (typeof getUpgradeLevel === 'function') {
        const fireRateLevel = getUpgradeLevel('permanentFireRate');
        if (fireRateLevel > 0) {
            const upgrade = typeof getAllUpgrades === 'function'
                ? getAllUpgrades().find(u => u.id === 'permanentFireRate')
                : null;
            if (upgrade && upgrade.effect) currentFireRate = fireRate * upgrade.effect(fireRateLevel);
        }
    }

    if (now - lastShotTime < 1 / currentFireRate) return;
    if (!zombies || zombies.length === 0) return;

    const maxRange = config.bullet.maxRange;
    const maxRangeSq = maxRange * maxRange;

    // Фильтрация по дальности
    const zombiesInRange = zombies.filter(z => {
        const dx = player.x - z.x;
        const dy = player.y - z.y;
        return dx * dx + dy * dy <= maxRangeSq;
    });

    if (zombiesInRange.length === 0) return;

    // Сортировка по расстоянию
    const sortedZombies = zombiesInRange.sort((a, b) => {
        const dxA = player.x - a.x;
        const dyA = player.y - a.y;
        const dxB = player.x - b.x;
        const dyB = player.y - b.y;
        return (dxA * dxA + dyA * dyA) - (dxB * dxB + dyB * dyB);
    });

    if (currentTargetIndex >= sortedZombies.length) currentTargetIndex = 0;

    const target = sortedZombies[currentTargetIndex];
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const distSq = dx * dx + dy * dy;
    if (distSq <= 0.0001) return;

    const dist = Math.sqrt(distSq);

    currentTargetIndex++;
    if (currentTargetIndex >= sortedZombies.length) currentTargetIndex = 0;

    lastShotTime = now;

    const dirX = dx / dist;
    const dirY = dy / dist;

    // Тройной выстрел
    if (typeof hasBuff === 'function' && hasBuff('tripleShot')) {
        shootBullet(dirX, dirY);
        setTimeout(() => shootBullet(dirX, dirY), 70);
        setTimeout(() => shootBullet(dirX, dirY), 140);
        return;
    }

    // Множественные пули
    if (typeof hasBuff === 'function' &&
        (hasBuff('multiShot2') || hasBuff('multiShot4') || hasBuff('multiShot6'))) {

        let count = 2;
        if (hasBuff('multiShot4')) count = 4;
        else if (hasBuff('multiShot6')) count = 6;

        const delay = 60;
        for (let i = 0; i < count; i++) {
            setTimeout(() => shootBullet(dirX, dirY), i * delay);
        }
        return;
    }

    // Обычный выстрел
    shootBullet(dirX, dirY);
}

/**
 * Создание пули
 */
function shootBullet(dx, dy) {
    const distSq = dx * dx + dy * dy;
    if (distSq === 0) return;

    const dist = Math.sqrt(distSq);

    lastShotAngle = Math.atan2(dy, dx);

    const w = player.width;
    const h = player.height;
    const armWidth = w * 0.2;
    const gunX = w / 2 - armWidth * 0.2;
    const gunY = -h * 0.1;
    const barrelLength = 12;

    const cosA = Math.cos(lastShotAngle);
    const sinA = Math.sin(lastShotAngle);

    const gunWorldX = player.x + cosA * gunX - sinA * gunY;
    const gunWorldY = player.y + sinA * gunX + cosA * gunY;

    const spawnX = gunWorldX + cosA * barrelLength;
    const spawnY = gunWorldY + sinA * barrelLength;

    const bullet = {
        x: spawnX,
        y: spawnY,
        radius: config.bullet.radius,
        speed: config.bullet.speed,
        dx: dx / dist,
        dy: dy / dist,
        bounces: 0,
        maxBounces: 0
    };

    // Постоянный рикошет
    if (typeof getUpgradeLevel === 'function') {
        const ricochetLevel = getUpgradeLevel('permanentRicochet');
        if (ricochetLevel > 0) {
            const upgrade = typeof getAllUpgrades === 'function'
                ? getAllUpgrades().find(u => u.id === 'permanentRicochet')
                : null;
            if (upgrade && upgrade.effect) bullet.maxBounces = upgrade.effect(ricochetLevel);
        }
    }

    // Временный бафф рикошета
    if (typeof hasBuff === 'function' && hasBuff('ricochet')) {
        const buff = typeof buffConfig !== 'undefined' ? buffConfig['ricochet'] : null;
        if (buff) bullet.maxBounces = buff.maxBounces || 3;
    }

    bullets.push(bullet);

    muzzleFlash = 3;
    playSound("shoot");
}

// ===== ОБНОВЛЕНИЕ ПУЛЬ =====

function updateBullets(dt = 1 / 60) {
    const dtNorm = dt * 60;

    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];

        // Движение
        b.x += b.dx * b.speed * dtNorm;
        b.y += b.dy * b.speed * dtNorm;

        // Удаление за границами
        if (b.x < 0 || b.x > WORLD_WIDTH || b.y < 0 || b.y > WORLD_HEIGHT) {
            bullets.splice(i, 1);
            continue;
        }

        let hit = false;
        let hitCount = 0;
        let maxHits = 1;

        if (typeof getUpgradeLevel === 'function') {
            const pierceLevel = getUpgradeLevel('pierce');
            if (pierceLevel > 0) maxHits = 2;
        }

        // ⚡ ПОЛУЧАЕМ ТОЛЬКО БЛИЖАЙШИХ ЗОМБИ
        const neighbors = gridGetNeighbors(b.x, b.y);

        for (let z of neighbors) {
            const dx = b.x - z.x;
            const dy = b.y - z.y;
            const distSq = dx * dx + dy * dy;
            const hitRadius = z.size / 2;
            const hitRadiusSq = hitRadius * hitRadius;

            if (distSq < hitRadiusSq) {
                hitCount++;

                z.health -= config.bullet.damage;

                // Кровь
                if (blood.length > 300) blood.shift();
                blood.push({
                    x: z.x,
                    y: z.y,
                    size: Math.random() * 12 + 8,
                    alpha: 1
                });

                // Отталкивание
                if (typeof getUpgradeLevel === 'function') {
                    const pushLevel = getUpgradeLevel('pushBack');
                    if (pushLevel > 0) {
                        const dist = Math.sqrt(distSq) || 1;
                        const pushPower = 5 * pushLevel;
                        z.x += (dx / dist) * pushPower;
                        z.y += (dy / dist) * pushPower;
                    }
                }

                // Смерть зомби
                if (z.health <= 0) {
                    if (blood.length > 300) blood.shift();
                    blood.push({
                        x: z.x,
                        y: z.y,
                        size: 20,
                        alpha: 1
                    });

                    if (typeof spawnHeart === 'function' && Math.random() < 0.3)
                        spawnHeart(z.x, z.y);

                    if (typeof spawnCoin === 'function' && Math.random() < 0.5) {
                        let coinValue = 1;
                        if (z.name === 'tank' || z.name === 'brute') coinValue = 3 + Math.floor(Math.random() * 3);
                        else if (z.name === 'spitter' || z.name === 'crawler') coinValue = 2 + Math.floor(Math.random() * 2);
                        spawnCoin(z.x, z.y, coinValue);
                    }

                    if (typeof spawnBuff === 'function' && Math.random() < 0.15) {
                        const buffTypesObj = typeof BUFF_TYPES !== 'undefined' ? BUFF_TYPES : window.BUFF_TYPES;
                        const buffConfigObj = typeof buffConfig !== 'undefined' ? buffConfig : window.buffConfig;
                        const buffTypes = Object.values(buffTypesObj);
                        if (buffTypes && buffTypes.length > 0 && buffConfigObj) {
                            // При смерти зомби спавнятся только положительные баффы
                            const positiveTypes = buffTypes.filter(type => {
                                const config = buffConfigObj[type];
                                return config && !config.isNegative;
                            });
                            
                            if (positiveTypes.length > 0) {
                                const buffType = positiveTypes[Math.floor(Math.random() * positiveTypes.length)];
                                spawnBuff(buffType, z.x, z.y);
                            }
                        }
                    }

                    zombies.splice(zombies.indexOf(z), 1);
                    score++;
                    zombiesKilled++;

                    if (typeof zombiesInWave !== 'undefined' && zombiesInWave > 0)
                        zombiesInWave--;

                    if (zombies.length === 0) startWaveCooldown();
                }

                // Рикошет
                if (b.maxBounces > 0 && b.bounces < b.maxBounces && zombies.length > 1) {
                    let nearestZombie = null;
                    let nearestDistSq = Infinity;

                    for (let other of neighbors) {
                        if (other === z) continue;
                        const dx2 = b.x - other.x;
                        const dy2 = b.y - other.y;
                        const d2 = dx2 * dx2 + dy2 * dy2;
                        if (d2 < nearestDistSq) {
                            nearestDistSq = d2;
                            nearestZombie = other;
                        }
                    }

                    if (nearestZombie) {
                        const rdx = nearestZombie.x - b.x;
                        const rdy = nearestZombie.y - b.y;
                        const rDistSq = rdx * rdx + rdy * rdy;
                        if (rDistSq > 0) {
                            const rDist = Math.sqrt(rDistSq);
                            b.dx = rdx / rDist;
                            b.dy = rdy / rDist;
                            b.bounces++;
                            continue;
                        }
                    }
                }

                if (hitCount >= maxHits) {
                    bullets.splice(i, 1);
                    hit = true;
                    break;
                }
            }
        }

        if (hit) continue;
    }
}

// ===== ОТРИСОВКА ПУЛЬ =====

function renderBullets(ctx) {
    ctx.fillStyle = 'yellow';
    for (let b of bullets) {
        ctx.fillRect(b.x - 1, b.y - 1, 2, 2);
    }
}
