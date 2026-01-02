/* ============================================
   ОСНОВНАЯ ЛОГИКА ИГРЫ
   ============================================
   Управляет инициализацией, игровым циклом,
   рендерингом, меню и общими функциями игры.
   ============================================ */

// ===== ОПРЕДЕЛЕНИЕ ПЛАТФОРМЫ =====
// Проверка, является ли устройство мобильным
const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

// ===== СОСТОЯНИЕ ИГРЫ =====
let gameStarted = false;  // Флаг запуска игры
let isPaused = false;    // Флаг паузы
let camera = { x: 0, y: 0 };  // Позиция камеры

// ===== УПРАВЛЕНИЕ МЕНЮ =====

/**
 * Запуск игры - скрывает меню и инициализирует игру
 * @param {boolean} loadFromSave - Загружать ли из сохранения
 */
function startGame(loadFromSave = false) {
    document.getElementById("main-menu").classList.add("hidden");
    canvas.classList.add("game-active"); // Показываем canvas
    gameStarted = true;
    isPaused = false;
    
    // Если загружаем из сохранения, восстанавливаем состояние
    if (loadFromSave) {
        const saveData = loadGame();
        if (saveData) {
            restoreGame(saveData);
        }
    } else {
        // НОВАЯ ИГРА - полностью сбрасываем состояние
        // Удаляем сохранение
        deleteSave();
        
        // Скрываем кнопку "Продолжить" в главном меню
        document.getElementById("continue-btn").style.display = "none";
        
        // Сбрасываем игровые переменные
        wave = 1;
        score = 0;
        zombiesKilled = 0;
        isWaveActive = false;
        isWaveCooldown = false;
        waveTimer = 0;
        rankDisplayTime = 0;
        currentDisplayRank = null;
        if (typeof getRankByScore === 'function') {
            lastRankScore = getRankByScore(0).minScore;
        } else {
            lastRankScore = 0;
        }
        
        // Очищаем массивы
        zombies = [];
        bullets = [];
        footprints = [];
        blood = [];
        if (typeof hearts !== 'undefined') hearts = [];
        
        // Сбрасываем счетчик ID зомби
        if (typeof nextZombieId !== 'undefined') {
            nextZombieId = 1;
        }
        
        // Сбрасываем позицию игрока на центр мира
        player.x = WORLD_WIDTH / 2;
        player.y = WORLD_HEIGHT / 2;
        playerHitCooldown = 0;
        
        // Применяем сложность к игроку (только при новой игре)
        applyDifficultyToPlayer();
        
        // Запускаем первую волну
        isWaveActive = false;
        isWaveCooldown = false;
        setTimeout(() => {
            if (typeof spawnWave === 'function') {
                spawnWave(wave);
            }
        }, 100);
    }
    
    // Инициализируем камеру на игрока при старте
    const cssW = canvas.clientWidth || window.innerWidth;
    const cssH = canvas.clientHeight || window.innerHeight;
    camera.x = player.x - cssW / 2;
    camera.y = player.y - cssH / 2;
    
    // Ограничиваем камеру границами мира
    camera.x = Math.max(0, Math.min(camera.x, WORLD_WIDTH - cssW));
    camera.y = Math.max(0, Math.min(camera.y, WORLD_HEIGHT - cssH));
}

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
}

/**
 * Закрытие меню настроек
 */
function closeSettings() {
    document.getElementById("settings-menu").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
}

/**
 * Открытие меню "Как играть"
 */
function openHowToPlay() {
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("howto-menu").classList.remove("hidden");
}

/**
 * Закрытие меню "Как играть"
 */
function closeHowToPlay() {
    document.getElementById("howto-menu").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
}

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

/**
 * Открытие меню рейтинга
 */
function openLeaderboard() {
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("leaderboard-menu").classList.remove("hidden");
    
    const content = document.getElementById("leaderboard-content");
    const leaderboard = loadLeaderboard();
    
    if (leaderboard.length === 0) {
        content.innerHTML = '<p class="text">Рейтинг пуст</p>';
        return;
    }
    
    let html = '';
    leaderboard.slice(0, 20).forEach((entry, index) => {
        html += `<div class="leaderboard-item">
            <span class="leaderboard-rank">#${index + 1}</span>
            <span style="color: ${getRankByScore(entry.score).color};">${entry.rank}</span>
            ${entry.nickname} - ${entry.score} очков (Волна ${entry.wave})
        </div>`;
    });
    content.innerHTML = html;
}

