import type { WeaponStats } from "../data/weapons";

export class WeaponSystem {
  ammoInMag: number;
  private reloadEndsAt = 0;
  private nextShotAt = 0;

  constructor(
    readonly stats: WeaponStats,
    ammo = stats.magazineSize,
  ) {
    this.ammoInMag = ammo;
  }

  get isReloading(): boolean {
    return this.reloadEndsAt > 0;
  }

  canFire(now: number): boolean {
    return !this.isReloading && this.ammoInMag > 0 && now >= this.nextShotAt;
  }

  update(now: number): void {
    if (this.reloadEndsAt > 0 && now >= this.reloadEndsAt) {
      this.ammoInMag = this.stats.magazineSize;
      this.reloadEndsAt = 0;
    }
  }

  tryReload(now: number): boolean {
    if (this.isReloading || this.ammoInMag >= this.stats.magazineSize) {
      return false;
    }

    this.reloadEndsAt = now + this.stats.reloadMs;
    return true;
  }

  tryFire(now: number): boolean {
    if (this.isReloading || this.ammoInMag <= 0 || now < this.nextShotAt) {
      return false;
    }

    this.ammoInMag -= 1;
    this.nextShotAt = now + this.stats.fireRateMs;
    return true;
  }
}
