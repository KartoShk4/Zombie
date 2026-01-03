/* ============================================
   УПРАВЛЕНИЕ МЕНЮ
   ============================================
   Функции для управления различными меню игры:
   главное меню, настройки, рейтинг, достижения,
   магазин и другие экраны.
   ============================================ */

// ===== УПРАВЛЕНИЕ НОВОЙ ИГРОЙ =====
/**
 * Флаг для отслеживания подтверждения новой игры
 * Предотвращает случайное начало новой игры при наличии сохранения
 */
let newGameConfirmed = false;

/**
 * Подтверждение начала новой игры
 * Вызывается при нажатии кнопки "Да" в предупреждении о новой игре
 */
function confirmNewGame() {
    newGameConfirmed = true;
    document.getElementById("new-game-warning").classList.add("hidden");
    startGame(false);
}

/**
 * Отмена начала новой игры
 * Вызывается при нажатии кнопки "Отмена" в предупреждении о новой игре
 */
function cancelNewGame() {
    newGameConfirmed = false;
    document.getElementById("new-game-warning").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
}

/**
 * Запуск игры - скрывает меню и инициализирует игру
 * @param {boolean} loadFromSave - Загружать ли из сохранения
 */
function startGame(loadFromSave = false) {
    if (!loadFromSave && typeof hasSave === 'function' && hasSave() && !newGameConfirmed) {
        document.getElementById("main-menu").classList.add("hidden");
        document.getElementById("new-game-warning").classList.remove("hidden");
        return;
    }

    newGameConfirmed = false;
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("new-game-warning").classList.add("hidden");
    canvas.classList.add("game-active");
    gameStarted = true;
    isPaused = false;

    if (loadFromSave) {
        const saveData = loadGame();
        if (saveData) {
            restoreGame(saveData);
            if (typeof getRankByScore === 'function' && typeof score !== 'undefined') {
                const currentRank = getRankByScore(score);
                lastRankScore = currentRank.minScore;
            }
        }
        if (typeof applyUpgrades === 'function') applyUpgrades();
    } else {
        deleteSave(); // удаляем только временное сохранение

        document.getElementById("continue-btn").style.display = "none";

        wave = 1;
        score = 0;
        zombiesKilled = 0;
        isWaveActive = false;
        isWaveCooldown = false;
        waveTimer = 0;
        rankDisplayTime = 0;
        currentDisplayRank = null;
        achievementDisplayTime = 0;
        currentDisplayAchievement = null;
        pendingAchievements = [];
        upgradeNotificationTime = 0;
        lastUpgradeCheckTime = 0;
        coinSpawnTimer = 5 + Math.random() * 5;
        buffSpawnTimer = 8 + Math.random() * 7;
        lastRankScore = typeof getRankByScore === 'function' ? getRankByScore(0).minScore : 0;

        zombies = [];
        bullets = [];
        footprints = [];
        blood = [];
        if (typeof hearts !== 'undefined') hearts = [];
        if (typeof coins !== 'undefined') coins = [];
        if (typeof buffs !== 'undefined') buffs = [];

        if (typeof nextZombieId !== 'undefined') nextZombieId = 1;

        player.x = WORLD_WIDTH / 2;
        player.y = WORLD_HEIGHT / 2;
        playerHitCooldown = 0;

        applyDifficultyToPlayer();
        if (typeof applyUpgrades === 'function') applyUpgrades();

        buffSpawnTimer = 15 + Math.random() * 10;
        upgradeNotificationShownThisWave = false;

        if (typeof generateObstacles === 'function') generateObstacles();

        setTimeout(() => {
            if (typeof spawnWave === 'function') spawnWave(wave);
        }, 100);
    }

    const cssW = canvas.clientWidth || window.innerWidth;
    const cssH = canvas.clientHeight || window.innerHeight;
    camera.x = Math.max(0, Math.min(player.x - cssW / 2, WORLD_WIDTH - cssW));
    camera.y = Math.max(0, Math.min(player.y - cssH / 2, WORLD_HEIGHT - cssH));
}

// ===== УПРАВЛЕНИЕ НАСТРОЙКАМИ =====
/**
 * Открытие меню настроек
 */
function openSettings() {
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("settings-menu").classList.remove("hidden");
    updateDifficultyUI();
}

/**
 * Выбор уровня сложности
 * @param {string} difficulty - 'easy', 'normal' или 'hard'
 */
function selectDifficulty(difficulty) {
    setDifficulty(difficulty);
    updateDifficultyUI();
}

/**
 * Обновление UI выбора сложности
 * Обновляет визуальное отображение выбранной сложности в меню настроек
 */
