/**
 * Характеристики материалов ядер. Единственное место, где хранятся плотности.
 *
 * density     — плотность; масса = плотность × объём (считает Rapier)
 * restitution — упругость отскока
 * friction    — трение
 * breakForce  — сила удара, при которой ядро рассыпается (null — не ломается).
 *               Значения ориентировочные, подберите по тестам.
 * tier        — какой уровень катапульты нужен, чтобы выстрелить этим ядром
 * visual      — внешний вид (цвет, шероховатость, металличность и т.д.)
 */
export const AMMO = [
    {
        id: 1, key: "hay", label: "Солома", density: 0.2,
        restitution: 0.1, friction: 1.0, breakForce: 80, tier: 1,
        damage:5,
        visual: { color: "#d9b24c", roughness: 1, metalness: 0, bands: { count: 3, color: "#7a5a1e" } },
    },
    {
        id: 2, key: "wood", label: "Дуб", density: 0.7,
        damage:9,
        restitution: 0.3, friction: 0.7, breakForce: null, tier: 1,
        visual: { color: "#8b5a2b", roughness: 0.85, metalness: 0, bands: { count: 2, color: "#3a3d42" } },
    },
    {
        id: 3, key: "ice", label: "Лёд", density: 0.92,
        damage:12,
        restitution: 0.15, friction: 0.05, breakForce: 400, tier: 1,
        visual: { color: "#bfe6f5", roughness: 0.1, metalness: 0, flat: true, opacity: 0.8 },
    },
    {
        id: 4, key: "ground", label: "Земля", density: 1.5,
        damage:14,
        restitution: 0.05, friction: 0.9, breakForce: 300, tier: 1,
        visual: { color: "#6b4a2f", roughness: 1, metalness: 0, flat: true },
    },
    {
        id: 5, key: "brick", label: "Кирпич", density: 1.8,
        damage:16,
        restitution: 0.2, friction: 0.8, breakForce: 900, tier: 2,
        visual: { color: "#b5532f", roughness: 0.9, metalness: 0 },
    },
    {
        id: 6, key: "concrete", label: "Бетон", density: 2.4,
        damage:18,
        restitution: 0.2, friction: 0.8, breakForce: null, tier: 2,
        visual: { color: "#9a9a96", roughness: 0.95, metalness: 0 },
    },
    {
        id: 7, key: "stone", label: "Гранит", density: 2.7,
        damage:20,
        restitution: 0.25, friction: 0.7, breakForce: null, tier: 2,
        visual: { color: "#7c7f83", roughness: 0.8, metalness: 0.05, flat: true },
    },
    {
        id: 8, key: "cast_iron", label: "Чугун", density: 7.2,
        damage:22,
        restitution: 0.2, friction: 0.5, breakForce: null, tier: 3,
        visual: { color: "#2b2d31", roughness: 0.45, metalness: 0.9 },
    },
    {
        id: 9, key: "lead", label: "Свинец", density: 11.3,
        damage:24,
        restitution: 0.05, friction: 0.6, breakForce: null, tier: 3,
        visual: { color: "#6f7c8c", roughness: 0.35, metalness: 0.8 },
    },
];

// Оттенки дерева — блоки чередуют цвета, чтобы башня выглядела живее
export const WOOD = ['#a8743f', '#b9824a', '#9a6a38', '#c28d55']

export const GOBLIN_SKIN = '#6fb83f'
export const GOBLIN_DARK = '#4f8a2b'

// Высота базовой модели гоблина (до макушки), в её собственных единицах
export const GOBLIN_BASE_HEIGHT = 1.4

export const HED = [
    [0,2,-50],
    [10,2,-50],
    [-10,2,-50],
    [0,2,50],
    [10,2,50],
    [-10,2,50]
]

/** Найти материал по id (число) или ключу ("stone"). */
export function getAmmo(type) {
    const found = AMMO.find((a) => a.id === type || a.key === type);
    if (!found) throw new Error(`Неизвестный материал ядра: ${type}`);
    return found;
}

/** Масса шара: плотность × объём. */
export function ammoMass(type, radius = 0.3) {
    return getAmmo(type).density * (4 / 3) * Math.PI * radius ** 3;
}

