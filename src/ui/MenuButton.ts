import Phaser from "phaser";
import { COLORS, GAME_WIDTH } from "../config";
import { AudioSystem } from "../systems/AudioSystem";

export const MENU_BUTTON = { width: 280, height: 64, gap: 80 } as const;

type MenuButtonOptions = {
  x?: number;
  y: number;
  depth?: number;
  scrollFactor?: number;
  fontSize?: string;
};

export function addMenuButton(
  scene: Phaser.Scene,
  label: string,
  onClick: () => void,
  options: MenuButtonOptions,
): Phaser.GameObjects.GameObject[] {
  const x = options.x ?? GAME_WIDTH / 2;
  const depth = options.depth ?? 2;
  const scroll = options.scrollFactor ?? 1;

  const image = scene.add.image(x, options.y, "button").setDepth(depth).setScrollFactor(scroll);

  const text = scene.add
    .text(x, options.y, label, {
      fontFamily: "monospace",
      fontSize: options.fontSize ?? "24px",
      color: COLORS.text,
    })
    .setOrigin(0.5)
    .setDepth(depth + 1)
    .setScrollFactor(scroll);

  const hit = scene.add
    .zone(x, options.y, MENU_BUTTON.width, MENU_BUTTON.height)
    .setDepth(depth + 2)
    .setScrollFactor(scroll)
    .setInteractive({ useHandCursor: true });

  hit.on("pointerover", () => {
    image.setTint(0x2de2ff);
    text.setColor("#0a0a12");
  });
  hit.on("pointerout", () => {
    image.clearTint();
    image.setScale(1);
    text.setColor(COLORS.text);
  });
  hit.on("pointerdown", () => {
    image.setTint(0xff2d6a);
    image.setScale(0.97);
    AudioSystem.from(scene).unlock();
    AudioSystem.from(scene).playSfx("sfx-ui");
    onClick();
  });

  return [image, text, hit];
}
