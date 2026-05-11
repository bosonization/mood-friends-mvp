export const CURRENT_TUTORIAL_VERSION = 1;

export type TutorialStep = {
  image: string;
  label: string;
};

export const tutorialSteps: TutorialStep[] = [
  { image: "/tutorial/chu01.png", label: "ノリの基本" },
  { image: "/tutorial/chu02.png", label: "連絡のきっかけ" },
  { image: "/tutorial/chu03.png", label: "友達招待" },
  { image: "/tutorial/chu04.png", label: "成長とひみつ" }
];
