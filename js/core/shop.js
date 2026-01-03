/* ============================================
   УПРАВЛЕНИЕ МАГАЗИНОМ
   ============================================
   Функции для управления магазином улучшений:
   открытие, закрытие, покупка улучшений.
   ============================================ */

/**
 * Проверка доступных улучшений
 * Проверяет, есть ли улучшения, которые можно купить
 * @returns {boolean} true если есть доступные улучшения
 */
function hasAvailableUpgrades() {
    if (typeof getAllUpgrades === 'function' && typeof getUpgradeLevel === 'function' && typeof getUpgradeCost === 'function' && typeof getCoins === 'function') {
        const allUpgrades = getAllUpgrades();
        const coins = getCoins();
        
        for (let upgrade of allUpgrades) {
            const level = getUpgradeLevel(upgrade.id);
            const cost = getUpgradeCost(upgrade.id);
            
            if (level < upgrade.maxLevel && coins >= cost) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Открытие магазина
 * Показывает меню магазина с доступными улучшениями
 * Автоматически ставит игру на паузу при открытии
 */
function openShop() {
    // Всегда ставим игру на паузу при открытии магазина
    if (gameStarted) {
        isPaused = true;
    }
    
    if (typeof getAllUpgrades === 'function' && typeof getUpgradeLevel === 'function' && typeof getUpgradeCost === 'function') {
        const shopContent = document.getElementById("shop-content");
        const coinsDisplay = document.getElementById("shop-coins-display");
        const closeBtn = document.getElementById("shop-close-btn");
        
        if (shopContent && coinsDisplay && typeof getCoins === 'function') {
            // Обновляем количество монет
            coinsDisplay.textContent = getCoins();
            
            // Обновляем текст кнопки закрытия
            if (closeBtn) {
                if (gameStarted) {
                    closeBtn.textContent = "Продолжить игру";
                    closeBtn.onclick = closeShop;
                } else {
                    closeBtn.textContent = "Назад";
                    closeBtn.onclick = closeShopToMenu;
                }
            }
            
            // Генерируем список улучшений
            let html = '';
            const allUpgrades = getAllUpgrades();
            
            allUpgrades.forEach(upgrade => {
                // Все улучшения теперь постоянные
                const level = getUpgradeLevel(upgrade.id);
                const cost = getUpgradeCost(upgrade.id);
                const isMaxLevel = level >= upgrade.maxLevel;
                const canAfford = typeof getCoins === 'function' && getCoins() >= cost;
                
                html += `<div style="padding: 10px; margin: 5px 0; background: rgba(255, 255, 255, 0.05); border: 2px solid ${canAfford && !isMaxLevel ? '#ffd700' : '#555'};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 14px; color: #ffd700;">${upgrade.icon} ${upgrade.name}</div>
                            <div style="font-size: 10px; color: #aaa; margin-top: 5px;">${upgrade.desc}</div>
                            <div style="font-size: 9px; color: #888; margin-top: 3px;">Уровень: ${level}/${upgrade.maxLevel}</div>
                        </div>
                        <div style="text-align: right;">
                            ${isMaxLevel ? 
                                '<div style="color: #4a4; font-size: 12px;">МАКС</div>' :
                                `<div style="color: ${canAfford ? '#ffd700' : '#888'}; font-size: 12px;">${cost} 🪙</div>
                                <button class="menu-btn" onclick="buyUpgradeFromShop('${upgrade.id}')" style="width: 120px; padding: 8px; font-size: 10px; margin-top: 5px; ${canAfford ? '' : 'opacity: 0.5;'}">Купить</button>`
                            }
                        </div>
                    </div>
                </div>`;
            });
            
            shopContent.innerHTML = html;
        }
    }
    
    document.getElementById("shop-menu").classList.remove("hidden");
    // Пауза уже установлена в начале функции
}

/**
 * Закрытие магазина
 * Скрывает меню магазина и возобновляет игру (если игра была запущена)
 */
function closeShop() {
    document.getElementById("shop-menu").classList.add("hidden");
    if (gameStarted) {
        isPaused = false; // Возобновляем игру только если игра запущена
    }
}

/**
 * Покупка улучшения из магазина
 * @param {string} upgradeId - ID улучшения для покупки
 */
function buyUpgradeFromShop(upgradeId) {
    if (typeof buyUpgrade === 'function') {
        const success = buyUpgrade(upgradeId);
        if (success) {
            // Сохраняем данные пользователя после покупки
            if (typeof saveUserData === 'function') {
                saveUserData();
            }
            // Сохраняем игру после покупки
            saveGame();
            // Скрываем уведомление, так как улучшение куплено
            upgradeNotificationTime = 0;
            // Обновляем магазин
            openShop();
        } else {
            alert("Недостаточно монет или достигнут максимальный уровень!");
        }
    }
}

/**
 * Открытие магазина из главного меню
 */
function openShopFromMenu() {
    document.getElementById("main-menu").classList.add("hidden");
    openShop();
}

/**
 * Закрытие магазина с возвратом в меню (если открыт из меню)
 */
function closeShopToMenu() {
    closeShop();
    document.getElementById("main-menu").classList.remove("hidden");
}

/**
 * Запуск перерыва между волнами
 * Проверяет наличие доступных улучшений и открывает магазин, если они есть
 */
function startWaveCooldown() {
    isWaveActive = false;
    isWaveCooldown = true;
    waveTimer = waveCooldownTime;
    
    // НЕ ставим игру на паузу автоматически - только если открывается магазин
    // Пауза будет установлена в openShop() если нужно
    
    // Показываем магазин после волны только если есть доступные улучшения
    if (gameStarted) {
        setTimeout(() => {
            if (gameStarted && hasAvailableUpgrades()) {
                openShop(); // openShop() установит паузу
            }
            // Если магазин не открывается, игра продолжается без паузы
        }, 500);
    }
}
