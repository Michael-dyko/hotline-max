import Phaser from "phaser";
import type { Player } from "../entities/Player";
import type { CombatSystem } from "./CombatSystem";
import type { EnemyAI } from "./EnemyAI";

function isPlayerBullet(projectile: unknown): boolean {
  return (
    projectile instanceof Phaser.Physics.Arcade.Sprite &&
    projectile.getData("team") === "player"
  );
}

function isEnemyBullet(projectile: unknown): boolean {
  return (
    projectile instanceof Phaser.Physics.Arcade.Sprite &&
    projectile.getData("team") === "enemy"
  );
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
      (projectile) => {
        combat.stopProjectile(projectile);
      },
    );

    scene.physics.add.collider(
      combat.projectiles,
      combat.targets,
      (projectile, target) => {
        combat.hitTarget(projectile, target);
      },
      (projectile) => isPlayerBullet(projectile),
    );

    scene.physics.add.collider(
      combat.projectiles,
      enemyAI.sprites,
      (projectile, sprite) => {
        const damage = Number(
          projectile instanceof Phaser.Physics.Arcade.Sprite
            ? projectile.getData("damage")
            : 0,
        );
        combat.stopProjectile(projectile);
        if (sprite instanceof Phaser.GameObjects.GameObject) {
          enemyAI.hurt(sprite, damage);
        }
      },
      (projectile) => isPlayerBullet(projectile),
    );

    scene.physics.add.collider(
      combat.projectiles,
      player.sprite,
      (projectile) => {
        const damage = Number(
          projectile instanceof Phaser.Physics.Arcade.Sprite
            ? projectile.getData("damage")
            : 0,
        );
        combat.stopProjectile(projectile);
        player.takeDamage(damage, scene.time.now);
      },
      (projectile) => isEnemyBullet(projectile) && !player.isDead,
    );
  }
}
