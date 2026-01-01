let bullets = [];
let score = 0;
let zombiesKilled = 0;
let zombiesPerWave = 5;

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

                    if (zombiesKilled >= zombiesPerWave) {
                        wave++;
                        zombiesKilled = 0;
                        spawnWave(wave);
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
