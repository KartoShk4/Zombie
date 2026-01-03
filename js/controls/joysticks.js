/* ============================================
   ВИРТУАЛЬНЫЙ ДЖОЙСТИК
   ============================================
   Управление виртуальным джойстиком для
   мобильных устройств: обработка касаний,
   расчет направления движения игрока.
   ============================================ */

// ===== ДАННЫЕ ДЖОЙСТИКА =====
/**
 * Объект джойстика
 * Содержит позицию базы, стика и вектор направления
 */
let joystick = {
    baseX: 0,        // X координата базы джойстика (в CSS-пикселях)
    baseY: 0,        // Y координата базы джойстика (в CSS-пикселях)
    stickX: 0,        // X координата стика джойстика (в CSS-пикселях)
    stickY: 0,        // Y координата стика джойстика (в CSS-пикселях)
    radius: 60,      // Радиус джойстика в CSS-пикселях
    vector: { x: 0, y: 0 }  // Нормализованный вектор направления (от -1 до 1)
};

/**
 * ID активного касания
 * null если джойстик не активен
 */
let touchId = null;

// ===== КЭШИРОВАНИЕ РАЗМЕРОВ CANVAS =====
/**
 * Кэшированное значение getBoundingClientRect() для canvas
 * Используется для оптимизации (избегаем повторных вызовов)
 */
let canvasRect = null;

/**
 * Обновление кэшированного значения размеров canvas
 * Вызывается при изменении размера окна
 */
function updateCanvasRect() {
    canvasRect = canvas.getBoundingClientRect();
}

// Инициализация при загрузке
updateCanvasRect();
window.addEventListener("resize", updateCanvasRect);

// ===== ОБРАБОТКА КАСАНИЙ =====
/**
 * Обработчик начала касания
 * Создает джойстик в месте касания (плавающий джойстик)
 * @param {TouchEvent} e - Событие касания
 */
function handleTouchStart(e) {
    // Если джойстик уже активен, игнорируем новое касание
    if (touchId !== null) return;

    const rect = canvasRect;
    // Обрабатываем первое касание
    for (let t of e.changedTouches) {
        touchId = t.identifier;  // Сохраняем ID касания

        // Вычисляем координаты касания относительно canvas
        const x = t.clientX - rect.left;
        const y = t.clientY - rect.top;

        // Устанавливаем позицию джойстика в месте касания
        joystick.baseX = x;
        joystick.baseY = y;
        joystick.stickX = x;
        joystick.stickY = y;

        // Обновляем вектор направления
        moveJoystick(x, y);
        break;
    }
}

/**
 * Обработчик движения касания
 * Обновляет позицию стика джойстика при движении пальца
 * @param {TouchEvent} e - Событие движения касания
 */
function handleTouchMove(e) {
    // Если джойстик не активен, игнорируем
    if (touchId === null) return;

    const rect = canvasRect;
    // Ищем касание с сохраненным ID
    for (let t of e.changedTouches) {
        if (t.identifier === touchId) {
            // Обновляем позицию стика
            moveJoystick(
                t.clientX - rect.left,
                t.clientY - rect.top
            );
            break;
        }
    }
}

/**
 * Обработчик окончания касания
 * Сбрасывает джойстик при отпускании пальца
 * @param {TouchEvent} e - Событие окончания касания
 */
function handleTouchEnd(e) {
    for (let t of e.changedTouches) {
        if (t.identifier === touchId) {
            // Сбрасываем джойстик
            resetJoystick();
            touchId = null;
            break;
        }
    }
}

// ===== ЛОГИКА ДЖОЙСТИКА =====
/**
 * Обновление позиции стика джойстика
 * Ограничивает движение стика радиусом джойстика
 * @param {number} x - X координата касания (в CSS-пикселях)
 * @param {number} y - Y координата касания (в CSS-пикселях)
 */
function moveJoystick(x, y) {
    const dx = x - joystick.baseX;  // Смещение по X
    const dy = y - joystick.baseY;  // Смещение по Y
    const distSq = dx * dx + dy * dy;  // Квадрат расстояния (для оптимизации)
    const r = joystick.radius;

    // Если касание за пределами радиуса, ограничиваем позицию стика
    if (distSq > r * r) {
        const dist = Math.sqrt(distSq);
        // Позиция стика на границе круга
        joystick.stickX = joystick.baseX + (dx / dist) * r;
        joystick.stickY = joystick.baseY + (dy / dist) * r;
    } else {
        // Позиция стика следует за касанием
        joystick.stickX = x;
        joystick.stickY = y;
    }

    // Вычисляем нормализованный вектор направления (от -1 до 1)
    joystick.vector.x = (joystick.stickX - joystick.baseX) / r;
    joystick.vector.y = (joystick.stickY - joystick.baseY) / r;
}

/**
 * Сброс джойстика
 * Возвращает стик в центр базы и обнуляет вектор направления
 */
function resetJoystick() {
    joystick.stickX = joystick.baseX;
    joystick.stickY = joystick.baseY;
    joystick.vector.x = 0;
    joystick.vector.y = 0;
}

// ===== ПОДКЛЮЧЕНИЕ ОБРАБОТЧИКОВ =====
// Обработчики событий касания
canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false });

// ===== БЛОКИРОВКА ЗУМА =====
// Предотвращаем масштабирование при жестах двумя пальцами
canvas.addEventListener("touchstart", e => {
    if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchmove", e => {
    if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

// Блокируем жестовые события (для старых браузеров)
canvas.addEventListener("gesturestart", e => e.preventDefault(), { passive: false });
canvas.addEventListener("gesturechange", e => e.preventDefault(), { passive: false });
canvas.addEventListener("gestureend", e => e.preventDefault(), { passive: false });
