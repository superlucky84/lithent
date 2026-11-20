/**
 * The template's default texts and faces (createLithent/widget/src/
 * FeedbackWidget.tsx keeps them inside the component). The parity test in
 * e2e/widget-compare.spec.ts checks the visible ones against every version.
 */
export const defaultLabels = {
  question: 'How was this page?',
  ratings: ['Very bad', 'Bad', 'Okay', 'Good', 'Very good'],
  placeholder: 'Anything we could do better? (optional)',
  send: 'Send',
  thanks: 'Thanks for your feedback!',
  again: 'Send another',
};

export type Labels = typeof defaultLabels;

export const faces = ['😞', '🙁', '😐', '🙂', '😍'];

/** The labels to show: the defaults with what the page passed on top. */
export const mergeLabels = (labels: unknown): Labels => ({
  ...defaultLabels,
  ...(labels as Partial<Labels> | undefined),
});
