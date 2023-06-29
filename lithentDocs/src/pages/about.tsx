import { h, mount } from 'lithent';
import { ContentHeader } from '@/components/contentHeader';

// grid grid-cols-1 xl:grid-cols-2
export const About = mount(() => {
  return () => (
    <div class="max-w-xl mb-8 px-4 pt-6 xl:gap-4 bg-gray-900">
      <ContentHeader title="Why use Lithent?" />
      <h3 class="text-slate-50 text-lg mt-4">
        Lithent have the bare minimum of necessary functionality, with no
        unnecessary features.
      </h3>
      <p class="text-gray-400 mt-4">
        In a real-world development environment, you may want to use Virtual DOM
        lightly, with only the bare minimum of core functionality.
      </p>
      <p class="text-gray-400 mt-4">
        "Lithent" makes it easy to add, remove, and update virtual domes to
        specific parts of a pre-drawn SSR page.
      </p>
      <p class="text-gray-400 mt-4">
        "Lithent" has implemented the bare minimum functionality needed to
        create and update virtual DOM in general (we only need to know 'render',
        'mounter', 'updater', 'renewer', 'mountCallback', and 'updateCallback').
      </p>
      <p class="text-gray-400 mt-4">
        We provide code in the form of 'helpers' that extend the basic
        functionality, but using the helpers is only optional and users can
        extend and develop custom helpers for their own projects.
      </p>
      <h3 class="text-slate-50 text-lg mt-4">
        Approach with the developer-friendly concept of closures between
        "component mounter" and "renderer"
      </h3>
      <p class="text-gray-400 mt-4">
        Many existing UI libraries have their advantages, but they also create
        rules that are too strong and rigid for fear of users making mistakes.
      </p>
      <p class="text-gray-400 mt-4">
        JavaScript users are used to using closures and love to develop with
        them.
      </p>
      <p class="text-gray-400 mt-4">
        "Lithent" provides a familiar approach to my JavaScript development, as
        it leverages the properties of higher-order functions and closures to
        define and recycle the state of a component.
      </p>
    </div>
  );
});
