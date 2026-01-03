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
        let buffY = cssH - (isMobile ? 120 : 100); // Выше джойстика (больше отступ на мобильных)
        
        // Разделяем положительные и негативные баффы
        const positiveBuffs = [];
        const negativeBuffs = [];
        
        for (let buffId in activeBuffs) {
            const buff = activeBuffs[buffId];
            if (buff.timeLeft > 0) {
                const config = getBuffConfig(buffId);
                if (config) {
                    if (config.isNegative) {
                        negativeBuffs.push({ id: buffId, buff, config });
                    } else {
                        positiveBuffs.push({ id: buffId, buff, config });
                    }
                }
            }
        }
        
        // Сначала показываем негативные баффы (красные)
        for (let item of negativeBuffs) {
            const { id: buffId, buff, config } = item;
            ctx.save();
            ctx.textAlign = "left";
            
            // Фон баффа (темнее для негативных)
            ctx.fillStyle = "rgba(68, 0, 0, 0.8)";
            const buffWidth = isMobile ? 180 : 200;
            const buffHeight = isMobile ? 22 : 20;
            ctx.fillRect(15, buffY - buffHeight/2, buffWidth, buffHeight);
            
            // Рамка (красная для негативных)
            ctx.strokeStyle = "#ff4444";
            ctx.lineWidth = 3;
            ctx.strokeRect(15, buffY - buffHeight/2, buffWidth, buffHeight);
            
            // Иконка
            ctx.fillStyle = "#ff4444";
            ctx.font = isMobile ? "14px 'Press Start 2P'" : "12px 'Press Start 2P'";
            ctx.fillText(config.icon || "?", 20, buffY - (isMobile ? 6 : 8));
            
            // Название
            ctx.font = isMobile ? "9px 'Press Start 2P'" : "8px 'Press Start 2P'";
            ctx.fillText(config.name || buffId, 38, buffY - (isMobile ? 6 : 8));
            
            // Таймер
            const timeLeft = Math.max(0, Math.floor(buff.timeLeft));
            ctx.fillStyle = timeLeft <= 3 ? "#ff0000" : "#ff6666"; // Ярко-красный для негативных
            ctx.font = isMobile ? "8px 'Press Start 2P'" : "7px 'Press Start 2P'";
            ctx.fillText(timeLeft + "s", buffWidth - 20, buffY + (isMobile ? 7 : 5));
            
            ctx.restore();
            buffY -= (isMobile ? 28 : 25);
        }
        
        // Затем показываем положительные баффы
        for (let item of positiveBuffs) {
            const { id: buffId, buff, config } = item;
            ctx.save();
            ctx.textAlign = "left";
            
            // Фон баффа
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            const buffWidth = isMobile ? 180 : 200;
            const buffHeight = isMobile ? 22 : 20;
            ctx.fillRect(15, buffY - buffHeight/2, buffWidth, buffHeight);
            
            // Рамка
            ctx.strokeStyle = config.color || "#ffd700";
            ctx.lineWidth = 2;
            ctx.strokeRect(15, buffY - buffHeight/2, buffWidth, buffHeight);
            
            // Иконка
            ctx.fillStyle = config.color || "#ffd700";
            ctx.font = isMobile ? "14px 'Press Start 2P'" : "12px 'Press Start 2P'";
            ctx.fillText(config.icon || "?", 20, buffY - (isMobile ? 6 : 8));
            
            // Название
            ctx.font = isMobile ? "9px 'Press Start 2P'" : "8px 'Press Start 2P'";
            ctx.fillText(config.name || buffId, 38, buffY - (isMobile ? 6 : 8));
            
            // Таймер (исправлено: используем Math.floor для правильного отображения)
            const timeLeft = Math.max(0, Math.floor(buff.timeLeft));
            ctx.fillStyle = timeLeft <= 3 ? "#ff4444" : "#aaa"; // Красный цвет если осталось <= 3 секунды
            ctx.font = isMobile ? "8px 'Press Start 2P'" : "7px 'Press Start 2P'";
            ctx.fillText(timeLeft + "s", buffWidth - 5, buffY + (isMobile ? 7 : 5));
            
            ctx.restore();
            buffY -= (isMobile ? 28 : 25);
        }
    }

    // === 5. ЗВАНИЕ (эпический показ при получении) ===
    const rankShowing =
        rankDisplayTime > 0 &&
        currentDisplayRank;

    if (rankShowing) {
        ctx.save();
        ctx.textAlign = "center";

        const cssW = canvas.clientWidth || window.innerWidth;
        const rankY = isMobile ? 95 : 60;

        // --- Плавное появление ---
        const appearTime = 0.5; // время появления
        const alpha = Math.min(1, rankDisplayTime / appearTime);
        ctx.globalAlpha = alpha;

        // --- Эффект увеличения (zoom-in) ---
        const scale = 1 + (1 - alpha) * 0.4; // от 1.4 → 1.0
        ctx.translate(cssW / 2, rankY);
        ctx.scale(scale, scale);

        // --- Лёгкая вибрация (пульсация) ---
        const pulse = Math.sin(performance.now() * 0.01) * 2;

        // --- Сияние вокруг текста ---
        ctx.shadowColor = currentDisplayRank.color;
        ctx.shadowBlur = 25;

        // --- Основной текст ---
        ctx.font = "18px 'Press Start 2P'";
        ctx.fillStyle = currentDisplayRank.color;
        ctx.fillText(currentDisplayRank.name, 0, pulse);

        // --- Внешний контур для читаемости ---
        ctx.shadowBlur = 0;
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.strokeText(currentDisplayRank.name, 0, pulse);

        ctx.restore();
    }


    // === 6. ДОСТИЖЕНИЕ — эффектная золотая карточка ===
    const achievementShowing =
        achievementDisplayTime > 0 &&
        currentDisplayAchievement;

    if (achievementShowing) {
        ctx.save();
        ctx.textAlign = "center";

        const cssW = canvas.clientWidth || window.innerWidth;

        // Позиция (ниже звания, если оно есть)
        const baseY = isMobile ? 110 : 80;
        const achievementY = rankShowing ? baseY + 30 : baseY;

        // --- Плавное появление ---
        const appearTime = 0.5;
        const alpha = Math.min(1, achievementDisplayTime / appearTime);
        ctx.globalAlpha = alpha;

        // --- Плавный подъём карточки (slide-up) ---
        const slideOffset = (1 - alpha) * 20;

        // --- Пульсация рамки ---
        const pulse = 1 + Math.sin(performance.now() * 0.005) * 0.05;

        // Размер карточки
        const frameWidth = 220;
        const frameHeight = 70;
        const frameX = cssW / 2 - frameWidth / 2;
        const frameY = achievementY - frameHeight / 2 + slideOffset;

        // --- Градиентная золотая рамка ---
        const gradient = ctx.createLinearGradient(frameX, frameY, frameX + frameWidth, frameY + frameHeight);
        gradient.addColorStop(0, "#ffea8a");
        gradient.addColorStop(1, "#ffb300");

        ctx.lineWidth = 4 * pulse;
        ctx.strokeStyle = gradient;
        ctx.strokeRect(frameX - 3, frameY - 3, frameWidth + 6, frameHeight + 6);

        // --- Внутренняя рамка ---
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255, 215, 0, 0.8)";
        ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);

        // --- Фон карточки ---
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(frameX, frameY, frameWidth, frameHeight);

        // --- Свечение вокруг карточки ---
        ctx.shadowColor = "rgba(255, 200, 50, 0.8)";
        ctx.shadowBlur = 25;

        // --- Заголовок ---
        ctx.font = "9px 'Press Start 2P'";
        ctx.fillStyle = "#ffe066";
        ctx.fillText("ДОСТИЖЕНИЕ ПОЛУЧЕНО", cssW / 2, frameY + 14);

        // --- Иконка достижения ---
        ctx.shadowBlur = 0;
        ctx.font = "20px 'Press Start 2P'";
        ctx.fillStyle = "#ffd700";
        ctx.fillText(currentDisplayAchievement.icon || "🏆", cssW / 2, frameY + 34);

        // --- Название достижения ---
        ctx.font = "10px 'Press Start 2P'";
        ctx.fillStyle = "#fff";
        ctx.fillText(currentDisplayAchievement.name, cssW / 2, frameY + 56);

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

