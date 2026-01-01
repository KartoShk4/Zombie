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
let camera = { x: 0, y: 0 };  // Позиция камеры

// ===== УПРАВЛЕНИЕ МЕНЮ =====

/**
 * Запуск игры - скрывает меню и инициализирует игру
 */
function startGame() {
    document.getElementById("main-menu").classList.add("hidden");
    canvas.classList.add("game-active"); // Показываем canvas
    gameStarted = true;
    
    // Инициализируем камеру на игрока при старте
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;
    
    // Ограничиваем камеру границами мира
    camera.x = Math.max(0, Math.min(camera.x, WORLD_WIDTH - canvas.width));
    camera.y = Math.max(0, Math.min(camera.y, WORLD_HEIGHT - canvas.height));
}

/**
 * Открытие меню настроек
 */
function openSettings() {
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("settings-menu").classList.remove("hidden");
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

// ===== ИНИЦИАЛИЗАЦИЯ CANVAS =====
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Глобальные переменные управления (страховка, если input.js загрузится позже)
let isMouseDown = false;
let mouseAim = {x: 0, y: 0};

// Эффекты
let muzzleFlash = 0;  // Интенсивность вспышки при выстреле

// Установка размеров canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== ФОНОВЫЙ CANVAS =====
// Отдельный canvas для статического фона (травы, земли, камней)
let backgroundCanvas = document.createElement("canvas");
let backgroundCtx = backgroundCanvas.getContext("2d");
backgroundCanvas.width = WORLD_WIDTH;
backgroundCanvas.height = WORLD_HEIGHT;

// ===== ИГРОВЫЕ ДАННЫЕ =====
let footprints = [];  // Массив следов игрока

// Система волн
let wave = 1;                    // Текущая волна
let isWaveActive = false;        // Активна ли волна
let isWaveCooldown = false;      // Идет ли перерыв между волнами
let waveCooldownTime = 3;        // Длительность перерыва (секунды)
let waveTimer = 0;               // Таймер перерыва

// Визуальные эффекты
let lightFlicker = 1;            // Мерцание света (0.9-1.1)
let cameraShake = 0;             // Интенсивность дрожания камеры
let cameraShakePower = 8;        // Мощность дрожания камеры
let lastShotAngle = 0;           // Угол последнего выстрела

// ===== РЕНДЕРИНГ ЭФФЕКТОВ =====

/**
 * Отрисовка следов игрока (реалистичные следы ног)
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderFootprints(ctx) {
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

    // Удаляем полностью прозрачные следы
    footprints = footprints.filter(f => f.alpha > 0);
}

/**
 * Отрисовка виньетки (затемнение по краям экрана)
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderVignette(ctx) {
    let gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.2,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );

    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.6)");

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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

/**
 * Запрос полноэкранного режима
 */
function requestFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.warn("Fullscreen blocked by browser:", err);
        });
    }
}

