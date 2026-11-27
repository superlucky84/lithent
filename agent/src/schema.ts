import type {
  ParamConstructor,
  ParamFieldSpec,
  ParamIssue,
  ParamSpec,
  ToolDescriptor,
} from '@/types';

/**
 * Parameter declarations → JSON Schema, and the argument check `callTool`
 * runs (DESIGN §2.5, DC-2, DC-11).
 */

const field = (f: ParamFieldSpec) => (typeof f == 'function' ? { type: f } : f);

/** `String` → `'string'` … `Array` → `'array'`: the JSON Schema type. */
const typeOf = (c: ParamConstructor) => c.name.toLowerCase();

export const toInputSchema = (
  spec: ParamSpec = {}
): ToolDescriptor['inputSchema'] => {
  const properties: Record<string, Record<string, unknown>> = {};
  const required: string[] = [];
  const schema: ToolDescriptor['inputSchema'] = {
    type: 'object',
    properties,
    additionalProperties: false,
  };

  for (const key in spec) {
    const f = field(spec[key]);
    const p: Record<string, unknown> = { type: typeOf(f.type) };
    if (f.description) p.description = f.description;
    if (f.enum) p.enum = [...f.enum];
    if (f.required) required.push(key);
    properties[key] = p;
  }

  if (required.length) schema.required = required;
  return schema;
};

const matches = (type: string, v: unknown) =>
  type == 'array'
    ? Array.isArray(v)
    : type == 'object'
      ? !!v && typeof v == 'object' && !Array.isArray(v)
      : type == 'number'
        ? Number.isFinite(v)
        : typeof v == type;

const has = {}.hasOwnProperty;

/**
 * The declared arguments, and the issues if any. Keys the declaration does
 * not name are left out (DC-11).
 */
export const validateArgs = (
  spec: ParamSpec = {},
  args: unknown
): [Record<string, unknown>, ParamIssue[]?] => {
  const out: Record<string, unknown> = {};
  const issues: ParamIssue[] = [];

  if (!args || typeof args != 'object' || Array.isArray(args)) {
    return [out, [{ param: '', issue: 'type', expected: 'object' }]];
  }

  for (const key in spec) {
    const f = field(spec[key]);
    const type = typeOf(f.type);
    const v = has.call(args, key)
      ? (args as Record<string, unknown>)[key]
      : undefined;

    if (v === undefined) {
      if (f.required) issues.push({ param: key, issue: 'required' });
    } else if (!matches(type, v)) {
      issues.push({ param: key, issue: 'type', expected: type });
    } else if (f.enum && !f.enum.includes(v as string)) {
      issues.push({ param: key, issue: 'enum', expected: [...f.enum] });
    } else {
      out[key] = v;
    }
  }

  return issues.length ? [out, issues] : [out];
};
