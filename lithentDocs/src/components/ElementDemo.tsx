import { mount } from 'lithent';
import { defineElement, emit } from 'lithent/element';

type Language = 'en' | 'ko';

// The widget: an ordinary lithent component, registered once for the page.
const PayButton = mount<{
  amount?: number;
  currency?: string;
  host: HTMLElement;
}>((renew, props) => {
  let clicks = 0;
  return () => (
    <button
      part="button"
      onClick={() => {
        clicks++;
        renew();
        emit(props.host, 'pay', { amount: props.amount, clicks });
      }}
    >
      Pay {props.amount ?? 0} {props.currency ?? 'KRW'} · {clicks}
    </button>
  );
});

defineElement('docs-pay-button', PayButton, {
  props: { amount: Number, currency: String },
  styles: [
    `button {
      font: inherit;
      padding: 0.5rem 1rem;
      border: 0;
      border-radius: 0.5rem;
      color: white;
      background: var(--pay-color, #42b883);
      cursor: pointer;
    }`,
  ],
});

const copy = {
  en: { more: 'amount +1000', last: 'Last pay event:', none: 'none yet' },
  ko: { more: 'amount +1000', last: '마지막 pay 이벤트:', none: '아직 없음' },
};

/**
 * The page side: it only sets an attribute and listens to a DOM event, the
 * way any host page would.
 */
export const ElementDemo = mount<{ language: Language }>(
  (renew, { language }) => {
    let amount = 1000;
    let last = '';
    const onPay = (event: Event) => {
      last = JSON.stringify((event as CustomEvent).detail);
      renew();
    };
    return () => {
      const t = copy[language];
      return (
        <div class="not-prose my-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
          <div class="flex flex-wrap items-center gap-3">
            <docs-pay-button amount={amount} onPay={onPay} />
            <button
              class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm"
              onClick={() => {
                amount += 1000;
                renew();
              }}
            >
              {t.more}
            </button>
          </div>
          <p class="text-sm">
            {t.last} <code>{last || t.none}</code>
          </p>
        </div>
      );
    };
  }
);
