# Security Policy

## Supported versions

Security fixes are released for the latest minor version of the current major
version of each published package.

| Package              | Supported       |
| -------------------- | --------------- |
| `lithent`            | latest 1.x      |
| `lithent-concurrent` | latest 0.x      |
| `create-lithent`     | latest 0.x      |
| `@lithent/*` tooling | latest release  |

`lithent/helper`, `lithent/ssr`, `lithent/element`, `lithent/tag`,
`lithent/ftags` and `lithent/devHelper` ship inside the `lithent` package and
follow its version.

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Report it privately through GitHub:
[Report a vulnerability](https://github.com/superlucky84/lithent/security/advisories/new).

Include the affected package and version, a minimal reproduction, and what an
attacker can do with it.

You can expect an acknowledgement within 7 days. A confirmed vulnerability is
fixed in a patch release, and the release notes credit the reporter unless
asked not to.

## What lithent protects against

- **Text content** is never parsed as HTML. In the browser it is written with
  `createTextNode`; `renderToString` escapes `&`, `<` and `>`.
- **Attribute values** cannot break out of their attribute. In the browser they
  are written with `setAttribute`; `renderToString` escapes `&`, `<`, `>` and
  `"`, and does not write a prop whose name is not a valid attribute name.
  (Releases up to and including `lithent` 1.23.0 did not escape attribute
  values in `renderToString`.)
- **No `eval` and no `new Function`** in any runtime bundle.
- **Event handlers** are attached with `addEventListener`, never as attribute
  strings. **Styles** given as an object are applied through the CSSOM.

## What is the application's responsibility

- **The `innerHTML` prop** writes its string as HTML, both in the browser and
  in `renderToString`. Treat it like `dangerouslySetInnerHTML` in React: never
  pass untrusted input.
- **URL attributes** (`href`, `src`, `action`, ...) are not checked. A
  `javascript:` URL from untrusted input must be rejected by the application.
- **Spreading untrusted objects as props** lets the data choose which
  attributes and event handlers are set. Pick the props you pass.

## Content-Security-Policy and Trusted Types

The built `lithent`, `lithent-concurrent` and `lithent/element` bundles run
under this policy with no violation, checked in a real browser by
`e2e/csp.spec.ts`:

```
default-src 'none'; script-src 'self'; style-src 'self';
require-trusted-types-for 'script'
```

Two paths assign to a Trusted Types sink and are rejected under
`require-trusted-types-for 'script'` unless the page defines a default policy:

- the `innerHTML` prop;
- removing an `<html>` element that lithent itself rendered or hydrated
  (full-document apps, as `renderWithHydration` produces). This one is read
  from the source, not covered by the browser test.

`renderToString` writes a `style` object as an inline `style` attribute. A
policy without `style-src 'unsafe-inline'` ignores that attribute until the
page is hydrated, when the same styles are applied through the CSSOM.
