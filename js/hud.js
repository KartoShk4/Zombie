function renderHUD(ctx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(18, 18, 104, 14);

    ctx.fillStyle = 'red';
    ctx.fillRect(20, 20, player.health, 10);

    ctx.fillStyle = 'white';
    ctx.font = "20px Arial";
    ctx.fillText(player.health, 20, 30);

    ctx.fillText("Wave: " + wave, canvas.width - 120, 60);

    ctx.fillStyle = 'black';
    ctx.fillText("Score: " + score, canvas.width - 120, 30);
}
