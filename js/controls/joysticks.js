/* ============================================
   УПРАВЛЕНИЕ ДЖОЙСТИКАМИ (TOUCH)
   ============================================
   Обработка сенсорного управления для
   мобильных устройств: один джойстик
   по центру снизу (движение и стрельба).
   ============================================ */

// ===== БАЗОВЫЕ ОБЪЕКТЫ ДЖОЙСТИКОВ =====

// Единый джойстик — движение и стрельба
// Координаты в CSS-пикселях (будут инициализированы при загрузке)
let joystick = {
    baseX: 0,       // Базовая позиция X (центр экрана) - в CSS-пикселях
    baseY: 0,       // Базовая позиция Y (снизу) - в CSS-пикселях
    stickX: 0,      // Текущая позиция стика X - в CSS-пикселях
    stickY: 0,      // Текущая позиция стика Y - в CSS-пикселях
    radius: 60,     // Радиус джойстика в CSS-пикселях
    vector: { x: 0, y: 0 }  // Нормализованный вектор направления
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
    const rect = canvas.getBoundingClientRect();
    for (let t of e.changedTouches) {
        // ЕДИНЫЙ ДЖОЙСТИК (любое касание, если джойстик свободен)
        if (touchId === null) {
            touchId = t.identifier;
            // Преобразуем координаты касания в CSS-пиксели относительно canvas
            const x = t.clientX - rect.left;
            const y = t.clientY - rect.top;
            
            // Плавающий джойстик - устанавливаем базовую позицию в место касания
            joystick.baseX = x;
            joystick.baseY = y;
            joystick.stickX = x;
            joystick.stickY = y;
            
            moveJoystick(joystick, x, y);
        }
    }
}

/**
 * Обработчик движения касания
 * @param {TouchEvent} e - Событие касания
 */
function handleTouchMove(e) {
    const rect = canvas.getBoundingClientRect();
    for (let t of e.changedTouches) {
        // Обновляем джойстик
        if (t.identifier === touchId) {
            // Преобразуем координаты касания в CSS-пиксели относительно canvas
            const x = t.clientX - rect.left;
            const y = t.clientY - rect.top;
            moveJoystick(joystick, x, y);
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
canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
canvas.addEventListener("touchend", handleTouchEnd, { passive: false });


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