/** Энергия удара ½·m·v². Удобна как основа урона по гоблинам и блокам. */
export function impactEnergy(mass, speed) {
    return 0.5 * mass * speed * speed;
}

// Прежний формат {id, density, name}. Строится из AMMO,
// чтобы плотности не дублировались и не расходились.
export const PROJECTILES = AMMO.map(({ id, density, key,damage }) => ({ id, density, name: key,damage:damage }));

/**
 * Уровни и выдаваемые снаряды.
 *
 * lev          — номер уровня
 * title        — короткое название
 * enemies      — сколько гоблинов нужно победить
 * armored      — сколько из них в шлемах (или король): им нужны тяжёлые ядра
 * catapultTier — какой уровень катапульты нужен (см. tier в AMMO)
 * minShots     — за сколько выстрелов уровень проходится по замыслу (проверить игрой)
 * pule         — выдаваемые снаряды, id из AMMO, в порядке выстрелов
 *
 * Правила проходимости (проверяет validateLevels):
 *  1. все id существуют, а tier ядра не выше catapultTier;
 *  2. снарядов не меньше, чем minShots + 1: остаётся запас и можно получить звезду за снаряд;
 *  3. тяжёлых ядер (плотность от HEAVY_DENSITY) не меньше, чем гоблинов в шлемах.
 */

const ENEMIES = {
    goblin:{type:"goblin",floor:1,hp:20,armor:0}
}

export const LEVEL_PROJECTILES = [
    // Мир 1. Деревня
    { lev: 1,  title: "Первая башня",
        enemies: 1,
        armored: 0,
        catapultTier: 1,
        minShots: 1,
        pule: [1,2,6,7,8],
        tower:[
            {
                id: 1,
                object:generateTower({floors:2,width:5,enemies:[{...ENEMIES.goblin,floor: 1}],barrel:[]}),
                position:[0,5,200]
            }
        ],
        wall:[],
        goblin:[],
        barrel:[]
    },
    { lev: 2,  title: "Две башни",enemies: 2, armored: 0, catapultTier: 1, minShots: 2, pule: [1,1,6,6,7,7,8,8,9],
        tower:[
            {
                id: 1,
                object:generateTower({floors:2,width:5,enemies:[{...ENEMIES.goblin,floor: 1}],barrel:[]}),
                position:[-50,5,200]
            },
            {
                id: 2,
                object:generateTower({floors:2,width:5,enemies:[{...ENEMIES.goblin,floor: 1}],barrel:[]}),
                position:[50,5,200]
            }
        ],
        wall: [],
        goblin:[],
        barrel:[]
    },
    { lev: 3,  title: "Каменная стена",    enemies: 1, armored: 0, catapultTier: 1, minShots: 2, pule: [4,4,2,3,6,7,8],
        tower:[],
        wall: [{
            id:1,
            object:generateWall({length:20,rows:5,brickLength:5,brickDepth:3,brickHeight:3}),
            position:[0,1,200]
        }],
        goblin:[{
        id:1,
        object:ENEMIES.goblin,
        position:[0,1,230],
        height:5

    }]
    },
    { lev: 4,  title: "Первая бочка",      enemies: 2, armored: 0, catapultTier: 1, minShots: 1, pule: [2,2,3,4,5,6],
        tower:[
            {
                id: 1,
                object:generateTower({floors:3,width:5,enemies:[{...ENEMIES.goblin,floor: 2}],barrel:[1]}),
                position:[0,5,200]
            }
        ],
        wall: [],
        goblin:[],
        barrel:[{
        id:1,
        position:[0,5,200]
        }]
    },
    { lev: 5,  title: "Диапазон и ежи",    enemies: 3, armored: 0, catapultTier: 1, minShots: 3, pule: [2,2,3,4,4] },
    // Мир 2. Замок
    { lev: 6,  title: "Мост через ров",    enemies: 3, armored: 0, catapultTier: 2, minShots: 2, pule: [2,2,5,5] },
    { lev: 7,  title: "Гоблин в шлеме",    enemies: 3, armored: 1, catapultTier: 2, minShots: 3, pule: [7,7,2,2,5] },
    { lev: 8,  title: "Склад за стеной",   enemies: 4, armored: 0, catapultTier: 2, minShots: 3, pule: [5,6,7,2,3] },
    { lev: 9,  title: "Цепная реакция",    enemies: 4, armored: 0, catapultTier: 2, minShots: 1, pule: [2,2,5] },
    { lev: 10, title: "Король-гоблин",     enemies: 3, armored: 1, catapultTier: 2, minShots: 4, pule: [7,7,6,6,5,2] },
    // Мир 3. Ледяные горы
    { lev: 11, title: "Скользкий лёд",     enemies: 3, armored: 0, catapultTier: 3, minShots: 3, pule: [4,4,5,2,3] },
    { lev: 12, title: "Подвешенные глыбы", enemies: 4, armored: 0, catapultTier: 3, minShots: 2, pule: [2,2,2,5] },
    { lev: 13, title: "Бочки во льду",     enemies: 4, armored: 0, catapultTier: 3, minShots: 3, pule: [7,6,5,2,2] },
    { lev: 14, title: "Три платформы",     enemies: 5, armored: 0, catapultTier: 3, minShots: 4, pule: [5,5,6,2,2,3] },
    { lev: 15, title: "Ледяной король",    enemies: 3, armored: 3, catapultTier: 3, minShots: 5, pule: [8,8,7,7,6,5,2] },
    // Мир 4. Вулкан
    { lev: 16, title: "Лавовые острова",   enemies: 4, armored: 0, catapultTier: 3, minShots: 4, pule: [6,6,5,7,2,2,4] },
    { lev: 17, title: "Топливная цепочка", enemies: 5, armored: 0, catapultTier: 3, minShots: 3, pule: [5,6,7,2,2,4] },
    { lev: 18, title: "Движущиеся платформы", enemies: 5, armored: 0, catapultTier: 3, minShots: 4, pule: [2,2,5,6,7,3,1] },
    { lev: 19, title: "Лавовый мост",      enemies: 5, armored: 2, catapultTier: 3, minShots: 4, pule: [8,8,7,6,5,2,2] },
    { lev: 20, title: "Крепость короля",   enemies: 6, armored: 3, catapultTier: 3, minShots: 7, pule: [9,9,8,8,7,6,5,2,2] },
]

