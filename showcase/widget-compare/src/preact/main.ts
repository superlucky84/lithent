/**
 * The Preact bundle entry: Preact 11 renders the component into the
 * element's shadow root through the shared wrapper.
 */
import { h, render } from 'preact';
import { defineElement } from '../shared/define-element';
import { feedbackProps, styles } from '../shared/template';
import { FeedbackWidget } from './FeedbackWidget';
import type { FeedbackProps } from './FeedbackWidget';

defineElement('feedback-widget', feedbackProps, styles, {
  render(shadow, props) {
    render(h(FeedbackWidget, props as FeedbackProps), shadow);
  },
  unmount(shadow) {
    render(null, shadow);
  },
});
