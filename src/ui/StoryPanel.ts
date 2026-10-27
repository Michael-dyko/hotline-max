import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../config";
import { prefersReducedMotion } from "../data/fx";
import { AudioSystem } from "../systems/AudioSystem";

export function drawMenuGrid(scene: Phaser.Scene): void {
  const graphics = scene.add.graphics();
  graphics.lineStyle(1, COLORS.neonCyan, 0.08);
  for (let x = 0; x <= GAME_WIDTH; x += 64) {
    graphics.lineBetween(x, 0, x, GAME_HEIGHT);
  }
  for (let y = 0; y <= GAME_HEIGHT; y += 64) {
    graphics.lineBetween(0, y, GAME_WIDTH, y);
  }
}

export function addStoryTitle(scene: Phaser.Scene, text: string, y: number, size = 56): Phaser.GameObjects.Text {
  const title = scene.add
    .text(GAME_WIDTH / 2, y, text, {
      fontFamily: "monospace",
      fontSize: `${size}px`,
      color: "#ff2d6a",
      stroke: "#2de2ff",
      strokeThickness: 1,
      align: "center",
    })
    .setOrigin(0.5);

  if (!prefersReducedMotion()) {
    scene.tweens.add({
      targets: title,
      alpha: 0.72,
      duration: 900,
      yoyo: true,
      repeat: -1,
    });
  }

  return title;
}

export function addStoryLines(
  scene: Phaser.Scene,
  lines: readonly string[],
  startY: number,
): void {
  lines.forEach((line, index) => {
    scene.add
      .text(GAME_WIDTH / 2, startY + index * 36, line, {
        fontFamily: "monospace",
        fontSize: "22px",
        color: COLORS.text,
        align: "center",
        wordWrap: { width: GAME_WIDTH - 160 },
      })
      .setOrigin(0.5);
  });
}

export function addMenuButton(
  scene: Phaser.Scene,
  label: string,
  y: number,
  onClick: () => void,
): void {
  const x = GAME_WIDTH / 2;
  const button = scene.add.image(x, y, "button");
  scene.add
    .text(x, y, label, {
      fontFamily: "monospace",
      fontSize: "28px",
      color: COLORS.text,
    })
    .setOrigin(0.5);

  const hit = scene.add.zone(x, y, 280, 64).setInteractive({ useHandCursor: true });
  hit.on("pointerover", () => button.setTint(0x2de2ff));
  hit.on("pointerout", () => button.clearTint());
  hit.on("pointerdown", () => {
    AudioSystem.from(scene).playSfx("sfx-ui");
    onClick();
  });
}
