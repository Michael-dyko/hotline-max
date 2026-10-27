import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config";
import { CONTROL_LINES } from "../data/controls";
import { prefersReducedMotion } from "../data/fx";
import { GIFT, giftText } from "../data/gift";
import { AudioSystem } from "../systems/AudioSystem";
import { AudioPanel } from "../ui/AudioPanel";
import { addMenuButton } from "../ui/MenuButton";
import { drawMenuGrid } from "../ui/StoryPanel";

type MenuView = "root" | "controls" | "credits";

export class MenuScene extends Phaser.Scene {
  private readonly viewItems: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    const audio = AudioSystem.from(this);
    audio.playMusic("music-menu");
    this.input.on("pointerdown", () => audio.unlock());
    this.input.keyboard?.on("keydown", () => audio.unlock());
    drawMenuGrid(this);
    new AudioPanel(this, audio, 48, GAME_HEIGHT - 140);
    this.showView("root");
  }

  private showView(view: MenuView): void {
    for (const item of this.viewItems) {
      item.destroy();
    }
    this.viewItems.length = 0;

    if (view === "root") {
      this.drawRoot();
      return;
    }
    if (view === "controls") {
      this.drawTextView("CONTROLS", CONTROL_LINES);
      return;
    }
    this.drawTextView("CREDITS", GIFT.creditsLines.map(giftText));
  }

  private drawRoot(): void {
    const title = this.add
      .text(GAME_WIDTH / 2, 150, giftText(GIFT.gameTitle), {
        fontFamily: "monospace",
        fontSize: "64px",
        color: "#ff2d6a",
        stroke: "#2de2ff",
        strokeThickness: 1,
      })
      .setOrigin(0.5);
    this.viewItems.push(title);

    if (!prefersReducedMotion()) {
      this.tweens.add({
        targets: title,
        alpha: 0.72,
        duration: 900,
        yoyo: true,
        repeat: -1,
      });
    }

    this.viewItems.push(
      this.add
        .text(GAME_WIDTH / 2, 220, giftText(GIFT.menuTagline), {
          fontFamily: "monospace",
          fontSize: "20px",
          color: COLORS.muted,
        })
        .setOrigin(0.5),
      ...addMenuButton(this, "START GAME", () => this.scene.start("IntroScene"), {
        y: 330,
        fontSize: "26px",
      }),
      ...addMenuButton(this, "CONTROLS", () => this.showView("controls"), { y: 410 }),
      ...addMenuButton(this, "CREDITS", () => this.showView("credits"), { y: 490 }),
    );
  }

  private drawTextView(heading: string, lines: readonly string[]): void {
    this.viewItems.push(
      this.add
        .text(GAME_WIDTH / 2, 110, heading, {
          fontFamily: "monospace",
          fontSize: "40px",
          color: "#2de2ff",
        })
        .setOrigin(0.5),
    );

    lines.forEach((line, index) => {
      this.viewItems.push(
        this.add
          .text(GAME_WIDTH / 2, 190 + index * 32, line, {
            fontFamily: "monospace",
            fontSize: "20px",
            color: COLORS.text,
            align: "center",
          })
          .setOrigin(0.5),
      );
    });

    this.viewItems.push(
      ...addMenuButton(this, "BACK", () => this.showView("root"), {
        y: 540,
      }),
    );
  }
}
