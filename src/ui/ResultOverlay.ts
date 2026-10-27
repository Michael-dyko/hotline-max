import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config";
import { AudioSystem } from "../systems/AudioSystem";

type OverlayButton = {
  label: string;
  onClick: () => void;
};

type OverlayOptions = {
  body?: string;
  skippable?: boolean;
};

export class ResultOverlay {
  private readonly items: Phaser.GameObjects.GameObject[] = [];
  private skipHandler: (() => void) | undefined;

  constructor(private readonly scene: Phaser.Scene) {}

  show(title: string, buttons: OverlayButton[], options: OverlayOptions = {}): void {
    this.clear();

    const dim = this.scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.72)
      .setScrollFactor(0)
      .setDepth(100);

    const heading = this.scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 140, title, {
        fontFamily: "monospace",
        fontSize: "48px",
        color: title === "YOU DIED" ? "#ff2d6a" : "#2de2ff",
        align: "center",
        wordWrap: { width: GAME_WIDTH - 120 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);

    this.items.push(dim, heading);

    if (options.body) {
      const body = this.scene.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, options.body, {
          fontFamily: "monospace",
          fontSize: "22px",
          color: COLORS.text,
          align: "center",
          wordWrap: { width: GAME_WIDTH - 200 },
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(101);
      this.items.push(body);
    }

    buttons.forEach((button, index) => {
      this.addButton(button.label, GAME_HEIGHT / 2 + 40 + index * 80, button.onClick);
    });

    if (options.skippable && buttons[0]) {
      const first = buttons[0];
      let used = false;
      this.skipHandler = () => {
        if (used) {
          return;
        }
        used = true;
        first.onClick();
      };
      dim.setInteractive();
      dim.on("pointerdown", this.skipHandler);
      this.scene.input.keyboard?.on("keydown-SPACE", this.skipHandler);
      this.scene.input.keyboard?.on("keydown-ENTER", this.skipHandler);
    }
  }

  private addButton(label: string, y: number, onClick: () => void): void {
    const x = GAME_WIDTH / 2;
    const image = this.scene.add
      .image(x, y, "button")
      .setScrollFactor(0)
      .setDepth(101)
      .setInteractive({ useHandCursor: true });
    const text = this.scene.add
      .text(x, y, label, {
        fontFamily: "monospace",
        fontSize: "24px",
        color: COLORS.text,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102);

    image.on("pointerover", () => image.setTint(0x2de2ff));
    image.on("pointerout", () => image.clearTint());
    image.on("pointerdown", () => {
      AudioSystem.from(this.scene).playSfx("sfx-ui");
      onClick();
    });

    this.items.push(image, text);
  }

  private clear(): void {
    if (this.skipHandler) {
      this.scene.input.keyboard?.off("keydown-SPACE", this.skipHandler);
      this.scene.input.keyboard?.off("keydown-ENTER", this.skipHandler);
      this.skipHandler = undefined;
    }
    for (const item of this.items) {
      item.destroy();
    }
    this.items.length = 0;
  }
}
