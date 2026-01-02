/* ============================================
   СЕРДЕЧКИ ДЛЯ ЛЕЧЕНИЯ
   ============================================
   Управление сердечками: спавн при смерти зомби,
   коллизия с игроком и восстановление здоровья.
   ============================================ */

// ===== ДАННЫЕ СЕРДЕЧЕК =====
let hearts = [];  // Массив всех сердечек на карте

// ===== СПАВН СЕРДЕЧЕК =====

/**
 * Создание сердечка в указанной позиции
 * @param {number} x - Позиция X
 * @param {number} y - Позиция Y
 */
function spawnHeart(x, y) {
    hearts.push({
        x: x,
        y: y,
        size: 15,  // Размер сердечка
        healAmount: 2,  // Количество HP для восстановления
        pulse: 0,  // Пульсация для анимации
        lifetime: 30  // Время жизни в секундах (30 секунд)
    });
}

// ===== ОБНОВЛЕНИЕ СЕРДЕЧЕК =====

/**
 * Обновление всех сердечек каждый кадр
 * Обрабатывает коллизию с игроком и удаление старых
 */
function updateHearts() {
    for (let i = hearts.length - 1; i >= 0; i--) {
        let h = hearts[i];
        
        // Обновление анимации пульсации
        h.pulse += 0.1;
        
        // Уменьшение времени жизни
        h.lifetime -= 1 / 60;  // 60 FPS
        
        // Удаление истекших сердечек
        if (h.lifetime <= 0) {
            hearts.splice(i, 1);
            continue;
        }
        
        // Проверка коллизии с игроком
        const dx = player.x - h.x;
        const dy = player.y - h.y;
        const dist = Math.hypot(dx, dy);
        
        // Радиус подбора (размер игрока + размер сердечка)
        const pickupRadius = (player.width / 2) + (h.size / 2);
        
        if (dist < pickupRadius) {
            // Подбор сердечка - восстанавливаем здоровье
            player.health = Math.min(player.health + h.healAmount, player.maxHealth || config.player.health);
            
            // Удаляем сердечко
            hearts.splice(i, 1);
        }
    }
}

// ===== ОТРИСОВКА СЕРДЕЧЕК =====

/**
 * Отрисовка всех сердечек на canvas
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderHearts(ctx) {
    for (let h of hearts) {
        ctx.save();
        ctx.translate(h.x, h.y);
        
        // Пульсация (легкое покачивание размера)
        const pulseScale = 1 + Math.sin(h.pulse) * 0.1;
        ctx.scale(pulseScale, pulseScale);
        
        // Рисуем сердечко используя функцию из pixel_heart.js
        // Но адаптируем для мира (больше размер)
        const heartSize = h.size;
        const scale = heartSize / 8;  // Масштаб для пиксельного сердца
        
        // Пиксельная карта сердца
        const pixels = [
            "01100110",
            "11111111",
            "11111111",
            "01111110",
            "00111100",
            "00011000",
            "00000000"
        ];
        
        ctx.fillStyle = "#ff3b3b";  // Красный цвет
        
        // Проходим по каждому пикселю
        for (let row = 0; row < pixels.length; row++) {
            for (let col = 0; col < pixels[row].length; col++) {
                if (pixels[row][col] === "1") {
                    // Рисуем пиксель с центрированием
                    ctx.fillRect(
                        (col - pixels[row].length / 2) * scale,
                        (row - pixels.length / 2) * scale,
                        scale,
                        scale
                    );
                }
            }
        }
        
        // Легкое свечение (опционально)
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#ff6b6b";
        ctx.beginPath();
        ctx.arc(0, 0, heartSize * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        ctx.restore();
    }
}

