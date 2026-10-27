import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config";
import { prefersReducedMotion } from "../data/fx";
import { GIFT, giftText } from "../data/gift";
import { AudioSystem } from "../systems/AudioSystem";
import { AudioPanel } from "../ui/AudioPanel";
import { drawMenuGrid } from "../ui/StoryPanel";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    const audio = AudioSystem.from(this);
    audio.playMusic("music-menu");
    drawMenuGrid(this);
    new AudioPanel(this, audio, 48, GAME_HEIGHT - 140);

    const title = this.add
      .text(GAME_WIDTH / 2, 180, giftText(GIFT.gameTitle), {
        fontFamily: "monospace",
        fontSize: "64px",
        color: "#ff2d6a",
        stroke: "#2de2ff",
        strokeThickness: 1,
      })
      .setOrigin(0.5);

    if (!prefersReducedMotion()) {
      this.tweens.add({
        targets: title,
        alpha: 0.72,
        duration: 900,
        yoyo: true,
        repeat: -1,
      });
    }

    this.add
      .text(GAME_WIDTH / 2, 250, giftText(GIFT.menuTagline), {
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
      audio.unlock();
      audio.playSfx("sfx-ui");
      this.scene.start("IntroScene");
    });
  }
}
