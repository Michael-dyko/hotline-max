import Phaser from "phaser";
import { CAMERA_FOLLOW_LERP, COLORS, GAME_WIDTH, cheatsEnabled } from "../config";
import { GIFT, giftText, getLevelCopy } from "../data/gift";
import { getLevel, getLevelNumber, getNextLevelId, LEVELS } from "../data/levels";
import { PISTOL } from "../data/weapons";
import { Player } from "../entities/Player";
import { CollisionSystem } from "../systems/CollisionSystem";
import { CombatSystem } from "../systems/CombatSystem";
import { FxSystem } from "../systems/FxSystem";
import { EnemyAI } from "../systems/EnemyAI";
import { InputSystem } from "../systems/InputSystem";
import { LevelSystem } from "../systems/LevelSystem";
import { MeleeSystem } from "../systems/MeleeSystem";
import { MovementSystem } from "../systems/MovementSystem";
import { PickupSystem } from "../systems/PickupSystem";
import { AudioSystem } from "../systems/AudioSystem";
import { WeaponSystem } from "../systems/WeaponSystem";
import { Hud } from "../ui/Hud";
import { ResultOverlay } from "../ui/ResultOverlay";

type FlowState = "playing" | "paused" | "dead" | "complete";

type GameSceneData = {
  levelId?: string;
};

export class GameScene extends Phaser.Scene {
  private levelId = "level-1";
  private flow: FlowState = "playing";
  private player!: Player;
  private inputSystem!: InputSystem;
  private weapon: WeaponSystem | undefined;
  private combat!: CombatSystem;
  private enemyAI!: EnemyAI;
  private pickups!: PickupSystem;
  private melee!: MeleeSystem;
  private hud!: Hud;
  private overlay!: ResultOverlay;
  private fireArmed = false;
  private readonly movementSystem = new MovementSystem();
  private readonly collisionSystem = new CollisionSystem();

  constructor() {
    super("GameScene");
  }

  init(data: GameSceneData): void {
    this.levelId = data.levelId ?? "level-1";
    this.flow = "playing";
    this.fireArmed = false;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);

    const level = new LevelSystem(this, getLevel(this.levelId));
    level.applyBounds();

    const fx = new FxSystem(this);
    this.registry.set("fx", fx);

    this.player = new Player(this, level.data.spawn.x, level.data.spawn.y);
    this.inputSystem = new InputSystem(this);
    this.weapon = new WeaponSystem(PISTOL);
    this.combat = new CombatSystem(this, fx);
    this.combat.spawnTargets(level.data.targets);
    this.enemyAI = new EnemyAI(this, this.combat, level.solidRects, level.data.enemies);
    this.pickups = new PickupSystem(this);
    this.pickups.spawnFromData(level.data.pickups);
    this.melee = new MeleeSystem(this);
    AudioSystem.from(this).playMusic("music-game");
    this.hud = new Hud(this);
    this.overlay = new ResultOverlay(this);

    this.collisionSystem.enablePlayerWalls(this, this.player, level.solids);
    this.collisionSystem.enablePlayerTargets(this, this.player, this.combat);
    this.collisionSystem.enableEnemies(this, this.player, this.enemyAI, level.solids);
    this.collisionSystem.enableProjectiles(
      this,
      this.player,
      this.combat,
      this.enemyAI,
      level.solids,
    );

    this.physics.add.overlap(this.player.sprite, this.pickups.sprites, (_player, item) => {
      if (!(item instanceof Phaser.GameObjects.GameObject)) {
        return;
      }
      this.tryPickUp(item);
    });

    this.cameras.main.startFollow(
      this.player.sprite,
      true,
      CAMERA_FOLLOW_LERP,
      CAMERA_FOLLOW_LERP,
    );

