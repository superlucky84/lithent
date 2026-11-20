/**
 * The bundle entry. Everything this file imports ends up in
 * dist/<package name>.js, and loading that file registers the elements.
 * Define as many elements here as your widget needs; they share one copy
 * of lithent.
 */
import { defineElement } from 'lithent/element';
import { FeedbackWidget } from './FeedbackWidget';
import { feedbackProps } from './feedbackProps';
// `?inline` turns the stylesheet into a string. defineElement puts it inside
// the element's shadow root, so it does not touch the page and the page's
// CSS does not reach in.
import styles from './feedback-widget.css?inline';

defineElement('feedback-widget', FeedbackWidget, {
  props: feedbackProps,
  styles: [styles],
});
