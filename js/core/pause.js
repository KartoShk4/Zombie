/* ============================================
   УПРАВЛЕНИЕ ПАУЗОЙ
   ============================================
   Функции для управления паузой игры:
   постановка на паузу, снятие с паузы,
   выход из игры с сохранением и без.
   ============================================ */

/**
 * Постановка игры на паузу
 * Показывает меню паузы и сохраняет игру
 */
function pauseGame() {
    if (!gameStarted || isPaused) return;
    
    isPaused = true;
    document.getElementById("pause-menu").classList.remove("hidden");
    saveGame(); // Автосохранение при паузе
}

/**
 * Снятие игры с паузы
 * Скрывает меню паузы и возобновляет игру
 */
function resumeGame() {
    if (!isPaused) return;
    
    isPaused = false;
    document.getElementById("pause-menu").classList.add("hidden");
}

/**
 * Выход из игры без сохранения
 * Скрывает меню паузы и возвращает в главное меню
 */
function quitWithoutSave() {
    // Скрываем меню паузы
    document.getElementById("pause-menu").classList.add("hidden");
    
    // Скрываем canvas
    canvas.classList.remove("game-active");
    
    // Сбрасываем флаг игры
    gameStarted = false;
    isPaused = false;
    
    // Показываем главное меню
    document.getElementById("main-menu").classList.remove("hidden");
    
    // Проверяем наличие сохранения и показываем кнопку "Продолжить", если есть
    if (hasSave()) {
        document.getElementById("continue-btn").style.display = "block";
    } else {
        document.getElementById("continue-btn").style.display = "none";
    }
    
    console.log('Выход из игры без сохранения');
}

/**
 * Сохранение и выход из игры
 * Сохраняет игру и возвращает в главное меню
 */
function saveAndQuit() {
    saveGame();
    isPaused = false;
    gameStarted = false;
    document.getElementById("pause-menu").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
    canvas.classList.remove("game-active");
    
    // Показываем кнопку "Продолжить" в главном меню, так как есть сохранение
    document.getElementById("continue-btn").style.display = "block";
}