    const copy = getLevelCopy(this.levelId);
    if (copy.briefing) {
      const briefing = this.add
        .text(GAME_WIDTH / 2, 150, giftText(copy.briefing), {
          fontFamily: "monospace",
          fontSize: "22px",
          color: "#ffe566",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(10);
      this.tweens.add({
        targets: briefing,
        alpha: 0,
        delay: 2800,
        duration: 600,
        onComplete: () => briefing.destroy(),
      });
    }

    this.input.keyboard?.on("keydown-ESC", () => {
      this.togglePause();
    });
    this.input.keyboard?.on("keydown-M", () => {
      AudioSystem.from(this).toggleMute();
    });
    this.enableCheats();
  }

  private enableCheats(): void {
    if (!cheatsEnabled()) {
      return;
    }

    if (!this.registry.has("devGod")) {
      this.registry.set("devGod", true);
    }

    this.add
      .text(GAME_WIDTH - 24, 16, "DEV  N skip  1-3 jump  G god", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: COLORS.muted,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(10);

    this.input.keyboard?.on("keydown-N", () => {
      if (this.flow !== "playing") {
        return;
      }
      for (const enemy of this.enemyAI.enemies) {
        if (enemy.state !== "DEAD") {
          enemy.die();
        }
      }
    });

    this.input.keyboard?.on("keydown-ONE", () => {
      this.goToLevel("level-1");
    });
    this.input.keyboard?.on("keydown-TWO", () => {
      this.goToLevel("level-2");
    });
    this.input.keyboard?.on("keydown-THREE", () => {
      this.goToLevel("level-3");
    });
    this.input.keyboard?.on("keydown-G", () => {
      this.registry.set("devGod", this.registry.get("devGod") !== true);
    });
  }

  update(_time: number, delta: number): void {
    const now = this.time.now;
    const hostilesLeft = this.enemyAI.enemies.filter((enemy) => enemy.state !== "DEAD").length;
    const boss = this.enemyAI.enemies.find((enemy) => enemy.boss && enemy.state !== "DEAD");
    this.hud.sync(
      this.weapon,
      this.player,
      getLevelNumber(this.levelId),
      LEVELS.length,
      hostilesLeft,
      getLevelCopy(this.levelId).title,
      boss ? GIFT.bossName : undefined,
    );
    this.resolveFlow();

    if (this.flow !== "playing") {
      this.player.sprite.setVelocity(0, 0);
      return;
    }

    const move = this.inputSystem.getMoveVector();
    const aim = this.inputSystem.getAimPoint(this);
    this.movementSystem.update(this.player, move, aim);

    this.weapon?.update(now);
    if (this.inputSystem.isReloadJustPressed() && this.weapon?.tryReload(now)) {
      AudioSystem.from(this).playSfx("sfx-reload");
    }
    if (this.inputSystem.isMeleeJustPressed()) {
      this.melee.trySwing(now, this.player, this.enemyAI);
    }
    if (this.inputSystem.isDropJustPressed()) {
      this.dropWeapon(now);
    }
    if (!this.inputSystem.isFiring(this)) {
      this.fireArmed = true;
    }
    if (this.fireArmed && this.inputSystem.isFiring(this) && this.weapon) {
      if (this.combat.tryShoot(this.player, this.weapon, now, "player")) {
        this.enemyAI.hearShot(this.player.x, this.player.y);
      }
    }
    this.enemyAI.update(now, delta, this.player);
    this.combat.update(now);
  }

  private tryPickUp(item: Phaser.GameObjects.GameObject): void {
    const now = this.time.now;
    const collected = this.pickups.collectFrom(item, now);
    if (!collected) {
      return;
    }

    if (this.weapon) {
      this.pickups.dropBehind(this.player, this.weapon, now);
    }
    this.weapon = new WeaponSystem(collected.stats, collected.ammo);
    AudioSystem.from(this).playSfx("sfx-pickup");
    const fx = this.registry.get("fx");
    if (fx instanceof FxSystem) {
      fx.pickup(this.player.x, this.player.y);
    }
  }

  private dropWeapon(now: number): void {
    if (!this.weapon) {
      return;
    }

    this.pickups.dropBehind(this.player, this.weapon, now);
    this.weapon = undefined;
    AudioSystem.from(this).playSfx("sfx-ui");
  }

  private resolveFlow(): void {
    if (this.flow !== "playing") {
      return;
    }

    if (this.player.isDead) {
      this.flow = "dead";
      this.overlay.show("YOU DIED", [
        { label: "RESTART", onClick: () => this.restartLevel() },
        { label: "MENU", onClick: () => this.goToMenu() },
      ]);
      return;
    }

    if (this.enemyAI.allDefeated()) {
      this.flow = "complete";
      const fx = this.registry.get("fx");
      if (fx instanceof FxSystem) {
        fx.levelClear();
      }
      const nextId = getNextLevelId(this.levelId);
      const copy = getLevelCopy(this.levelId);
      if (nextId) {
        this.overlay.show(
          `${copy.title}  CLEARED`,
          [
            {
              label: "NEXT",
              onClick: () => this.goToLevel(nextId),
            },
            { label: "MENU", onClick: () => this.goToMenu() },
          ],
          {
            body: copy.afterClear ? giftText(copy.afterClear) : undefined,
            skippable: true,
          },
        );
        return;
      }

      this.scene.start("EndingScene");
    }
  }

  private togglePause(): void {
    if (this.flow === "dead" || this.flow === "complete") {
      return;
    }
    if (this.flow === "paused") {
      this.resumePlay();
      return;
    }
    this.pausePlay();
  }

  private pausePlay(): void {
    this.flow = "paused";
    this.fireArmed = false;
    this.physics.world.pause();
    this.time.paused = true;
    this.tweens.pauseAll();
    this.player.sprite.setVelocity(0, 0);
    this.overlay.show("PAUSED", [
      { label: "RESUME", onClick: () => this.resumePlay() },
      { label: "RESTART", onClick: () => this.restartLevel() },
      { label: "MENU", onClick: () => this.goToMenu() },
    ]);
  }

  private resumePlay(): void {
    if (this.flow !== "paused") {
      return;
    }
    this.overlay.hide();
    this.physics.world.resume();
    this.time.paused = false;
    this.tweens.resumeAll();
    this.fireArmed = false;
    this.flow = "playing";
  }

  private goToLevel(levelId: string): void {
    this.scene.start("GameScene", { levelId });
  }

  private restartLevel(): void {
    this.scene.start("GameScene", { levelId: this.levelId });
  }

  private goToMenu(): void {
    this.scene.start("MenuScene");
  }
}