// Ядро считается тяжёлым, если его плотность не меньше этого значения (гранит и тяжелее)
export const HEAVY_DENSITY = 2.7;

/**
 * Проверка данных уровней. Возвращает список проблем, пустой список значит всё в порядке.
 * Вызовите один раз при старте в режиме разработки.
 * Это проверка данных, а не игры: minShots всё равно нужно подтвердить прохождением.
 */
export function validateLevels(levels = LEVEL_PROJECTILES) {
    const problems = [];
    levels.forEach((level, index) => {
        const where = `Уровень ${level.lev}`;
        if (level.lev !== index + 1) problems.push(`${where}: номера должны идти подряд, ожидался ${index + 1}`);

        const ammo = [];
        level.pule.forEach((id) => {
            const a = AMMO.find((m) => m.id === id);
            if (!a) problems.push(`${where}: неизвестный id ядра ${id}`);
            else ammo.push(a);
        });

        ammo.filter((a) => a.tier > level.catapultTier).forEach((a) =>
            problems.push(`${where}: ядро "${a.key}" (tier ${a.tier}) требует катапульту выше ${level.catapultTier}`)
        );

        if (level.pule.length < level.minShots + 1)
            problems.push(`${where}: снарядов ${level.pule.length}, нужно не меньше ${level.minShots + 1} (minShots + запас)`);

        const heavy = ammo.filter((a) => a.density >= HEAVY_DENSITY).length;
        if (heavy < level.armored)
            problems.push(`${where}: тяжёлых ядер ${heavy}, а гоблинов в шлемах ${level.armored}`);

        if (level.armored > level.enemies)
            problems.push(`${where}: гоблинов в шлемах (${level.armored}) больше, чем всего врагов (${level.enemies})`);
    });
    return problems;
}


export const DEFAULT_SETTINGS = {
    master: 80,
    music: 60,
    effects: 100,
    shadows: 'high',
    fps: false,
    sensitivity: 50,
    aimLine: true,
}

