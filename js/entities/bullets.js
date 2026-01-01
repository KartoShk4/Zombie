/* ============================================
   ПУЛИ
   ============================================
   Управление пулями: создание, движение,
   столкновения и отрисовка.
   ============================================ */

// ===== ДАННЫЕ ПУЛЬ =====
let bullets = [];           // Массив всех пуль
let score = 0;              // Счет игрока
let zombiesKilled = 0;      // Количество убитых зомби

// Примечание: muzzleFlash объявлена в main.js

// ===== СИСТЕМА СТРЕЛЬБЫ =====
let fireRate = 5;           // Количество выстрелов в секунду
let lastShotTime = 0;        // Время последнего выстрела

// ===== СОЗДАНИЕ ПУЛЬ =====

/**
 * Попытка выстрела с ограничением по темпу стрельбы
 * @param {number} dx - Направление X
 * @param {number} dy - Направление Y
 */
function tryShootBullet(dx, dy) {
    const now = performance.now() / 1000;
    const timeSinceLastShot = now - lastShotTime;

    // Проверка кулдауна стрельбы
    if (timeSinceLastShot < 1 / fireRate) {
        return;  // Слишком рано для следующего выстрела
    }

    lastShotTime = now;
    shootBullet(dx, dy);
}

/**
 * Создание пули
 * @param {number} dx - Направление X
 * @param {number} dy - Направление Y
 */
function shootBullet(dx, dy) {
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;  // Нет направления

    // Сохраняем угол выстрела для вспышки
    lastShotAngle = Math.atan2(dy, dx);

    const muzzleOffset = 30;  // Расстояние от центра игрока до дула

    // Позиция спавна пули (перед игроком)
    const spawnX = player.x + Math.cos(lastShotAngle) * muzzleOffset;
    const spawnY = player.y + Math.sin(lastShotAngle) * muzzleOffset;

    // Создаем пулю
    bullets.push({
        x: spawnX,
        y: spawnY,
        radius: config.bullet.radius,
        speed: config.bullet.speed,
        dx: dx / dist,  // Нормализованное направление X
        dy: dy / dist   // Нормализованное направление Y
    });

    // Активируем вспышку
    muzzleFlash = 3;
}

// ===== ОБНОВЛЕНИЕ ПУЛЬ =====

/**
 * Обновление всех пуль каждый кадр
 * Обрабатывает движение и столкновения
 */
function updateBullets() {
    // Проходим по всем пулям (в обратном порядке для безопасного удаления)
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];

        // Движение пули
        b.x += b.dx * b.speed;
        b.y += b.dy * b.speed;

        // Если пуля вышла за границы мира — удалить
        if (b.x < 0 || b.x > WORLD_WIDTH || b.y < 0 || b.y > WORLD_HEIGHT) {
            bullets.splice(i, 1);
            continue;
        }

        // Проверка попадания в зомби
        let hit = false;

        for (let j = zombies.length - 1; j >= 0; j--) {
            let z = zombies[j];

            // Круглый хитбокс
            const dist = Math.hypot(b.x - z.x, b.y - z.y);

            if (dist < z.size / 2) {
                // Попадание!

                // Наносим урон
                z.health -= config.bullet.damage;

                // Создаем частицу крови при попадании
                blood.push({
                    x: z.x,
                    y: z.y,
                    size: Math.random() * 12 + 8,
                    alpha: 1
                });

                // Удаляем пулю
                bullets.splice(i, 1);
                hit = true;

                // Проверка смерти зомби
                if (z.health <= 0) {
                    // Большая лужа крови при смерти
                    blood.push({
                        x: z.x,
                        y: z.y,
                        size: 20,
                        alpha: 1
                    });

                    // Удаляем зомби
                    zombies.splice(j, 1);
                    score++;
                    zombiesKilled++;

                    // Если все зомби убиты, запускаем перерыв между волнами
                    if (zombies.length === 0) {
                        startWaveCooldown();
                    }
                }

                break;  // Выходим из цикла зомби
            }
        }

        if (hit) continue;  // Пропускаем дальнейшую обработку этой пули
    }
}

// ===== ОТРИСОВКА ПУЛЬ =====

/**
 * Отрисовка всех пуль на canvas
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderBullets(ctx) {
    ctx.fillStyle = 'yellow';
    for (let b of bullets) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

