import Phaser from "phaser";
import { COLORS } from "../config";
import { MELEE } from "../data/weapons";
import type { Player } from "../entities/Player";
import type { EnemyAI } from "./EnemyAI";
import { AudioSystem } from "./AudioSystem";
import { FxSystem } from "./FxSystem";

export class MeleeSystem {
  private nextAt = 0;

  constructor(private readonly scene: Phaser.Scene) {}

  trySwing(now: number, player: Player, enemyAI: EnemyAI): boolean {
    if (now < this.nextAt) {
      return false;
    }

    this.nextAt = now + MELEE.cooldownMs;
    AudioSystem.from(this.scene).playSfx("sfx-melee");
    this.showArc(player);
    const fx = this.scene.registry.get("fx");
    if (fx instanceof FxSystem) {
      fx.melee(player.x, player.y);
    }

    const facing = player.rotation;
    const hit = new Set<object>();

    for (const enemy of enemyAI.enemies) {
      if (enemy.state === "DEAD" || hit.has(enemy)) {
        continue;
      }

      const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
      if (dist > MELEE.range) {
        continue;
      }

      const toEnemy = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
      if (Math.abs(Phaser.Math.Angle.Wrap(toEnemy - facing)) > MELEE.halfArc) {
        continue;
      }

      hit.add(enemy);
      enemyAI.hurt(enemy.sprite, MELEE.damage);
    }

    return true;
  }

  private showArc(player: Player): void {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(COLORS.neonCyan, 0.4);
    graphics.beginPath();
    graphics.moveTo(player.x, player.y);
    graphics.arc(
      player.x,
      player.y,
      MELEE.range,
      player.rotation - MELEE.halfArc,
      player.rotation + MELEE.halfArc,
      false,
    );
    graphics.closePath();
    graphics.fillPath();
    graphics.setDepth(8);

    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 120,
      onComplete: () => {
        graphics.destroy();
      },
    });
  }
}
