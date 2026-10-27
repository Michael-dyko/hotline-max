export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type EnemySpawn = {
  patrol: { x: number; y: number }[];
  hp?: number;
  boss?: boolean;
};

export type LevelData = {
  id: string;
  width: number;
  height: number;
  spawn: { x: number; y: number };
  targets: { x: number; y: number }[];
  enemies: EnemySpawn[];
  pickups: { weaponId: string; x: number; y: number; ammo?: number }[];
  rooms: Rect[];
  walls: Rect[];
  obstacles: Rect[];
};

export const TILE_SIZE = 40;

function tileCenter(tx: number, ty: number): { x: number; y: number } {
  return {
    x: tx * TILE_SIZE + TILE_SIZE / 2,
    y: ty * TILE_SIZE + TILE_SIZE / 2,
  };
}

function tile(tx: number, ty: number, tw: number, th: number): Rect {
  return {
    x: tx * TILE_SIZE,
    y: ty * TILE_SIZE,
    width: tw * TILE_SIZE,
    height: th * TILE_SIZE,
  };
}

const LEVEL_1: LevelData = {
  id: "level-1",
  width: 48 * TILE_SIZE,
  height: 27 * TILE_SIZE,
  spawn: { x: 8 * TILE_SIZE, y: 7 * TILE_SIZE },
  targets: [],
  enemies: [
    { patrol: [tileCenter(20, 3), tileCenter(34, 8)] },
    { patrol: [tileCenter(4, 16), tileCenter(12, 23)] },
    { patrol: [tileCenter(36, 15), tileCenter(43, 23)] },
  ],
  pickups: [{ weaponId: "shotgun", x: tileCenter(9, 8).x, y: tileCenter(9, 8).y }],
  rooms: [
    tile(1, 1, 14, 11),
    tile(16, 1, 31, 11),
    tile(1, 13, 14, 13),
    tile(16, 13, 16, 4),
    tile(33, 13, 14, 13),
    tile(16, 18, 16, 8),
    tile(15, 6, 1, 2),
    tile(6, 12, 2, 1),
    tile(24, 12, 2, 1),
    tile(15, 14, 1, 2),
    tile(32, 14, 1, 2),
    tile(22, 17, 2, 1),
  ],
  walls: [
    tile(0, 0, 48, 1),
    tile(0, 26, 48, 1),
    tile(0, 1, 1, 25),
    tile(47, 1, 1, 25),
    tile(15, 1, 1, 5),
    tile(15, 8, 1, 4),
    tile(1, 12, 5, 1),
    tile(8, 12, 16, 1),
    tile(26, 12, 21, 1),
    tile(15, 13, 1, 1),
    tile(15, 16, 1, 10),
    tile(32, 13, 1, 1),
    tile(32, 16, 1, 10),
    tile(16, 17, 6, 1),
    tile(24, 17, 8, 1),
  ],
  obstacles: [
    tile(4, 4, 4, 2),
    tile(30, 4, 6, 2),
    tile(40, 7, 2, 2),
    tile(3, 20, 2, 2),
    tile(6, 21, 3, 2),
    tile(38, 18, 6, 2),
    tile(26, 21, 3, 2),
  ],
};

const LEVEL_2: LevelData = {
  id: "level-2",
  width: 36 * TILE_SIZE,
  height: 20 * TILE_SIZE,
  spawn: tileCenter(4, 16),
  targets: [],
  enemies: [
    { patrol: [tileCenter(8, 3), tileCenter(11, 8)] },
    { patrol: [tileCenter(20, 3), tileCenter(24, 6)] },
    { patrol: [tileCenter(28, 4), tileCenter(32, 15)] },
    { patrol: [tileCenter(18, 15), tileCenter(24, 16)] },
  ],
  pickups: [{ weaponId: "shotgun", x: tileCenter(6, 14).x, y: tileCenter(6, 14).y }],
  rooms: [
    tile(1, 1, 12, 18),
    tile(14, 1, 10, 8),
    tile(14, 11, 10, 8),
    tile(25, 1, 10, 18),
    tile(13, 8, 1, 4),
    tile(24, 8, 1, 4),
    tile(17, 9, 4, 2),
  ],
  walls: [
    tile(0, 0, 36, 1),
    tile(0, 19, 36, 1),
    tile(0, 1, 1, 18),
    tile(35, 1, 1, 18),
    tile(13, 1, 1, 7),
    tile(13, 12, 1, 7),
    tile(24, 1, 1, 7),
    tile(24, 12, 1, 7),
    tile(14, 9, 3, 2),
    tile(21, 9, 3, 2),
  ],
  obstacles: [tile(5, 5, 3, 2), tile(18, 3, 3, 2), tile(29, 8, 3, 2), tile(16, 14, 2, 2)],
};

const LEVEL_3: LevelData = {
  id: "level-3",
  width: 40 * TILE_SIZE,
  height: 24 * TILE_SIZE,
  spawn: tileCenter(3, 8),
  targets: [],
  enemies: [
    { patrol: [tileCenter(16, 3), tileCenter(22, 5)] },
    { patrol: [tileCenter(30, 3), tileCenter(36, 8)] },
    { patrol: [tileCenter(6, 16), tileCenter(12, 20)] },
    { patrol: [tileCenter(16, 18), tileCenter(22, 21)] },
    { patrol: [tileCenter(31, 16), tileCenter(36, 20)], boss: true, hp: 10 },
  ],
  pickups: [{ weaponId: "shotgun", x: tileCenter(8, 8).x, y: tileCenter(8, 8).y }],
  rooms: [
    tile(1, 1, 10, 10),
    tile(12, 1, 14, 6),
    tile(27, 1, 12, 10),
    tile(1, 13, 25, 10),
    tile(27, 13, 12, 10),
    tile(11, 4, 1, 3),
    tile(5, 11, 2, 2),
    tile(18, 7, 2, 6),
    tile(26, 4, 1, 3),
    tile(26, 16, 1, 3),
  ],
  walls: [
    tile(0, 0, 40, 1),
    tile(0, 23, 40, 1),
    tile(0, 1, 1, 22),
    tile(39, 1, 1, 22),
    tile(11, 1, 1, 3),
    tile(11, 7, 1, 4),
    tile(1, 11, 4, 2),
    tile(7, 11, 11, 2),
    tile(20, 7, 6, 6),
    tile(26, 1, 1, 3),
    tile(26, 7, 1, 9),
    tile(26, 19, 1, 4),
    tile(27, 11, 12, 2),
  ],
  obstacles: [
    tile(3, 3, 2, 2),
    tile(32, 4, 4, 2),
    tile(4, 18, 3, 2),
    tile(18, 16, 3, 2),
    tile(32, 18, 3, 2),
  ],
};

export const LEVELS: LevelData[] = [LEVEL_1, LEVEL_2, LEVEL_3];

export function getLevel(id: string): LevelData {
  const level = LEVELS.find((entry) => entry.id === id);
  if (!level) {
    throw new Error(`Unknown level: ${id}`);
  }
  return level;
}

export function getLevelNumber(id: string): number {
  return LEVELS.findIndex((entry) => entry.id === id) + 1;
}

export function getNextLevelId(id: string): string | undefined {
  const index = LEVELS.findIndex((entry) => entry.id === id);
  return LEVELS[index + 1]?.id;
}
