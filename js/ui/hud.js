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

    // === 1. СЕРДЦЕ (ИКОНКА ЗДОРОВЬЯ) - СЛЕВА ВВЕРХУ ===
    drawPixelHeart(ctx, 15, 15, 2);

    // === 2. ПОЛОСКА ЗДОРОВЬЯ - СЛЕВА ВВЕРХУ, РЯДОМ С СЕРДЦЕМ ===
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

    // === 3. КНОПКА ПАУЗЫ (для мобильных, справа вверху) ===
    if (isMobile) {
        const cssW = canvas.clientWidth || window.innerWidth;
        const pauseBtnSize = 30;
        const pauseBtnX = cssW - pauseBtnSize - 15;
        const pauseBtnY = 15;
        
        // Фон кнопки
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(pauseBtnX - 3, pauseBtnY - 3, pauseBtnSize + 6, pauseBtnSize + 6);
        
        // Иконка паузы
        ctx.fillStyle = "white";
        ctx.fillRect(pauseBtnX, pauseBtnY, pauseBtnSize * 0.25, pauseBtnSize);
        ctx.fillRect(pauseBtnX + pauseBtnSize * 0.5, pauseBtnY, pauseBtnSize * 0.25, pauseBtnSize);
    }

    // === 4. СЧЕТ И ВОЛНА (справа вверху, ниже кнопки паузы) ===
    const cssW = canvas.clientWidth || window.innerWidth;
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    const rightX = cssW - 15; // Прямо у правого края
    const scoreY = isMobile ? 55 : 15; // Ниже кнопки паузы на мобильных
    const waveY = isMobile ? 70 : 30; // Ниже счета
    ctx.fillText("Score: " + score, rightX, scoreY);
    ctx.fillText("Wave: " + wave, rightX, waveY);
    ctx.textAlign = "left";

    // === 5. ЗВАНИЕ (показывается только при получении, по центру, ниже верхних элементов) ===
    if (typeof rankDisplayTime !== 'undefined' && rankDisplayTime > 0 && typeof currentDisplayRank !== 'undefined' && currentDisplayRank) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.font = "12px 'Press Start 2P'";
        
        // Плавное появление/исчезание
        const alpha = Math.min(1, rankDisplayTime / 0.5);
        ctx.globalAlpha = alpha > 0.3 ? 1 : alpha / 0.3;
        
        const cssW = canvas.clientWidth || window.innerWidth;
        ctx.fillStyle = currentDisplayRank.color;
        // Показываем по центру, достаточно низко, чтобы не мешать верхним элементам
        // Учитываем высоту HP (до ~37px) и счет/волну (до ~85px на мобильных)
        const rankY = isMobile ? 95 : 60;
        ctx.fillText(currentDisplayRank.name, cssW / 2, rankY);
        ctx.restore();
    }

    // === 6. ТАЙМЕР ВОЛНЫ (по центру, ниже звания или ниже верхних элементов) ===
    if (isWaveCooldown) {
        // Проверяем, не показывается ли звание, чтобы не перекрыться
        const rankShowing = typeof rankDisplayTime !== 'undefined' && rankDisplayTime > 0 && typeof currentDisplayRank !== 'undefined' && currentDisplayRank;
        ctx.textAlign = "center";
        ctx.font = "10px 'Press Start 2P'";
        // Если показывается звание, сдвигаем таймер ниже, иначе показываем ниже верхних элементов
        const cssW = canvas.clientWidth || window.innerWidth;
        const baseTimerY = isMobile ? 95 : 60;
        const timerY = rankShowing ? baseTimerY + 20 : baseTimerY;
        ctx.fillText("Next: " + Math.ceil(waveTimer), cssW / 2, timerY);
        ctx.textAlign = "left";
    }

    ctx.restore();
}

