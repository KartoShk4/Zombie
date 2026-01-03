/* ============================================
   ИГРОК — ОПТИМИЗИРОВАННАЯ ВЕРСИЯ
   ============================================ */

// ===== СОСТОЯНИЕ ИГРОКА =====
let player = {
    width: config.player.width,
    height: config.player.height,
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    health: config.player.health,
    maxHealth: config.player.health,
    speed: config.player.speed
};

let playerHitCooldown = 0;

// ===== УРОН =====
function damagePlayer(amount) {
    if (playerHitCooldown > 0) return;

    player.health -= amount;
    playerHitCooldown = config.zombie.hitCooldown;

    if (player.health <= 0) {
        player.health = 0;
        if (typeof showReviveModal === 'function') showReviveModal();
        else gameOver();
    }

    cameraShake = cameraShakePower;
}

// ===== ОБНОВЛЕНИЕ ИГРОКА =====
function updatePlayer(dt = 1/60) {
    const jx = joystick.vector.x;
    const jy = joystick.vector.y;

    // === 1. ДВИЖЕНИЕ ===
    if (jx !== 0 || jy !== 0) {
        let currentSpeed = player.speed;

        // Бафф скорости (положительный)
        if (typeof hasBuff === 'function' && hasBuff('movementSpeed')) {
            const lvl = typeof getBuffLevel === 'function' ? getBuffLevel('movementSpeed') : 1;
            const buff = typeof buffConfig !== 'undefined' ? buffConfig['movementSpeed'] : null;
            if (buff && buff.effect) currentSpeed *= buff.effect(lvl);
        }
        
        // Дебафф замедления (негативный)
        if (typeof hasBuff === 'function' && hasBuff('movementSlow')) {
            const lvl = typeof getBuffLevel === 'function' ? getBuffLevel('movementSlow') : 1;
            const buff = typeof buffConfig !== 'undefined' ? buffConfig['movementSlow'] : null;
            if (buff && buff.effect) currentSpeed *= buff.effect(lvl);
        }

        // Постоянное улучшение
        if (typeof getUpgradeLevel === 'function') {
            const lvl = getUpgradeLevel('permanentMovementSpeed');
            if (lvl > 0) {
                const up = typeof getAllUpgrades === 'function'
                    ? getAllUpgrades().find(u => u.id === 'permanentMovementSpeed')
                    : null;
                if (up && up.effect) currentSpeed *= up.effect(lvl);
            }
        }

        const move = currentSpeed * dt * 60;
        const newX = player.x + jx * move;
        const newY = player.y + jy * move;

        // Проверка препятствий
        if (typeof checkObstacleCollision === 'function') {
            const r = player.width / 2;
            if (!checkObstacleCollision(newX, newY, r, false)) {
                player.x = newX;
                player.y = newY;
            }
        } else {
            player.x = newX;
            player.y = newY;
        }
    }

    // === 2. ГРАНИЦЫ МИРА ===
    const halfW = player.width / 2;
    const halfH = player.height / 2;

    if (player.x < halfW) player.x = halfW;
    else if (player.x > WORLD_WIDTH - halfW) player.x = WORLD_WIDTH - halfW;

    if (player.y < halfH) player.y = halfH;
    else if (player.y > WORLD_HEIGHT - halfH) player.y = WORLD_HEIGHT - halfH;

    // === 3. СЛЕДЫ ===
    if ((jx !== 0 || jy !== 0) && Math.random() < 0.10) {
        const angle = Math.atan2(jy, jx);

        const offset = player.width * 0.35;
        const offsetX = -Math.cos(angle) * offset;
        const offsetY = -Math.sin(angle) * offset;

        const footOffset = (footprints.length & 1 ? -1 : 1) * player.width * 0.2;
        const perp = angle + Math.PI / 2;

        footprints.push({
            x: player.x + offsetX + Math.cos(perp) * footOffset,
            y: player.y + offsetY + Math.sin(perp) * footOffset + player.height * 0.25,
            alpha: 0.7,
            size: 7 + Math.random() * 3,
            rotation: perp
        });

        if (footprints.length > 200) footprints.shift();
    }
}

// ===== ОТРИСОВКА ИГРОКА =====
function renderPlayer(ctx) {
    ctx.save();
    ctx.translate(player.x, player.y);

    const w = player.width;
    const head = w;

    // Голова
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-head/2, -head/2, head, head);

    // Глаза
    const eye = head * 0.2;
    const ex = head * 0.25;
    const ey = -head * 0.15;

    ctx.fillStyle = "#000";
    ctx.fillRect(-ex - eye/2, ey - eye/2, eye, eye);
    ctx.fillRect(ex - eye/2, ey - eye/2, eye, eye);

    // Рот
    ctx.fillRect(-head * 0.25, ey + eye * 1.2, head * 0.5, head * 0.08);

    // Вспышка (проверяем настройки графики)
    if (muzzleFlash > 0 && typeof lastShotAngle !== 'undefined') {
        let showFlash = true;
        if (typeof getGraphicsSettings === 'function') {
            const settings = getGraphicsSettings();
            showFlash = settings.muzzleFlash;
        }
        
        if (showFlash) {
            const alpha = Math.min(1, muzzleFlash / 3);
            ctx.globalAlpha = alpha;

            const dist = head * 0.6;
            const fx = Math.cos(lastShotAngle) * dist;
            const fy = Math.sin(lastShotAngle) * dist;
            const size = head * 0.4;

            ctx.save();
            ctx.translate(fx, fy);
            ctx.rotate(lastShotAngle);

            ctx.fillStyle = "#ffd42a";
            ctx.fillRect(0, -size/2, size * 1.5, size);

            ctx.fillStyle = "#ffaa00";
            ctx.fillRect(size * 0.3, -size/3, size, size * 0.6);

            ctx.restore();
            ctx.globalAlpha = 1;
        }
    }

    ctx.restore();
}
