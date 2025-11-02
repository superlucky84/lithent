export interface TemplateMatch {
  start: number;
  end: number;
  snippet: string;
}

const DEFAULT_ALPHA_NUMERIC = new Set<number>();

for (let code = 48; code <= 57; code++) {
  DEFAULT_ALPHA_NUMERIC.add(code);
}
for (let code = 65; code <= 90; code++) {
  DEFAULT_ALPHA_NUMERIC.add(code);
}
for (let code = 97; code <= 122; code++) {
  DEFAULT_ALPHA_NUMERIC.add(code);
}
DEFAULT_ALPHA_NUMERIC.add(95); // _
DEFAULT_ALPHA_NUMERIC.add(36); // $

const isAlphaNumeric = (code: number): boolean => {
  return DEFAULT_ALPHA_NUMERIC.has(code);
};

const shouldAttemptTemplate = (source: string, index: number): boolean => {
  if (source[index] !== '<') {
    return false;
  }

  const next = source.charCodeAt(index + 1);
  if (Number.isNaN(next)) {
    return false;
  }

  // Allow fragments <>, closing </, comments <!-, normal tags <a
  const isValidNext =
    next === 47 || // /
    next === 62 || // >
    next === 33 || // ! (e.g. <!-- -->)
    isAlphaNumeric(next);
  if (!isValidNext) {
    return false;
  }

  // Ensure previous meaningful char is not part of an identifier (e.g. a<b)
  let i = index - 1;
  while (i >= 0) {
    const code = source.charCodeAt(i);
    if (code === 32 || code === 9 || code === 10 || code === 13) {
      i--;
      continue;
    }
    if (isAlphaNumeric(code)) {
      // Identifier characters => likely relational operator (e.g. a<b)
      return false;
    }
    break;
  }

  return true;
};

const skipQuoted = (source: string, index: number, quote: string): number => {
  let i = index + 1;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '\\') {
      i += 2;
      continue;
    }
    if (ch === quote) {
      return i + 1;
    }
    i++;
  }
  return source.length;
};

const skipTemplateLiteral = (source: string, index: number): number => {
  let i = index + 1;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '\\') {
      i += 2;
      continue;
    }
    if (ch === '`') {
      return i + 1;
    }
    if (ch === '$' && source[i + 1] === '{') {
      const result = skipJsExpression(source, i + 2);
      if (result == null) {
        return source.length;
      }
      i = result;
      continue;
    }
    i++;
  }
  return source.length;
};

const skipLineComment = (source: string, index: number): number => {
  let i = index;
  while (i < source.length && source[i] !== '\n') {
    i++;
  }
  return i;
};

const skipBlockComment = (source: string, index: number): number => {
  const end = source.indexOf('*/', index);
  return end === -1 ? source.length : end + 2;
};

const skipHtmlComment = (source: string, index: number): number => {
  const end = source.indexOf('-->', index);
  return end === -1 ? source.length : end + 3;
};

const skipJsExpression = (source: string, index: number): number | null => {
  let depth = 1;
  let i = index;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '\\') {
      i += 2;
      continue;
    }
    if (ch === "'" || ch === '"') {
      i = skipQuoted(source, i, ch);
      continue;
    }
    if (ch === '`') {
      i = skipTemplateLiteral(source, i);
      continue;
    }
    if (ch === '/' && source[i + 1] === '*') {
      i = skipBlockComment(source, i + 2);
      continue;
    }
    if (ch === '/' && source[i + 1] === '/') {
      i = skipLineComment(source, i + 2);
      continue;
    }
    if (ch === '{') {
      depth++;
      i++;
      continue;
    }
    if (ch === '}') {
      depth--;
      i++;
      if (depth === 0) {
        return i;
      }
      continue;
    }
    i++;
  }
  return null;
};

interface SkipTagResult {
  position: number;
  selfClosing: boolean;
}

const skipTag = (
  source: string,
  index: number,
  closing: boolean
): SkipTagResult | null => {
  let i = index;
  while (i < source.length) {
    const ch = source[i];
    if (ch === "'" || ch === '"') {
      i = skipQuoted(source, i, ch);
      continue;
    }
    if (ch === '{') {
      const result = skipJsExpression(source, i + 1);
      if (result == null) {
        return null;
      }
      i = result;
      continue;
    }
    if (ch === '/' && source[i + 1] === '*') {
      i = skipBlockComment(source, i + 2);
      continue;
    }
    if (ch === '/' && source[i + 1] === '/') {
      i = skipLineComment(source, i + 2);
      continue;
    }
    if (ch === '>') {
      const selfClosing = !closing && source[i - 1] === '/';
      return { position: i + 1, selfClosing };
    }
    i++;
  }
  return null;
};

const extractTemplate = (
  source: string,
  start: number
): TemplateMatch | null => {
  const len = source.length;
  let pos = start;
  let depth = 0;

  while (pos < len) {
    const ch = source[pos];

    if (ch === '/' && source[pos + 1] === '*') {
      pos = skipBlockComment(source, pos + 2);
      continue;
    }
    if (ch === '/' && source[pos + 1] === '/') {
      pos = skipLineComment(source, pos + 2);
      continue;
    }
    if (ch === '{') {
      const result = skipJsExpression(source, pos + 1);
      if (result != null) {
        pos = result;
        continue;
      }
    }
    if (ch === '<') {
      if (source.startsWith('<!--', pos)) {
        pos = skipHtmlComment(source, pos + 4);
        continue;
      }

      if (source[pos + 1] === '/') {
        depth--;
        const res = skipTag(source, pos + 2, true);
        if (!res) {
          return null;
        }
        pos = res.position;
        if (depth === 0) {
          return {
            start,
            end: pos,
            snippet: source.slice(start, pos),
          };
        }
        continue;
      } else {
        depth++;
        const res = skipTag(source, pos + 1, false);
        if (!res) {
          return null;
        }
        pos = res.position;
        if (res.selfClosing) {
          depth--;
          if (depth === 0) {
            return {
              start,
              end: pos,
              snippet: source.slice(start, pos),
            };
          }
        }
        continue;
      }
    }

    pos++;
  }

  return null;
};

export const scanTemplates = (code: string): TemplateMatch[] => {
  const matches: TemplateMatch[] = [];
  const len = code.length;
  let index = 0;

  while (index < len) {
    const ch = code[index];

    if (ch === "'" || ch === '"') {
      index = skipQuoted(code, index, ch);
      continue;
    }
    if (ch === '`') {
      index = skipTemplateLiteral(code, index);
      continue;
    }
    if (ch === '/' && code[index + 1] === '*') {
      index = skipBlockComment(code, index + 2);
      continue;
    }
    if (ch === '/' && code[index + 1] === '/') {
      index = skipLineComment(code, index + 2);
      continue;
    }

    if (ch === '<' && shouldAttemptTemplate(code, index)) {
      const match = extractTemplate(code, index);
      if (match) {
        matches.push(match);
        index = match.end;
        continue;
      }
    }

    index++;
  }

  return matches;
};
