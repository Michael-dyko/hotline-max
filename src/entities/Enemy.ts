import Phaser from "phaser";
import { COLORS, PLAYER_BODY_RADIUS } from "../config";
import { ENEMY_AI, ENEMY_HP } from "../data/enemies";
import { PISTOL } from "../data/weapons";
import { WeaponSystem } from "../systems/WeaponSystem";

export type EnemyState = "PATROL" | "ALERT" | "CHASE" | "ATTACK" | "DEAD";

export class Enemy {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly weapon: WeaponSystem;
  readonly patrol: Phaser.Math.Vector2[];
  state: EnemyState = "PATROL";
  hp = ENEMY_HP;
  patrolIndex = 0;
  lastKnown = new Phaser.Math.Vector2();
  nextPerceptionAt = 0;
  alertUntil = 0;
  attackReadyAt = 0;
  stuckMs = 0;

  constructor(scene: Phaser.Scene, patrol: { x: number; y: number }[]) {
    const start = patrol[0];
    if (!start) {
      throw new Error("Enemy patrol needs at least one point.");
    }

    this.patrol = patrol.map((point) => new Phaser.Math.Vector2(point.x, point.y));
    this.sprite = scene.physics.add.sprite(start.x, start.y, "enemy");
    this.sprite.setCircle(PLAYER_BODY_RADIUS);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.setData("enemy", this);
    this.weapon = new WeaponSystem(PISTOL);
    this.lastKnown.copy(this.patrol[0]);
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  get rotation(): number {
    return this.sprite.rotation;
  }

  setState(next: EnemyState, now: number): void {
    if (this.state === "DEAD" || this.state === next) {
      return;
    }

    this.state = next;
    if (next === "ATTACK") {
      this.attackReadyAt = now + ENEMY_AI.reactionMs;
    }
  }

  face(x: number, y: number): void {
    this.sprite.setRotation(Phaser.Math.Angle.Between(this.x, this.y, x, y));
  }

  showHitFlash(): void {
    this.sprite.setTint(COLORS.neonYellow);
    this.sprite.scene.time.delayedCall(80, () => {
      if (this.state !== "DEAD" && this.sprite.active) {
        this.sprite.clearTint();
      }
    });
  }

  die(): void {
    this.state = "DEAD";
    this.sprite.setVelocity(0, 0);
    this.sprite.disableBody(true, false);
    this.sprite.setTint(0x4a4a58);
    this.sprite.setAlpha(0.5);
  }
}
