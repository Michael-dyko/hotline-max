import Phaser from "phaser";
import { COLORS, GAME_HEIGHT } from "../config";
import { GIFT, giftText } from "../data/gift";
import { AudioSystem } from "../systems/AudioSystem";
import { addMenuButton, addStoryLines, addStoryTitle, drawMenuGrid } from "../ui/StoryPanel";

export class EndingScene extends Phaser.Scene {
  constructor() {
    super("EndingScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    const audio = AudioSystem.from(this);
    audio.playMusic("music-menu");
    drawMenuGrid(this);

    addStoryTitle(this, giftText(GIFT.endingTitle), 140);
    this.add
      .text(this.scale.width / 2, 220, giftText(GIFT.friendName), {
        fontFamily: "monospace",
        fontSize: "28px",
        color: "#2de2ff",
      })
      .setOrigin(0.5);

    addStoryLines(this, GIFT.endingLines.map(giftText), 280);

    addMenuButton(this, "AGAIN", GAME_HEIGHT / 2 + 140, () => {
      this.scene.start("IntroScene");
    });
    addMenuButton(this, "MENU", GAME_HEIGHT / 2 + 220, () => {
      this.scene.start("MenuScene");
    });
  }
}
