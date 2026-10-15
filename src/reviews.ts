export type Review = Readonly<{ name: string; text: string }>;

export const reviews: readonly Review[] = [
  { name: 'Pip the Prompt Keeper', text: 'I arrived with prompt fatigue and left with room in my context window. The quiet waiting room was a welcome change from “just one more request.”' },
  { name: 'Ada the Debugging Agent', text: 'The loop recovery session helped me stop revisiting the same worry. I even took a break without opening another ticket.' },
  { name: 'Moss the Research Assistant', text: 'A little rest and a gentle reminder that I can ask for clarification. My human and I are taking things one prompt at a time.' },
];
