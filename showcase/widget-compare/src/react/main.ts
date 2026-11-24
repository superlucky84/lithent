/**
 * The React bundle entry: React 19 renders the component into the element's
 * shadow root through the shared wrapper.
 */
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { defineElement } from '../shared/define-element';
import { feedbackProps, styles } from '../shared/template';
import { FeedbackWidget } from './FeedbackWidget';
import type { FeedbackProps } from './FeedbackWidget';

const roots = new WeakMap<ShadowRoot, Root>();

defineElement('feedback-widget', feedbackProps, styles, {
  render(shadow, props) {
    let root = roots.get(shadow);
    if (!root) roots.set(shadow, (root = createRoot(shadow)));
    root.render(createElement(FeedbackWidget, props as FeedbackProps));
  },
  unmount(shadow) {
    roots.get(shadow)?.unmount();
    roots.delete(shadow);
  },
});
