/* ============================================
   ВИЗУАЛЬНЫЕ ЭФФЕКТЫ
   ============================================
   Функции для отрисовки визуальных эффектов:
   следы игрока и зомби, туман, виньетка.
   ============================================ */

/**
 * Отрисовка следов игрока (реалистичные следы ног)
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderFootprints(ctx) {
    // Проверяем настройки графики
    if (typeof getGraphicsSettings === 'function') {
        const settings = getGraphicsSettings();
        if (!settings.footprints) return; // Следы отключены
        
        // Ограничиваем количество следов
        if (typeof limitFootprints === 'function') {
            limitFootprints(footprints, settings.maxFootprints);
        }
    }
    
    // Следы игрока
    footprints.forEach(f => {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation || 0);
        ctx.globalAlpha = f.alpha;
        
        const size = f.size || 8;
        
        // След ноги (овальная форма)
        ctx.fillStyle = "#2a2a2a";
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Пальцы (маленькие овалы)
        ctx.fillStyle = "#1a1a1a";
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.ellipse(i * size * 0.15, -size * 0.25, size * 0.12, size * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        f.alpha -= 0.003;  // Медленное исчезновение
    });

    // Удаляем полностью прозрачные следы игрока
    footprints = footprints.filter(f => f.alpha > 0);
    
    // Проверяем настройки графики для следов зомби
    if (typeof getGraphicsSettings === 'function') {
        const settings = getGraphicsSettings();
        if (!settings.zombieFootprints) {
            // Следы зомби отключены, очищаем массив
            zombieFootprints = [];
            return;
        }
        
        // Ограничиваем количество следов зомби
        if (typeof limitFootprints === 'function') {
            limitFootprints(zombieFootprints, settings.maxZombieFootprints);
        }
    }
    
    // Следы зомби (более темные, кровавые)
    zombieFootprints.forEach(f => {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation || 0);
        ctx.globalAlpha = f.alpha;
        
        const size = f.size || 6;
        
        // След зомби (более темный, с красноватым оттенком)
        ctx.fillStyle = "#1a0a0a";  // Очень темный красноватый
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.5, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Кровавые пятна (неправильной формы)
        ctx.fillStyle = "#3a0a0a";
        ctx.beginPath();
        ctx.ellipse(size * 0.1, size * 0.1, size * 0.15, size * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-size * 0.1, -size * 0.1, size * 0.12, size * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        f.alpha -= 0.002;  // Медленнее исчезают
    });

    // Удаляем полностью прозрачные следы зомби
    zombieFootprints = zombieFootprints.filter(f => f.alpha > 0);
}

/**
 * Отрисовка тумана
 * Создает эффект легкого тумана поверх игрового мира
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderFog(ctx) {
    // Проверяем настройки графики
    if (typeof getGraphicsSettings === 'function') {
        const settings = getGraphicsSettings();
        if (!settings.fog) return; // Туман отключен
    }
    
    const cssW = canvas.clientWidth || window.innerWidth;
    const cssH = canvas.clientHeight || window.innerHeight;
    ctx.save();
    ctx.fillStyle = "rgba(200, 200, 200, 0.15)";
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.restore();
}

/**
 * Отрисовка виньетки (затемнение по краям экрана)
 * Создает эффект затемнения по краям для лучшей фокусировки на центре
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderVignette(ctx) {
    // Проверяем настройки графики
    if (typeof getGraphicsSettings === 'function') {
        const settings = getGraphicsSettings();
        if (!settings.vignette) return; // Виньетка отключена
    }
    
    const cssW = canvas.clientWidth || window.innerWidth;
    const cssH = canvas.clientHeight || window.innerHeight;
    let gradient = ctx.createRadialGradient(
        cssW / 2, cssH / 2, cssW * 0.2,
        cssW / 2, cssH / 2, cssW * 0.7
    );

    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.15)");  // Уменьшена интенсивность (было 0.6)

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.restore();
}

