/* ============================================
   ПРЕПЯТСТВИЯ И ОБЪЕКТЫ МИРА
   ============================================
   Управление препятствиями: камни, земля,
   кусты, деревья и дорожки.
   ============================================ */

// ===== ДАННЫЕ ПРЕПЯТСТВИЙ =====
let obstacles = [];  // Массив всех препятствий
let totalZombiesSpawned = 0;  // Общее количество заспавненных зомби

// ===== ТИПЫ ПРЕПЯТСТВИЙ =====
const OBSTACLE_TYPES = {
    STONE: 'stone',      // Камень (проходимый)
    DIRT: 'dirt',        // Земля (проходимая)
    BUSH: 'bush',        // Куст (проходимый)
    TREE: 'tree',        // Дерево (непроходимое)
    PATH: 'path'         // Дорожка (проходимая)
};

/**
 * Генерация препятствий для мира
 */
function generateObstacles() {
    obstacles = [];
    
    // Получаем размеры мира (с проверкой на доступность)
    const worldW = typeof WORLD_WIDTH !== 'undefined' ? WORLD_WIDTH : 3000;
    const worldH = typeof WORLD_HEIGHT !== 'undefined' ? WORLD_HEIGHT : 3000;
    
    // === ПИКСЕЛЬНЫЕ КАМНИ ===
    const stoneCount = 80;
    for (let i = 0; i < stoneCount; i++) {
        obstacles.push({
            type: OBSTACLE_TYPES.STONE,
            x: Math.random() * worldW,
            y: Math.random() * worldH,
            size: 8 + Math.random() * 8,  // Размер 8-16 пикселей
            color: `rgb(${80 + Math.random() * 40}, ${80 + Math.random() * 40}, ${80 + Math.random() * 40})`
        });
    }
    
    // === КВАДРАТНАЯ ЗЕМЛЯ ===
    const dirtCount = 120;
    for (let i = 0; i < dirtCount; i++) {
        const size = 20 + Math.random() * 30; // Размер 20-50 пикселей
        obstacles.push({
            type: OBSTACLE_TYPES.DIRT,
            x: Math.random() * worldW,
            y: Math.random() * worldH,
            size: size,
            color: `rgb(${60 + Math.random() * 20}, ${40 + Math.random() * 15}, ${30 + Math.random() * 10})`
        });
    }
    
    // === КУСТЫ (проходимые) ===
    const bushCount = 60;
    for (let i = 0; i < bushCount; i++) {
        const size = 15 + Math.random() * 15; // Размер 15-30 пикселей
        obstacles.push({
            type: OBSTACLE_TYPES.BUSH,
            x: Math.random() * worldW,
            y: Math.random() * worldH,
            size: size,
            color: `rgb(${20 + Math.random() * 30}, ${60 + Math.random() * 40}, ${10 + Math.random() * 20})`
        });
    }
    
    // === ДЕРЕВЬЯ (непроходимые) ===
    const treeCount = 40;
    for (let i = 0; i < treeCount; i++) {
        const size = 20 + Math.random() * 15; // Размер 20-35 пикселей
        obstacles.push({
            type: OBSTACLE_TYPES.TREE,
            x: Math.random() * worldW,
            y: Math.random() * worldH,
            size: size,
            trunkColor: `rgb(${40 + Math.random() * 20}, ${20 + Math.random() * 10}, ${10 + Math.random() * 5})`,
            leavesColor: `rgb(${10 + Math.random() * 20}, ${40 + Math.random() * 30}, ${5 + Math.random() * 15})`
        });
    }
    
    // === КАМЕННЫЕ ДОРОЖКИ ===
    const pathCount = 8; // Несколько дорожек
    for (let i = 0; i < pathCount; i++) {
        const startX = Math.random() * worldW;
        const startY = Math.random() * worldH;
        const length = 200 + Math.random() * 300; // Длина дорожки
        const angle = Math.random() * Math.PI * 2; // Направление дорожки
        const pathWidth = 15 + Math.random() * 10; // Ширина дорожки
        
        // Создаем сегменты дорожки
        const segments = Math.floor(length / 20);
        for (let j = 0; j < segments; j++) {
            const segmentX = startX + Math.cos(angle) * (j * 20);
            const segmentY = startY + Math.sin(angle) * (j * 20);
            
            // Ограничиваем границами мира
            if (segmentX >= 0 && segmentX < worldW && segmentY >= 0 && segmentY < worldH) {
                obstacles.push({
                    type: OBSTACLE_TYPES.PATH,
                    x: segmentX,
                    y: segmentY,
                    size: pathWidth,
                    color: `rgb(${100 + Math.random() * 30}, ${100 + Math.random() * 30}, ${100 + Math.random() * 30})`
                });
            }
        }
    }
}

