/* ============================================
   УПРАВЛЕНИЕ ДЖОЙСТИКАМИ (TOUCH)
   ============================================
   Обработка сенсорного управления для
   мобильных устройств: один джойстик
   по центру снизу (движение и стрельба).
   ============================================ */

// ===== БАЗОВЫЕ ОБЪЕКТЫ ДЖОЙСТИКОВ =====

// Единый джойстик — движение и стрельба
let joystick = {
    baseX: window.innerWidth / 2,       // Базовая позиция X (центр экрана)
    baseY: window.innerHeight - 100,    // Базовая позиция Y (снизу)
    stickX: window.innerWidth / 2,      // Текущая позиция стика X
    stickY: window.innerHeight - 100,   // Текущая позиция стика Y
    radius: 60,                          // Радиус джойстика
    vector: { x: 0, y: 0 }              // Нормализованный вектор направления
};

// ===== ОТСЛЕЖИВАНИЕ КАСАНИЙ =====
// ID активного касания джойстика
let touchId = null;   // ID касания джойстика

// ===== ОБРАБОТКА СОБЫТИЙ КАСАНИЯ =====

/**
 * Обработчик начала касания
 * @param {TouchEvent} e - Событие касания
 */
function handleTouchStart(e) {
    for (let t of e.changedTouches) {
        // ЕДИНЫЙ ДЖОЙСТИК (любое касание, если джойстик свободен)
        if (touchId === null) {
            touchId = t.identifier;
            moveJoystick(joystick, t.clientX, t.clientY);
        }
    }
}

/**
 * Обработчик движения касания
 * @param {TouchEvent} e - Событие касания
 */
function handleTouchMove(e) {
    for (let t of e.changedTouches) {
        // Обновляем джойстик
        if (t.identifier === touchId) {
            moveJoystick(joystick, t.clientX, t.clientY);
        }
    }
}

/**
 * Обработчик окончания касания
 * @param {TouchEvent} e - Событие касания
 */
function handleTouchEnd(e) {
    for (let t of e.changedTouches) {
        // Сбрасываем джойстик
        if (t.identifier === touchId) {
            resetJoystick(joystick);
            touchId = null;
        }
    }
}

// ===== УПРАВЛЕНИЕ ДЖОЙСТИКАМИ =====

/**
 * Перемещение стика джойстика
 * @param {Object} js - Объект джойстика
 * @param {number} x - Позиция X касания
 * @param {number} y - Позиция Y касания
 */
function moveJoystick(js, x, y) {
    const dx = x - js.baseX;
    const dy = y - js.baseY;
    const dist = Math.hypot(dx, dy);

    // Если касание вышло за радиус, ограничиваем позицию
    if (dist > js.radius) {
        js.stickX = js.baseX + (dx / dist) * js.radius;
        js.stickY = js.baseY + (dy / dist) * js.radius;
    } else {
        // Иначе следуем за касанием
        js.stickX = x;
        js.stickY = y;
    }

    // Вычисляем нормализованный вектор направления
    js.vector.x = (js.stickX - js.baseX) / js.radius;
    js.vector.y = (js.stickY - js.baseY) / js.radius;
}

/**
 * Сброс джойстика в исходное положение
 * @param {Object} js - Объект джойстика
 */
function resetJoystick(js) {
    js.stickX = js.baseX;
    js.stickY = js.baseY;
    js.vector.x = 0;
    js.vector.y = 0;
}

// ===== ПОДКЛЮЧЕНИЕ СОБЫТИЙ =====
// Подключаем обработчики событий к canvas
canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchmove", handleTouchMove);
canvas.addEventListener("touchend", handleTouchEnd);

// Отключаем зум двумя пальцами при управлении джойстиками
canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length > 1) {
        e.preventDefault(); // Предотвращаем зум
    }
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
    if (e.touches.length > 1) {
        e.preventDefault(); // Предотвращаем зум
    }
}, { passive: false });

canvas.addEventListener("gesturestart", (e) => {
    e.preventDefault(); // Предотвращаем жесты (зум)
}, { passive: false });

canvas.addEventListener("gesturechange", (e) => {
    e.preventDefault(); // Предотвращаем жесты (зум)
}, { passive: false });

canvas.addEventListener("gestureend", (e) => {
    e.preventDefault(); // Предотвращаем жесты (зум)
}, { passive: false });
canvas.addEventListener("touchcancel", handleTouchEnd);

