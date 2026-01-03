/* ============================================
   ИГРОВОЙ ЦИКЛ
   ============================================
   Основной игровой цикл: обновление состояния,
   отрисовка кадра, управление временем.
   ============================================ */

// ===== ИНИЦИАЛИЗАЦИЯ CANVAS =====
/**
 * Canvas элемент для отрисовки игры
 */
const canvas = document.getElementById("canvas");

/**
 * Контекст canvas для рисования
 */
const ctx = canvas.getContext("2d");

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

// ===== ОБНОВЛЕНИЕ ИГРЫ =====
/**
 * Основная функция обновления игрового состояния
 * Вызывается каждый кадр
 * @param {number} dt - Delta time (время с последнего кадра в секундах)
 */
function update(dt = 1/60) {
    // Не обновляем игру если она на паузе
    if (isPaused) {
        return;
    }
    
    // Обновление игровых объектов (передаем delta time)
    updatePlayer(dt);
    updateZombies(dt);
    updateBullets(dt);
    if (typeof updateHearts === 'function') updateHearts(dt);
    if (typeof updateCoins === 'function') updateCoins(dt);
    if (typeof updateBuffs === 'function') updateBuffs(dt);
    
    // Обработка негативных баффов (яд, слабость и т.д.)
    if (typeof activeBuffs !== 'undefined' && typeof getBuffConfig === 'function') {
        // Обработка яда (урон со временем)
        if (typeof hasBuff === 'function' && hasBuff('poison')) {
            const poisonConfig = getBuffConfig('poison');
            if (poisonConfig && poisonConfig.damagePerSecond) {
                const poisonLevel = typeof getBuffLevel === 'function' ? getBuffLevel('poison') : 1;
                const damage = poisonConfig.damagePerSecond * poisonLevel * dt;
                if (typeof damagePlayer === 'function') {
                    damagePlayer(damage);
                }
            }
        }
    }

    // Обработка перерыва между волнами
    if (isWaveCooldown) {
        waveTimer -= dt;  // Уменьшаем таймер с учетом delta time
        if (waveTimer <= 0) {
            isWaveCooldown = false;
            wave++;
            spawnWave(wave);  // Запускаем следующую волну
        }
    }

    // Обновление кулдауна урона игроку
    if (playerHitCooldown > 0) {
        playerHitCooldown -= dt;
        if (playerHitCooldown < 0) playerHitCooldown = 0;
    }

    // Мерцание света (обновляем реже для уменьшения мигания)
    // Проверяем настройки графики
    if (typeof getGraphicsSettings === 'function') {
        const settings = getGraphicsSettings();
        if (settings.lightFlicker) {
            if (Math.random() < 0.1) { // Обновляем только в 10% случаев
                lightFlicker = 0.95 + Math.random() * 0.1; // Меньший диапазон для плавности
            }
        } else {
            lightFlicker = 1.0; // Отключаем мерцание
        }
    } else {
        // Обратная совместимость
        if (Math.random() < 0.1) {
            lightFlicker = 0.95 + Math.random() * 0.1;
        }
    }
    
    // Обновление вспышки выстрела
    if (muzzleFlash > 0) {
        muzzleFlash -= 0.3;
        if (muzzleFlash < 0) muzzleFlash = 0;
    }

    // === ОБНОВЛЕНИЕ КАМЕРЫ ===
    updateCamera();
    
    // Проверка достижений (если система доступна) - проверяем периодически
    if (typeof checkAchievements === 'function' && Math.random() < 0.02) { // Проверяем ~1% кадров
        const stats = {
            kills: zombiesKilled,
            maxWave: wave,
            totalKills: zombiesKilled,
            maxScore: score,
            perfectWaves: 0,
            totalCoins: typeof getCoins === 'function' ? getCoins() : 0, // Монетки сохраняются между играми
            healed: 0,
            maxCombo: 0,
            superKills: 0,
            totalTime: 0
        };
        const newAchievements = checkAchievements(stats);
        // Добавляем новые достижения в очередь для показа
        if (newAchievements.length > 0) {
            pendingAchievements.push(...newAchievements);
        }
    }
    
    // Проверка нового звания
    if (typeof getRankByScore === 'function') {
        const currentRank = getRankByScore(score);
        // Проверяем, получили ли мы новое звание (сравниваем по minScore)
        if (currentRank.minScore > lastRankScore) {
            // Новое звание получено
            currentDisplayRank = currentRank;
            rankDisplayTime = 3.0; // Показываем 3 секунды
            lastRankScore = currentRank.minScore;
        }
    }
    
    // Обновление времени отображения звания
    if (rankDisplayTime > 0) {
        rankDisplayTime -= dt; // Уменьшаем с учетом delta time
        if (rankDisplayTime <= 0) {
            rankDisplayTime = 0;
            currentDisplayRank = null;
        }
    }
    
    // Обновление времени отображения достижения
    if (achievementDisplayTime > 0) {
        achievementDisplayTime -= dt;
        if (achievementDisplayTime <= 0) {
            achievementDisplayTime = 0;
            currentDisplayAchievement = null;
            
            // Показываем следующее достижение из очереди, если есть
            if (pendingAchievements.length > 0) {
                currentDisplayAchievement = pendingAchievements.shift();
                achievementDisplayTime = 3.0; // Показываем 3 секунды
            }
        }
    } else if (pendingAchievements.length > 0 && currentDisplayAchievement === null) {
        // Если нет активного достижения, показываем первое из очереди
        currentDisplayAchievement = pendingAchievements.shift();
        achievementDisplayTime = 3.0; // Показываем 3 секунды
    }
    
    // Проверка доступных улучшений (каждые 2 секунды) - только во время игры, не в паузе
    if (!isPaused && gameStarted) {
        const now = performance.now() / 1000;
        if (now - lastUpgradeCheckTime > 2) {
            lastUpgradeCheckTime = now;
            if (hasAvailableUpgrades() && !upgradeNotificationShownThisWave) {
                // Показываем уведомление только если его еще нет и не показывали в этой волне
                if (upgradeNotificationTime <= 0) {
                    upgradeNotificationTime = 3.0; // Показываем 3 секунды
                    upgradeNotificationShownThisWave = true; // Помечаем, что показали в этой волне
                }
            } else {
                // Если улучшений нет, скрываем уведомление
                upgradeNotificationTime = 0;
            }
        }
        
        // Обновление времени отображения уведомления об улучшении
        if (upgradeNotificationTime > 0) {
            upgradeNotificationTime -= 1 / 60;
            if (upgradeNotificationTime <= 0) {
                upgradeNotificationTime = 0;
            }
        }
        
        // Случайный спавн монеток (каждые 10-20 секунд) - только во время игры
        coinSpawnTimer -= dt;
        if (coinSpawnTimer <= 0 && typeof spawnCoin === 'function') {
            coinSpawnTimer = 10 + Math.random() * 10; // 10-20 секунд
            
            // Спавним монетку в видимой области вокруг игрока
            const cssW = canvas.clientWidth || window.innerWidth;
            const cssH = canvas.clientHeight || window.innerHeight;
            
            // Спавним в области вокруг игрока (в пределах видимости камеры)
            const spawnRadius = Math.max(cssW, cssH) * 0.6; // Радиус спавна (в пределах видимости)
            const minDistance = 150; // Минимальное расстояние от игрока
            const maxDistance = spawnRadius; // Максимальное расстояние от игрока
            
            // Случайный угол и расстояние
            const angle = Math.random() * Math.PI * 2;
            const distance = minDistance + Math.random() * (maxDistance - minDistance);
            let x = player.x + Math.cos(angle) * distance;
            let y = player.y + Math.sin(angle) * distance;
            
            // Ограничиваем границами мира
            x = Math.max(50, Math.min(x, WORLD_WIDTH - 50));
            y = Math.max(50, Math.min(y, WORLD_HEIGHT - 50));
            
            spawnCoin(x, y);
        }
        
        // Случайный спавн баффов (каждые 15-25 секунд) - по тому же принципу, что монеты и сердца
        buffSpawnTimer -= dt;
        if (buffSpawnTimer <= 0 && typeof spawnBuff === 'function') {
            buffSpawnTimer = 15 + Math.random() * 10; // 15-25 секунд
            
            // Проверяем доступность BUFF_TYPES
            const buffTypesAvailable = typeof BUFF_TYPES !== 'undefined' || (typeof window !== 'undefined' && window.BUFF_TYPES);
            if (buffTypesAvailable) {
                // Спавним бафф в видимой области вокруг игрока (точно как монеты)
                const cssW = canvas.clientWidth || window.innerWidth;
                const cssH = canvas.clientHeight || window.innerHeight;
                
                // Спавним в области вокруг игрока (в пределах видимости камеры)
                const spawnRadius = Math.max(cssW, cssH) * 0.6; // Радиус спавна (в пределах видимости)
                const minDistance = 150; // Минимальное расстояние от игрока
                const maxDistance = spawnRadius; // Максимальное расстояние от игрока
                
                // Случайный угол и расстояние
                const angle = Math.random() * Math.PI * 2;
                const distance = minDistance + Math.random() * (maxDistance - minDistance);
                let x = player.x + Math.cos(angle) * distance;
                let y = player.y + Math.sin(angle) * distance;
                
                // Ограничиваем границами мира
                x = Math.max(50, Math.min(x, WORLD_WIDTH - 50));
                y = Math.max(50, Math.min(y, WORLD_HEIGHT - 50));
                
                // Выбираем случайный тип баффа (используем значения, а не ключи)
                const buffTypesObj = typeof BUFF_TYPES !== 'undefined' ? BUFF_TYPES : window.BUFF_TYPES;
                const buffConfigObj = typeof buffConfig !== 'undefined' ? buffConfig : window.buffConfig;
                const buffTypes = Object.values(buffTypesObj); // Используем значения, а не ключи
                if (buffTypes && buffTypes.length > 0 && buffConfigObj) {
                    // 70% шанс положительного баффа, 30% шанс негативного
                    const isNegative = Math.random() < 0.3;
                    let availableTypes = buffTypes;
                    
                    // Если нужен негативный бафф, фильтруем только негативные
                    if (isNegative) {
                        availableTypes = buffTypes.filter(type => {
                            const config = buffConfigObj[type];
                            return config && config.isNegative;
                        });
                    } else {
                        // Иначе только положительные
                        availableTypes = buffTypes.filter(type => {
                            const config = buffConfigObj[type];
                            return config && !config.isNegative;
                        });
                    }
                    
                    // Если нет доступных типов нужного вида, используем все
                    if (availableTypes.length === 0) {
                        availableTypes = buffTypes;
                    }
                    
                    const buffType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
                    spawnBuff(buffType, x, y);
                    console.log('Бафф заспавнен по таймеру:', buffType, 'в позиции', x, y);
                }
            }
        }
    }
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

    // Дрожание камеры
    applyCameraShake(ctx);

    // Вспышка при выстреле теперь отрисовывается на пистолете в renderPlayer

    // 4. Препятствия (рисуются перед игроком и зомби)
    if (typeof renderObstacles === 'function') renderObstacles(ctx);
    
    // 5. Игровые объекты (следы, кровь, сердечки, монетки, баффы, игрок, зомби, пули)
    renderFootprints(ctx);
    renderBlood(ctx);
    if (typeof renderHearts === 'function') renderHearts(ctx);
    if (typeof renderCoins === 'function') renderCoins(ctx);
    if (typeof renderBuffs === 'function') renderBuffs(ctx); // Баффы отрисовываются в мировых координатах
    
    // Радиус стрельбы (белая полупрозрачная рамка)
    // Проверяем настройки графики
    if (typeof getGraphicsSettings === 'function') {
        const settings = getGraphicsSettings();
        if (settings.shootRadius) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            const shootRadius = config.bullet.maxRange;
            
            ctx.beginPath();
            ctx.arc(player.x, player.y, shootRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    } else {
        // Обратная совместимость
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        const shootRadius = config.bullet.maxRange;
        
        ctx.beginPath();
        ctx.arc(player.x, player.y, shootRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    
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

    // 6. Джойстик (для мобильных устройств) - плавающий джойстик
    // Показываем только если джойстик активен (touchId !== null)
    if (isMobile && touchId !== null) {
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
    }

    // 7. Виньетка (самый верхний слой)
    renderVignette(ctx);
}

// ===== ИГРОВОЙ ЦИКЛ =====
/**
 * Время последнего кадра
 * Используется для расчета delta time
 */
let lastFrameTime = performance.now();

/**
 * Целевой FPS игры
 */
const TARGET_FPS = 60;

/**
 * Главный игровой цикл
 * Вызывается через requestAnimationFrame
 * @param {number} currentTime - Текущее время в миллисекундах
 */
function gameLoop(currentTime) {
    // Если игра не запущена, просто продолжаем цикл
    if (!gameStarted) {
        lastFrameTime = currentTime;
        requestAnimationFrame(gameLoop);
        return;
    }

    // Вычисляем delta time (время с последнего кадра в секундах)
    const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.1); // Ограничиваем максимум 0.1 сек
    lastFrameTime = currentTime;

    // Обновление состояния игры с учетом delta time
    update(deltaTime);

    // Автоматическая стрельба всегда активна, нацеливается на зомби по очереди
    tryShootBullet();

    // Отрисовка кадра
    render();
    
    // Продолжаем цикл
    requestAnimationFrame(gameLoop);
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

    // Джойстик - при ресайзе сбрасываем только если не активен
    // (для плавающего джойстика позиция устанавливается при касании)
    if (touchId === null) {
        const cssW = canvas.clientWidth || window.innerWidth;
        const cssH = canvas.clientHeight || window.innerHeight;
        joystick.baseX = cssW / 2;
        joystick.baseY = cssH - 120;
        joystick.stickX = joystick.baseX;
        joystick.stickY = joystick.baseY;
    }
});

// ===== ОБРАБОТКА КЛИКА ПО КНОПКЕ ПАУЗЫ =====
/**
 * Обработка клика по кнопке паузы в HUD (для мобильных)
 * @param {number} x - X координата клика в CSS-пикселях
 * @param {number} y - Y координата клика в CSS-пикселях
 * @returns {boolean} true если клик был по кнопке паузы
 */
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

// ===== ОБРАБОТКА ЗАВЕРШЕНИЯ ИГРЫ =====
/**
 * Обработка окончания игры
 * Сохраняет рейтинг, проверяет достижения и показывает экран Game Over
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
 * Удаляет сохранение и перезагружает страницу
 */
function restartGame() {
    deleteSave();
    location.reload();
}

// ===== ПРОВЕРКА ОРИЕНТАЦИИ =====
/**
 * Проверка ориентации экрана (портретная/ландшафтная)
 * Показывает предупреждение на мобильных устройствах в портретной ориентации
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

checkOrientation();

// ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ =====
window.onload = () => {
    // Убеждаемся, что canvas правильно масштабирован с учётом DPR
    resizeCanvasToDisplaySize(canvas, ctx);
    
    // Инициализация джойстика - координаты в CSS-пикселях
    // Для плавающего джойстика начальная позиция не важна, она устанавливается при касании
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
    if (typeof loadUpgrades === 'function') {
        loadUpgrades();
    }
    if (typeof applyUpgrades === 'function') {
        applyUpgrades();
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

