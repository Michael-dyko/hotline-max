import type Phaser from "phaser";

export const IMAGE_OPTIONAL = [
  { key: "art-player", path: "assets/sprites/player.png", logical: "player" },
  { key: "art-enemy", path: "assets/sprites/enemy.png", logical: "enemy" },
  { key: "art-pickup", path: "assets/sprites/pickup.png", logical: "pickup" },
  { key: "art-floor", path: "assets/tiles/floor.png", logical: "floor" },
  { key: "art-wall", path: "assets/tiles/wall.png", logical: "wall" },
] as const;

export const AUDIO_FILES = [
  { key: "sfx-pistol", path: "assets/audio/pistol.wav" },
  { key: "sfx-shotgun", path: "assets/audio/shotgun.wav" },
  { key: "sfx-reload", path: "assets/audio/reload.wav" },
  { key: "sfx-hit-wall", path: "assets/audio/hit-wall.wav" },
  { key: "sfx-hit-enemy", path: "assets/audio/hit-enemy.wav" },
  { key: "sfx-melee", path: "assets/audio/melee.wav" },
  { key: "sfx-death", path: "assets/audio/death.wav" },
  { key: "sfx-hurt", path: "assets/audio/hurt.wav" },
  { key: "sfx-pickup", path: "assets/audio/pickup.wav" },
  { key: "sfx-ui", path: "assets/audio/ui-click.wav" },
  {
    key: "music-menu",
    path: ["assets/audio/menu_theme.ogg", "assets/audio/music-menu.wav"],
  },
  {
    key: "music-game",
    path: ["assets/audio/main_theme_1.ogg", "assets/audio/music-game.wav"],
  },
] as const;

export function textureKey(scene: { textures: Phaser.Textures.TextureManager }, logical: string): string {
  const artKey = `art-${logical}`;
  if (scene.textures.exists(artKey)) {
    return artKey;
  }
  return logical;
}
