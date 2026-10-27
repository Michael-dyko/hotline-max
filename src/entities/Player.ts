import Phaser from "phaser";
import { COLORS, PLAYER_BODY_RADIUS } from "../config";
import { textureKey } from "../data/assets";
import { PLAYER_STATS } from "../data/player";
import { AudioSystem } from "../systems/AudioSystem";
import { FxSystem } from "../systems/FxSystem";

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  hp: number = PLAYER_STATS.maxHp;
  private lastHurtAt = -Infinity;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, textureKey(scene, "player"));
    this.sprite.setDisplaySize(32, 32);
    this.sprite.setCircle(PLAYER_BODY_RADIUS);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.setDamping(false);
    this.sprite.setDrag(0);
    this.sprite.setMaxVelocity(1000);
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

  get isDead(): boolean {
    return this.hp <= 0;
  }

  get maxHp(): number {
    return PLAYER_STATS.maxHp;
  }

  takeDamage(amount: number, now: number): boolean {
    if (this.sprite.scene.registry.get("devGod") === true) {
      return false;
    }
    if (this.isDead || now - this.lastHurtAt < PLAYER_STATS.iFrameMs) {
      return false;
    }

    this.lastHurtAt = now;
    const applied = PLAYER_STATS.oneHitKill ? this.hp : amount;
    this.hp = Math.max(0, this.hp - applied);
    this.showHurtFeedback();

    if (this.isDead) {
      this.die();
    }

    return true;
  }

  private showHurtFeedback(): void {
    this.sprite.setTint(COLORS.neonYellow);
    const fx = this.sprite.scene.registry.get("fx");
    if (fx instanceof FxSystem) {
      fx.playerHurt();
    }
    AudioSystem.from(this.sprite.scene).playSfx("sfx-hurt");
    this.sprite.scene.time.delayedCall(80, () => {
      if (!this.isDead) {
        this.sprite.clearTint();
      }
    });
  }

  private die(): void {
    this.sprite.setVelocity(0, 0);
    this.sprite.setTint(0x4a4a58);
  }
}
