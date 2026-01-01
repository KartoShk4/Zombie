/* ============================================
   УПРАВЛЕНИЕ ДЖОЙСТИКАМИ (TOUCH)
   ============================================
   Обработка сенсорного управления для
   мобильных устройств: два джойстика
   (движение и прицел).
   ============================================ */

// ===== БАЗОВЫЕ ОБЪЕКТЫ ДЖОЙСТИКОВ =====

// Левый джойстик — движение
let joystick = {
    baseX: 100,                          // Базовая позиция X
    baseY: window.innerHeight - 100,    // Базовая позиция Y
    stickX: 100,                         // Текущая позиция стика X
    stickY: window.innerHeight - 100,   // Текущая позиция стика Y
    radius: 60,                          // Радиус джойстика
    vector: { x: 0, y: 0 }              // Нормализованный вектор направления
};

// Правый джойстик — прицел
let aimJoystick = {
    baseX: window.innerWidth - 100,      // Базовая позиция X
    baseY: window.innerHeight - 100,    // Базовая позиция Y
    stickX: window.innerWidth - 100,     // Текущая позиция стика X
    stickY: window.innerHeight - 100,   // Текущая позиция стика Y
    radius: 60,                          // Радиус джойстика
    vector: { x: 0, y: 0 }              // Нормализованный вектор направления
};

// ===== ОТСЛЕЖИВАНИЕ КАСАНИЙ =====
// ID активных касаний для каждого джойстика
let leftTouchId = null;   // ID касания левого джойстика
let rightTouchId = null;  // ID касания правого джойстика

// ===== ОБРАБОТКА СОБЫТИЙ КАСАНИЯ =====

/**
 * Обработчик начала касания
 * @param {TouchEvent} e - Событие касания
 */
function handleTouchStart(e) {
    for (let t of e.changedTouches) {
        // ЛЕВЫЙ ДЖОЙСТИК (левая половина экрана)
        if (t.clientX < window.innerWidth / 2 && leftTouchId === null) {
            leftTouchId = t.identifier;
            moveJoystick(joystick, t.clientX, t.clientY);
        }

        // ПРАВЫЙ ДЖОЙСТИК (правая половина экрана)
        if (t.clientX > window.innerWidth / 2 && rightTouchId === null) {
            rightTouchId = t.identifier;
            moveJoystick(aimJoystick, t.clientX, t.clientY);
        }
    }
}

/**
 * Обработчик движения касания
 * @param {TouchEvent} e - Событие касания
 */
function handleTouchMove(e) {
    for (let t of e.changedTouches) {
        // Обновляем левый джойстик
        if (t.identifier === leftTouchId) {
            moveJoystick(joystick, t.clientX, t.clientY);
        }
        // Обновляем правый джойстик
        if (t.identifier === rightTouchId) {
            moveJoystick(aimJoystick, t.clientX, t.clientY);
        }
    }
}

/**
 * Обработчик окончания касания
 * @param {TouchEvent} e - Событие касания
 */
function handleTouchEnd(e) {
    for (let t of e.changedTouches) {
        // Сбрасываем левый джойстик
        if (t.identifier === leftTouchId) {
            resetJoystick(joystick);
            leftTouchId = null;
        }
        // Сбрасываем правый джойстик
        if (t.identifier === rightTouchId) {
            resetJoystick(aimJoystick);
            rightTouchId = null;
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
canvas.addEventListener("touchcancel", handleTouchEnd);

