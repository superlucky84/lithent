/**
 * The Lit bundle entry: one LitElement, Lit's own way to write a Custom
 * Element. Lit observes the attributes, keeps the properties and adopts the
 * styles itself, so this version needs no wrapper.
 */
import { LitElement, html, nothing, unsafeCSS } from 'lit';
import type { PropertyValues } from 'lit';
import { faces, mergeLabels } from '../shared/labels';
import { styles } from '../shared/template';
import type {
  FeedbackRateDetail,
  FeedbackSubmitDetail,
} from '../shared/template';

/** A feedback card: pick a face, optionally add a comment, send. */
class FeedbackWidget extends LitElement {
  static styles = unsafeCSS(styles);

  static properties = {
    question: { type: String },
    pageId: { type: String, attribute: 'page-id' },
    labels: { type: Object },
    rating: { state: true },
    comment: { state: true },
    sent: { state: true },
  };

  declare question?: string;
  declare pageId?: string;
  declare labels?: unknown;
  declare rating: number;
  declare comment: string;
  declare sent: boolean;

  constructor() {
    super();
    this.reset();
  }

  private reset() {
    this.rating = 0;
    this.comment = '';
    this.sent = false;
  }

  // A single-page app moves to another page by changing `page-id`:
  // start over for the new page.
  protected willUpdate(changed: PropertyValues<this>) {
    if (changed.has('pageId')) this.reset();
  }

  private emit(name: string, detail: unknown) {
    return this.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail,
      })
    );
  }

  private rate(value: number) {
    this.rating = value;
    const detail: FeedbackRateDetail = { pageId: this.pageId, rating: value };
    this.emit('feedback-rate', detail);
  }

  private submit(event: Event) {
    event.preventDefault();
    const detail: FeedbackSubmitDetail = {
      pageId: this.pageId,
      rating: this.rating,
      comment: this.comment.trim(),
    };
    // false when the page called `event.preventDefault()`: keep the form.
    if (this.emit('feedback-submit', detail)) this.sent = true;
  }

  render() {
    const text = mergeLabels(this.labels);
    const question = this.question || text.question;

    if (this.sent) {
      return html`<section part="card" class="card" role="status">
        <p class="thanks">${text.thanks}</p>
        <button type="button" class="again" @click=${this.reset}>
          ${text.again}
        </button>
      </section>`;
    }

    return html`<form part="card" class="card" @submit=${this.submit}>
      <p class="question">${question}</p>
      <div class="faces" role="group" aria-label=${question}>
        ${faces.map(
          (face, index) =>
            html`<button
              type="button"
              class="face"
              aria-pressed=${this.rating === index + 1 ? 'true' : 'false'}
              aria-label=${text.ratings[index]}
              title=${text.ratings[index]}
              @click=${() => this.rate(index + 1)}
            >
              ${face}
            </button>`
        )}
      </div>
      ${this.rating > 0
        ? html`<div class="details">
            <textarea
              rows="3"
              maxlength="500"
              placeholder=${text.placeholder}
              aria-label=${text.placeholder}
              .value=${this.comment}
              @input=${(event: Event) => {
                this.comment = (event.target as HTMLTextAreaElement).value;
              }}
            ></textarea>
            <button type="submit" part="send" class="send">${text.send}</button>
          </div>`
        : nothing}
      <slot name="footer"></slot>
    </form>`;
  }
}

if (!customElements.get('feedback-widget'))
  customElements.define('feedback-widget', FeedbackWidget);
