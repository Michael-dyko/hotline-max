import Phaser from "phaser";
import { COLORS } from "../config";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create(): void {
    this.createPlaceholderTextures();
    this.scene.start("MenuScene");
  }

  private createPlaceholderTextures(): void {
    this.drawPlayerTexture();
    this.drawTexture("button", 280, 64, COLORS.neonPink);
    this.drawTexture("floor-tile", 64, 64, COLORS.floor);
    this.drawTexture("bullet", 8, 8, COLORS.neonYellow);
    this.drawTexture("muzzle", 18, 18, COLORS.neonYellow);
    this.drawTexture("target", 28, 28, COLORS.neonCyan);
    this.drawEnemyTexture();
  }

  private drawTexture(
    key: string,
    width: number,
    height: number,
    color: number,
  ): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.lineStyle(2, 0xffffff, 0.25);
    graphics.strokeRect(1, 1, width - 2, height - 2);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  private drawPlayerTexture(): void {
    const size = 32;
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(COLORS.neonPink, 1);
    graphics.fillTriangle(size - 2, size / 2, 4, 4, 4, size - 4);
    graphics.lineStyle(2, COLORS.neonCyan, 0.9);
    graphics.strokeTriangle(size - 2, size / 2, 4, 4, 4, size - 4);
    graphics.generateTexture("player", size, size);
    graphics.destroy();
  }

  private drawEnemyTexture(): void {
    const size = 32;
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(COLORS.neonYellow, 1);
    graphics.fillTriangle(size - 2, size / 2, 4, 4, 4, size - 4);
    graphics.lineStyle(2, 0xff2d6a, 0.9);
    graphics.strokeTriangle(size - 2, size / 2, 4, 4, 4, size - 4);
    graphics.generateTexture("enemy", size, size);
    graphics.destroy();
  }
}
