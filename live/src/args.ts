import type { ParamIssue, ToolDescriptor } from 'lithent/agent';

/**
 * The argument check of `lithent/agent`'s `callTool` (docs/agent-ui
 * DESIGN.md §2.5, DC-11), run on the host against the JSON Schema the widget
 * reported (§3.4). The host checks before it asks for approval, so the
 * person approves only a valid call with the declared keys, as with a local
 * bridge (DC-5, DC-14); the sandbox bridge checks again. The schema comes
 * from the sandbox, so a malformed one must not throw.
 */

const matches = (type: unknown, v: unknown) =>
  type == 'array'
    ? Array.isArray(v)
    : type == 'object'
      ? !!v && typeof v == 'object' && !Array.isArray(v)
      : type == 'number'
        ? Number.isFinite(v)
        : typeof v == type;

const has = {}.hasOwnProperty;

/** The declared arguments, and the issues if any (keys left out: DC-11). */
export const checkArgs = (
  schema: ToolDescriptor['inputSchema'] | undefined,
  args: unknown
): [Record<string, unknown>, ParamIssue[]?] => {
  const out: Record<string, unknown> = {};
  const issues: ParamIssue[] = [];

  if (!args || typeof args != 'object' || Array.isArray(args)) {
    return [out, [{ param: '', issue: 'type', expected: 'object' }]];
  }

  const { properties = {}, required } =
    schema || ({} as Partial<ToolDescriptor['inputSchema']>);
  for (const key in properties) {
    const { type, enum: allowed } = (properties[key] || {}) as {
      type?: unknown;
      enum?: unknown;
    };
    const v = has.call(args, key)
      ? (args as Record<string, unknown>)[key]
      : undefined;

    if (v === undefined) {
      if (Array.isArray(required) && required.includes(key)) {
        issues.push({ param: key, issue: 'required' });
      }
    } else if (!matches(type, v)) {
      issues.push({ param: key, issue: 'type', expected: type });
    } else if (Array.isArray(allowed) && !allowed.includes(v)) {
      issues.push({ param: key, issue: 'enum', expected: [...allowed] });
    } else {
      out[key] = v;
    }
  }

  return issues.length ? [out, issues] : [out];
};
