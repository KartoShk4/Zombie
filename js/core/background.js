/* ============================================
   ГЕНЕРАЦИЯ ФОНА
   ============================================
   Функции для генерации статического фона игры:
   пиксельная трава, препятствия.
   ============================================ */

// ===== ФОНОВЫЙ CANVAS =====
/**
 * Отдельный canvas для статического фона (травы, земли, камней)
 * Рисуется один раз при инициализации и при изменении размера окна
 */
let backgroundCanvas = document.createElement("canvas");
let backgroundCtx = backgroundCanvas.getContext("2d");
backgroundCanvas.width = WORLD_WIDTH;
backgroundCanvas.height = WORLD_HEIGHT;

/**
 * Генерация статического фона (пиксельная трава)
 * Создает текстуру травы из пикселей разных оттенков зеленого
 */
function generateStaticBackground() {
    // Проверяем, что canvas инициализирован
    if (!backgroundCanvas || !backgroundCtx) {
        console.error('Background canvas не инициализирован!');
        return;
    }
    
    const ctx = backgroundCtx;
    const w = backgroundCanvas.width;
    const h = backgroundCanvas.height;
    
    // Проверяем, что размеры валидны
    if (w <= 0 || h <= 0) {
        console.error('Неверные размеры background canvas:', w, h);
        return;
    }

    // === ПИКСЕЛЬНАЯ ТРАВА (зеленый фон) ===
    // Базовый зеленый цвет травы
    const baseGreen = { r: 60, g: 100, b: 40 };
    
    // Заливаем фон базовым зеленым
    ctx.fillStyle = `rgb(${baseGreen.r}, ${baseGreen.g}, ${baseGreen.b})`;
    ctx.fillRect(0, 0, w, h);
    
    // Пиксельная текстура травы (квадраты разных оттенков зеленого)
    const pixelSize = 10; // Размер пикселя (увеличен для лучшего вида)
    for (let y = 0; y < h; y += pixelSize) {
        for (let x = 0; x < w; x += pixelSize) {
            // Случайные вариации зеленого
            const variation = (Math.random() - 0.5) * 30;
            const r = Math.max(40, Math.min(80, baseGreen.r + variation));
            const g = Math.max(80, Math.min(120, baseGreen.g + variation));
            const b = Math.max(30, Math.min(60, baseGreen.b + variation));
            
            ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
            ctx.fillRect(x, y, pixelSize, pixelSize);
        }
    }
    
    // Генерируем препятствия (камни, земля, кусты, деревья, дорожки)
    // Вызываем только если функция доступна
    try {
        if (typeof generateObstacles === 'function') {
            generateObstacles();
        }
    } catch (error) {
        console.error('Ошибка при генерации препятствий:', error);
    }
}

