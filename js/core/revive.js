/* ============================================
   СИСТЕМА ВОЗРОЖДЕНИЯ
   ============================================
   Функции для управления системой возрождения:
   расчет стоимости, показ модального окна,
   подтверждение и отмена возрождения.
   ============================================ */

/**
 * Расчет стоимости возрождения на основе волны
 * Стоимость увеличивается с каждой волной
 * @returns {number} Стоимость возрождения в монетах
 */
function getReviveCost() {
    // Базовая стоимость 10 монет, увеличивается на 5 за каждую волну
    return 10 + (wave - 1) * 5;
}

/**
 * Показ модального окна возрождения
 * Вызывается при смерти игрока
 * Показывает стоимость возрождения и количество монет игрока
 */
function showReviveModal() {
    // Не останавливаем игру полностью, только ставим на паузу
    isPaused = true;
    
    const reviveCost = getReviveCost();
    const playerCoins = typeof getCoins === 'function' ? getCoins() : 0;
    const canAfford = playerCoins >= reviveCost;
    
    // Обновляем текст в модальном окне
    const reviveCostEl = document.getElementById("revive-cost");
    const reviveCoinsEl = document.getElementById("revive-player-coins");
    const reviveBtn = document.getElementById("revive-confirm-btn");
    const reviveCancelBtn = document.getElementById("revive-cancel-btn");
    
    if (reviveCostEl) reviveCostEl.textContent = reviveCost;
    if (reviveCoinsEl) reviveCoinsEl.textContent = playerCoins;
    
    // Настраиваем кнопку возрождения
    if (reviveBtn) {
        if (canAfford) {
            reviveBtn.disabled = false;
            reviveBtn.style.opacity = "1";
            reviveBtn.onclick = confirmRevive;
        } else {
            reviveBtn.disabled = true;
            reviveBtn.style.opacity = "0.5";
            reviveBtn.onclick = null;
        }
    }
    
    if (reviveCancelBtn) {
        reviveCancelBtn.onclick = cancelRevive;
    }
    
    // Показываем модальное окно
    document.getElementById("revive-modal").classList.remove("hidden");
}

/**
 * Подтверждение возрождения
 * Вызывается при нажатии кнопки "Возродиться"
 * Списывает монеты, восстанавливает здоровье и отталкивает зомби
 */
function confirmRevive() {
    const reviveCost = getReviveCost();
    const playerCoins = typeof getCoins === 'function' ? getCoins() : 0;
    
    if (playerCoins >= reviveCost) {
        // Списываем монеты
        if (typeof addCoins === 'function') {
            addCoins(-reviveCost);
        }
        
        // Возрождаем игрока
        player.health = player.maxHealth || config.player.health;
        playerHitCooldown = 0;
        
        // Отталкиваем всех зомби от игрока
        for (let z of zombies) {
            const dx = z.x - player.x;
            const dy = z.y - player.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 0) {
                const pushDistance = 100; // Отталкиваем на 100 пикселей
                z.x += (dx / dist) * pushDistance;
                z.y += (dy / dist) * pushDistance;
            }
        }
        
        // Скрываем модальное окно
        document.getElementById("revive-modal").classList.add("hidden");
        
        // Возобновляем игру
        isPaused = false;
        if (!gameStarted) {
            gameStarted = true;
        }
        canvas.classList.add("game-active");
    } else {
        // Если монет не хватает, завершаем игру
        cancelRevive();
    }
}

/**
 * Отмена возрождения - завершение игры
 * Вызывается при нажатии кнопки "Завершить игру"
 * Скрывает модальное окно и вызывает gameOver()
 */
function cancelRevive() {
    // Скрываем модальное окно возрождения
    document.getElementById("revive-modal").classList.add("hidden");
    
    // Завершаем игру
    gameOver();
}

