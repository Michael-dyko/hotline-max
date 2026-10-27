import Phaser from "phaser";
import { COLORS } from "../config";
import type { AudioSystem } from "../systems/AudioSystem";

export class AudioPanel {
  constructor(scene: Phaser.Scene, audio: AudioSystem, x: number, y: number) {
    this.row(scene, audio, x, y, "MUSIC", () => audio.settings.music, (value) => {
      audio.setMusicVolume(value);
    });
    this.row(scene, audio, x, y + 36, "SFX", () => audio.settings.sfx, (value) => {
      audio.setSfxVolume(value);
    });

    const mute = scene.add
      .text(x, y + 72, "", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: COLORS.text,
      })
      .setInteractive({ useHandCursor: true });

    const refreshMute = (): void => {
      mute.setText(audio.settings.muted ? "MUTED  (M)" : "MUTE   (M)");
      mute.setColor(audio.settings.muted ? "#ff2d6a" : COLORS.text);
    };
    refreshMute();
    mute.on("pointerdown", () => {
      audio.playSfx("sfx-ui");
      audio.toggleMute();
      refreshMute();
    });

    scene.input.keyboard?.on("keydown-M", () => {
      audio.toggleMute();
      refreshMute();
    });
  }

  private row(
    scene: Phaser.Scene,
    audio: AudioSystem,
    x: number,
    y: number,
    label: string,
    getValue: () => number,
    setValue: (value: number) => void,
  ): void {
    scene.add.text(x, y, label, {
      fontFamily: "monospace",
      fontSize: "16px",
      color: COLORS.muted,
    });

    const blocks: Phaser.GameObjects.Rectangle[] = [];
    for (let i = 0; i < 8; i += 1) {
      const block = scene.add
        .rectangle(x + 90 + i * 18, y + 8, 14, 16, COLORS.neonCyan)
        .setInteractive({ useHandCursor: true });
      blocks.push(block);
      block.on("pointerdown", () => {
        audio.unlock();
        setValue((i + 1) / 8);
        audio.playSfx("sfx-ui");
        paint();
      });
    }

    const paint = (): void => {
      const filled = Math.round(getValue() * 8);
      blocks.forEach((block, index) => {
        block.setFillStyle(index < filled ? COLORS.neonCyan : COLORS.wall);
      });
    };
    paint();
  }
}
