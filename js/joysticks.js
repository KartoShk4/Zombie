// ======== Touch управление джойстиками ========

// ======== БАЗОВЫЕ ОБЪЕКТЫ ДЖОЙСТИКОВ ========

// Левый джойстик — движение
let joystick = {
    baseX: 100,
    baseY: window.innerHeight - 100,
    stickX: 100,
    stickY: window.innerHeight - 100,
    radius: 60,
    vector: { x: 0, y: 0 }
};

// Правый джойстик — прицел
let aimJoystick = {
    baseX: window.innerWidth - 100,
    baseY: window.innerHeight - 100,
    stickX: window.innerWidth - 100,
    stickY: window.innerHeight - 100,
    radius: 60,
    vector: { x: 0, y: 0 }
};


// активные пальцы
let leftTouchId = null;
let rightTouchId = null;

function handleTouchStart(e) {
    for (let t of e.changedTouches) {
        // ЛЕВЫЙ ДЖОЙСТИК
        if (t.clientX < window.innerWidth / 2 && leftTouchId === null) {
            leftTouchId = t.identifier;
            moveJoystick(joystick, t.clientX, t.clientY);
        }

        // ПРАВЫЙ ДЖОЙСТИК
        if (t.clientX > window.innerWidth / 2 && rightTouchId === null) {
            rightTouchId = t.identifier;
            moveJoystick(aimJoystick, t.clientX, t.clientY);
        }
    }
}

function handleTouchMove(e) {
    for (let t of e.changedTouches) {
        if (t.identifier === leftTouchId) {
            moveJoystick(joystick, t.clientX, t.clientY);
        }
        if (t.identifier === rightTouchId) {
            moveJoystick(aimJoystick, t.clientX, t.clientY);
        }
    }
}

function handleTouchEnd(e) {
    for (let t of e.changedTouches) {
        if (t.identifier === leftTouchId) {
            resetJoystick(joystick);
            leftTouchId = null;
        }
        if (t.identifier === rightTouchId) {
            resetJoystick(aimJoystick);
            rightTouchId = null;
        }
    }
}

function moveJoystick(js, x, y) {
    const dx = x - js.baseX;
    const dy = y - js.baseY;
    const dist = Math.hypot(dx, dy);

    if (dist > js.radius) {
        js.stickX = js.baseX + (dx / dist) * js.radius;
        js.stickY = js.baseY + (dy / dist) * js.radius;
    } else {
        js.stickX = x;
        js.stickY = y;
    }

    js.vector.x = (js.stickX - js.baseX) / js.radius;
    js.vector.y = (js.stickY - js.baseY) / js.radius;
}

function resetJoystick(js) {
    js.stickX = js.baseX;
    js.stickY = js.baseY;
    js.vector.x = 0;
    js.vector.y = 0;
}

// подключаем события
canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchmove", handleTouchMove);
canvas.addEventListener("touchend", handleTouchEnd);
canvas.addEventListener("touchcancel", handleTouchEnd);
