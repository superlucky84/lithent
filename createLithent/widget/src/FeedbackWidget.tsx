import { mount } from 'lithent';
import { emit } from 'lithent/element';
import type { ElementProps } from 'lithent/element';
// Type-only: this file exports nothing but the component, which is what
// lets the dev server swap it in place when you edit it.
import type {
  feedbackProps,
  FeedbackRateDetail,
  FeedbackSubmitDetail,
} from './feedbackProps';

type Props = ElementProps<typeof feedbackProps>;

const defaultLabels = {
  question: 'How was this page?',
  ratings: ['Very bad', 'Bad', 'Okay', 'Good', 'Very good'],
  placeholder: 'Anything we could do better? (optional)',
  send: 'Send',
  thanks: 'Thanks for your feedback!',
  again: 'Send another',
};

type Labels = typeof defaultLabels;

const faces = ['😞', '🙁', '😐', '🙂', '😍'];

/**
 * A feedback card: pick a face, optionally add a comment, send.
 *
 * The outer function runs once per element and keeps the state in closure
 * variables. The inner function runs on every render; `renew()` asks for one.
 */
export const FeedbackWidget = mount<Props>((renew, props) => {
  let rating = 0;
  let comment = '';
  let sent = false;
  let pageId = props.pageId;

  const reset = () => {
    rating = 0;
    comment = '';
    sent = false;
  };

  const rate = (value: number) => {
    rating = value;
    const detail: FeedbackRateDetail = { pageId: props.pageId, rating };
    emit(props.host, 'feedback-rate', detail);
    renew();
  };

  const submit = (event: Event) => {
    event.preventDefault();
    const detail: FeedbackSubmitDetail = {
      pageId: props.pageId,
      rating,
      comment: comment.trim(),
    };
    // `emit` returns false when the page called `event.preventDefault()`,
    // for example because saving the feedback failed. Keep the form then.
    if (emit(props.host, 'feedback-submit', detail)) {
      sent = true;
      renew();
    }
  };

  return () => {
    // A single-page app moves to another page by changing `page-id`:
    // start over for the new page.
    if (props.pageId !== pageId) {
      pageId = props.pageId;
      reset();
    }

    const text: Labels = {
      ...defaultLabels,
      ...(props.labels as Partial<Labels> | undefined),
    };
    const question = props.question || text.question;

    if (sent) {
      return (
        <section part="card" class="card" role="status">
          <p class="thanks">{text.thanks}</p>
          <button
            type="button"
            class="again"
            onClick={() => {
              reset();
              renew();
            }}
          >
            {text.again}
          </button>
        </section>
      );
    }

    return (
      <form part="card" class="card" onSubmit={submit}>
        <p class="question">{question}</p>
        <div class="faces" role="group" aria-label={question}>
          {faces.map((face, index) => (
            <button
              type="button"
              class="face"
              aria-pressed={rating === index + 1 ? 'true' : 'false'}
              aria-label={text.ratings[index]}
              title={text.ratings[index]}
              onClick={() => rate(index + 1)}
            >
              {face}
            </button>
          ))}
        </div>
        {rating > 0 ? (
          <div class="details">
            <textarea
              rows={3}
              maxLength={500}
              placeholder={text.placeholder}
              aria-label={text.placeholder}
              value={comment}
              onInput={(event: Event) => {
                comment = (event.target as HTMLTextAreaElement).value;
              }}
            />
            <button type="submit" part="send" class="send">
              {text.send}
            </button>
          </div>
        ) : null}
        <slot name="footer" />
      </form>
    );
  };
});
