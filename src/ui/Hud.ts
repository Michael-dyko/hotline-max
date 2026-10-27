import Phaser from "phaser";
import { COLORS } from "../config";
import type { Player } from "../entities/Player";
import type { WeaponSystem } from "../systems/WeaponSystem";

export class Hud {
  private readonly ammoText: Phaser.GameObjects.Text;
  private readonly hpText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.hpText = scene.add
      .text(24, 72, "", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ff2d6a",
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.ammoText = scene.add
      .text(24, 96, "", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: COLORS.text,
      })
      .setScrollFactor(0)
      .setDepth(10);
  }

  sync(weapon: WeaponSystem, player: Player): void {
    this.hpText.setText(`HP ${player.hp}/${player.maxHp}`);
    const { ammoInMag, stats, isReloading } = weapon;
    const status = isReloading ? "  RELOADING" : ammoInMag === 0 ? "  EMPTY  R" : "";
    this.ammoText.setText(`AMMO ${ammoInMag}/${stats.magazineSize}${status}`);
  }
}
