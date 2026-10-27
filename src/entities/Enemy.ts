import Phaser from "phaser";
import { COLORS, PLAYER_BODY_RADIUS } from "../config";
import { textureKey } from "../data/assets";
import { ENEMY_AI, ENEMY_HP } from "../data/enemies";
import { GIFT } from "../data/gift";
import type { EnemySpawn } from "../data/levels";
import { PISTOL } from "../data/weapons";
import { AudioSystem } from "../systems/AudioSystem";
import { FxSystem } from "../systems/FxSystem";
import { WeaponSystem } from "../systems/WeaponSystem";

export type EnemyState = "PATROL" | "ALERT" | "CHASE" | "ATTACK" | "DEAD";

export class Enemy {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly weapon: WeaponSystem;
  readonly patrol: Phaser.Math.Vector2[];
  readonly boss: boolean;
  readonly nameLabel: Phaser.GameObjects.Text | undefined;
  state: EnemyState = "PATROL";
  hp: number;
  patrolIndex = 0;
  lastKnown = new Phaser.Math.Vector2();
  nextPerceptionAt = 0;
  alertUntil = 0;
  attackReadyAt = 0;
  stuckMs = 0;
  private readonly idleTint: number | undefined;

  constructor(scene: Phaser.Scene, spawn: EnemySpawn) {
    const start = spawn.patrol[0];
    if (!start) {
      throw new Error("Enemy patrol needs at least one point.");
    }

    this.boss = Boolean(spawn.boss);
    this.hp = spawn.hp ?? ENEMY_HP;
    this.idleTint = this.boss ? COLORS.neonPink : undefined;
    this.patrol = spawn.patrol.map((point) => new Phaser.Math.Vector2(point.x, point.y));
    this.sprite = scene.physics.add.sprite(start.x, start.y, textureKey(scene, "enemy"));
    this.sprite.setDisplaySize(this.boss ? 40 : 32, this.boss ? 40 : 32);
    this.sprite.setCircle(this.boss ? 14 : PLAYER_BODY_RADIUS);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.setData("enemy", this);
    if (this.idleTint !== undefined) {
      this.sprite.setTint(this.idleTint);
    }
    this.weapon = new WeaponSystem(PISTOL);
    this.lastKnown.copy(this.patrol[0]);

    if (this.boss) {
      this.nameLabel = scene.add
        .text(start.x, start.y - 28, GIFT.bossName, {
          fontFamily: "monospace",
          fontSize: "12px",
          color: "#ff2d6a",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(6);
    }
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

  syncLabel(): void {
    this.nameLabel?.setPosition(this.x, this.y - 28);
  }

  showHitFlash(): void {
    this.sprite.setTint(COLORS.neonYellow);
    this.sprite.scene.time.delayedCall(80, () => {
      if (this.state !== "DEAD" && this.sprite.active) {
        if (this.idleTint !== undefined) {
          this.sprite.setTint(this.idleTint);
        } else {
          this.sprite.clearTint();
        }
      }
    });
  }

  die(): void {
    this.state = "DEAD";
    this.sprite.setVelocity(0, 0);
    this.sprite.disableBody(true, false);
    this.sprite.setTint(0x4a4a58);
    this.nameLabel?.destroy();
    const fx = this.sprite.scene.registry.get("fx");
    if (fx instanceof FxSystem) {
      fx.enemyDeath(this.sprite);
    } else {
      this.sprite.setAlpha(0.5);
    }
    AudioSystem.from(this.sprite.scene).playSfx("sfx-death");
  }
}
