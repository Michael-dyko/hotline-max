import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config";

type OverlayButton = {
  label: string;
  onClick: () => void;
};

export class ResultOverlay {
  private readonly root: Phaser.GameObjects.Container;

  constructor(private readonly scene: Phaser.Scene) {
    this.root = scene.add.container(0, 0).setDepth(100).setScrollFactor(0).setVisible(false);
  }

  show(title: string, buttons: OverlayButton[]): void {
    this.root.removeAll(true);

    const dim = this.scene.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      0.72,
    );

    const heading = this.scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120, title, {
        fontFamily: "monospace",
        fontSize: "48px",
        color: "#ff2d6a",
      })
      .setOrigin(0.5);

    this.root.add([dim, heading]);

    buttons.forEach((button, index) => {
      this.addButton(button.label, GAME_HEIGHT / 2 - 10 + index * 80, button.onClick);
    });

    this.root.setVisible(true);
  }

  private addButton(label: string, y: number, onClick: () => void): void {
    const x = GAME_WIDTH / 2;
    const image = this.scene.add.image(x, y, "button");
    const text = this.scene.add
      .text(x, y, label, {
        fontFamily: "monospace",
        fontSize: "24px",
        color: COLORS.text,
      })
      .setOrigin(0.5);
    const hit = this.scene.add.zone(x, y, 280, 64).setInteractive({ useHandCursor: true });

    hit.on("pointerover", () => image.setTint(0x2de2ff));
    hit.on("pointerout", () => image.clearTint());
    hit.on("pointerdown", onClick);

    this.root.add([image, text, hit]);
  }
}
