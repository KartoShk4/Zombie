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

function spawnWave(wave) {
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

    const advancedTypes = [
        {
            name: "tank",
            bodyColor: "#3b4f3b",
            headColor: "#2a3a2a",
            size: 35,
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
            size: 40,
            speed: 0.6,
            health: 12,
            damage: 10,
            eyeColor: "#ff0000",
            hasHair: false,
            hasWounds: true
        }
    ];

    if (typeof isWaveActive !== 'undefined') {
        isWaveActive = true;
    }

    const SAFE_RADIUS = 200;

    let count;
    if (typeof config === 'undefined' || !config.wave || typeof config.wave.baseZombies === 'undefined') {
        console.error('Конфигурация волны недоступна! Используем значение по умолчанию: 5');
        count = 5 + wave;
    } else {
        count = config.wave.baseZombies + wave;
    }

    console.log(`Спавн волны ${wave}, количество зомби: ${count}`);

    let availableTypes = [...baseTypes];
    if (wave >= 3) availableTypes = [...availableTypes, ...advancedTypes];
    if (wave >= 5) availableTypes = [...availableTypes, ...eliteTypes];

    const worldWidth = typeof WORLD_WIDTH !== 'undefined' ? WORLD_WIDTH : 3000;
    const worldHeight = typeof WORLD_HEIGHT !== 'undefined' ? WORLD_HEIGHT : 3000;

    for (let i = 0; i < count; i++) {
        const baseType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

        const waveMultiplier = 1 + (wave - 1) * 0.15;
        const t = {
            ...baseType,
            health: Math.floor(baseType.health * waveMultiplier),
            speed: baseType.speed * (1 + (wave - 1) * 0.05),
            damage: Math.floor(baseType.damage * waveMultiplier)
        };

        let x, y;
        let attempts = 0;

        do {
            x = Math.random() * worldWidth;
            y = Math.random() * worldHeight;

            if (typeof player !== 'undefined' && player) {
                const dx = x - player.x;
                const dy = y - player.y;
                const distSq = dx * dx + dy * dy;
                if (distSq > SAFE_RADIUS * SAFE_RADIUS) break;
            } else break;

            attempts++;
        } while (attempts < 50);

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
            step: 0,
            hasHair: t.hasHair,
            hasWounds: t.hasWounds,
            woundCount: t.hasWounds ? Math.floor(Math.random() * 3) + 1 : 0,
            type: t.name
        };

        zombies.push(zombie);

        if (typeof totalZombiesSpawned !== 'undefined') {
            totalZombiesSpawned++;
        }
    }

    if (typeof zombiesInWave !== 'undefined') {
        zombiesInWave = zombies.length;
    }

    console.log(`Волна ${wave} создана, зомби в массиве: ${zombies.length}`);
}

// ===== ОБНОВЛЕНИЕ ЗОМБИ =====

function updateZombies(dt = 1 / 60) {
    let hitsThisFrame = 0;
    const MAX_HITS_PER_FRAME = 1;

    // ⚡ ОБНОВЛЯЕМ СЕТКУ
    gridClear();
    for (let z of zombies) gridAdd(z);

    const playerX = player.x;
    const playerY = player.y;
    const playerHalf = player.width / 2;

    for (let z of zombies) {
        const dx = playerX - z.x;
        const dy = playerY - z.y;
        const distSq = dx * dx + dy * dy;
        if (distSq === 0) continue;

        const dist = Math.sqrt(distSq);

        // ⚡ ОТТАЛКИВАНИЕ ЗОМБИ ЧЕРЕЗ СЕТКУ
        const neighbors = gridGetNeighbors(z.x, z.y);

        for (let other of neighbors) {
            if (other === z) continue;

            const dx2 = z.x - other.x;
            const dy2 = z.y - other.y;
            const dist2Sq = dx2 * dx2 + dy2 * dy2;
            if (dist2Sq === 0) continue;

            const minDistZ = (z.width / 2 + other.width / 2) * 0.8;
            const minDistZSq = minDistZ * minDistZ;

            if (dist2Sq < minDistZSq) {
                const dist2 = Math.sqrt(dist2Sq);
                const push = (minDistZ - dist2) * 0.05;
                z.x += (dx2 / dist2) * push;
                z.y += (dy2 / dist2) * push;
            }
        }

        // ⚡ ДВИЖЕНИЕ К ИГРОКУ
        const minDist = (playerHalf + z.width / 2) * 0.7;

        if (dist > minDist) {
            const nx = dx / dist;
            const ny = dy / dist;
            z.x += nx * z.speed;
            z.y += ny * z.speed;

            // Следы зомби
            if (typeof zombieFootprints !== 'undefined' && Math.random() < 0.08) {
                const moveAngle = Math.atan2(dy, dx);
                const footOffset = (zombieFootprints.length % 2 === 0 ? -1 : 1) * z.width * 0.15;
                const perpAngle = moveAngle + Math.PI / 2;
                const footX = Math.cos(perpAngle) * footOffset;
                const footY = Math.sin(perpAngle) * footOffset;

                zombieFootprints.push({
                    x: z.x + footX,
                    y: z.y + footY + z.height * 0.2,
                    alpha: 0.6,
                    size: 6 + Math.random() * 2,
                    rotation: moveAngle + Math.PI / 2,
                    isZombie: true
                });
            }
        } else {
            const push = (minDist - dist) * 0.1;
            const nx = dx / dist;
            const ny = dy / dist;
            z.x -= nx * push;
            z.y -= ny * push;
        }

        // Анимация шага
        if (typeof lowPerformanceMode === 'undefined' || !lowPerformanceMode) {
            z.step += 0.1;
            z.y += Math.sin(z.step) * 0.3;
        }

        // ⚡ УРОН ИГРОКУ
        const hitDist = playerHalf + z.width / 2;
        if (dist < hitDist) {
            if (hitsThisFrame < MAX_HITS_PER_FRAME) {
                damagePlayer(z.damage);
                hitsThisFrame++;
            }
        }
    }
}

