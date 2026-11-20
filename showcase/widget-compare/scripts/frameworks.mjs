/**
 * The four versions of the widget, in the order the page shows them.
 * docs/widget-compare/DESIGN.md has the rules they follow.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('..', import.meta.url));
export const template = resolve(root, '../../createLithent/widget');
export const dist = resolve(root, 'dist');

/**
 * The version of a package installed for a directory. Read from
 * node_modules rather than resolved: lithent does not export its
 * package.json.
 */
const versionOf = (name, from) =>
  JSON.parse(
    readFileSync(resolve(from, 'node_modules', name, 'package.json'), 'utf8')
  ).version;

export const frameworks = [
  {
    id: 'lithent',
    label: 'lithent',
    // The template's own entry, not a copy (REQUIREMENTS RQ-2).
    entry: resolve(template, 'src/main.ts'),
    sources: [
      'createLithent/widget/src/main.ts',
      'createLithent/widget/src/FeedbackWidget.tsx',
    ],
    packages: { lithent: versionOf('lithent', template) },
    // lithent/element is the Custom Element layer.
    wrapper: 'lithent/element',
  },
  {
    id: 'react',
    label: 'React',
    entry: resolve(root, 'src/react/main.ts'),
    jsx: 'react',
    sources: [
      'showcase/widget-compare/src/react/main.ts',
      'showcase/widget-compare/src/react/FeedbackWidget.tsx',
      'showcase/widget-compare/src/shared/define-element.ts',
    ],
    packages: {
      react: versionOf('react', root),
      'react-dom': versionOf('react-dom', root),
    },
    wrapper: 'shared wrapper (src/shared/define-element.ts)',
  },
  {
    id: 'preact',
    label: 'Preact',
    entry: resolve(root, 'src/preact/main.ts'),
    jsx: 'preact',
    sources: [
      'showcase/widget-compare/src/preact/main.ts',
      'showcase/widget-compare/src/preact/FeedbackWidget.tsx',
      'showcase/widget-compare/src/shared/define-element.ts',
    ],
    packages: { preact: versionOf('preact', root) },
    wrapper: 'shared wrapper (src/shared/define-element.ts)',
  },
  {
    id: 'lit',
    label: 'Lit',
    entry: resolve(root, 'src/lit/main.ts'),
    sources: ['showcase/widget-compare/src/lit/main.ts'],
    packages: { lit: versionOf('lit', root) },
    wrapper: 'none (LitElement is a Custom Element)',
  },
];
