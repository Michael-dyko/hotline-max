import Phaser from "phaser";
import { ENEMY_AI } from "../data/enemies";
import type { EnemySpawn, Rect } from "../data/levels";
import { Enemy } from "../entities/Enemy";
import type { Player } from "../entities/Player";
import type { CombatSystem } from "./CombatSystem";
import { hasLineOfSight } from "./los";

export class EnemyAI {
  readonly enemies: Enemy[] = [];
  readonly sprites: Phaser.Physics.Arcade.Group;

  constructor(
    scene: Phaser.Scene,
    private readonly combat: CombatSystem,
    private readonly solids: Rect[],
    spawns: EnemySpawn[],
  ) {
    this.sprites = scene.physics.add.group();
    for (const spawn of spawns) {
      const enemy = new Enemy(scene, spawn);
      this.enemies.push(enemy);
      this.sprites.add(enemy.sprite);
    }
  }

  hearShot(x: number, y: number): void {
    for (const enemy of this.enemies) {
      if (enemy.state === "DEAD") {
        continue;
      }

      const heard = Phaser.Math.Distance.Between(enemy.x, enemy.y, x, y) <= ENEMY_AI.hearRange;
      if (!heard) {
        continue;
      }

      enemy.lastKnown.set(x, y);
      if (enemy.state === "PATROL") {
        enemy.setState("ALERT", enemy.sprite.scene.time.now);
        enemy.alertUntil = enemy.sprite.scene.time.now + ENEMY_AI.alertMs;
      }
    }
  }

  allDefeated(): boolean {
    return this.enemies.length > 0 && this.enemies.every((enemy) => enemy.state === "DEAD");
  }

  hurt(sprite: Phaser.GameObjects.GameObject, damage: number): void {
    const enemy = sprite.getData("enemy");
    if (!(enemy instanceof Enemy) || enemy.state === "DEAD") {
      return;
    }

    enemy.hp -= damage;
    enemy.showHitFlash();
    if (enemy.hp <= 0) {
      enemy.die();
    }
  }

  update(now: number, delta: number, player: Player): void {
    for (const enemy of this.enemies) {
      if (enemy.state === "DEAD") {
        continue;
      }

      enemy.weapon.update(now);
      if (enemy.weapon.ammoInMag <= 0) {
        enemy.weapon.tryReload(now);
      }

      if (now >= enemy.nextPerceptionAt) {
        enemy.nextPerceptionAt = now + ENEMY_AI.perceptionMs;
        this.perceive(enemy, player, now);
      }

      this.act(enemy, player, now, delta);
      enemy.syncLabel();
    }
  }

  private perceive(enemy: Enemy, player: Player, now: number): void {
    const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
    const sees =
      dist <= ENEMY_AI.detectRange &&
      hasLineOfSight(enemy.x, enemy.y, player.x, player.y, this.solids, ENEMY_AI.losStep);

    if (sees) {
      enemy.lastKnown.set(player.x, player.y);
      enemy.alertUntil = now + ENEMY_AI.alertMs;
      if (dist <= ENEMY_AI.attackRange) {
        enemy.setState("ATTACK", now);
      } else {
        enemy.setState("CHASE", now);
      }
      return;
    }

    if (enemy.state === "ATTACK" || enemy.state === "CHASE") {
      enemy.setState("ALERT", now);
    }
  }

  private act(enemy: Enemy, player: Player, now: number, delta: number): void {
    switch (enemy.state) {
      case "PATROL":
        this.moveToward(enemy, enemy.patrol[enemy.patrolIndex], ENEMY_AI.patrolSpeed, delta);
        this.advancePatrol(enemy);
        break;
      case "ALERT":
        this.moveToward(enemy, enemy.lastKnown, ENEMY_AI.chaseSpeed, delta);
        if (
          Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.lastKnown.x, enemy.lastKnown.y) <=
            ENEMY_AI.arriveDistance ||
          now >= enemy.alertUntil
        ) {
          enemy.setState("PATROL", now);
        }
        break;
      case "CHASE":
        this.moveToward(enemy, enemy.lastKnown, ENEMY_AI.chaseSpeed, delta);
        break;
      case "ATTACK": {
        enemy.sprite.setVelocity(0, 0);
        enemy.face(player.x, player.y);
        if (now >= enemy.attackReadyAt && enemy.weapon.canFire(now)) {
          const canSee = hasLineOfSight(
            enemy.x,
            enemy.y,
            player.x,
            player.y,
            this.solids,
            ENEMY_AI.losStep,
          );
          if (canSee) {
            this.combat.tryShoot(enemy, enemy.weapon, now, "enemy");
          }
        }
        break;
      }
      default:
        break;
    }
  }

  private moveToward(
    enemy: Enemy,
    goal: Phaser.Math.Vector2 | undefined,
    speed: number,
    delta: number,
  ): void {
    if (!goal) {
      enemy.sprite.setVelocity(0, 0);
      return;
    }

    const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, goal.x, goal.y);
    if (dist <= ENEMY_AI.arriveDistance) {
      enemy.sprite.setVelocity(0, 0);
      enemy.stuckMs = 0;
      return;
    }

    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, goal.x, goal.y);
    enemy.sprite.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    enemy.face(goal.x, goal.y);

    const body = enemy.sprite.body;
    const moving =
      body instanceof Phaser.Physics.Arcade.Body && body.velocity.lengthSq() > 64;
    if (moving) {
      enemy.stuckMs = 0;
      return;
    }

    enemy.stuckMs += delta;
    if (enemy.stuckMs >= ENEMY_AI.stuckMs) {
      enemy.stuckMs = 0;
      if (enemy.state === "PATROL") {
        enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrol.length;
      }
    }
  }

  private advancePatrol(enemy: Enemy): void {
    const goal = enemy.patrol[enemy.patrolIndex];
    if (!goal) {
      return;
    }

    if (
      Phaser.Math.Distance.Between(enemy.x, enemy.y, goal.x, goal.y) <= ENEMY_AI.arriveDistance
    ) {
      enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrol.length;
    }
  }
}
