function drawPixelHeart(ctx, x, y, scale = 3) {
    const pixels = [
        "01100110",
        "11111111",
        "11111111",
        "01111110",
        "00111100",
        "00011000",
        "00000000"
    ];

    ctx.fillStyle = "#ff3b3b";

    for (let row = 0; row < pixels.length; row++) {
        for (let col = 0; col < pixels[row].length; col++) {
            if (pixels[row][col] === "1") {
                ctx.fillRect(
                    x + col * scale,
                    y + row * scale,
                    scale,
                    scale
                );
            }
        }
    }
}
