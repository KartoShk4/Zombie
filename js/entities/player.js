/* ============================================
   ИГРОК
   ============================================
   Управление игроком: движение, здоровье,
   отрисовка и обработка урона.
   ============================================ */

// ===== СОСТОЯНИЕ ИГРОКА =====
// Объект игрока с начальными параметрами
let player = {
    width: config.player.width,        // Ширина игрока
    height: config.player.height,     // Высота игрока
    x: WORLD_WIDTH / 2,               // Позиция X (центр мира)
    y: WORLD_HEIGHT / 2,              // Позиция Y (центр мира)
    health: config.player.health,     // Текущее здоровье
    maxHealth: config.player.health,  // Максимальное здоровье (с учетом сложности)
    speed: config.player.speed        // Скорость движения
};

// Кулдаун урона (защита от спама урона)
let playerHitCooldown = 0;

// ===== ОБРАБОТКА УРОНА =====

/**
 * Нанесение урона игроку
 * @param {number} amount - Количество урона
 */
function damagePlayer(amount) {
    // Защита от спама урона - если кулдаун активен, урон не наносится
    if (playerHitCooldown > 0) return;

    // Уменьшаем здоровье
    player.health -= amount;
    playerHitCooldown = config.zombie.hitCooldown;

    // Проверка смерти
    if (player.health <= 0) {
        player.health = 0;
        // Показываем предложение возродиться вместо немедленного gameOver
        if (typeof showReviveModal === 'function') {
            showReviveModal();
        } else {
            gameOver();  // Если функция недоступна, завершаем игру
        }
    }
    
    // Дрожание камеры при уроне
    cameraShake = cameraShakePower;
}

// ===== ОБНОВЛЕНИЕ ИГРОКА =====

/**
 * Обновление состояния игрока каждый кадр
 * Обрабатывает движение и ограничения
 */
function updatePlayer(dt = 1/60) {
    // === 1. УПРАВЛЕНИЕ ДЖОЙСТИКОМ (МОБИЛЬНОЕ) ===
    if (joystick.vector.x !== 0 || joystick.vector.y !== 0) {
        // Применяем бафф скорости передвижения
        let currentSpeed = player.speed;
        if (typeof hasBuff === 'function' && typeof buffConfig !== 'undefined') {
            if (hasBuff('movementSpeed')) {
                const level = typeof getBuffLevel === 'function' ? getBuffLevel('movementSpeed') : 1;
                const buff = buffConfig['movementSpeed'];
                if (buff && buff.effect) {
                    currentSpeed = player.speed * buff.effect(level);
                }
            }
        }
        
        // Применяем постоянное улучшение скорости
        if (typeof getUpgradeLevel === 'function') {
            const speedLevel = getUpgradeLevel('permanentMovementSpeed');
            if (speedLevel > 0) {
                const upgrade = typeof getAllUpgrades === 'function' ? getAllUpgrades().find(u => u.id === 'permanentMovementSpeed') : null;
                if (upgrade && upgrade.effect) {
                    currentSpeed = player.speed * upgrade.effect(speedLevel);
                }
            }
        }
        
        const newX = player.x + joystick.vector.x * currentSpeed * dt * 60; // Нормализуем к 60 FPS
        const newY = player.y + joystick.vector.y * currentSpeed * dt * 60;
        
        // Проверяем коллизию с препятствиями (деревьями)
        if (typeof checkObstacleCollision === 'function') {
            const playerRadius = player.width / 2;
            if (!checkObstacleCollision(newX, newY, playerRadius, false)) {
                player.x = newX;
                player.y = newY;
            }
        } else {
            player.x = newX;
            player.y = newY;
        }
    }

    // === 2. ОГРАНИЧЕНИЯ ПО КРАЯМ МИРА ===
    // Не даем игроку выйти за границы мира
    if (player.x < player.width / 2) player.x = player.width / 2;
    if (player.x > WORLD_WIDTH - player.width / 2) player.x = WORLD_WIDTH - player.width / 2;

    if (player.y < player.height / 2) player.y = player.height / 2;
    if (player.y > WORLD_HEIGHT - player.height / 2) player.y = WORLD_HEIGHT - player.height / 2;

    // === 4. СОЗДАНИЕ СЛЕДОВ ===
    // Создаем следы только при реальном движении
    const moveX = joystick.vector.x;
    const moveY = joystick.vector.y;
    const isMoving = moveX !== 0 || moveY !== 0;
    
    if (isMoving && Math.random() < 0.12) {
        // Вычисляем угол движения
        const angle = Math.atan2(moveY, moveX);
        const offsetX = -Math.cos(angle) * (player.width * 0.35);
        const offsetY = -Math.sin(angle) * (player.height * 0.35);
        
        // Чередуем левую и правую ногу
        const footOffset = (footprints.length % 2 === 0 ? -1 : 1) * player.width * 0.2;
        const perpAngle = angle + Math.PI / 2;
        const footX = Math.cos(perpAngle) * footOffset;
        const footY = Math.sin(perpAngle) * footOffset;
        
        footprints.push({
            x: player.x + offsetX + footX,
            y: player.y + offsetY + footY + player.height * 0.25,  // Следы под ногами
            alpha: 0.7,      // Начальная прозрачность
            size: 7 + Math.random() * 3,  // Размер следа
            rotation: angle + Math.PI / 2  // Поворот следа (перпендикулярно движению)
        });
    }
}

