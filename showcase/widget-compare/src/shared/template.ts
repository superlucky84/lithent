/**
 * What every version takes from the create-lithent widget template, so the
 * four widgets share one contract and one stylesheet rather than copies:
 * the props declaration, the event detail types and the CSS.
 */
export { feedbackProps } from '../../../../createLithent/widget/src/feedbackProps';
export type {
  FeedbackRateDetail,
  FeedbackSubmitDetail,
} from '../../../../createLithent/widget/src/feedbackProps';
export { default as styles } from '../../../../createLithent/widget/src/feedback-widget.css?inline';
