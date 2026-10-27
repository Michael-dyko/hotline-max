export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LevelData = {
  id: string;
  width: number;
  height: number;
  spawn: { x: number; y: number };
  targets: { x: number; y: number }[];
  enemies: { patrol: { x: number; y: number }[] }[];
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
  targets: [tileCenter(11, 7), tileCenter(11, 3), tileCenter(22, 6)],
  enemies: [
    { patrol: [tileCenter(20, 3), tileCenter(34, 8)] },
    { patrol: [tileCenter(4, 16), tileCenter(12, 23)] },
    { patrol: [tileCenter(36, 15), tileCenter(43, 23)] },
  ],
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
  width: 32 * TILE_SIZE,
  height: 18 * TILE_SIZE,
  spawn: { x: 6 * TILE_SIZE, y: 9 * TILE_SIZE },
  targets: [],
  enemies: [{ patrol: [tileCenter(22, 5), tileCenter(26, 13)] }],
  rooms: [tile(1, 1, 14, 16), tile(17, 1, 14, 16), tile(15, 8, 2, 2)],
  walls: [
    tile(0, 0, 32, 1),
    tile(0, 17, 32, 1),
    tile(0, 1, 1, 16),
    tile(31, 1, 1, 16),
    tile(15, 1, 2, 7),
    tile(15, 10, 2, 7),
  ],
  obstacles: [tile(5, 4, 4, 2), tile(22, 8, 3, 2)],
};

export const LEVELS: LevelData[] = [LEVEL_1, LEVEL_2];

export function getLevel(id: string): LevelData {
  const level = LEVELS.find((entry) => entry.id === id);
  if (!level) {
    throw new Error(`Unknown level: ${id}`);
  }
  return level;
}

export function getNextLevelId(id: string): string | undefined {
  const index = LEVELS.findIndex((entry) => entry.id === id);
  return LEVELS[index + 1]?.id;
}
