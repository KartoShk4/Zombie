/* ============================================
   ДЖОЙСТИК — ОПТИМИЗИРОВАННАЯ ВЕРСИЯ
   ============================================ */

let joystick = {
    baseX: 0,
    baseY: 0,
    stickX: 0,
    stickY: 0,
    radius: 60,
    vector: { x: 0, y: 0 }
};

let touchId = null;

// Кэшируем rect, чтобы не вызывать каждый раз
let canvasRect = null;
function updateCanvasRect() {
    canvasRect = canvas.getBoundingClientRect();
}
updateCanvasRect();
window.addEventListener("resize", updateCanvasRect);

// ===== TOUCH START =====
function handleTouchStart(e) {
    if (touchId !== null) return;

    const rect = canvasRect;
    for (let t of e.changedTouches) {
        touchId = t.identifier;

        const x = t.clientX - rect.left;
        const y = t.clientY - rect.top;

        joystick.baseX = x;
        joystick.baseY = y;
        joystick.stickX = x;
        joystick.stickY = y;

        moveJoystick(x, y);
        break;
    }
}

// ===== TOUCH MOVE =====
function handleTouchMove(e) {
    if (touchId === null) return;

    const rect = canvasRect;
    for (let t of e.changedTouches) {
        if (t.identifier === touchId) {
            moveJoystick(
                t.clientX - rect.left,
                t.clientY - rect.top
            );
            break;
        }
    }
}

// ===== TOUCH END =====
function handleTouchEnd(e) {
    for (let t of e.changedTouches) {
        if (t.identifier === touchId) {
            resetJoystick();
            touchId = null;
            break;
        }
    }
}

// ===== ЛОГИКА ДЖОЙСТИКА =====
function moveJoystick(x, y) {
    const dx = x - joystick.baseX;
    const dy = y - joystick.baseY;
    const distSq = dx * dx + dy * dy;
    const r = joystick.radius;

    if (distSq > r * r) {
        const dist = Math.sqrt(distSq);
        joystick.stickX = joystick.baseX + (dx / dist) * r;
        joystick.stickY = joystick.baseY + (dy / dist) * r;
    } else {
        joystick.stickX = x;
        joystick.stickY = y;
    }

    joystick.vector.x = (joystick.stickX - joystick.baseX) / r;
    joystick.vector.y = (joystick.stickY - joystick.baseY) / r;
}

function resetJoystick() {
    joystick.stickX = joystick.baseX;
    joystick.stickY = joystick.baseY;
    joystick.vector.x = 0;
    joystick.vector.y = 0;
}

// ===== ПОДКЛЮЧЕНИЕ =====
canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false });

// Блокируем зум
canvas.addEventListener("touchstart", e => {
    if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchmove", e => {
    if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

canvas.addEventListener("gesturestart", e => e.preventDefault(), { passive: false });
canvas.addEventListener("gesturechange", e => e.preventDefault(), { passive: false });
canvas.addEventListener("gestureend", e => e.preventDefault(), { passive: false });
