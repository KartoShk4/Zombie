/* ============================================
   УПРАВЛЕНИЕ КЛАВИАТУРОЙ
   ============================================
   Обработка нажатий клавиш для управления
   игроком (WASD и стрелки).
   ============================================ */

// ===== СОСТОЯНИЕ КЛАВИШ =====
// Объект для отслеживания нажатых клавиш
let keys = {
    w: false,          // Вверх
    a: false,          // Влево
    s: false,          // Вниз
    d: false,          // Вправо
    ArrowUp: false,    // Стрелка вверх
    ArrowDown: false,  // Стрелка вниз
    ArrowLeft: false,  // Стрелка влево
    ArrowRight: false  // Стрелка вправо
};

// ===== ОБРАБОТКА НАЖАТИЙ КЛАВИШ =====

/**
 * Обработчик нажатия клавиши
 */
window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();

    // WASD управление
    if (k === "w") keys.w = true;
    if (k === "a") keys.a = true;
    if (k === "s") keys.s = true;
    if (k === "d") keys.d = true;

    // Стрелки
    if (e.key === "ArrowUp") keys.ArrowUp = true;
    if (e.key === "ArrowDown") keys.ArrowDown = true;
    if (e.key === "ArrowLeft") keys.ArrowLeft = true;
    if (e.key === "ArrowRight") keys.ArrowRight = true;
});

/**
 * Обработчик отпускания клавиши
 */
window.addEventListener('keyup', e => {
    const k = e.key.toLowerCase();

    // WASD управление
    if (k === "w") keys.w = false;
    if (k === "a") keys.a = false;
    if (k === "s") keys.s = false;
    if (k === "d") keys.d = false;

    // Стрелки
    if (e.key === "ArrowUp") keys.ArrowUp = false;
    if (e.key === "ArrowDown") keys.ArrowDown = false;
    if (e.key === "ArrowLeft") keys.ArrowLeft = false;
    if (e.key === "ArrowRight") keys.ArrowRight = false;
});

