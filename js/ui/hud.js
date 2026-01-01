/* ============================================
   ИНТЕРФЕЙС ИГРЫ (HUD)
   ============================================
   Отрисовка интерфейса: здоровье, счет,
   волна и таймеры.
   ============================================ */

/**
 * Отрисовка интерфейса игры
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderHUD(ctx) {
    ctx.save();

    // Настройка шрифта
    ctx.font = "16px 'Press Start 2P'";
    ctx.textBaseline = "top";
    ctx.fillStyle = "white";

    // === 1. СЕРДЦЕ (ИКОНКА ЗДОРОВЬЯ) ===
    drawPixelHeart(ctx, 20, 20, 3);

    // === 2. ПОЛОСКА ЗДОРОВЬЯ ===
    // Используем максимальное здоровье игрока (с учетом сложности)
    const maxHP = player.maxHealth || config.player.health;
    const hpWidth = 120;

    // Рамка полоски
    ctx.fillStyle = "#000";
    ctx.fillRect(60, 22, hpWidth + 4, 14);

    // Фон полоски (темно-красный)
    ctx.fillStyle = "#550000";
    ctx.fillRect(62, 24, hpWidth, 10);

    // Сама полоска здоровья (ярко-красный)
    ctx.fillStyle = "#ff3b3b";
    ctx.fillRect(62, 24, (player.health / maxHP) * hpWidth, 10);

    // Текст HP (текущее/максимальное)
    ctx.fillStyle = "white";
    ctx.fillText(player.health + "/" + maxHP, 62, 40);

    // === 3. СЧЕТ ===
    ctx.fillText("Score: " + score, canvas.width - 200, 20);

    // === 4. ВОЛНА ===
    ctx.fillText("Wave: " + wave, canvas.width - 200, 50);

    // === 5. ТАЙМЕР ВОЛНЫ ===
    // Показываем таймер, если идет перерыв между волнами
    if (isWaveCooldown) {
        ctx.textAlign = "center";
        ctx.font = "24px 'Press Start 2P'";
        ctx.fillText("Next wave in " + Math.ceil(waveTimer), canvas.width / 2, 80);
        ctx.textAlign = "left";
    }

    // === 6. КНОПКА ПАУЗЫ (для мобильных) ===
    if (isMobile) {
        const pauseBtnSize = 40;
        const pauseBtnX = canvas.width - pauseBtnSize - 20;
        const pauseBtnY = 20;
        
        // Фон кнопки
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(pauseBtnX - 5, pauseBtnY - 5, pauseBtnSize + 10, pauseBtnSize + 10);
        
        // Иконка паузы (две вертикальные линии)
        ctx.fillStyle = "white";
        ctx.fillRect(pauseBtnX, pauseBtnY, pauseBtnSize * 0.25, pauseBtnSize);
        ctx.fillRect(pauseBtnX + pauseBtnSize * 0.5, pauseBtnY, pauseBtnSize * 0.25, pauseBtnSize);
    }

    ctx.restore();
}

