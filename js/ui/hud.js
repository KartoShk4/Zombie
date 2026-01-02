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
    
    // Количество зомби в текущей волне
    if (typeof zombiesInWave !== 'undefined' && zombiesInWave > 0) {
        ctx.fillStyle = "#ff6666";
        ctx.fillText("Zombies: " + zombiesInWave, rightX, zombiesY);
    }
    
    // Монетки (золотым цветом)
    if (typeof getCoins === 'function') {
        ctx.fillStyle = "#ffd700";
        ctx.fillText("🪙 " + getCoins(), rightX, coinsY);
    }
    
    ctx.textAlign = "left";
    
    // === 9. АКТИВНЫЕ БАФФЫ (слева внизу, выше джойстика) ===
    if (typeof activeBuffs !== 'undefined' && typeof getBuffConfig === 'function') {
        const cssH = canvas.clientHeight || window.innerHeight;
        let buffY = cssH - 100; // Выше джойстика
        
        for (let buffId in activeBuffs) {
            const buff = activeBuffs[buffId];
            if (buff.timeLeft > 0) {
                const config = getBuffConfig(buffId);
                if (config) {
                    ctx.save();
                    ctx.textAlign = "left";
                    
                    // Фон баффа
                    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                    ctx.fillRect(15, buffY - 12, 120, 20);
                    
                    // Рамка
                    ctx.strokeStyle = config.color || "#ffd700";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(15, buffY - 12, 120, 20);
                    
                    // Иконка
                    ctx.fillStyle = config.color || "#ffd700";
                    ctx.font = "12px 'Press Start 2P'";
                    ctx.fillText(config.icon || "?", 20, buffY - 8);
                    
                    // Название
                    ctx.font = "8px 'Press Start 2P'";
                    ctx.fillText(config.name || buffId, 35, buffY - 8);
                    
                    // Таймер
                    const timeLeft = Math.ceil(buff.timeLeft);
                    ctx.fillStyle = "#aaa";
                    ctx.font = "7px 'Press Start 2P'";
                    ctx.fillText(timeLeft + "s", 15, buffY + 5);
                    
                    ctx.restore();
                    buffY -= 25;
                }
            }
        }
    }

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

    // === 10. ИНДИКАТОРЫ НАПРАВЛЕНИЯ К ЗОМБИ (мини-индикация на краях экрана) ===
    renderZombieDirectionIndicators(ctx);

    ctx.restore();
}

/**
 * Отрисовка индикаторов направления к зомби за пределами экрана
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderZombieDirectionIndicators(ctx) {
    if (typeof zombies === 'undefined' || !zombies || zombies.length === 0) return;
    if (!gameStarted || isPaused) return;
    
    const cssW = canvas.clientWidth || window.innerWidth;
    const cssH = canvas.clientHeight || window.innerHeight;
    
    // Границы видимой области (в мировых координатах)
    const viewLeft = camera.x;
    const viewRight = camera.x + cssW;
    const viewTop = camera.y;
    const viewBottom = camera.y + cssH;
    
    // Отступ от края экрана для индикаторов
    const indicatorMargin = 20;
    const indicatorSize = 12;
    
    // Группируем зомби по направлениям (чтобы не показывать слишком много индикаторов)
    const directionGroups = {};
    
    for (let z of zombies) {
        // Проверяем, находится ли зомби за пределами видимой области
        const isOffScreen = z.x < viewLeft || z.x > viewRight || z.y < viewTop || z.y > viewBottom;
        
        if (isOffScreen) {
            // Вычисляем угол от центра экрана (игрока) к зомби
            const dx = z.x - player.x;
            const dy = z.y - player.y;
            const angle = Math.atan2(dy, dx);
            
            // Округляем угол до ближайшего из 8 направлений (каждые 45 градусов)
            const normalizedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
            const key = normalizedAngle.toFixed(2);
            
            if (!directionGroups[key]) {
                directionGroups[key] = {
                    angle: normalizedAngle,
                    count: 0,
                    closestZombie: z,
                    closestDist: Math.hypot(dx, dy)
                };
            }
            
            directionGroups[key].count++;
            const dist = Math.hypot(dx, dy);
            if (dist < directionGroups[key].closestDist) {
                directionGroups[key].closestDist = dist;
                directionGroups[key].closestZombie = z;
            }
        }
    }
    
    // Рисуем индикаторы для каждого направления
    for (let key in directionGroups) {
        const group = directionGroups[key];
        const angle = group.angle;
        
        // Вычисляем точку на краю экрана
        const centerX = cssW / 2;
        const centerY = cssH / 2;
        
        // Находим пересечение луча с краем экрана
        let edgeX, edgeY;
        
        // Вычисляем точку на краю прямоугольника
        const tan = Math.tan(angle);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        // Проверяем пересечение с каждой стороной экрана
        if (cos > 0) {
            // Правая сторона
            edgeX = cssW - indicatorMargin;
            edgeY = centerY + (edgeX - centerX) * tan;
            if (edgeY < indicatorMargin || edgeY > cssH - indicatorMargin) {
                if (sin > 0) {
                    // Нижняя сторона
                    edgeY = cssH - indicatorMargin;
                    edgeX = centerX + (edgeY - centerY) / tan;
                } else {
                    // Верхняя сторона
                    edgeY = indicatorMargin;
                    edgeX = centerX + (edgeY - centerY) / tan;
                }
            }
        } else {
            // Левая сторона
            edgeX = indicatorMargin;
            edgeY = centerY + (edgeX - centerX) * tan;
            if (edgeY < indicatorMargin || edgeY > cssH - indicatorMargin) {
                if (sin > 0) {
                    // Нижняя сторона
                    edgeY = cssH - indicatorMargin;
                    edgeX = centerX + (edgeY - centerY) / tan;
                } else {
                    // Верхняя сторона
                    edgeY = indicatorMargin;
                    edgeX = centerX + (edgeY - centerY) / tan;
                }
            }
        }
        
        // Рисуем индикатор
        ctx.save();
        ctx.translate(edgeX, edgeY);
        ctx.rotate(angle + Math.PI / 2); // Поворачиваем стрелку в направлении зомби
        
        // Фон индикатора (полупрозрачный красный круг)
        ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
        ctx.beginPath();
        ctx.arc(0, 0, indicatorSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Стрелка (белый треугольник)
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(0, -indicatorSize * 0.6);
        ctx.lineTo(-indicatorSize * 0.4, indicatorSize * 0.3);
        ctx.lineTo(indicatorSize * 0.4, indicatorSize * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Если зомби несколько в этом направлении, показываем количество
        if (group.count > 1) {
            ctx.save();
            ctx.rotate(-angle - Math.PI / 2); // Возвращаем текст в нормальное положение
            ctx.fillStyle = "white";
            ctx.font = "8px 'Press Start 2P'";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(group.count.toString(), 0, indicatorSize * 1.5);
            ctx.restore();
        }
        
        ctx.restore();
    }
}