export function routable(n) {
    return Math.PI / 180 * n;
}

const isAmmo = (v) => AMMO.some((a) => a.id === v || a.key === v);

/**
 * Материал снаряда из элемента pule. В pule может лежать просто id или ключ ("hay", 2),
 * либо объект с полем type, material, name или id. Если не найден, будет гранит.
 */
export function materialOf(el) {
    if (isAmmo(el)) return el;
    const found = [el?.type, el?.material, el?.name, el?.id].find(isAmmo);
    return found ?? "stone";
}

/**
 * Выбор следующего ядра. Переносит ядро с номером index на место, которое
 * зарядится следующим (puleStep), остальные сдвигаются, их порядок сохраняется.
 * Уже заряженные ядра (номера меньше puleStep) не трогаются.
 * Возвращает новый массив или тот же, если менять нечего.
 */
export function pickNext(pule, puleStep, index) {
    if (index <= puleStep || index >= pule.length) return pule;
    const next = pule.slice();
    const [chosen] = next.splice(index, 1);
    next.splice(puleStep, 0, chosen);
    return next;
}

/**
 * Модель выстрела для линии прицеливания. Числа нужно подобрать по игре:
 * линия совпадёт с настоящим полётом, только если ядро запускается с такой же скоростью.
 *
 * energyPerForce  — энергия выстрела на единицу force (store.force)
 * baseAngleDeg    — угол вылета при slant = 0
 * angleDegPerSlant — на сколько градусов меняется угол от единицы slant
 */
export const LAUNCH = {
    energyPerForce: 60,
    baseAngleDeg: 30,
    angleDegPerSlant: 5,
    minAngleDeg: 5,
    maxAngleDeg: 80,
    maxSpeed: 60,
};

/**
 * Начальная скорость ядра [x, y, z]. Энергия задаётся силой выстрела,
 * поэтому тяжёлое ядро летит медленнее: v = sqrt(2·E / m).
 * direction — единичный вектор [x, z] горизонтального направления выстрела.
 */
export function launchVelocity({ force, slant, mass, direction = [0, 1], config = LAUNCH }) {
    const speed = Math.min(config.maxSpeed, Math.sqrt((2 * config.energyPerForce * force) / mass));
    const deg = Math.min(
        config.maxAngleDeg,
        Math.max(config.minAngleDeg, config.baseAngleDeg + config.angleDegPerSlant * slant)
    );
    const angle = (deg * Math.PI) / 180;
    const horizontal = speed * Math.cos(angle);
    return [direction[0] * horizontal, speed * Math.sin(angle), direction[1] * horizontal];
}

/**
 * Точки навесной траектории без учёта столкновений: p = p0 + v·t + g·t²/2.
 * Останавливается на уровне земли groundY. gravity должна совпадать с гравитацией <Physics>.
 */
export function predictTrajectory({
    origin,
    velocity,
    gravity = 9.81,
    dt = 0.06,
    steps = 60,
    groundY = -Infinity,
}) {
    const points = [[...origin]];
    for (let i = 1; i <= steps; i++) {
        const t = i * dt;
        const p = [
            origin[0] + velocity[0] * t,
            origin[1] + velocity[1] * t - 0.5 * gravity * t * t,
            origin[2] + velocity[2] * t,
        ];
        if (p[1] < groundY) {
            // Находим момент пересечения земли и ставим туда последнюю точку
            const a = 0.5 * gravity, b = -velocity[1], c = groundY - origin[1];
            const tHit = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
            points.push([
                origin[0] + velocity[0] * tHit,
                groundY,
                origin[2] + velocity[2] * tHit,
            ]);
            break;
        }
        points.push(p);
    }
    return points;
}


