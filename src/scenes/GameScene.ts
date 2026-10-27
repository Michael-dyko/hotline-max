import Phaser from "phaser";
import { CAMERA_FOLLOW_LERP, COLORS } from "../config";
import { getLevel, getNextLevelId } from "../data/levels";
import { PISTOL } from "../data/weapons";
import { Player } from "../entities/Player";
import { CollisionSystem } from "../systems/CollisionSystem";
import { CombatSystem } from "../systems/CombatSystem";
import { EnemyAI } from "../systems/EnemyAI";
import { InputSystem } from "../systems/InputSystem";
import { LevelSystem } from "../systems/LevelSystem";
import { MovementSystem } from "../systems/MovementSystem";
import { WeaponSystem } from "../systems/WeaponSystem";
import { Hud } from "../ui/Hud";
import { ResultOverlay } from "../ui/ResultOverlay";

type FlowState = "playing" | "dead" | "complete";

type GameSceneData = {
  levelId?: string;
};

export class GameScene extends Phaser.Scene {
  private levelId = "level-1";
  private flow: FlowState = "playing";
  private player!: Player;
  private inputSystem!: InputSystem;
  private weapon!: WeaponSystem;
  private combat!: CombatSystem;
  private enemyAI!: EnemyAI;
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

    this.player = new Player(this, level.data.spawn.x, level.data.spawn.y);
    this.inputSystem = new InputSystem(this);
    this.weapon = new WeaponSystem(PISTOL);
    this.combat = new CombatSystem(this);
    this.combat.spawnTargets(level.data.targets);
    this.enemyAI = new EnemyAI(this, this.combat, level.solidRects, level.data.enemies);
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

    this.cameras.main.startFollow(
      this.player.sprite,
      true,
      CAMERA_FOLLOW_LERP,
      CAMERA_FOLLOW_LERP,
    );

    this.add
      .text(24, 16, "WASD move  |  mouse aim  |  LMB fire  |  R reload", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#2de2ff",
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.add
      .text(24, 42, "ESC: menu", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: COLORS.muted,
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.input.keyboard?.on("keydown-ESC", () => {
      this.goToMenu();
    });
  }

  update(_time: number, delta: number): void {
    const now = this.time.now;
    this.hud.sync(this.weapon, this.player);
    this.resolveFlow();

    if (this.flow !== "playing") {
      this.player.sprite.setVelocity(0, 0);
      return;
    }

    const move = this.inputSystem.getMoveVector();
    const aim = this.inputSystem.getAimPoint(this);
    this.movementSystem.update(this.player, move, aim);

    this.weapon.update(now);
    if (this.inputSystem.isReloadJustPressed()) {
      this.weapon.tryReload(now);
    }
    if (!this.inputSystem.isFiring(this)) {
      this.fireArmed = true;
    }
    if (this.fireArmed && this.inputSystem.isFiring(this)) {
      if (this.combat.tryShoot(this.player, this.weapon, now, "player")) {
        this.enemyAI.hearShot(this.player.x, this.player.y);
      }
    }
    this.enemyAI.update(now, delta, this.player);
    this.combat.update(now);
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
      const nextId = getNextLevelId(this.levelId);
      const buttons = [];
      if (nextId) {
        buttons.push({
          label: "NEXT",
          onClick: () => this.scene.start("GameScene", { levelId: nextId }),
        });
      }
      buttons.push({ label: "MENU", onClick: () => this.goToMenu() });
      this.overlay.show("CLEARED", buttons);
    }
  }

  private restartLevel(): void {
    this.scene.restart({ levelId: this.levelId });
  }

  private goToMenu(): void {
    this.scene.start("MenuScene");
  }
}
