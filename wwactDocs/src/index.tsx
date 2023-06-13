import { h, render, mount } from 'wwact';
import { Router, RouterItem } from 'wwact-router';
import Main from '@/components/Main';
import Sub from '@/components/Sub';
import Sub2 from '@/components/Sub2';

const Root = mount(() => {
  return () => (
    <div class="md:container">
      <header>header</header>
      <h1 class="text-3xl font-bold underline">Hello world!</h1>
      <div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
        <div class="shrink-0">
          <img class="h-12 w-12" src="/img/logo.svg" alt="ChitChat Logo" />
        </div>
        <div>
          <div class="text-xl font-medium text-black">ChitChat</div>
          <p class="text-slate-500">You have a new message!</p>
        </div>
      </div>
      <aside>aside</aside>
      <main>
        <Router>
          <RouterItem path="main" element={<Main />} />
          <RouterItem path="sub" element={<Sub />} />
          <RouterItem path=":sub" element={<Sub2 />} />
        </Router>
      </main>
    </div>
  );
});

render(<Root />, document.getElementById('app'));
