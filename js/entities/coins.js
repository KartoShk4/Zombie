/* ============================================
   ЗОЛОТЫЕ МОНЕТКИ
   ============================================
   Управление монетками: спавн при смерти зомби,
   коллизия с игроком и сбор монет.
   ============================================ */

// ===== ДАННЫЕ МОНЕТОК =====
let coins = [];  // Массив всех монеток на карте

// ===== СПАВН МОНЕТОК =====

/**
 * Создание монетки в указанной позиции
 * @param {number} x - Позиция X
 * @param {number} y - Позиция Y
 * @param {number} value - Стоимость монетки (по умолчанию 1)
 */
function spawnCoin(x, y, value = 1) {
    coins.push({
        x: x,
        y: y,
        size: 18,  // Размер монетки (увеличен для лучшей видимости)
        value: value,  // Стоимость монетки
        rotation: 0,  // Вращение для анимации
        pulse: 0,  // Пульсация для анимации
        lifetime: 60  // Время жизни в секундах (60 секунд)
    });
}

// ===== ОБНОВЛЕНИЕ МОНЕТОК =====

/**
 * Обновление всех монеток каждый кадр
 * Обрабатывает коллизию с игроком и удаление старых
 */
function updateCoins(dt = 1/60) {
    for (let i = coins.length - 1; i >= 0; i--) {
        let c = coins[i];
        
        // Обновление анимации
        c.rotation += 0.05;
        c.pulse += 0.1;
        
        // Уменьшение времени жизни
        c.lifetime -= dt;
        
        // Удаление истекших монеток
        if (c.lifetime <= 0) {
            coins.splice(i, 1);
            continue;
        }
        
        // Проверка коллизии с игроком
        const dx = player.x - c.x;
        const dy = player.y - c.y;
        const dist = Math.hypot(dx, dy);
        
        // Радиус подбора (размер игрока + размер монетки)
        const pickupRadius = (player.width / 2) + (c.size / 2);
        
        if (dist < pickupRadius) {
            // Подбор монетки - добавляем монеты
            if (typeof addCoins === 'function') {
                addCoins(c.value);
            }

            // Звук подбора монетки
            playSound("coin");
            
            // Удаляем монетку
            coins.splice(i, 1);
        }
    }
}

// ===== ОТРИСОВКА МОНЕТОК =====

/**
 * Отрисовка всех монеток на canvas
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderCoins(ctx) {
    for (let c of coins) {
        ctx.save();
        ctx.translate(c.x, c.y);
        
        // Пульсация (легкое покачивание размера)
        const pulseScale = 1 + Math.sin(c.pulse) * 0.15;
        ctx.scale(pulseScale, pulseScale);
        
        // Вращение монетки
        ctx.rotate(c.rotation);
        
        // Рисуем золотую монетку
        const radius = c.size / 2;
        
        // Свечение вокруг монетки (для лучшей видимости)
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        // Внешний круг (золотой)
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Внутренний круг (темнее)
        ctx.fillStyle = "#ffaa00";
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Блик (светлое пятно)
        ctx.fillStyle = "#fff8dc";
        ctx.beginPath();
        ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Символ доллара или знак монеты
        ctx.fillStyle = "#ffd700";
        ctx.font = `${radius * 1.2}px 'Press Start 2P'`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", 0, 0);
        
        ctx.restore();
    }
}

