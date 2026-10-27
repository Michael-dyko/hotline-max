import Phaser from "phaser";
import { COLORS } from "../config";
import type { Player } from "../entities/Player";
import type { WeaponSystem } from "../systems/WeaponSystem";

export class Hud {
  private readonly ammoText: Phaser.GameObjects.Text;
  private readonly hpText: Phaser.GameObjects.Text;
  private readonly levelText: Phaser.GameObjects.Text;
  private readonly objectiveText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const style = {
      fontFamily: "monospace",
      stroke: "#000000",
      strokeThickness: 3,
    } as const;

    this.levelText = scene.add
      .text(24, 16, "", { ...style, fontSize: "16px", color: COLORS.muted })
      .setScrollFactor(0)
      .setDepth(10);

    this.objectiveText = scene.add
      .text(24, 38, "", { ...style, fontSize: "16px", color: "#2de2ff" })
      .setScrollFactor(0)
      .setDepth(10);

    this.hpText = scene.add
      .text(24, 64, "", { ...style, fontSize: "18px", color: "#ff2d6a" })
      .setScrollFactor(0)
      .setDepth(10);

    this.ammoText = scene.add
      .text(24, 88, "", { ...style, fontSize: "18px", color: COLORS.text })
      .setScrollFactor(0)
      .setDepth(10);

    scene.add
      .text(24, 116, "ESC pause", { ...style, fontSize: "14px", color: COLORS.muted })
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
    this.levelText.setText(`${levelTitle}  ${levelNumber}/${levelCount}`);
    const target = bossName ? `DEFEAT ${bossName}` : "CLEAR ALL";
    this.objectiveText.setText(`${target}  ·  ${hostilesLeft} left`);
    this.hpText.setText(`HP ${player.hp}/${player.maxHp}`);
    if (!weapon) {
      this.ammoText.setText("UNARMED  ·  SPACE melee");
      return;
    }

    const { ammoInMag, stats, isReloading } = weapon;
    const status = isReloading ? "  RELOADING" : ammoInMag === 0 ? "  EMPTY  R" : "";
    this.ammoText.setText(`${stats.name}  ${ammoInMag}/${stats.magazineSize}${status}`);
  }
}
