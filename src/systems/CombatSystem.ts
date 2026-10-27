import Phaser from "phaser";
import { COLORS, TARGET_HP } from "../config";
import type { WeaponStats } from "../data/weapons";
import {
  disableProjectile,
  PROJECTILE_KIND,
  recycleProjectile,
} from "../entities/Projectile";
import { AudioSystem } from "./AudioSystem";
import type { FxSystem } from "./FxSystem";
import type { WeaponSystem } from "./WeaponSystem";

const MAX_PROJECTILES = 64;

export type Shooter = {
  x: number;
  y: number;
  rotation: number;
};

export class CombatSystem {
  readonly projectiles: Phaser.Physics.Arcade.Group;
  readonly targets: Phaser.Physics.Arcade.StaticGroup;

  constructor(
    private readonly scene: Phaser.Scene,
    readonly fx: FxSystem,
  ) {
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

    const stats = weapon.stats;
    const pellets = Math.max(1, stats.pelletCount);
    let spawned = 0;

    for (let index = 0; index < pellets; index += 1) {
      const offset = pellets === 1 ? 0 : index / (pellets - 1) - 0.5;
      const angle = shooter.rotation + offset * 2 * stats.spreadRad;
      const x = shooter.x + Math.cos(angle) * stats.muzzleOffset;
      const y = shooter.y + Math.sin(angle) * stats.muzzleOffset;
      const bullet = this.projectiles.get(x, y, "bullet") as
        | Phaser.Physics.Arcade.Sprite
        | null;
      if (!bullet) {
        break;
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
      spawned += 1;
    }

    if (spawned === 0) {
      weapon.ammoInMag += 1;
      return false;
    }

    const flashAngle = shooter.rotation;
    this.showMuzzleFlash(
      shooter.x + Math.cos(flashAngle) * stats.muzzleOffset,
      shooter.y + Math.sin(flashAngle) * stats.muzzleOffset,
      stats,
    );
    AudioSystem.from(this.scene).playSfx(
      stats.id === "shotgun" ? "sfx-shotgun" : "sfx-pistol",
    );
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
    this.fx.enemyHit(target.x, target.y);

    this.scene.time.delayedCall(80, () => {
      if (target.active) {
        target.clearTint();
      }
    });

    if (hp <= 0) {
      target.disableBody(true, true);
    }
  }

  stopProjectile(projectile: unknown, withImpact = true): void {
    if (projectile instanceof Phaser.Physics.Arcade.Sprite) {
      if (withImpact) {
        this.fx.impact(projectile.x, projectile.y);
        AudioSystem.from(this.scene).playSfx("sfx-hit-wall");
      }
      disableProjectile(projectile);
    }
  }

  private showMuzzleFlash(x: number, y: number, _stats: WeaponStats): void {
    this.fx.muzzle(x, y);
  }
}
