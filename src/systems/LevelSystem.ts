import Phaser from "phaser";
import { COLORS } from "../config";
import { textureKey } from "../data/assets";
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
    graphics.fillStyle(0x0c0c16, 1);

    const floorKey = textureKey(this.scene, "floor");
    for (const room of this.data.rooms) {
      if (floorKey === "art-floor") {
        this.scene.add
          .tileSprite(
            room.x + room.width / 2,
            room.y + room.height / 2,
            room.width,
            room.height,
            floorKey,
          )
          .setDepth(0);
      } else {
        graphics.fillRect(room.x, room.y, room.width, room.height);
      }
    }

    graphics.lineStyle(1, COLORS.neonCyan, 0.12);
    for (let x = 0; x <= this.data.width; x += 64) {
      graphics.lineBetween(x, 0, x, this.data.height);
    }
    for (let y = 0; y <= this.data.height; y += 64) {
      graphics.lineBetween(0, y, this.data.width, y);
    }
  }

  private addSolids(rects: Rect[], color: number): void {
    for (const rect of rects) {
      const wallKey = textureKey(this.scene, "wall");
      const cx = rect.x + rect.width / 2;
      const cy = rect.y + rect.height / 2;
      const block =
        wallKey === "art-wall"
          ? this.scene.add.tileSprite(cx, cy, rect.width, rect.height, wallKey)
          : this.scene.add.rectangle(cx, cy, rect.width, rect.height, color);
      if (block instanceof Phaser.GameObjects.Rectangle) {
        block.setStrokeStyle(1, COLORS.neonCyan, 0.55);
      }
      this.scene.physics.add.existing(block, true);
      this.solids.add(block);
    }
  }
}