// ===== ОТРИСОВКА КРОВИ =====

function renderBlood(ctx) {
    for (let i = blood.length - 1; i >= 0; i--) {
        const b = blood[i];

        ctx.save();
        ctx.globalAlpha = b.alpha;
        ctx.fillStyle = "#7a0000";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        b.alpha -= 0.02;
        if (b.alpha <= 0) blood.splice(i, 1);
    }

    if (blood.length > 400) blood.length = 400;
}

// ===== ОТРИСОВКА ЗОМБИ =====

function renderZombies(ctx) {
    const playerX = player.x;
    const playerY = player.y;

    zombies.forEach(z => {
        ctx.save();
        ctx.translate(z.x, z.y);

        const w = z.width;
        const headSize = w;

        // Голова
        ctx.fillStyle = z.headColor;
        ctx.fillRect(-headSize / 2, -headSize / 2, headSize, headSize);

        // Волосы
        if (z.hasHair) {
            ctx.fillStyle = "#2a2a2a";
            ctx.fillRect(-headSize / 2, -headSize / 2 - headSize * 0.15, headSize, headSize * 0.2);
        }

        // Глаза
        const eyeSize = headSize * 0.2;
        const eyeOffsetX = headSize * 0.25;
        const eyeOffsetY = -headSize * 0.15;

        ctx.fillStyle = z.eyeColor;
        ctx.fillRect(-eyeOffsetX - eyeSize / 2, eyeOffsetY - eyeSize / 2, eyeSize, eyeSize);
        ctx.fillRect(eyeOffsetX - eyeSize / 2, eyeOffsetY - eyeSize / 2, eyeSize, eyeSize);

        // Зрачки
        const angle = Math.atan2(playerY - z.y, playerX - z.x);
        const px = Math.cos(angle) * eyeSize * 0.3;
        const py = Math.sin(angle) * eyeSize * 0.3;

        ctx.fillStyle = "#000";
        const pupilSize = eyeSize * 0.5;
        ctx.fillRect(-eyeOffsetX - pupilSize / 2 + px, eyeOffsetY - pupilSize / 2 + py, pupilSize, pupilSize);
        ctx.fillRect(eyeOffsetX - pupilSize / 2 + px, eyeOffsetY - pupilSize / 2 + py, pupilSize, pupilSize);

        // Рот
        const mouthY = eyeOffsetY + eyeSize * 1.3;
        ctx.fillStyle = "#000";
        ctx.fillRect(-headSize * 0.25, mouthY, headSize * 0.5, headSize * 0.18);

        // Зубы
        ctx.fillStyle = "#fff";
        const toothCount = 5;
        const toothWidth = (headSize * 0.5) / toothCount;
        for (let i = 0; i < toothCount; i++) {
            const toothX = -headSize * 0.25 + i * toothWidth;
            ctx.fillRect(toothX, mouthY, toothWidth * 0.8, headSize * 0.12);
        }

        // Раны
        if (z.hasWounds) {
            ctx.fillStyle = "#7a0000";
            ctx.fillRect(eyeOffsetX + eyeSize * 0.5, eyeOffsetY, headSize * 0.15, headSize * 0.15);
            ctx.fillRect(-headSize * 0.1, -headSize * 0.3, headSize * 0.2, headSize * 0.1);

            ctx.fillStyle = "#aa0000";
            ctx.globalAlpha = 0.7;
            ctx.fillRect(eyeOffsetX + eyeSize * 0.5, eyeOffsetY + headSize * 0.15, headSize * 0.1, headSize * 0.2);
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    });
}
