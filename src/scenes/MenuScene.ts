import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);

    this.add
      .text(GAME_WIDTH / 2, 180, "HOTLINE MAX", {
        fontFamily: "monospace",
        fontSize: "64px",
        color: "#ff2d6a",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 250, "A birthday bloodbath", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: COLORS.muted,
      })
      .setOrigin(0.5);

    const buttonX = GAME_WIDTH / 2;
    const buttonY = GAME_HEIGHT / 2 + 40;

    const button = this.add.image(buttonX, buttonY, "button");

    this.add
      .text(buttonX, buttonY, "START", {
        fontFamily: "monospace",
        fontSize: "28px",
        color: COLORS.text,
      })
      .setOrigin(0.5);

    const hit = this.add
      .zone(buttonX, buttonY, 280, 64)
      .setInteractive({ useHandCursor: true });

    hit.on("pointerover", () => {
      button.setTint(0x2de2ff);
    });

    hit.on("pointerout", () => {
      button.clearTint();
    });

    hit.on("pointerdown", () => {
      this.scene.start("GameScene", { levelId: "level-1" });
    });
  }
}
