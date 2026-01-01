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
        gameOver();  // Завершение игры
    }
    
    // Дрожание камеры при уроне
    cameraShake = cameraShakePower;
}

// ===== ОБНОВЛЕНИЕ ИГРОКА =====

/**
 * Обновление состояния игрока каждый кадр
 * Обрабатывает движение и ограничения
 */
function updatePlayer() {
    // === 1. УПРАВЛЕНИЕ ДЖОЙСТИКОМ (МОБИЛЬНОЕ) ===
    if (joystick.vector.x !== 0 || joystick.vector.y !== 0) {
        player.x += joystick.vector.x * player.speed;
        player.y += joystick.vector.y * player.speed;
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
    const h = player.height;

    // === ТЕЛО ИГРОКА (синий квадрат) ===
    ctx.fillStyle = "#4a90e2";
    ctx.fillRect(-w/2, -h/2, w, h);

    // === ГОЛОВА (белый квадрат) ===
    const headSize = w * 0.6;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-headSize/2, -h/2 - headSize * 0.3, headSize, headSize);

    // === ГЛАЗА (черные квадраты) ===
    const eyeSize = w * 0.12;
    const eyeOffsetX = w * 0.15;
    const eyeOffsetY = -h/2 - headSize * 0.15;
    
    ctx.fillStyle = "#000000";
    ctx.fillRect(-eyeOffsetX - eyeSize/2, eyeOffsetY - eyeSize/2, eyeSize, eyeSize);
    ctx.fillRect(eyeOffsetX - eyeSize/2, eyeOffsetY - eyeSize/2, eyeSize, eyeSize);

    // === РОТ (черная линия) ===
    ctx.fillStyle = "#000000";
    ctx.fillRect(-w * 0.15, eyeOffsetY + eyeSize, w * 0.3, w * 0.05);

    // === РУКИ (синие квадраты) ===
    const armWidth = w * 0.2;
    const armHeight = h * 0.4;
    ctx.fillStyle = "#4a90e2";
    ctx.fillRect(-w/2 - armWidth * 0.5, -h * 0.2, armWidth, armHeight);
    ctx.fillRect(w/2 - armWidth * 0.5, -h * 0.2, armWidth, armHeight);

    // === НОГИ (синие квадраты) ===
    const legWidth = w * 0.25;
    const legHeight = h * 0.35;
    ctx.fillStyle = "#2a5a92";
    ctx.fillRect(-w * 0.25, h/2 - legHeight * 0.3, legWidth, legHeight);
    ctx.fillRect(w * 0.25 - legWidth, h/2 - legHeight * 0.3, legWidth, legHeight);

    ctx.restore();
}

