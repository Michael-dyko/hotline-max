export type WeaponStats = {
  id: string;
  name: string;
  magazineSize: number;
  fireRateMs: number;
  reloadMs: number;
  damage: number;
  projectileSpeed: number;
  projectileLifespanMs: number;
  muzzleOffset: number;
  pelletCount: number;
  spreadRad: number;
  color: number;
};

export const PISTOL: WeaponStats = {
  id: "pistol",
  name: "PISTOL",
  magazineSize: 12,
  fireRateMs: 180,
  reloadMs: 900,
  damage: 1,
  projectileSpeed: 720,
  projectileLifespanMs: 1200,
  muzzleOffset: 22,
  pelletCount: 1,
  spreadRad: 0,
  color: 0xffe566,
};

export const SHOTGUN: WeaponStats = {
  id: "shotgun",
  name: "SHOTGUN",
  magazineSize: 6,
  fireRateMs: 520,
  reloadMs: 1400,
  damage: 1,
  projectileSpeed: 640,
  projectileLifespanMs: 420,
  muzzleOffset: 22,
  pelletCount: 5,
  spreadRad: 0.38,
  color: 0xff6a2d,
};

export const WEAPONS: Record<string, WeaponStats> = {
  pistol: PISTOL,
  shotgun: SHOTGUN,
};

export function getWeapon(id: string): WeaponStats {
  const weapon = WEAPONS[id];
  if (!weapon) {
    throw new Error(`Unknown weapon: ${id}`);
  }
  return weapon;
}

export const MELEE = {
  range: 56,
  halfArc: Math.PI / 2.6,
  damage: 2,
  cooldownMs: 400,
} as const;
