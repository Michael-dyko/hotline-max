import Phaser from "phaser";
import { PLAYER_SPEED } from "../config";
import type { Player } from "../entities/Player";

export class MovementSystem {
  update(
    player: Player,
    move: Phaser.Math.Vector2,
    aim: Phaser.Math.Vector2,
  ): void {
    player.sprite.setVelocity(move.x * PLAYER_SPEED, move.y * PLAYER_SPEED);

    const angle = Phaser.Math.Angle.Between(player.x, player.y, aim.x, aim.y);
    player.sprite.setRotation(angle);
  }
}
