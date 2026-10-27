import Phaser from "phaser";

export const PROJECTILE_KIND = "projectile";

export function recycleProjectile(
  sprite: Phaser.Physics.Arcade.Sprite,
  x: number,
  y: number,
  angle: number,
  speed: number,
  damage: number,
  expiresAt: number,
  team: "player" | "enemy",
): void {
  sprite.enableBody(true, x, y, true, true);
  sprite.setRotation(angle);
  sprite.setData("kind", PROJECTILE_KIND);
  sprite.setData("damage", damage);
  sprite.setData("expiresAt", expiresAt);
  sprite.setData("team", team);

  const body = sprite.body;
  if (!(body instanceof Phaser.Physics.Arcade.Body)) {
    return;
  }

  body.setAllowGravity(false);
  body.setCollideWorldBounds(true);
  body.onWorldBounds = true;
  sprite.scene.physics.velocityFromRotation(angle, speed, body.velocity);
}

export function disableProjectile(sprite: Phaser.Physics.Arcade.Sprite): void {
  sprite.disableBody(true, true);
}
