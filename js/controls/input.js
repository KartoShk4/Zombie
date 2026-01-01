/* ============================================
   УПРАВЛЕНИЕ ПАУЗОЙ
   ============================================
   Обработка клавиш для паузы игры
   (только для мобильных устройств с клавиатурой)
   ============================================ */

// ===== СОСТОЯНИЕ КЛАВИШ =====
// Объект для отслеживания клавиш паузы
let keys = {
    p: false,          // Пауза
    Escape: false      // Пауза (Escape)
};

// ===== ОБРАБОТКА НАЖАТИЙ КЛАВИШ =====

/**
 * Обработчик нажатия клавиши (только пауза)
 */
window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();

    // Пауза (P или Escape) - только для устройств с клавиатурой
    if (k === "p" || e.key === "Escape") {
        if (gameStarted && !isPaused) {
            pauseGame();
        } else if (isPaused) {
            resumeGame();
        }
        keys.p = true;
        keys.Escape = true;
        e.preventDefault();
        return;
    }
});

/**
 * Обработчик отпускания клавиши (только пауза)
 */
window.addEventListener('keyup', e => {
    const k = e.key.toLowerCase();

    // Пауза
    if (k === "p") keys.p = false;
    if (e.key === "Escape") keys.Escape = false;
});

