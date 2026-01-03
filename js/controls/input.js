/* ============================================
   INPUT — ОПТИМИЗИРОВАННАЯ ВЕРСИЯ
   ============================================ */

let keys = {
    p: false,
    Escape: false
};

window.addEventListener("keydown", e => {
    const k = e.key;

    if (k === "p" || k === "P" || k === "Escape") {
        if (gameStarted) {
            if (!isPaused) pauseGame();
            else resumeGame();
        }

        keys.p = true;
        keys.Escape = true;
        e.preventDefault();
    }
});

window.addEventListener("keyup", e => {
    if (e.key === "p" || e.key === "P") keys.p = false;
    if (e.key === "Escape") keys.Escape = false;
});
