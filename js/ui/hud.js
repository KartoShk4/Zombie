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

    // Настройка шрифта (уменьшенный для мобильных)
    ctx.font = "10px 'Press Start 2P'";
    ctx.textBaseline = "top";
    ctx.fillStyle = "white";

    // === 1. СЕРДЦЕ (ИКОНКА ЗДОРОВЬЯ) - УМЕНЬШЕНО ===
    drawPixelHeart(ctx, 15, 15, 2);

    // === 2. ПОЛОСКА ЗДОРОВЬЯ - УМЕНЬШЕНА ===
    const maxHP = player.maxHealth || config.player.health;
    const hpWidth = 80;

    // Рамка полоски
    ctx.fillStyle = "#000";
    ctx.fillRect(45, 17, hpWidth + 4, 10);

    // Фон полоски
    ctx.fillStyle = "#550000";
    ctx.fillRect(47, 19, hpWidth, 6);

    // Полоска здоровья
    ctx.fillStyle = "#ff3b3b";
    ctx.fillRect(47, 19, (player.health / maxHP) * hpWidth, 6);

    // Текст HP (компактный, ниже полоски здоровья)
    ctx.fillStyle = "white";
    ctx.font = "8px 'Press Start 2P'";
    ctx.fillText(player.health + "/" + maxHP, 47, 29);
    ctx.font = "10px 'Press Start 2P'"; // Восстанавливаем размер шрифта

    // === 3. СЧЕТ И ВОЛНА (справа вверху, компактный) ===
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    const rightX = canvas.width - 15; // Прямо у правого края
    ctx.fillText("Score: " + score, rightX, 15);
    ctx.fillText("Wave: " + wave, rightX, 30);
    ctx.textAlign = "left";

    // === 4. ЗВАНИЕ (показывается только при получении, сверху по центру) ===
    // Рисуем ПЕРЕД таймером, чтобы они не перекрывались
    if (typeof rankDisplayTime !== 'undefined' && rankDisplayTime > 0 && typeof currentDisplayRank !== 'undefined' && currentDisplayRank) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.font = "12px 'Press Start 2P'";
        
        // Плавное появление/исчезание
        const alpha = Math.min(1, rankDisplayTime / 0.5);
        ctx.globalAlpha = alpha > 0.3 ? 1 : alpha / 0.3;
        
        ctx.fillStyle = currentDisplayRank.color;
        // Показываем достаточно высоко, чтобы не мешать HP (который заканчивается на ~37px)
        // Используем Y=52 чтобы был достаточный отступ от текста HP (Y=29, высота ~10px)
        ctx.fillText(currentDisplayRank.name, canvas.width / 2, 52);
        ctx.restore();
    }

    // === 5. ТАЙМЕР ВОЛНЫ (компактный, ниже звания) ===
    if (isWaveCooldown) {
        // Проверяем, не показывается ли звание, чтобы не перекрыться
        const rankShowing = typeof rankDisplayTime !== 'undefined' && rankDisplayTime > 0 && typeof currentDisplayRank !== 'undefined' && currentDisplayRank;
        ctx.textAlign = "center";
        ctx.font = "10px 'Press Start 2P'";
        // Если показывается звание, сдвигаем таймер ниже, иначе показываем ниже HP
        const timerY = rankShowing ? 67 : 43;
        ctx.fillText("Next: " + Math.ceil(waveTimer), canvas.width / 2, timerY);
        ctx.textAlign = "left";
    }

    // === 7. КНОПКА ПАУЗЫ (для мобильных, уменьшена) ===
    if (isMobile) {
        const pauseBtnSize = 30;
        const pauseBtnX = canvas.width - pauseBtnSize - 15;
        const pauseBtnY = 15;
        
        // Фон кнопки
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(pauseBtnX - 3, pauseBtnY - 3, pauseBtnSize + 6, pauseBtnSize + 6);
        
        // Иконка паузы
        ctx.fillStyle = "white";
        ctx.fillRect(pauseBtnX, pauseBtnY, pauseBtnSize * 0.25, pauseBtnSize);
        ctx.fillRect(pauseBtnX + pauseBtnSize * 0.5, pauseBtnY, pauseBtnSize * 0.25, pauseBtnSize);
    }

    ctx.restore();
}

