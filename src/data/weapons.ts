export type WeaponStats = {
  id: string;
  magazineSize: number;
  fireRateMs: number;
  reloadMs: number;
  damage: number;
  projectileSpeed: number;
  projectileLifespanMs: number;
  muzzleOffset: number;
};

export const PISTOL: WeaponStats = {
  id: "pistol",
  magazineSize: 12,
  fireRateMs: 180,
  reloadMs: 900,
  damage: 1,
  projectileSpeed: 720,
  projectileLifespanMs: 1200,
  muzzleOffset: 22,
};
