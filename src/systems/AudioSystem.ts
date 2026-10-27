import Phaser from "phaser";

const STORAGE_KEY = "hotline-max-audio";

type AudioSettings = {
  music: number;
  sfx: number;
  muted: boolean;
};

const DEFAULTS: AudioSettings = { music: 0.45, sfx: 0.7, muted: false };

const SFX_THROTTLE_MS: Record<string, number> = {
  "sfx-hit-wall": 40,
  "sfx-hit-enemy": 50,
  "sfx-pistol": 40,
};

export class AudioSystem {
  settings: AudioSettings;
  unlocked = false;
  private pendingMusic: string | undefined;
  private readonly lastPlayed = new Map<string, number>();
  private readonly game: Phaser.Game;

  constructor(game: Phaser.Game) {
    this.game = game;
    this.settings = this.load();
    this.applyMute();
  }

  static from(scene: Phaser.Scene): AudioSystem {
    const existing = scene.registry.get("audio");
    if (existing instanceof AudioSystem) {
      return existing;
    }
    const audio = new AudioSystem(scene.game);
    scene.registry.set("audio", audio);
    return audio;
  }

  unlock(): void {
    if (!this.unlocked) {
      this.unlocked = true;
      this.game.sound.unlock();
    }
    if (this.pendingMusic) {
      const key = this.pendingMusic;
      this.pendingMusic = undefined;
      this.playMusic(key);
    }
  }

  playSfx(key: string): void {
    if (!this.unlocked || this.settings.muted || !this.has(key)) {
      return;
    }

    const now = this.game.loop.time;
    const throttle = SFX_THROTTLE_MS[key] ?? 0;
    const previous = this.lastPlayed.get(key) ?? -Infinity;
    if (now - previous < throttle) {
      return;
    }
    this.lastPlayed.set(key, now);
    this.game.sound.play(key, { volume: this.settings.sfx });
  }

  playMusic(key: string): void {
    if (!this.has(key)) {
      return;
    }
    this.pendingMusic = key;
    if (!this.unlocked) {
      return;
    }
    this.pendingMusic = undefined;

    for (const sound of this.listSounds()) {
      if (sound.key.startsWith("music-") && sound.key !== key && sound.isPlaying) {
        sound.stop();
      }
    }

    const existing = this.game.sound.get(key);
    const music = existing ?? this.game.sound.add(key, { loop: true });
    this.setTrackVolume(music, this.settings.muted ? 0 : this.settings.music);
    if (!music.isPlaying) {
      music.play();
    }
  }

  setMusicVolume(value: number): void {
    this.settings.music = Phaser.Math.Clamp(value, 0, 1);
    this.save();
    const music = this.musicTrack();
    if (music) {
      this.setTrackVolume(music, this.settings.muted ? 0 : this.settings.music);
    }
  }

  setSfxVolume(value: number): void {
    this.settings.sfx = Phaser.Math.Clamp(value, 0, 1);
    this.save();
  }

  setMuted(muted: boolean): void {
    this.settings.muted = muted;
    this.save();
    this.applyMute();
  }

  toggleMute(): void {
    this.setMuted(!this.settings.muted);
  }

  private musicTrack(): Phaser.Sound.BaseSound | null {
    return this.listSounds().find((sound) => sound.key.startsWith("music-") && sound.isPlaying) ?? null;
  }

  private listSounds(): Phaser.Sound.BaseSound[] {
    const manager = this.game.sound as unknown as { sounds?: Phaser.Sound.BaseSound[] };
    return manager.sounds ?? [];
  }

  private setTrackVolume(sound: Phaser.Sound.BaseSound, volume: number): void {
    const withVolume = sound as Phaser.Sound.BaseSound & { setVolume?: (value: number) => void };
    withVolume.setVolume?.(volume);
  }

  private has(key: string): boolean {
    return this.game.cache.audio.exists(key);
  }

  private applyMute(): void {
    this.game.sound.mute = this.settings.muted;
    const music = this.musicTrack();
    if (music) {
      this.setTrackVolume(music, this.settings.muted ? 0 : this.settings.music);
    }
  }

  private load(): AudioSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { ...DEFAULTS };
      }
      const parsed = JSON.parse(raw) as Partial<AudioSettings>;
      return {
        music: typeof parsed.music === "number" ? parsed.music : DEFAULTS.music,
        sfx: typeof parsed.sfx === "number" ? parsed.sfx : DEFAULTS.sfx,
        muted: Boolean(parsed.muted),
      };
    } catch {
      return { ...DEFAULTS };
    }
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
  }
}
