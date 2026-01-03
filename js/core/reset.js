function resetFullProgress() {
    if (!confirm("Вы уверены? Это удалит ВСЁ: монеты, улучшения, достижения, сохранение.")) return;

    // Удаляем сохранение
    if (typeof deleteSave === 'function') deleteSave();

    // Удаляем улучшения
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('zombie_survival_upgrades');
        localStorage.removeItem('zombie_survival_achievements');
        localStorage.removeItem('zombie_survival_user');
        localStorage.removeItem('zombie_survival_leaderboard');
    }

    // Обнуляем монеты
    if (typeof addCoins === 'function') addCoins(-getCoins());

    // Перезагрузка
    location.reload();
}

function openResetWarning() {
    document.getElementById("settings-menu").classList.add("hidden");
    document.getElementById("reset-warning").classList.remove("hidden");
}

function cancelResetProgress() {
    document.getElementById("reset-warning").classList.add("hidden");
    document.getElementById("settings-menu").classList.remove("hidden");
}

function confirmResetProgress() {
    // Удаляем всё, что относится к прогрессу
    localStorage.removeItem('zombie_survival_upgrades');
    localStorage.removeItem('zombie_survival_achievements');
    localStorage.removeItem('zombie_survival_user');
    localStorage.removeItem('zombie_survival_leaderboard');
    localStorage.removeItem('zombie_survival_save');

    // Перезагрузка игры
    location.reload();
}


