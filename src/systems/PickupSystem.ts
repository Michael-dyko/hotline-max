import Phaser from "phaser";
import { COLORS } from "../config";
import { textureKey } from "../data/assets";
import { getWeapon, type WeaponStats } from "../data/weapons";
import type { Player } from "../entities/Player";
import type { WeaponSystem } from "./WeaponSystem";

export type GroundWeapon = {
  stats: WeaponStats;
  ammo: number;
};

export class PickupSystem {
  readonly sprites: Phaser.Physics.Arcade.StaticGroup;
  private ignoreUntil = 0;
  private ignored?: Phaser.GameObjects.GameObject;

  constructor(private readonly scene: Phaser.Scene) {
    this.sprites = scene.physics.add.staticGroup();
  }

  spawn(
    x: number,
    y: number,
    stats: WeaponStats,
    ammo: number,
  ): Phaser.Physics.Arcade.Sprite {
    const sprite = this.scene.physics.add.staticSprite(x, y, textureKey(this.scene, "pickup"));
    sprite.setTint(stats.color);
    sprite.setData("weaponId", stats.id);
    sprite.setData("ammo", ammo);
    sprite.setDepth(4);
    const label = this.scene.add
      .text(x, y + 18, stats.name, {
        fontFamily: "monospace",
        fontSize: "10px",
        color: COLORS.text,
      })
      .setOrigin(0.5);
    sprite.setData("label", label);
    this.sprites.add(sprite);
    return sprite;
  }

  spawnFromData(pickups: { weaponId: string; x: number; y: number; ammo?: number }[]): void {
    for (const pickup of pickups) {
      const stats = getWeapon(pickup.weaponId);
      this.spawn(pickup.x, pickup.y, stats, pickup.ammo ?? stats.magazineSize);
    }
  }

  collectFrom(sprite: Phaser.GameObjects.GameObject, now: number): GroundWeapon | undefined {
    if (sprite === this.ignored && now < this.ignoreUntil) {
      return undefined;
    }

    const stats = getWeapon(String(sprite.getData("weaponId")));
    const ammo = Number(sprite.getData("ammo"));
    this.remove(sprite);
    return { stats, ammo: Number.isFinite(ammo) ? ammo : stats.magazineSize };
  }

  dropBehind(player: Player, weapon: WeaponSystem, now: number): void {
    const x = player.x - Math.cos(player.rotation) * 36;
    const y = player.y - Math.sin(player.rotation) * 36;
    this.ignored = this.spawn(x, y, weapon.stats, weapon.ammoInMag);
    this.ignoreUntil = now + 450;
  }

  private remove(sprite: Phaser.GameObjects.GameObject): void {
    const label = sprite.getData("label");
    if (label instanceof Phaser.GameObjects.Text) {
      label.destroy();
    }
    sprite.destroy();
  }
}
