/**
 * Birthday gift copy. Edit this file only — no gameplay lives here.
 *
 * Replace the placeholder strings before you send the game.
 * Use {name} anywhere you want the friend's display name inserted.
 * Leave a dialogue string empty ("") to skip that interstitial.
 */
export const GIFT = {
  /** Display name of the birthday person. Placeholder on purpose. */
  friendName: "FRIEND",

  gameTitle: "HOTLINE MAX",

  menuTagline: "A birthday game for {name}",

  introTitle: "TONIGHT",
  introLines: [
    "The rooms are already waiting.",
    "Clear each floor. Don't linger.",
    "This one is for you, {name}.",
  ],
  introHint: "CLICK or SPACE to continue",

  levels: {
    "level-1": {
      title: "FRONT DESK",
      briefing: "In and out.",
      afterClear: "They know you're here.",
    },
    "level-2": {
      title: "THE HALL",
      briefing: "Keep moving.",
      afterClear: "Last door. Someone's waiting.",
    },
    "level-3": {
      title: "BACK OFFICE",
      briefing: "Finish it.",
      afterClear: "",
    },
  },

  /** Name shown on the unique last-level encounter. */
  bossName: "THE HOST",

  endingTitle: "HAPPY BIRTHDAY",
  endingLines: [
    "That's the job, {name}.",
    "Thanks for playing.",
    "A small game for a big day.",
  ],
} as const;

export type GiftLevelId = keyof typeof GIFT.levels;

export type LevelCopy = {
  title: string;
  briefing: string;
  afterClear: string;
};

export function giftText(value: string): string {
  return value.split("{name}").join(GIFT.friendName);
}

export function getLevelCopy(levelId: string): LevelCopy {
  if (levelId in GIFT.levels) {
    return GIFT.levels[levelId as GiftLevelId];
  }
  return { title: levelId, briefing: "", afterClear: "" };
}