/**
 * Проверка коллизии с препятствием
 * @param {number} x - Позиция X
 * @param {number} y - Позиция Y
 * @param {number} radius - Радиус объекта
 * @returns {boolean} true если есть коллизия с непроходимым препятствием
 */
function checkObstacleCollision(x, y, radius) {
    for (let obstacle of obstacles) {
        // Только деревья непроходимые
        if (obstacle.type === OBSTACLE_TYPES.TREE) {
            const dist = Math.hypot(x - obstacle.x, y - obstacle.y);
            if (dist < (obstacle.size / 2) + radius) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Отрисовка препятствий
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 */
function renderObstacles(ctx) {
    for (let obstacle of obstacles) {
        ctx.save();
        ctx.translate(obstacle.x, obstacle.y);
        
        switch (obstacle.type) {
            case OBSTACLE_TYPES.STONE:
                // Пиксельный камень (квадрат)
                ctx.fillStyle = obstacle.color;
                const stoneSize = Math.floor(obstacle.size);
                ctx.fillRect(-stoneSize/2, -stoneSize/2, stoneSize, stoneSize);
                // Тень
                ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
                ctx.fillRect(stoneSize/2 - 2, -stoneSize/2 + 2, 2, stoneSize);
                break;
                
            case OBSTACLE_TYPES.DIRT:
                // Квадратная земля
                ctx.fillStyle = obstacle.color;
                const dirtSize = Math.floor(obstacle.size);
                ctx.fillRect(-dirtSize/2, -dirtSize/2, dirtSize, dirtSize);
                // Текстура (более темные пиксели)
                ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                for (let i = 0; i < 3; i++) {
                    const px = (Math.random() - 0.5) * dirtSize * 0.6;
                    const py = (Math.random() - 0.5) * dirtSize * 0.6;
                    ctx.fillRect(px - 1, py - 1, 2, 2);
                }
                break;
                
            case OBSTACLE_TYPES.BUSH:
                // Пиксельный куст (квадрат с текстурой)
                ctx.fillStyle = obstacle.color;
                const bushSize = Math.floor(obstacle.size);
                ctx.fillRect(-bushSize/2, -bushSize/2, bushSize, bushSize);
                // Текстура листьев
                ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
                for (let i = 0; i < 4; i++) {
                    const px = (Math.random() - 0.5) * bushSize * 0.7;
                    const py = (Math.random() - 0.5) * bushSize * 0.7;
                    ctx.fillRect(px - 1, py - 1, 2, 2);
                }
                break;
                
            case OBSTACLE_TYPES.TREE:
                // Пиксельное дерево (ствол + крона)
                const treeSize = Math.floor(obstacle.size);
                const trunkSize = treeSize * 0.3;
                const leavesSize = treeSize * 0.8;
                
                // Крона (верх)
                ctx.fillStyle = obstacle.leavesColor;
                ctx.fillRect(-leavesSize/2, -leavesSize/2 - trunkSize/2, leavesSize, leavesSize);
                
                // Ствол (низ)
                ctx.fillStyle = obstacle.trunkColor;
                ctx.fillRect(-trunkSize/2, trunkSize/2, trunkSize, trunkSize * 1.5);
                
                // Тень от дерева
                ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                ctx.fillRect(-leavesSize/2, trunkSize * 1.8, leavesSize, trunkSize * 0.5);
                break;
                
            case OBSTACLE_TYPES.PATH:
                // Каменная дорожка (квадрат)
                ctx.fillStyle = obstacle.color;
                const pathSize = Math.floor(obstacle.size);
                ctx.fillRect(-pathSize/2, -pathSize/2, pathSize, pathSize);
                // Текстура камней
                ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
                ctx.fillRect(-pathSize/2, -pathSize/2, pathSize, 1); // Верхняя линия
                ctx.fillRect(-pathSize/2, pathSize/2 - 1, pathSize, 1); // Нижняя линия
                break;
        }
        
        ctx.restore();
    }
}