export function generateTower({ floors = 4, width = 3,enemies = [{type:"goblin",floor:1}],barrel = [2] } = {}) {
    const blockSize = 1;         // Толщина / ширина колонн
    const floorHeight = 4;       // Высота колонн (этажа)
    const slabThickness = 0.5;   // Толщина плиты-крышки
    const floorGap = 5;        // Зазор между этажами (воздух между крышкой и верхними колоннами)
    const span = width;          // Радиус расстановки колонн от центра

    let res = [];

    for (let j = 0; j < floors; j++) {
        // Полная высота одного этажа вместе с плитой и зазором до следующего
        const levelHeight = floorHeight + slabThickness + floorGap;
        const baseY = j * levelHeight;

        // Центр колонн текущего этажа по оси Y
        const pillarY = baseY + floorHeight / 2;

        // Центр крышки текущего этажа (лежит строго на колоннах)
        const slabY = baseY + floorHeight + slabThickness / 2 + 0.5;

        // Элементы этажа: 4 колонны по углам + 1 крышка посередине
        const towerElements = [
            [-span, pillarY, -span], // Задняя левая колонна
            [ span, pillarY, -span], // Задняя правая колонна
            [-span, pillarY,  span], // Передняя левая колонна
            [ span, pillarY,  span], // Передняя правая колонна
            [ 0,    slabY,    0   ] // Крышка этажа
        ];

        towerElements.forEach((el, i) => {
            const isSlab = i === 4;
            console.log(barrel.find((em)=>em === j))
            res.push({
                type: isSlab ? "stone_slab" : "stone_block",
                enemies:enemies.find((em)=>em.floor === j) && i === 4,
                enemiesConfig: enemies.find((em)=>em.floor === j),
                barrel:barrel.find((em)=>em === j) && i === 4,
                position: el,
                scale: isSlab
                    ? [span + blockSize * 2, slabThickness, span + blockSize * 2] // Размер плиты
                    : [blockSize, floorHeight, blockSize]                         // Размер колонны
            });
        });
    }


    return res;
}

export function generateWall({
                                 length = 8,
                                 rows = 6,
                                 brickLength = 2,
                                 brickHeight = 2,
                                 brickDepth = 2,
                                 axis = 'x',
                                 gap = 0.05,
                                 position = [0, 0, 0],
                                 mat = 'stone',
                                 idPrefix = 'wl',
                                 seed = 1,
                             } = {}) {
    if (!Number.isInteger(rows) || rows < 1) {
        throw new RangeError('rows должно быть целым числом от 1')
    }
    if (axis !== 'x' && axis !== 'z') {
        throw new RangeError("axis должна быть 'x' или 'z'")
    }
    if (!(length > 0) || !(brickLength > 0)) {
        throw new RangeError('length и brickLength должны быть больше нуля')
    }

    const [px, py, pz] = position
    const n = Math.max(1, Math.round(length / brickLength)) // целых кирпичей в чётном ряду
    const total = n * brickLength // фактическая длина стены
    const start = -total / 2 // начало стены вдоль оси, отсчёт от центра
    const blocks = []

    // детерминированная «случайность» для оттенка кирпича
    const shadeOf = (i) => 0.85 + (Math.abs(Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453) % 1) * 0.3

    // along — центр кирпича вдоль стены (от центра стены), len — его длина
    const add = (row, along, len) => {
        const y = py + row * brickHeight + brickHeight / 2
        const pos = axis === 'x' ? [px + along, y, pz] : [px, y, pz + along]
        const nominal = axis === 'x' ? [len, brickHeight, brickDepth] : [brickDepth, brickHeight, len]
        const sz = nominal.map((v) => v - 2 * gap)
        const i = blocks.length
        blocks.push({
            id: `${idPrefix}${i}`,
            kind: 'brick',
            row,
            pos,
            size: sz,
            half: sz.map((v) => v / 2),
            mat,
            shade: shadeOf(i),
        })
    }

    for (let r = 0; r < rows; r++) {
        if (r % 2 === 0 || n === 1) {
            // чётный ряд: n целых кирпичей встык
            for (let i = 0; i < n; i++) add(r, start + (i + 0.5) * brickLength, brickLength)
        } else {
            // нечётный ряд: половинка, n - 1 целых, половинка. Общая длина та же, торцы ровные
            add(r, start + brickLength / 4, brickLength / 2)
            for (let i = 0; i < n - 1; i++) add(r, start + brickLength / 2 + (i + 0.5) * brickLength, brickLength)
            add(r, start + total - brickLength / 4, brickLength / 2)
        }
    }

    const height = rows * brickHeight
    return { blocks, length: total, height, top: py + height, bricksPerRow: n }
}