/**
 * Закрытие меню рейтинга
 */
function closeLeaderboard() {
    document.getElementById("leaderboard-menu").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
}

/**
 * Открытие меню достижений
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

// ===== ИНИЦИАЛИЗАЦИЯ CANVAS =====
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Управление только через джойстики (мобильное)

// Эффекты
let muzzleFlash = 0;  // Интенсивность вспышки при выстреле

/**
 * Масштабирование canvas под DPR и установка CSS-размеров
 * Рисование происходит в CSS-пикселях
 * @param {HTMLCanvasElement} canvas - Canvas элемент
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function resizeCanvasToDisplaySize(canvas, ctx) {
    const DPR = window.devicePixelRatio || 1;
    const cssW = Math.floor(canvas.clientWidth || window.innerWidth);
    const cssH = Math.floor(canvas.clientHeight || window.innerHeight);

    // Устанавливаем bitmap размеры с учётом DPR
    canvas.width = cssW * DPR;
    canvas.height = cssH * DPR;

    // Оставляем CSS размеры как есть (чтобы элемент занимал нужное место)
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';

    // Приводим контекст к CSS‑координатам: теперь 1 единица в рисовании = 1 CSS‑пиксель
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

// Инициализация размеров canvas
resizeCanvasToDisplaySize(canvas, ctx);

// ===== ФОНОВЫЙ CANVAS =====
// Отдельный canvas для статического фона (травы, земли, камней)
let backgroundCanvas = document.createElement("canvas");
let backgroundCtx = backgroundCanvas.getContext("2d");
backgroundCanvas.width = WORLD_WIDTH;
backgroundCanvas.height = WORLD_HEIGHT;

// ===== ИГРОВЫЕ ДАННЫЕ =====
let footprints = [];  // Массив следов игрока
let zombieFootprints = [];  // Массив следов зомби

// Система волн (глобальные переменные для доступа из других модулей)
let wave = 1;                    // Текущая волна
let isWaveActive = false;        // Активна ли волна
let isWaveCooldown = false;      // Идет ли перерыв между волнами
let waveCooldownTime = 3;        // Длительность перерыва (секунды)
let waveTimer = 0;               // Таймер перерыва

// Делаем переменные глобальными для доступа из других модулей
window.isWaveActive = isWaveActive;
window.isWaveCooldown = isWaveCooldown;

// Визуальные эффекты
let lightFlicker = 1;            // Мерцание света (0.9-1.1)
let cameraShake = 0;             // Интенсивность дрожания камеры
let cameraShakePower = 8;        // Мощность дрожания камеры
let lastShotAngle = 0;           // Угол последнего выстрела
let rankDisplayTime = 0;         // Время отображения звания (0 = скрыто)
let currentDisplayRank = null;   // Текущее отображаемое звание
let lastRankScore = 0;           // Очки при последнем звании

// ===== РЕНДЕРИНГ ЭФФЕКТОВ =====

/**
 * Отрисовка следов игрока (реалистичные следы ног)
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderFootprints(ctx) {
    // Следы игрока
    footprints.forEach(f => {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation || 0);
        ctx.globalAlpha = f.alpha;
        
        const size = f.size || 8;
        
        // След ноги (овальная форма)
        ctx.fillStyle = "#2a2a2a";
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Пальцы (маленькие овалы)
        ctx.fillStyle = "#1a1a1a";
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.ellipse(i * size * 0.15, -size * 0.25, size * 0.12, size * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        f.alpha -= 0.003;  // Медленное исчезновение
    });

    // Удаляем полностью прозрачные следы игрока
    footprints = footprints.filter(f => f.alpha > 0);
    
    // Следы зомби (более темные, кровавые)
    zombieFootprints.forEach(f => {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation || 0);
        ctx.globalAlpha = f.alpha;
        
        const size = f.size || 6;
        
        // След зомби (более темный, с красноватым оттенком)
        ctx.fillStyle = "#1a0a0a";  // Очень темный красноватый
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.5, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Кровавые пятна (неправильной формы)
        ctx.fillStyle = "#3a0a0a";
        ctx.beginPath();
        ctx.ellipse(size * 0.1, size * 0.1, size * 0.15, size * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-size * 0.1, -size * 0.1, size * 0.12, size * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        f.alpha -= 0.002;  // Медленнее исчезают
    });

    // Удаляем полностью прозрачные следы зомби
    zombieFootprints = zombieFootprints.filter(f => f.alpha > 0);
}

/**
 * Отрисовка виньетки (затемнение по краям экрана)
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderVignette(ctx) {
    const cssW = canvas.clientWidth || window.innerWidth;
    const cssH = canvas.clientHeight || window.innerHeight;
    let gradient = ctx.createRadialGradient(
        cssW / 2, cssH / 2, cssW * 0.2,
        cssW / 2, cssH / 2, cssW * 0.7
    );

    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.15)");  // Уменьшена интенсивность (было 0.6)

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.restore();
}

// ===== ПРОВЕРКА ОРИЕНТАЦИИ =====

/**
 * Проверка ориентации экрана (портретная/ландшафтная)
 */
