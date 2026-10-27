import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config";
import { FX, prefersReducedMotion } from "../data/fx";

export class FxSystem {
  private readonly reduced = prefersReducedMotion();
  private readonly pool: Phaser.GameObjects.Image[] = [];
  private poolIndex = 0;

  constructor(private readonly scene: Phaser.Scene) {
    for (let i = 0; i < FX.poolSize; i += 1) {
      const spark = scene.add.image(-100, -100, "spark").setVisible(false).setDepth(20);
      this.pool.push(spark);
    }
  }

  muzzle(x: number, y: number): void {
    const flash = this.scene.add.image(x, y, "muzzle").setDepth(19);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.6,
      duration: this.reduced ? 40 : FX.muzzleLifeMs,
      onComplete: () => {
        flash.destroy();
      },
    });
    this.burst(x, y, COLORS.neonYellow, 3);
  }

  impact(x: number, y: number, color = COLORS.neonCyan): void {
    const mark = this.scene.add.image(x, y, "impact").setTint(color).setDepth(18);
    this.scene.tweens.add({
      targets: mark,
      alpha: 0,
      scale: 1.8,
      duration: this.reduced ? 40 : FX.impactLifeMs,
      onComplete: () => {
        mark.destroy();
      },
    });
    this.burst(x, y, color, 4);
    this.shake(FX.shakeHit.duration, FX.shakeHit.intensity);
  }

  enemyHit(x: number, y: number): void {
    this.burst(x, y, COLORS.neonYellow, 5);
  }

  enemyDeath(sprite: Phaser.GameObjects.Sprite): void {
    this.burst(sprite.x, sprite.y, COLORS.neonPink, 8);
    this.shake(FX.shakeDeath.duration, FX.shakeDeath.intensity);
    this.scene.tweens.add({
      targets: sprite,
      alpha: 0.35,
      scale: 0.65,
      angle: sprite.angle + (this.reduced ? 0 : 50),
      duration: this.reduced ? 80 : FX.deathLifeMs,
    });
  }

  playerHurt(): void {
    if (!this.reduced) {
      this.scene.cameras.main.flash(FX.flashHurtMs, 255, 45, 106, false);
      this.shake(FX.shakeHurt.duration, FX.shakeHurt.intensity);
    }

    const veil = this.scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.neonPink, 0.16)
      .setScrollFactor(0)
      .setDepth(90);
    this.scene.tweens.add({
      targets: veil,
      alpha: 0,
      duration: this.reduced ? 80 : 140,
      onComplete: () => {
        veil.destroy();
      },
    });
  }

  pickup(x: number, y: number): void {
    const ring = this.scene.add.image(x, y, "impact").setTint(COLORS.neonCyan).setDepth(18);
    this.scene.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 2.4,
      duration: this.reduced ? 90 : FX.pickupLifeMs,
      onComplete: () => {
        ring.destroy();
      },
    });
    this.burst(x, y, COLORS.neonCyan, 7);
  }

  melee(x: number, y: number): void {
    this.burst(x, y, COLORS.neonCyan, 4);
    this.shake(FX.shakeMelee.duration, FX.shakeMelee.intensity);
  }

  levelClear(): void {
    if (this.reduced) {
      return;
    }
    this.scene.cameras.main.flash(180, 45, 226, 255, false);
  }

  private shake(duration: number, intensity: number): void {
    if (this.reduced) {
      return;
    }
    this.scene.cameras.main.shake(duration, intensity);
  }

  private burst(x: number, y: number, color: number, count: number): void {
    const n = this.reduced ? Math.min(2, count) : count;
    for (let i = 0; i < n; i += 1) {
      const spark = this.nextSpark();
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 18;
      spark
        .setPosition(x, y)
        .setTint(color)
        .setAlpha(1)
        .setScale(1)
        .setVisible(true);
      this.scene.tweens.killTweensOf(spark);
      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.15,
        duration: FX.sparkLifeMs,
        onComplete: () => {
          spark.setVisible(false);
        },
      });
    }
  }

  private nextSpark(): Phaser.GameObjects.Image {
    const spark = this.pool[this.poolIndex % this.pool.length];
    this.poolIndex += 1;
    return spark;
  }
}
