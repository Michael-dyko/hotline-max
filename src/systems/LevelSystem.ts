import Phaser from "phaser";
import { COLORS } from "../config";
import type { LevelData, Rect } from "../data/levels";

export class LevelSystem {
  readonly solids: Phaser.Physics.Arcade.StaticGroup;

  constructor(
    private readonly scene: Phaser.Scene,
    readonly data: LevelData,
  ) {
    this.solids = scene.physics.add.staticGroup();
    this.drawRooms();
    this.addSolids(data.walls, COLORS.wall);
    this.addSolids(data.obstacles, COLORS.obstacle);
  }

  get solidRects(): Rect[] {
    return [...this.data.walls, ...this.data.obstacles];
  }

  applyBounds(): void {
    this.scene.physics.world.setBounds(0, 0, this.data.width, this.data.height);
    this.scene.cameras.main.setBounds(0, 0, this.data.width, this.data.height);
  }

  private drawRooms(): void {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(COLORS.floor, 1);

    for (const room of this.data.rooms) {
      graphics.fillRect(room.x, room.y, room.width, room.height);
    }

    graphics.lineStyle(1, COLORS.wall, 0.35);
    for (let x = 0; x <= this.data.width; x += 64) {
      graphics.lineBetween(x, 0, x, this.data.height);
    }
    for (let y = 0; y <= this.data.height; y += 64) {
      graphics.lineBetween(0, y, this.data.width, y);
    }
  }

  private addSolids(rects: Rect[], color: number): void {
    for (const rect of rects) {
      const block = this.scene.add.rectangle(
        rect.x + rect.width / 2,
        rect.y + rect.height / 2,
        rect.width,
        rect.height,
        color,
      );
      block.setStrokeStyle(1, COLORS.neonCyan, 0.25);
      this.scene.physics.add.existing(block, true);
      this.solids.add(block);
    }
  }
}
