let bullets = [];
let score = 0;
let zombiesKilled = 0;
let zombiesPerWave = 5;

// сколько пуль в секунду можно выпускать
let fireRate = 5;
let lastShotTime = 0;


function tryShootBullet(dx, dy) {
    const now = performance.now() / 1000;
    const timeSinceLastShot = now - lastShotTime;

    if (timeSinceLastShot < 1 / fireRate) {
        return;
    }

    lastShotTime = now;
    shootBullet(dx, dy);
}


function shootBullet(dx, dy) {
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;

    bullets.push({
        x: player.x,
        y: player.y,
        radius: config.bullet.radius,
        speed: config.bullet.speed,
        dx: dx / dist,
        dy: dy / dist
    });
}


function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];

        // движение пули
        b.x += b.dx * b.speed;
        b.y += b.dy * b.speed;

        // если пуля вышла за экран — удалить
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
            continue;
        }

        // проверка попадания
        let hit = false;

        for (let j = zombies.length - 1; j >= 0; j--) {
            let z = zombies[j];

            // круглый хитбокс
            const dist = Math.hypot(b.x - z.x, b.y - z.y);

            if (dist < z.size / 2) {

                // урон
                z.health -= config.bullet.damage;

                // кровь при попадании
                blood.push({
                    x: z.x,
                    y: z.y,
                    size: Math.random() * 12 + 8,
                    alpha: 1
                });

                // удалить пулю
                bullets.splice(i, 1);
                hit = true;

                // смерть зомби
                if (z.health <= 0) {

                    // большая лужа крови
                    blood.push({
                        x: z.x,
                        y: z.y,
                        size: 20,
                        alpha: 1
                    });

                    zombies.splice(j, 1);
                    score++;
                    zombiesKilled++;

                    if (zombies.length === 0) {
                        startWaveCooldown();
                    }
                }

                break; // выходим из цикла зомби
            }
        }

        if (hit) continue; // выходим из обработки пули
    }
}


function renderBullets(ctx) {
    ctx.fillStyle = 'yellow';
    for (let b of bullets) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
