import { render, mount } from 'lithent';
import { Main } from '@/components/Main';
import '@/input.css';

const Root = mount(() => {
  return () => <Main />;
});

render(<Root />, document.body);
