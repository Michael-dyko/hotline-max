import Phaser from "phaser";
import { PROJECTILE_KIND } from "../entities/Projectile";
import type { Player } from "../entities/Player";
import { AudioSystem } from "./AudioSystem";
import type { CombatSystem } from "./CombatSystem";
import type { EnemyAI } from "./EnemyAI";

function asSprite(value: unknown): Phaser.Physics.Arcade.Sprite | undefined {
  return value instanceof Phaser.Physics.Arcade.Sprite ? value : undefined;
}

function asProjectile(a: unknown, b?: unknown): Phaser.Physics.Arcade.Sprite | undefined {
  const first = asSprite(a);
  if (first?.getData("kind") === PROJECTILE_KIND) {
    return first;
  }

  const second = asSprite(b);
  if (second?.getData("kind") === PROJECTILE_KIND) {
    return second;
  }

  return undefined;
}

function projectileDamage(projectile: Phaser.Physics.Arcade.Sprite): number {
  const value = Number(projectile.getData("damage"));
  return Number.isFinite(value) && value > 0 ? value : 1;
}

export class CollisionSystem {
  enablePlayerWalls(
    scene: Phaser.Scene,
    player: Player,
    solids: Phaser.Physics.Arcade.StaticGroup,
  ): void {
    scene.physics.add.collider(player.sprite, solids);
  }

  enablePlayerTargets(scene: Phaser.Scene, player: Player, combat: CombatSystem): void {
    scene.physics.add.collider(player.sprite, combat.targets);
  }

  enableEnemies(
    scene: Phaser.Scene,
    player: Player,
    enemyAI: EnemyAI,
    solids: Phaser.Physics.Arcade.StaticGroup,
  ): void {
    scene.physics.add.collider(enemyAI.sprites, solids);
    scene.physics.add.collider(player.sprite, enemyAI.sprites);
  }

  enableProjectiles(
    scene: Phaser.Scene,
    player: Player,
    combat: CombatSystem,
    enemyAI: EnemyAI,
    solids: Phaser.Physics.Arcade.StaticGroup,
  ): void {
    scene.physics.add.collider(
      combat.projectiles,
      solids,
      (objectA, objectB) => {
        combat.stopProjectile(asProjectile(objectA, objectB));
      },
    );

    scene.physics.add.overlap(
      combat.projectiles,
      combat.targets,
      (objectA, objectB) => {
        const projectile = asProjectile(objectA, objectB);
        if (projectile?.getData("team") !== "player") {
          return;
        }
        combat.hitTarget(projectile, projectile === objectA ? objectB : objectA);
      },
    );

    scene.physics.add.overlap(
      combat.projectiles,
      enemyAI.sprites,
      (objectA, objectB) => {
        const projectile = asProjectile(objectA, objectB);
        if (!projectile || projectile.getData("team") !== "player") {
          return;
        }

        const enemySprite = projectile === objectA ? objectB : objectA;
        combat.stopProjectile(projectile, false);
        combat.fx.enemyHit(projectile.x, projectile.y);
        AudioSystem.from(scene).playSfx("sfx-hit-enemy");
        if (enemySprite instanceof Phaser.GameObjects.GameObject) {
          enemyAI.hurt(enemySprite, projectileDamage(projectile));
        }
      },
    );

    scene.physics.add.overlap(
      combat.projectiles,
      player.sprite,
      (objectA, objectB) => {
        const projectile = asProjectile(objectA, objectB);
        if (!projectile || projectile.getData("team") !== "enemy" || player.isDead) {
          return;
        }

        combat.stopProjectile(projectile, false);
        player.takeDamage(projectileDamage(projectile), scene.time.now);
      },
    );
  }
}
