import { useState } from 'react';
import type { FormEvent } from 'react';
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
 * starts the card over for the new page, React's way to reset state.
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

  const submit = (event: FormEvent) => {
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
      <section part="card" className="card" role="status">
        <p className="thanks">{text.thanks}</p>
        <button type="button" className="again" onClick={reset}>
          {text.again}
        </button>
      </section>
    );
  }

  return (
    <form part="card" className="card" onSubmit={submit}>
      <p className="question">{title}</p>
      <div className="faces" role="group" aria-label={title}>
        {faces.map((face, index) => (
          <button
            key={face}
            type="button"
            className="face"
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
        <div className="details">
          <textarea
            rows={3}
            maxLength={500}
            placeholder={text.placeholder}
            aria-label={text.placeholder}
            value={comment}
            onChange={event => setComment(event.target.value)}
          />
          <button type="submit" part="send" className="send">
            {text.send}
          </button>
        </div>
      ) : null}
      <slot name="footer" />
    </form>
  );
};
