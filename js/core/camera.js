/* ============================================
   УПРАВЛЕНИЕ КАМЕРОЙ
   ============================================
   Функции для управления камерой: следование
   за игроком, ограничение границами мира,
   дрожание камеры при уроне.
   ============================================ */

/**
 * Обновление позиции камеры
 * Камера следует за игроком с ограничением границами мира
 * Вызывается каждый кадр в функции update()
 */
function updateCamera() {
    const cssW = canvas.clientWidth || window.innerWidth;
    const cssH = canvas.clientHeight || window.innerHeight;
    
    // Камера следует за игроком
    camera.x = player.x - cssW / 2;
    camera.y = player.y - cssH / 2;
    
    // Ограничиваем камеру границами мира
    camera.x = Math.max(0, Math.min(camera.x, WORLD_WIDTH - cssW));
    camera.y = Math.max(0, Math.min(camera.y, WORLD_HEIGHT - cssH));
}

/**
 * Применение дрожания камеры к контексту
 * Используется при отрисовке для создания эффекта дрожания
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function applyCameraShake(ctx) {
    // Дрожание камеры (при уроне)
    if (cameraShake > 0) {
        const shakeX = (Math.random() - 0.5) * cameraShake;
        const shakeY = (Math.random() - 0.5) * cameraShake;
        ctx.translate(shakeX, shakeY);
        cameraShake *= 0.9;  // Затухание дрожания
    }
}