// ===== ОТРИСОВКА ИГРОКА =====

/**
 * Отрисовка игрока на canvas (квадратный пиксельный стиль)
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderPlayer(ctx) {
    ctx.save();
    ctx.translate(player.x, player.y);

    const w = player.width;
    const headSize = w * 1.0; // Голова равна размеру игрока

    // === ГОЛОВА (белый квадрат) ===
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-headSize/2, -headSize/2, headSize, headSize);

    // === ГЛАЗА (черные квадраты) ===
    const eyeSize = headSize * 0.2;
    const eyeOffsetX = headSize * 0.25;
    const eyeOffsetY = -headSize * 0.15;
    
    ctx.fillStyle = "#000000";
    ctx.fillRect(-eyeOffsetX - eyeSize/2, eyeOffsetY - eyeSize/2, eyeSize, eyeSize);
    ctx.fillRect(eyeOffsetX - eyeSize/2, eyeOffsetY - eyeSize/2, eyeSize, eyeSize);

    // === РОТ (черная линия) ===
    ctx.fillStyle = "#000000";
    ctx.fillRect(-headSize * 0.25, eyeOffsetY + eyeSize * 1.2, headSize * 0.5, headSize * 0.08);
    
    // === ВСПЫШКА ВЫСТРЕЛА (если активна) - рисуем перед игроком ===
    if (typeof muzzleFlash !== 'undefined' && muzzleFlash > 0 && typeof lastShotAngle !== 'undefined') {
        const flashAlpha = Math.min(1, muzzleFlash / 3);
        ctx.globalAlpha = flashAlpha;
        
        // Позиция вспышки перед игроком
        const flashDistance = headSize * 0.6;
        const flashX = Math.cos(lastShotAngle) * flashDistance;
        const flashY = Math.sin(lastShotAngle) * flashDistance;
        const flashSize = headSize * 0.4;
        
        ctx.save();
        ctx.translate(flashX, flashY);
        ctx.rotate(lastShotAngle);
        
        // Яркая вспышка
        ctx.fillStyle = "#ffd42a";
        ctx.fillRect(0, -flashSize/2, flashSize * 1.5, flashSize);
        ctx.fillStyle = "#ffaa00";
        ctx.fillRect(flashSize * 0.3, -flashSize/3, flashSize, flashSize * 0.6);
        
        ctx.restore();
        ctx.globalAlpha = 1.0;
    }

    ctx.restore();
}