window.addEventListener("click", requestFullscreen, {once: true});

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

    // Обработка перерыва между волнами
    if (isWaveCooldown) {
        waveTimer -= 1 / 60;  // Уменьшаем таймер (60 FPS)
        if (waveTimer <= 0) {
            isWaveCooldown = false;
            wave++;
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

    // === ОБНОВЛЕНИЕ КАМЕРЫ ===
    // Камера следует за игроком
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;

    // Ограничиваем камеру границами мира
    camera.x = Math.max(0, Math.min(camera.x, WORLD_WIDTH - canvas.width));
    camera.y = Math.max(0, Math.min(camera.y, WORLD_HEIGHT - canvas.height));
}

// ===== РЕНДЕРИНГ ЭФФЕКТОВ ОКРУЖЕНИЯ =====

/**
 * Отрисовка тумана
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderFog(ctx) {
    ctx.save();
    ctx.fillStyle = "rgba(200, 200, 200, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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

    // Вспышка при выстреле
    if (muzzleFlash > 0) {
        ctx.save();

        ctx.translate(player.x, player.y);
        ctx.rotate(lastShotAngle);

        ctx.globalAlpha = muzzleFlash / 3;

        // Отрисовка вспышки (желтые прямоугольники)
        ctx.fillStyle = "#ffe066";
        ctx.fillRect(25, -4, 16, 8);

        ctx.fillStyle = "#ffea99";
        ctx.fillRect(35, -2, 10, 4);

        ctx.fillStyle = "#ffd42a";
        ctx.fillRect(20, -6, 8, 12);

        ctx.restore();

        muzzleFlash -= 0.3;  // Уменьшение интенсивности
    }

    // 4. Игровые объекты (следы, кровь, игрок, зомби, пули)
    renderFootprints(ctx);
    renderBlood(ctx);
    renderPlayer(ctx);
    renderZombies(ctx);
    renderBullets(ctx);

    ctx.restore(); // Восстанавливаем трансформации

    // 5. HUD (всегда поверх всего)
    renderHUD(ctx);

    // 6. Джойстики (для мобильных устройств)
    // Левый джойстик (движение)
    ctx.fillStyle = 'rgba(116,116,116,0.3)';
    ctx.beginPath();
    ctx.arc(joystick.baseX, joystick.baseY, joystick.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(joystick.stickX, joystick.stickY, joystick.radius / 2, 0, Math.PI * 2);
    ctx.fill();

    // Правый джойстик (прицел)
    ctx.fillStyle = 'rgba(116,116,116,0.3)';
    ctx.beginPath();
    ctx.arc(aimJoystick.baseX, aimJoystick.baseY, aimJoystick.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(aimJoystick.stickX, aimJoystick.stickY, aimJoystick.radius / 2, 0, Math.PI * 2);
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

    // Стрельба мышью — автоогонь, но с ограниченным темпом
    if (isMouseDown) {
        tryShootBullet(mouseAim.x - player.x, mouseAim.y - player.y);
    }

    // Стрельба джойстиком прицела
    if (aimJoystick.vector.x !== 0 || aimJoystick.vector.y !== 0) {
        tryShootBullet(aimJoystick.vector.x, aimJoystick.vector.y);
    }

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
    document.getElementById("game-over").classList.remove("hidden");
    document.getElementById("final-score").innerText = "Счёт: " + score;
}

/**
 * Перезапуск игры
 */
function restartGame() {
    location.reload();
}

// ===== ГЕНЕРАЦИЯ ФОНА =====

/**
 * Генерация статического фона (трава, земля, камни)
 */
function generateStaticBackground() {
    const ctx = backgroundCtx;
    const w = backgroundCanvas.width;
    const h = backgroundCanvas.height;

    // === БАЗОВЫЙ ГРАДИЕНТ ЗЕМЛИ ===
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#5c8a3e");  // Светло-зеленый сверху
    grd.addColorStop(1, "#4f6b32");  // Темно-зеленый снизу
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // === МЯГКИЕ ПЯТНА ТРАВЫ ===
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 20 + Math.random() * 40;

        ctx.fillStyle = `rgba(80, 120, 50, ${0.05 + Math.random() * 0.05})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // === ПЯТНА ЗЕМЛИ ===
    for (let i = 0; i < 150; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 15 + Math.random() * 30;

        ctx.fillStyle = `rgba(90, 70, 40, ${0.05 + Math.random() * 0.05})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // === КАМНИ ===
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 6 + Math.random() * 10;

        // Основной камень
        ctx.fillStyle = `rgba(120, 120, 120, ${0.2 + Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // Блик на камне
        ctx.fillStyle = `rgba(200, 200, 200, 0.2)`;
        ctx.beginPath();
        ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ===== ОБРАБОТКА ИЗМЕНЕНИЯ РАЗМЕРА ОКНА =====

window.addEventListener('resize', () => {
    // Обновление размеров canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Пересоздаём фон
    backgroundCanvas.width = WORLD_WIDTH;
    backgroundCanvas.height = WORLD_HEIGHT;
    generateStaticBackground();

    // Центрируем игрока в центре мира
    player.x = WORLD_WIDTH / 2;
    player.y = WORLD_HEIGHT / 2;

    // Левый джойстик (движение)
    joystick.baseX = 120;
    joystick.baseY = canvas.height - 120;
    joystick.stickX = joystick.baseX;
    joystick.stickY = joystick.baseY;

    // Правый джойстик (прицел)
    aimJoystick.baseX = canvas.width - 120;
    aimJoystick.baseY = canvas.height - 120;
    aimJoystick.stickX = aimJoystick.baseX;
    aimJoystick.stickY = aimJoystick.baseY;
});

// ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ =====

window.onload = () => {
    // Генерация фона
    generateStaticBackground();
    
    // Сбрасываем флаги волны перед первым спавном
    isWaveActive = false;
    isWaveCooldown = false;
    
    // Запускаем первую волну
    spawnWave(wave);
    
    // Запускаем игровой цикл
    gameLoop();
};

