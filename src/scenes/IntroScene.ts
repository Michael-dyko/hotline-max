import Phaser from "phaser";
import { COLORS, GAME_HEIGHT } from "../config";
import { GIFT, giftText } from "../data/gift";
import { AudioSystem } from "../systems/AudioSystem";
import { addStoryLines, addStoryTitle, drawMenuGrid } from "../ui/StoryPanel";

export class IntroScene extends Phaser.Scene {
  constructor() {
    super("IntroScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    const audio = AudioSystem.from(this);
    audio.playMusic("music-menu");
    drawMenuGrid(this);

    addStoryTitle(this, giftText(GIFT.introTitle), 160);
    addStoryLines(this, GIFT.introLines.map(giftText), 260);

    this.add
      .text(this.scale.width / 2, GAME_HEIGHT - 80, GIFT.introHint, {
        fontFamily: "monospace",
        fontSize: "18px",
        color: COLORS.muted,
      })
      .setOrigin(0.5);

    const continueGame = (): void => {
      audio.unlock();
      audio.playSfx("sfx-ui");
      this.scene.start("GameScene", { levelId: "level-1" });
    };

    this.input.once("pointerdown", continueGame);
    this.input.keyboard?.once("keydown-SPACE", continueGame);
    this.input.keyboard?.once("keydown-ENTER", continueGame);
  }
}
