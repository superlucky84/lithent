/**
 * The public contract of <feedback-widget>: what the page can pass in, and
 * what the widget sends back. Keep it stable once customers embed the widget.
 */

/**
 * The props the element accepts. Each one is an attribute in kebab-case
 * (`page-id="pricing"`) and a property in camelCase (`el.pageId`).
 * Attributes are strings, so the constructor says how to read them:
 * `String` as is, `Number`, `Boolean` (present or not) and `Object` (JSON).
 */
export const feedbackProps = {
  question: String,
  pageId: String,
  labels: Object,
};

/** What the `feedback-rate` event carries in `event.detail`. */
export type FeedbackRateDetail = {
  pageId?: string;
  rating: number;
};

/** What the `feedback-submit` event carries in `event.detail`. */
export type FeedbackSubmitDetail = FeedbackRateDetail & {
  comment: string;
};
