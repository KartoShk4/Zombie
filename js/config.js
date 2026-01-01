// ======== Конфигурация игры ========
const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 3000;

const config = {
    player: {
        width: 50,
        height: 50,
        speed: 5,
        health: 100,
    },
    bullet: {
        radius: 3,
        speed: 10,
        damage: 1
    },
    zombie: {
        width: 30,
        height: 30,
        speed: 0.4,
        health: 50, // урон зомби hitCooldown: 0.5
        damage: 5, // задержка между ударами (секунды)
        hitCooldown: 1.0
    },
    wave: {
        baseZombies: 5
    }
};
