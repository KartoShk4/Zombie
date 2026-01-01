function renderHUD(ctx) {
    ctx.save();

    // Пиксельный шрифт
    ctx.font = "16px 'Press Start 2P'";
    ctx.textBaseline = "top";
    ctx.fillStyle = "white";

    // === 1. Сердце ===
    drawPixelHeart(ctx, 20, 20, 3);

    // === 2. Полоска здоровья ===
    const maxHP = config.player.health;
    const hpWidth = 120;

    // рамка
    ctx.fillStyle = "#000";
    ctx.fillRect(60, 22, hpWidth + 4, 14);

    // фон полоски
    ctx.fillStyle = "#550000";
    ctx.fillRect(62, 24, hpWidth, 10);

    // сама полоска
    ctx.fillStyle = "#ff3b3b";
    ctx.fillRect(62, 24, (player.health / maxHP) * hpWidth, 10);

    // текст HP
    ctx.fillStyle = "white";
    ctx.fillText(player.health + "/" + maxHP, 62, 40);

    // === 3. Счёт ===
    ctx.fillText("Score: " + score, canvas.width - 200, 20);

    // === 4. Волна ===
    ctx.fillText("Wave: " + wave, canvas.width - 200, 50);

    // === 5. Таймер волны ===
    if (isWaveCooldown) {
        ctx.textAlign = "center";
        ctx.font = "24px 'Press Start 2P'";
        ctx.fillText("Next wave in " + Math.ceil(waveTimer), canvas.width / 2, 80);
        ctx.textAlign = "left";
    }

    ctx.restore();
}
