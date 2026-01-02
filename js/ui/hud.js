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

    // === 4. СЧЕТ, ВОЛНА, ЗОМБИ И МОНЕТКИ (справа вверху, ниже кнопки паузы) ===
    const cssW = canvas.clientWidth || window.innerWidth;
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    const rightX = cssW - 15; // Прямо у правого края
    const scoreY = isMobile ? 55 : 15; // Ниже кнопки паузы на мобильных
    const waveY = isMobile ? 70 : 30; // Ниже счета
    const zombiesY = isMobile ? 85 : 45; // Ниже волны
    const coinsY = isMobile ? 100 : 60; // Ниже зомби
    
    ctx.fillText("Score: " + score, rightX, scoreY);
    ctx.fillText("Wave: " + wave, rightX, waveY);
    
    // Общее количество зомби
    if (typeof totalZombiesSpawned !== 'undefined') {
        ctx.fillStyle = "#ff6666";
        ctx.fillText("Zombies: " + totalZombiesSpawned, rightX, zombiesY);
    }
    
    // Монетки (золотым цветом)
    if (typeof getCoins === 'function') {
        ctx.fillStyle = "#ffd700";
        ctx.fillText("🪙 " + getCoins(), rightX, coinsY);
    }
    
    ctx.textAlign = "left";

    // === 5. ЗВАНИЕ (показывается только при получении, по центру, ниже верхних элементов) ===
    const rankShowing = typeof rankDisplayTime !== 'undefined' && rankDisplayTime > 0 && typeof currentDisplayRank !== 'undefined' && currentDisplayRank;
    if (rankShowing) {
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

    // === 6. ДОСТИЖЕНИЕ (показывается только при получении, по центру, ниже звания или верхних элементов) ===
    const achievementShowing = typeof achievementDisplayTime !== 'undefined' && achievementDisplayTime > 0 && typeof currentDisplayAchievement !== 'undefined' && currentDisplayAchievement;
    if (achievementShowing) {
        ctx.save();
        ctx.textAlign = "center";
        
        // Плавное появление/исчезание
        const alpha = Math.min(1, achievementDisplayTime / 0.5);
        ctx.globalAlpha = alpha > 0.3 ? 1 : alpha / 0.3;
        
        const cssW = canvas.clientWidth || window.innerWidth;
        // Позиционируем ниже звания, если оно показывается, иначе ниже верхних элементов
        const baseAchievementY = isMobile ? 95 : 60;
        const achievementY = rankShowing ? baseAchievementY + 20 : baseAchievementY;
        
        // Размеры рамки
        const framePadding = 12;
        const frameWidth = 200;
        const frameHeight = 60;
        const frameX = cssW / 2 - frameWidth / 2;
        const frameY = achievementY - frameHeight / 2;
        
        // Золотая рамка (внешняя)
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 3;
        ctx.strokeRect(frameX - 2, frameY - 2, frameWidth + 4, frameHeight + 4);
        
        // Золотая рамка (внутренняя)
        ctx.strokeStyle = "#ffaa00";
        ctx.lineWidth = 2;
        ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);
        
        // Фон рамки (полупрозрачный черный)
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
        
        // Текст "Новое достижение"
        ctx.font = "8px 'Press Start 2P'";
        ctx.fillStyle = "#ffd700";
        ctx.fillText("НОВОЕ ДОСТИЖЕНИЕ", cssW / 2, frameY + 12);
        
        // Иконка достижения
        ctx.font = "16px 'Press Start 2P'";
        ctx.fillStyle = "#ffd700";
        ctx.fillText(currentDisplayAchievement.icon || "🏆", cssW / 2, frameY + 28);
        
        // Название достижения
        ctx.font = "9px 'Press Start 2P'";
        ctx.fillStyle = "#ffd700";
        ctx.fillText(currentDisplayAchievement.name, cssW / 2, frameY + 48);
        
        ctx.restore();
    }

    // === 7. УВЕДОМЛЕНИЕ О ДОСТУПНОМ УЛУЧШЕНИИ (только во время игры, не в паузе) ===
    const upgradeNotificationShowing = typeof upgradeNotificationTime !== 'undefined' && upgradeNotificationTime > 0 && !isPaused;
    if (upgradeNotificationShowing) {
        ctx.save();
        ctx.textAlign = "center";
        
        // Плавное появление/исчезание
        const alpha = Math.min(1, upgradeNotificationTime / 0.5);
        ctx.globalAlpha = alpha > 0.3 ? 1 : alpha / 0.3;
        
        const cssW = canvas.clientWidth || window.innerWidth;
        const cssH = canvas.clientHeight || window.innerHeight;
        const notificationY = cssH - 80; // Внизу экрана, выше джойстика
        
        // Фон уведомления
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(cssW / 2 - 150, notificationY - 15, 300, 30);
        
        // Рамка
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        ctx.strokeRect(cssW / 2 - 150, notificationY - 15, 300, 30);
        
        // Текст уведомления
        ctx.font = "10px 'Press Start 2P'";
        ctx.fillStyle = "#ffd700";
        ctx.fillText("Доступно улучшение", cssW / 2, notificationY);
        
        ctx.restore();
    }

    // === 8. ТАЙМЕР ВОЛНЫ (по центру, ниже звания/достижения или ниже верхних элементов) ===
    if (isWaveCooldown) {
        ctx.textAlign = "center";
        ctx.font = "10px 'Press Start 2P'";
        const cssW = canvas.clientWidth || window.innerWidth;
        const baseTimerY = isMobile ? 95 : 60;
        // Сдвигаем таймер ниже, если показывается звание или достижение
        let offset = 0;
        if (rankShowing) offset += 20;
        if (achievementShowing) offset += 38; // Высота достижения (иконка + текст)
        const timerY = baseTimerY + offset;
        ctx.fillText("Next: " + Math.ceil(waveTimer), cssW / 2, timerY);
        ctx.textAlign = "left";
    }

    ctx.restore();
}