function checkOrientation() {
    const warning = document.getElementById("rotate-warning");

    const isPortrait =
        window.innerHeight > window.innerWidth ||
        (screen.orientation && screen.orientation.type.startsWith("portrait"));

    if (warning) {
        if (isPortrait) {
            warning.style.display = "flex";
            canvas.style.display = "none";
        } else {
            warning.style.display = "none";
            canvas.style.display = "block";
        }
    }
}

// Проверяем ориентацию сразу после загрузки
window.addEventListener("load", () => {
    setTimeout(checkOrientation, 50);
});

window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);

// ===== ПОЛНОЭКРАННЫЙ РЕЖИМ =====
// Удалено для мобильных устройств - используется автоматически

checkOrientation();

// ===== УПРАВЛЕНИЕ ВОЛНАМИ =====

/**
 * Запуск перерыва между волнами
 */
function startWaveCooldown() {
    isWaveActive = false;
    isWaveCooldown = true;
    waveTimer = waveCooldownTime;
}

// ===== ОБНОВЛЕНИЕ ИГРЫ =====

/**
 * Основная функция обновления игрового состояния
 * Вызывается каждый кадр
 */
function update() {
    // Обновление игровых объектов
    updatePlayer();
    updateZombies();
    updateBullets();
    if (typeof updateHearts === 'function') updateHearts();

    // Обработка перерыва между волнами
    if (isWaveCooldown) {
        waveTimer -= 1 / 60;  // Уменьшаем таймер (60 FPS)
        if (waveTimer <= 0) {
            isWaveCooldown = false;
            wave++;
            // Пересоздаем фон с новым уровнем сложности
            generateStaticBackground();
            spawnWave(wave);  // Запускаем следующую волну
        }
    }

    // Обновление кулдауна урона игроку
    if (playerHitCooldown > 0) {
        playerHitCooldown -= 1 / 60;
        if (playerHitCooldown < 0) playerHitCooldown = 0;
    }

    // Мерцание света (случайное значение)
    lightFlicker = 0.9 + Math.random() * 0.2;
    
    // Обновление вспышки выстрела
    if (muzzleFlash > 0) {
        muzzleFlash -= 0.3;
        if (muzzleFlash < 0) muzzleFlash = 0;
    }

    // === ОБНОВЛЕНИЕ КАМЕРЫ ===
    // Камера следует за игроком
    const cssW = canvas.clientWidth || window.innerWidth;
    const cssH = canvas.clientHeight || window.innerHeight;
    camera.x = player.x - cssW / 2;
    camera.y = player.y - cssH / 2;

    // Ограничиваем камеру границами мира
    camera.x = Math.max(0, Math.min(camera.x, WORLD_WIDTH - cssW));
    camera.y = Math.max(0, Math.min(camera.y, WORLD_HEIGHT - cssH));
    
    // Проверка достижений (если система доступна) - проверяем периодически
    if (typeof checkAchievements === 'function' && Math.random() < 0.02) { // Проверяем ~1% кадров
        const stats = {
            kills: zombiesKilled,
            maxWave: wave,
            totalKills: zombiesKilled,
            maxScore: score,
            perfectWaves: 0,
            totalCoins: typeof getCoins === 'function' ? getCoins() : 0,
            healed: 0,
            maxCombo: 0,
            superKills: 0,
            totalTime: 0
        };
        const newAchievements = checkAchievements(stats);
        // TODO: показать новые достижения на экране
    }
    
    // Проверка нового звания
    if (typeof getRankByScore === 'function') {
        const currentRank = getRankByScore(score);
        if (currentRank.minScore > lastRankScore) {
            // Новое звание получено
            currentDisplayRank = currentRank;
            rankDisplayTime = 3.0; // Показываем 3 секунды
            lastRankScore = currentRank.minScore;
        }
    }
    
    // Обновление времени отображения звания
    if (rankDisplayTime > 0) {
        rankDisplayTime -= 1 / 60; // Уменьшаем каждый кадр (60 FPS)
        if (rankDisplayTime <= 0) {
            rankDisplayTime = 0;
            currentDisplayRank = null;
        }
    }
}

