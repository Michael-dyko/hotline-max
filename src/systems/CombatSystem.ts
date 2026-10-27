import Phaser from "phaser";
import { COLORS, TARGET_HP } from "../config";
import type { WeaponStats } from "../data/weapons";
import {
  disableProjectile,
  PROJECTILE_KIND,
  recycleProjectile,
} from "../entities/Projectile";
import type { WeaponSystem } from "./WeaponSystem";

const MAX_PROJECTILES = 48;

export type Shooter = {
  x: number;
  y: number;
  rotation: number;
};

export class CombatSystem {
  readonly projectiles: Phaser.Physics.Arcade.Group;
  readonly targets: Phaser.Physics.Arcade.StaticGroup;

  constructor(private readonly scene: Phaser.Scene) {
    this.projectiles = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: MAX_PROJECTILES,
      defaultKey: "bullet",
    });
    this.targets = scene.physics.add.staticGroup();

    scene.physics.world.on(
      Phaser.Physics.Arcade.Events.WORLD_BOUNDS,
      (body: Phaser.Physics.Arcade.Body) => {
        const sprite = body.gameObject;
        if (
          sprite instanceof Phaser.Physics.Arcade.Sprite &&
          sprite.getData("kind") === PROJECTILE_KIND
        ) {
          disableProjectile(sprite);
        }
      },
    );
  }

  spawnTargets(points: { x: number; y: number }[]): void {
    for (const point of points) {
      const target = this.scene.physics.add.staticSprite(point.x, point.y, "target");
      target.setData("hp", TARGET_HP);
      this.targets.add(target);
    }
  }

  tryShoot(
    shooter: Shooter,
    weapon: WeaponSystem,
    now: number,
    team: "player" | "enemy",
  ): boolean {
    if (!weapon.tryFire(now)) {
      return false;
    }

    const angle = shooter.rotation;
    const stats = weapon.stats;
    const x = shooter.x + Math.cos(angle) * stats.muzzleOffset;
    const y = shooter.y + Math.sin(angle) * stats.muzzleOffset;
    const bullet = this.projectiles.get(x, y, "bullet") as
      | Phaser.Physics.Arcade.Sprite
      | null;

    if (!bullet) {
      weapon.ammoInMag += 1;
      return false;
    }

    recycleProjectile(
      bullet,
      x,
      y,
      angle,
      stats.projectileSpeed,
      stats.damage,
      now + stats.projectileLifespanMs,
      team,
    );
    this.showMuzzleFlash(x, y, stats);
    return true;
  }

  update(now: number): void {
    for (const child of this.projectiles.getChildren()) {
      if (!(child instanceof Phaser.Physics.Arcade.Sprite) || !child.active) {
        continue;
      }

      const expiresAt = child.getData("expiresAt");
      if (typeof expiresAt === "number" && now >= expiresAt) {
        disableProjectile(child);
      }
    }
  }

  hitTarget(projectile: unknown, target: unknown): void {
    if (!(projectile instanceof Phaser.Physics.Arcade.Sprite)) {
      return;
    }

    const damage = projectile.getData("damage");
    disableProjectile(projectile);

    if (!(target instanceof Phaser.Physics.Arcade.Sprite)) {
      return;
    }

    const hp = Number(target.getData("hp")) - Number(damage);
    target.setData("hp", hp);
    target.setTint(COLORS.neonYellow);

    this.scene.time.delayedCall(80, () => {
      if (target.active) {
        target.clearTint();
      }
    });

    if (hp <= 0) {
      target.disableBody(true, true);
    }
  }

  stopProjectile(projectile: unknown): void {
    if (projectile instanceof Phaser.Physics.Arcade.Sprite) {
      disableProjectile(projectile);
    }
  }

  private showMuzzleFlash(x: number, y: number, stats: WeaponStats): void {
    const flash = this.scene.add.image(x, y, "muzzle").setRotation(
      Phaser.Math.FloatBetween(0, Math.PI),
    );
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: Math.min(90, stats.fireRateMs / 2),
      onComplete: () => {
        flash.destroy();
      },
    });
  }
}
