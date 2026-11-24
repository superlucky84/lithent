import { useState } from 'preact/hooks';
import type { TargetedEvent } from 'preact';
import { emit } from '../shared/define-element';
import { faces, mergeLabels } from '../shared/labels';
import type {
  FeedbackRateDetail,
  FeedbackSubmitDetail,
} from '../shared/template';

export type FeedbackProps = {
  question?: string;
  pageId?: string;
  labels?: unknown;
  host: HTMLElement;
};

/**
 * A single-page app moves to another page by changing `page-id`. The key
 * starts the card over for the new page.
 */
export const FeedbackWidget = (props: FeedbackProps) => (
  <FeedbackCard key={props.pageId} {...props} />
);

/** A feedback card: pick a face, optionally add a comment, send. */
const FeedbackCard = ({ question, pageId, labels, host }: FeedbackProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);

  const text = mergeLabels(labels);
  const title = question || text.question;

  const reset = () => {
    setRating(0);
    setComment('');
    setSent(false);
  };

  const rate = (value: number) => {
    setRating(value);
    const detail: FeedbackRateDetail = { pageId, rating: value };
    emit(host, 'feedback-rate', detail);
  };

  const submit = (event: TargetedEvent<HTMLFormElement>) => {
    event.preventDefault();
    const detail: FeedbackSubmitDetail = {
      pageId,
      rating,
      comment: comment.trim(),
    };
    // false when the page called `event.preventDefault()`: keep the form.
    if (emit(host, 'feedback-submit', detail)) setSent(true);
  };

  if (sent) {
    return (
      <section part="card" class="card" role="status">
        <p class="thanks">{text.thanks}</p>
        <button type="button" class="again" onClick={reset}>
          {text.again}
        </button>
      </section>
    );
  }

  return (
    <form part="card" class="card" onSubmit={submit}>
      <p class="question">{title}</p>
      <div class="faces" role="group" aria-label={title}>
        {faces.map((face, index) => (
          <button
            key={face}
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
            onInput={event => setComment(event.currentTarget.value)}
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