// ===== РЕНДЕРИНГ ЭФФЕКТОВ ОКРУЖЕНИЯ =====

/**
 * Отрисовка тумана
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderFog(ctx) {
    const cssW = canvas.clientWidth || window.innerWidth;
    const cssH = canvas.clientHeight || window.innerHeight;
    ctx.save();
    ctx.fillStyle = "rgba(200, 200, 200, 0.15)";
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.restore();
}

// ===== ОСНОВНОЙ РЕНДЕРИНГ =====

/**
 * Главная функция отрисовки игры
 * Рисует все слои в правильном порядке
 */
function render() {
    // 1. Фон (первый слой) - статический фон мира
    ctx.drawImage(backgroundCanvas, -camera.x, -camera.y);

    // 2. Туман
    renderFog(ctx);

    // 3. Эффекты сцены (камера, вспышка)
    ctx.save();

    // Смещение камеры
    ctx.translate(-camera.x, -camera.y);

    // Мерцание света
    ctx.globalAlpha = lightFlicker;

    // Дрожание камеры (при уроне)
    if (cameraShake > 0) {
        const shakeX = (Math.random() - 0.5) * cameraShake;
        const shakeY = (Math.random() - 0.5) * cameraShake;
        ctx.translate(shakeX, shakeY);
        cameraShake *= 0.9;  // Затухание дрожания
    }

    // Вспышка при выстреле теперь отрисовывается на пистолете в renderPlayer

    // 4. Игровые объекты (следы, кровь, сердечки, игрок, зомби, пули)
    renderFootprints(ctx);
    renderBlood(ctx);
    if (typeof renderHearts === 'function') renderHearts(ctx);
    
    // Радиус стрельбы (белая полупрозрачная рамка)
    // Теперь рисуем в CSS-пикселях, поэтому используем обычный arc с одинаковыми радиусами
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    const shootRadius = config.bullet.maxRange;
    
    ctx.beginPath();
    ctx.arc(player.x, player.y, shootRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    renderZombies(ctx);
    renderPlayer(ctx); // Игрок рисуется после зомби, чтобы был поверх
    renderBullets(ctx);

    ctx.restore(); // Восстанавливаем трансформации

    // 5. HUD (всегда поверх всего)
    renderHUD(ctx);
    
    // 6. Индикатор паузы
    if (isPaused) {
        const cssW = canvas.clientWidth || window.innerWidth;
        const cssH = canvas.clientHeight || window.innerHeight;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, cssW, cssH);
        ctx.font = "32px 'Press Start 2P'";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("ПАУЗА", cssW / 2, cssH / 2);
        ctx.textAlign = "left";
        ctx.restore();
    }

    // 6. Джойстик (для мобильных устройств) - единый джойстик по центру снизу
    // Теперь рисуем в CSS-пикселях, поэтому используем обычный arc с одинаковыми радиусами
    const r = joystick.radius; // радиус круга в CSS-пикселях
    
    // База джойстика — круг
    ctx.fillStyle = 'rgba(116,116,116,0.3)';
    ctx.beginPath();
    ctx.arc(joystick.baseX, joystick.baseY, r, 0, Math.PI * 2);
    ctx.fill();
    
    // Стик джойстика — круг
    const stickR = r / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(joystick.stickX, joystick.stickY, stickR, 0, Math.PI * 2);
    ctx.fill();

    // 7. Виньетка (самый верхний слой)
    renderVignette(ctx);
}

// ===== ИГРОВОЙ ЦИКЛ =====

/**
 * Главный игровой цикл
 * Вызывается через requestAnimationFrame
 */
function gameLoop() {
    // Если игра не запущена, просто продолжаем цикл
    if (!gameStarted) {
        requestAnimationFrame(gameLoop);
        return;
    }

    // Обновление состояния игры
    update();

    // Автоматическая стрельба всегда активна, нацеливается на зомби по очереди
    tryShootBullet();

    // Отрисовка кадра
    render();
    
    // Продолжаем цикл
    requestAnimationFrame(gameLoop);
}

