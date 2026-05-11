export const CURRENT_TUTORIAL_VERSION = 1;

export type TutorialStep = {
  image: string;
  alt: string;
};

export const tutorialSteps: TutorialStep[] = [
  { image: "/tutorial/chu01.png", alt: "ノリは1人1件、10分ごとに更新" },
  { image: "/tutorial/chu02.png", alt: "友達の今を見て声をかけよう" },
  { image: "/tutorial/chu03.png", alt: "友達を招待してもっとつながる" },
  { image: "/tutorial/chu04.png", alt: "使うほど育つ。隠し要素もあるよ" }
];
