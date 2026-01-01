let bullets = [];
let score = 0;
let zombiesKilled = 0;
let zombiesPerWave = 5;

// сколько пуль в секунду можно выпускать
let fireRate = 5; // например, 5 выстрелов в секунду
let lastShotTime = 0;


function tryShootBullet(dx, dy) {
    const now = performance.now() / 1000; // время в секундах
    const timeSinceLastShot = now - lastShotTime;

    if (timeSinceLastShot < 1 / fireRate) {
        return; // ещё рано стрелять
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
        b.x += b.dx * b.speed;
        b.y += b.dy * b.speed;

        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
            continue;
        }

        for (let j = zombies.length - 1; j >= 0; j--) {
            let z = zombies[j];

            if (
                b.x > z.x - z.width / 2 &&
                b.x < z.x + z.width / 2 &&
                b.y > z.y - z.height / 2 &&
                b.y < z.y + z.height / 2
            ) {
                z.health -= config.bullet.damage;
                bullets.splice(i, 1);

                if (z.health <= 0) {
                    zombies.splice(j, 1);
                    score++;
                    zombiesKilled++;

                    if (zombies.length === 0) {
                        startWaveCooldown();
                    }
                }


                break;
            }
        }
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