// ===== УПРАВЛЕНИЕ ИГРОЙ =====

/**
 * Обработка окончания игры
 */
function gameOver() {
    gameStarted = false;
    canvas.classList.remove("game-active"); // Скрываем canvas при game over
    
    // Сохраняем рейтинг
    if (typeof saveToLeaderboard === 'function') {
        saveToLeaderboard(score, wave);
    }
    
    // Проверяем достижения перед завершением
    if (typeof checkAchievements === 'function') {
        const stats = {
            kills: zombiesKilled,
            maxWave: wave,
            totalKills: zombiesKilled, // TODO: добавить общий счетчик убийств
            maxScore: score,
            perfectWaves: 0,
            totalCoins: typeof getCoins === 'function' ? getCoins() : 0,
            healed: 0,
            maxCombo: 0,
            superKills: 0,
            totalTime: 0
        };
        checkAchievements(stats);
    }
    
    document.getElementById("game-over").classList.remove("hidden");
    document.getElementById("final-score").innerText = "Счёт: " + score + " | Волна: " + wave;
}

/**
 * Перезапуск игры
 */
function restartGame() {
    deleteSave();
    location.reload();
}

// ===== УПРАВЛЕНИЕ ПАУЗОЙ =====

/**
 * Постановка игры на паузу
 */
function pauseGame() {
    if (!gameStarted || isPaused) return;
    
    isPaused = true;
    document.getElementById("pause-menu").classList.remove("hidden");
    saveGame(); // Автосохранение при паузе
}

/**
 * Снятие игры с паузы
 */
function resumeGame() {
    if (!isPaused) return;
    
    isPaused = false;
    document.getElementById("pause-menu").classList.add("hidden");
}

/**
 * Сохранение и выход в меню
 */
/**
 * Выход из игры без сохранения
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

// ===== ГЕНЕРАЦИЯ ФОНА =====

/**
 * Генерация статического фона (трава, земля, камни)
 * С каждой волной: меньше травы, больше земли, потом больше камня
 */
