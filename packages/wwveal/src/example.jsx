import { h, Fragment, render } from 'wwact';
import Wwveal from '@/Wwveal';

const vDom = <Wwveal />;

// @ts-ignore
window.vDom = vDom;

render(vDom, document.body);