function updateDifficultyUI() {
    const current = getDifficulty();
    
    // Скрываем все галочки
    document.getElementById("difficulty-easy-check").style.opacity = "0";
    document.getElementById("difficulty-normal-check").style.opacity = "0";
    document.getElementById("difficulty-hard-check").style.opacity = "0";
    
    // Показываем галочку для выбранной сложности
    document.getElementById(`difficulty-${current}-check`).style.opacity = "1";
    
    // Обновляем стили кнопок
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        if (btn.dataset.difficulty === current) {
            btn.style.background = "#444";
            btn.style.borderColor = "#ff4444";
        } else {
            btn.style.background = "#222";
            btn.style.borderColor = "#555";
        }
    });
    
    // Обновляем никнейм в настройках
    if (typeof getNickname === 'function') {
        const nicknameInput = document.getElementById("settings-nickname-input");
        if (nicknameInput) {
            nicknameInput.value = getNickname();
        }
    }
}

/**
 * Сохранение никнейма из настроек
 */
function saveSettingsNickname() {
    const input = document.getElementById("settings-nickname-input");
    if (input && typeof setNickname === 'function') {
        const nickname = input.value.trim();
        if (nickname) {
            setNickname(nickname);
            if (typeof updateGreeting === 'function') {
                updateGreeting();
            }
            alert("Никнейм сохранен!");
        } else {
            alert("Введите никнейм!");
        }
    }
}

/**
 * Закрытие меню настроек
 */
function closeSettings() {
    document.getElementById("settings-menu").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
}

// ===== УПРАВЛЕНИЕ НАСТРОЙКАМИ ГРАФИКИ =====
/**
 * Открытие меню настроек графики
 */
function openGraphicsSettings() {
    document.getElementById("settings-menu").classList.add("hidden");
    document.getElementById("graphics-settings-menu").classList.remove("hidden");
    updateGraphicsUI();
}

/**
 * Закрытие меню настроек графики
 */
function closeGraphicsSettings() {
    document.getElementById("graphics-settings-menu").classList.add("hidden");
    document.getElementById("settings-menu").classList.remove("hidden");
}

/**
 * Выбор уровня качества графики
 * @param {string} quality - 'low', 'medium' или 'high'
 */
function selectGraphicsQuality(quality) {
    if (typeof setGraphicsQuality === 'function') {
        setGraphicsQuality(quality);
        updateGraphicsUI();
    }
}

/**
 * Обновление UI выбора качества графики
 */
function updateGraphicsUI() {
    if (typeof getGraphicsQuality !== 'function') return;
    
    const current = getGraphicsQuality();
    
    // Скрываем все галочки
    document.getElementById("graphics-low-check").style.opacity = "0";
    document.getElementById("graphics-medium-check").style.opacity = "0";
    document.getElementById("graphics-high-check").style.opacity = "0";
    
    // Показываем галочку для выбранного качества
    document.getElementById(`graphics-${current}-check`).style.opacity = "1";
    
    // Обновляем стили кнопок
    document.querySelectorAll('.graphics-quality-btn').forEach(btn => {
        if (btn.dataset.quality === current) {
            btn.style.background = "#444";
            btn.style.borderColor = "#ff4444";
        } else {
            btn.style.background = "#222";
            btn.style.borderColor = "#555";
        }
    });
}

// ===== УПРАВЛЕНИЕ НАСТРОЙКАМИ ЗВУКА =====
/**
 * Открытие меню настроек звука
 */
function openSoundSettings() {
    document.getElementById("settings-menu").classList.add("hidden");
    document.getElementById("sound-settings-menu").classList.remove("hidden");
}

/**
 * Закрытие меню настроек звука
 */
function closeSoundSettings() {
    document.getElementById("sound-settings-menu").classList.add("hidden");
    document.getElementById("settings-menu").classList.remove("hidden");
}

// ===== УПРАВЛЕНИЕ МЕНЮ "КАК ИГРАТЬ" =====
/**
 * Открытие меню "Как играть"
 */
function openHowToPlay() {
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("howto-menu").classList.remove("hidden");
}

/**
 * Открытие меню "Справка"
 */
function openFaq() {
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("faq-menu").classList.remove("hidden");
}


/**
 * Закрытие меню "Справка"
 */
function closeFaq() {
    document.getElementById("faq-menu").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
}

/**
 * Закрытие меню "Как играть"
 */
function closeHowToPlay() {
    document.getElementById("howto-menu").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
}

// ===== УПРАВЛЕНИЕ НИКНЕЙМОМ =====
/**
 * Сохранение никнейма и переход в главное меню
 */
function saveNickname() {
    const input = document.getElementById("nickname-input");
    const nickname = input.value.trim();
    if (nickname) {
        setNickname(nickname);
        document.getElementById("nickname-menu").classList.add("hidden");
        document.getElementById("main-menu").classList.remove("hidden");
        updateGreeting();
    }
}