function generateStaticBackground() {
    const ctx = backgroundCtx;
    const w = backgroundCanvas.width;
    const h = backgroundCanvas.height;

    const waveLevel = Math.min(wave || 1, 15); // Ограничиваем для плавной прогрессии
    const progress = Math.min(waveLevel / 15, 1); // Нормализуем от 0 до 1 (0 = волна 1, 1 = волна 15+)
    
    // === БАЗОВЫЙ ГРАДИЕНТ (начинается с зеленого, постепенно темнеет) ===
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    
    // Начальные цвета (волна 1): зеленый, как трава
    const startR = 85;
    const startG = 110;
    const startB = 60;
    
    // Конечные цвета (поздние волны): темная земля
    const endR = 60;
    const endG = 50;
    const endB = 40;
    
    // Интерполяция между начальным и конечным цветом
    const r1 = Math.floor(startR + (endR - startR) * progress);
    const g1 = Math.floor(startG + (endG - startG) * progress);
    const b1 = Math.floor(startB + (endB - startB) * progress);
    
    const r2 = Math.floor(r1 * 0.85);
    const g2 = Math.floor(g1 * 0.85);
    const b2 = Math.floor(b1 * 0.85);
    
    grd.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
    grd.addColorStop(1, `rgb(${r2}, ${g2}, ${b2})`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // === ПЯТНА ТРАВЫ (уменьшаются с каждой волной, реалистичные) ===
    const grassCount = Math.floor(250 - (250 - 20) * progress);
    for (let i = 0; i < grassCount; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 15 + Math.random() * 25;
        const alpha = Math.max(0.02, (0.1 + Math.random() * 0.1) * (1 - progress * 0.7));

        // Градиент для травы (от светлого к темному)
        const grassGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        const grassGreen = 60 + Math.random() * 40;
        grassGrad.addColorStop(0, `rgba(${grassGreen + 30}, ${grassGreen + 50}, ${grassGreen + 10}, ${alpha * 1.5})`);
        grassGrad.addColorStop(0.6, `rgba(${grassGreen}, ${grassGreen + 30}, ${grassGreen}, ${alpha})`);
        grassGrad.addColorStop(1, `rgba(${grassGreen - 20}, ${grassGreen + 10}, ${grassGreen - 20}, ${alpha * 0.5})`);
        
        ctx.fillStyle = grassGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        
        // Дополнительные мелкие пятна для текстуры
        if (Math.random() > 0.7) {
            ctx.fillStyle = `rgba(${grassGreen + 20}, ${grassGreen + 40}, ${grassGreen + 5}, ${alpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(x + (Math.random() - 0.5) * r, y + (Math.random() - 0.5) * r, r * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // === ПЯТНА ЗЕМЛИ (увеличиваются с каждой волной, реалистичные) ===
    const dirtCount = Math.floor(80 + (350 - 80) * progress);
    for (let i = 0; i < dirtCount; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 12 + Math.random() * 25;
        const alpha = 0.06 + Math.random() * 0.08 + progress * 0.04;

        // Цвет земли темнеет с прогрессией
        const dirtR = Math.floor(75 + progress * 25);
        const dirtG = Math.floor(65 - progress * 20);
        const dirtB = Math.floor(45 - progress * 15);
        
        // Градиент для земли
        const dirtGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        dirtGrad.addColorStop(0, `rgba(${dirtR + 10}, ${dirtG + 10}, ${dirtB + 5}, ${alpha * 1.2})`);
        dirtGrad.addColorStop(0.7, `rgba(${dirtR}, ${dirtG}, ${dirtB}, ${alpha})`);
        dirtGrad.addColorStop(1, `rgba(${dirtR - 15}, ${dirtG - 15}, ${dirtB - 10}, ${alpha * 0.7})`);
        
        ctx.fillStyle = dirtGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        
        // Дополнительная текстура
        if (Math.random() > 0.6) {
            ctx.fillStyle = `rgba(${dirtR - 10}, ${dirtG - 10}, ${dirtB - 5}, ${alpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(x + (Math.random() - 0.5) * r * 0.8, y + (Math.random() - 0.5) * r * 0.8, r * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // === КРОВАВЫЕ ПЯТНА (появляются с 3+ волны) ===
    if (waveLevel >= 3) {
        const bloodCount = (waveLevel - 2) * 5;
        for (let i = 0; i < bloodCount; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const r = 10 + Math.random() * 20;

            ctx.fillStyle = `rgba(${100 + waveLevel * 5}, 0, 0, ${0.1 + Math.random() * 0.1})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // === КАМНИ (увеличиваются с каждой волной, реалистичные) ===
    const stoneCount = Math.floor(40 + (150 - 40) * progress);
    for (let i = 0; i < stoneCount; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const baseR = 5 + Math.random() * 12;
        const stoneGray = Math.floor(100 - progress * 25);

        ctx.save();
        ctx.translate(x, y);
        
        // Немного сплюснутая форма для реалистичности
        const scaleX = 1;
        const scaleY = 0.75 + Math.random() * 0.25;
        ctx.scale(scaleX, scaleY);
        const r = baseR;
        
        // Градиент для объема
        const stoneGrad = ctx.createRadialGradient(-r * 0.4, -r * 0.4, 0, 0, 0, r * 1.2);
        stoneGrad.addColorStop(0, `rgba(${stoneGray + 40}, ${stoneGray + 40}, ${stoneGray + 40}, ${0.4 + Math.random() * 0.3})`);
        stoneGrad.addColorStop(0.5, `rgba(${stoneGray}, ${stoneGray}, ${stoneGray}, ${0.3 + Math.random() * 0.2})`);
        stoneGrad.addColorStop(1, `rgba(${stoneGray - 30}, ${stoneGray - 30}, ${stoneGray - 30}, ${0.2 + Math.random() * 0.15})`);
        
        ctx.fillStyle = stoneGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.9, Math.random() * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Блик на камне
        ctx.fillStyle = `rgba(180, 180, 180, ${0.3 + Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.ellipse(-r * 0.4, -r * 0.3, r * 0.3, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Тень
        ctx.fillStyle = `rgba(${stoneGray - 40}, ${stoneGray - 40}, ${stoneGray - 40}, ${0.2 + Math.random() * 0.15})`;
        ctx.beginPath();
        ctx.ellipse(r * 0.3, r * 0.4, r * 0.4, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// ===== ОБРАБОТКА ИЗМЕНЕНИЯ РАЗМЕРА ОКНА =====

window.addEventListener('resize', () => {
    // Обновление размеров canvas с учётом DPR
    resizeCanvasToDisplaySize(canvas, ctx);

    // Пересоздаём фон
    backgroundCanvas.width = WORLD_WIDTH;
    backgroundCanvas.height = WORLD_HEIGHT;
    generateStaticBackground();

    // Центрируем игрока в центре мира
    player.x = WORLD_WIDTH / 2;
    player.y = WORLD_HEIGHT / 2;

    // Джойстик (по центру снизу) - координаты в CSS-пикселях
    const cssW = canvas.clientWidth || window.innerWidth;
    const cssH = canvas.clientHeight || window.innerHeight;
    joystick.baseX = cssW / 2;
    joystick.baseY = cssH - 120;
    joystick.stickX = joystick.baseX;
    joystick.stickY = joystick.baseY;
});

// ===== ОБРАБОТКА КЛИКА ПО КНОПКЕ ПАУЗЫ =====
// Обработка клика по кнопке паузы в HUD (для мобильных)
function checkPauseButtonClick(x, y) {
    if (!isMobile || !gameStarted || isPaused) return false;
    
    const cssW = canvas.clientWidth || window.innerWidth;
    const pauseBtnSize = 40;
    const pauseBtnX = cssW - pauseBtnSize - 20;
    const pauseBtnY = 20;
    
    if (x >= pauseBtnX - 5 && x <= pauseBtnX + pauseBtnSize + 5 &&
        y >= pauseBtnY - 5 && y <= pauseBtnY + pauseBtnSize + 5) {
        pauseGame();
        return true;
    }
    return false;
}

// Обработка клика по canvas (для кнопки паузы)
canvas.addEventListener("click", (e) => {
    if (!gameStarted) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    checkPauseButtonClick(x, y);
});

// Обработка касания (для мобильных)
canvas.addEventListener("touchend", (e) => {
    if (!gameStarted) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.changedTouches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Проверяем, не попали ли в джойстик
    const joystickDist = Math.hypot(x - joystick.baseX, y - joystick.baseY);
    
    // Если не попали в джойстик, проверяем кнопку паузы
    if (joystickDist > joystick.radius) {
        checkPauseButtonClick(x, y);
    }
});

window.onload = () => {
    // Убеждаемся, что canvas правильно масштабирован с учётом DPR
    resizeCanvasToDisplaySize(canvas, ctx);
    
    // Инициализация джойстика - координаты в CSS-пикселях
    const cssW = canvas.clientWidth || window.innerWidth;
    const cssH = canvas.clientHeight || window.innerHeight;
    joystick.baseX = cssW / 2;
    joystick.baseY = cssH - 120;
    joystick.stickX = joystick.baseX;
    joystick.stickY = joystick.baseY;
    
    // Инициализация систем пользователя (если доступны)
    if (typeof loadUserData === 'function') {
        loadUserData();
    }
    if (typeof loadAchievements === 'function') {
        loadAchievements();
    }
    
    // Проверка никнейма (если система пользователя доступна)
    if (typeof loadUserData === 'function' && typeof saveNickname === 'function') {
        const userData = loadUserData();
        if (!userData.nickname) {
            // Показываем экран ввода никнейма
            document.getElementById("nickname-menu").classList.remove("hidden");
            document.getElementById("main-menu").classList.add("hidden");
            
            // Обработчик Enter для ввода никнейма
            const nicknameInput = document.getElementById("nickname-input");
            if (nicknameInput) {
                nicknameInput.addEventListener("keypress", (e) => {
                    if (e.key === "Enter") {
                        saveNickname();
                    }
                });
                nicknameInput.focus();
            }
        } else {
            // Показываем главное меню
            document.getElementById("nickname-menu").classList.add("hidden");
            document.getElementById("main-menu").classList.remove("hidden");
            if (typeof updateGreeting === 'function') {
                updateGreeting();
            }
        }
    } else {
        // Если система пользователя недоступна, показываем главное меню
        document.getElementById("nickname-menu").classList.add("hidden");
        document.getElementById("main-menu").classList.remove("hidden");
    }
    
    // Генерация фона
    generateStaticBackground();
    
    // Загружаем сохраненную сложность
    loadDifficulty();
    
    // Обновляем UI сложности в настройках
    updateDifficultyUI();
    
    // Проверяем наличие сохранения и показываем кнопку "Продолжить"
    if (hasSave()) {
        document.getElementById("continue-btn").style.display = "block";
    }
    
    // НЕ запускаем волну здесь - это делается в startGame()
    // Запускаем игровой цикл
    gameLoop();
};

