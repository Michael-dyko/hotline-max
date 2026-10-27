import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config";
import { addMenuButton } from "./MenuButton";

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
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 160, title, {
        fontFamily: "monospace",
        fontSize: "44px",
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
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, options.body, {
          fontFamily: "monospace",
          fontSize: "20px",
          color: COLORS.text,
          align: "center",
          wordWrap: { width: GAME_WIDTH - 200 },
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(101);
      this.items.push(body);
    }

    const startY = options.body ? GAME_HEIGHT / 2 + 10 : GAME_HEIGHT / 2 - 20;
    buttons.forEach((button, index) => {
      this.items.push(
        ...addMenuButton(this.scene, button.label, button.onClick, {
          y: startY + index * 80,
          depth: 101,
          scrollFactor: 0,
        }),
      );
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
      this.scene.input.keyboard?.on("keydown-SPACE", this.skipHandler);
      this.scene.input.keyboard?.on("keydown-ENTER", this.skipHandler);
    }
  }

  hide(): void {
    this.clear();
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
