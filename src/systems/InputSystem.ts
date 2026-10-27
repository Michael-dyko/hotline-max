import Phaser from "phaser";

export class InputSystem {
  private readonly keys: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    R: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
    Q: Phaser.Input.Keyboard.Key;
  };
  private readonly move = new Phaser.Math.Vector2();
  private readonly aim = new Phaser.Math.Vector2();

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error("Keyboard input is required for player movement.");
    }

    keyboard.addCapture("SPACE");
    this.keys = keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      R: Phaser.Input.Keyboard.KeyCodes.R,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
      Q: Phaser.Input.Keyboard.KeyCodes.Q,
    }) as {
      W: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
      R: Phaser.Input.Keyboard.Key;
      SPACE: Phaser.Input.Keyboard.Key;
      Q: Phaser.Input.Keyboard.Key;
    };
  }

  getMoveVector(): Phaser.Math.Vector2 {
    this.move.set(0, 0);

    if (this.keys.A.isDown) {
      this.move.x -= 1;
    }
    if (this.keys.D.isDown) {
      this.move.x += 1;
    }
    if (this.keys.W.isDown) {
      this.move.y -= 1;
    }
    if (this.keys.S.isDown) {
      this.move.y += 1;
    }

    if (this.move.lengthSq() > 0) {
      this.move.normalize();
    }

    return this.move;
  }

  getAimPoint(scene: Phaser.Scene): Phaser.Math.Vector2 {
    const pointer = scene.input.activePointer;
    return this.aim.set(pointer.worldX, pointer.worldY);
  }

  isFiring(scene: Phaser.Scene): boolean {
    return scene.input.activePointer.leftButtonDown();
  }

  isReloadJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.R);
  }

  isMeleeJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
  }

  isDropJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.Q);
  }
}
