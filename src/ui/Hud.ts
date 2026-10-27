import Phaser from "phaser";
import { COLORS } from "../config";
import type { Player } from "../entities/Player";
import type { WeaponSystem } from "../systems/WeaponSystem";

export class Hud {
  private readonly ammoText: Phaser.GameObjects.Text;
  private readonly hpText: Phaser.GameObjects.Text;
  private readonly levelText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.levelText = scene.add
      .text(24, 72, "", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: COLORS.muted,
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.hpText = scene.add
      .text(24, 96, "", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ff2d6a",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.ammoText = scene.add
      .text(24, 120, "", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: COLORS.text,
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(10);
  }

  sync(
    weapon: WeaponSystem | undefined,
    player: Player,
    levelNumber: number,
    levelCount: number,
    hostilesLeft: number,
    levelTitle: string,
    bossName: string | undefined,
  ): void {
    const boss = bossName ? `  |  ${bossName}` : "";
    this.levelText.setText(
      `${levelTitle}  ${levelNumber}/${levelCount}  |  LEFT ${hostilesLeft}${boss}`,
    );
    this.hpText.setText(`HP ${player.hp}/${player.maxHp}`);
    if (!weapon) {
      this.ammoText.setText("WEAPON —  |  SPACE melee");
      return;
    }

    const { ammoInMag, stats, isReloading } = weapon;
    const status = isReloading ? "  RELOADING" : ammoInMag === 0 ? "  EMPTY  R" : "";
    this.ammoText.setText(
      `${stats.name}  ${ammoInMag}/${stats.magazineSize}${status}`,
    );
  }
}