/**
 * Обновление приветствия в главном меню
 * Показывает никнейм игрока и его текущее звание
 */
function updateGreeting() {
    const greetingEl = document.getElementById("greeting-text");
    if (greetingEl) {
        const nickname = getNickname();
        const rank = getCurrentRank();
        greetingEl.textContent = `Привет, ${rank.name} ${nickname}!`;
        greetingEl.style.color = rank.color;
    }
}

// ===== УПРАВЛЕНИЕ РЕЙТИНГОМ =====
/**
 * Открытие меню рейтинга
 * Показывает лучший результат и информацию о системе званий
 */
function openLeaderboard() {
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("leaderboard-menu").classList.remove("hidden");
    
    const content = document.getElementById("leaderboard-content");
    const leaderboard = loadLeaderboard();
    
    // Добавляем информацию о званиях
    let html = '<div style="margin-bottom: 20px; padding: 15px; background: rgba(0, 0, 0, 0.3); border: 2px solid #555;">';
    html += '<h3 style="font-size: 14px; color: #ffd700; margin-bottom: 10px;">📜 СИСТЕМА ЗВАНИЙ</h3>';
    html += '<p style="font-size: 10px; color: #aaa; margin-bottom: 10px;">Звания получаются автоматически при достижении определенного количества очков:</p>';
    
    if (typeof ranks !== 'undefined' && ranks) {
        ranks.forEach((rank, index) => {
            const nextRank = ranks[index + 1];
            const requirement = nextRank ? `${rank.minScore} - ${nextRank.minScore - 1} очков` : `${rank.minScore}+ очков`;
            html += `<div style="margin: 5px 0; padding: 5px; background: rgba(255, 255, 255, 0.05);">
                <span style="color: ${rank.color}; font-weight: bold;">${rank.name}</span>
                <span style="color: #888; font-size: 9px;"> - ${requirement}</span>
            </div>`;
        });
    }
    
    html += '</div>';
    
    if (leaderboard.length === 0) {
        html += '<p class="text">Рейтинг пуст</p>';
    } else {
        html += '<h3 style="font-size: 14px; color: #ffd700; margin: 20px 0 10px 0;">🏆 ЛУЧШИЙ РЕЗУЛЬТАТ</h3>';
        // Показываем только лучший результат
        const bestEntry = leaderboard[0];
        html += `<div class="leaderboard-item" style="padding: 15px; background: rgba(255, 215, 0, 0.1); border: 2px solid #ffd700; margin: 10px 0;">
            <div style="font-size: 16px; color: #ffd700; margin-bottom: 10px;">🥇 ЛУЧШИЙ ИГРОК</div>
            <div style="font-size: 14px; color: ${getRankByScore(bestEntry.score).color}; margin-bottom: 5px;">
                <strong>${bestEntry.rank}</strong> ${bestEntry.nickname}
            </div>
            <div style="font-size: 12px; color: #aaa;">
                Очки: <strong style="color: #ffd700;">${bestEntry.score}</strong> | Волна: <strong style="color: #ffd700;">${bestEntry.wave}</strong>
            </div>
        </div>`;
    }
    
    content.innerHTML = html;
}

/**
 * Закрытие меню рейтинга
 */
function closeLeaderboard() {
    document.getElementById("leaderboard-menu").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
}

// ===== УПРАВЛЕНИЕ ДОСТИЖЕНИЯМИ =====
/**
 * Открытие меню достижений
 * Показывает все достижения с их статусом (разблокировано/заблокировано)
 */
function openAchievements() {
    const fromPause = isPaused;
    if (!fromPause) {
        document.getElementById("main-menu").classList.add("hidden");
    } else {
        document.getElementById("pause-menu").classList.add("hidden");
    }
    document.getElementById("achievements-menu").classList.remove("hidden");
    
    const content = document.getElementById("achievements-content");
    const unlocked = getUnlockedAchievements();
    const unlockedIds = new Set(unlocked.map(a => a.id));
    
    let html = '';
    achievements.forEach(achievement => {
        const isUnlocked = unlockedIds.has(achievement.id);
        html += `<div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}">
            <span class="achievement-icon">${achievement.icon}</span>
            <div style="font-weight: bold;">${achievement.name}</div>
            <div style="font-size: 8px; margin-top: 5px;">${achievement.desc}</div>
        </div>`;
    });
    content.innerHTML = html;
}

/**
 * Закрытие меню достижений
 */
function closeAchievements() {
    document.getElementById("achievements-menu").classList.add("hidden");
    if (isPaused) {
        document.getElementById("pause-menu").classList.remove("hidden");
    } else {
        document.getElementById("main-menu").classList.remove("hidden");
    }
}

