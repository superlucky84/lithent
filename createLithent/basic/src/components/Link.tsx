import { mount } from 'lithent';
import type { WDom } from 'lithent';
import { navigate } from '@/router';

type LinkProps = {
  to: string;
  class?: string;
  // Lithent passes children as the third mounter argument. TypeScript 5.8+
  // also checks JSX children against the props type, so allow them here.
  children?: unknown;
};

/**
 * A real link (middle-click, "open in new tab" and crawlers keep working)
 * that navigates on the client for a plain left click.
 */
export const Link = mount<LinkProps>((_renew, props, children: WDom[]) => {
  const onClick = (event: MouseEvent) => {
    const modified =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

    if (event.button !== 0 || modified) return;

    event.preventDefault();
    navigate(props.to);
  };

  return () => (
    <a href={props.to} class={props.class} onClick={onClick}>
      {children}
    </a>
  );
});
