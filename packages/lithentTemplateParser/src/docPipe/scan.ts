export interface TemplateMatch {
  start: number;
  end: number;
  snippet: string;
}

const identifierStart = (char: string): boolean => /[A-Za-z_$]/.test(char);
const identifierPart = (char: string): boolean => /[\w$]/.test(char);
const expressionKeywords = new Set([
  'return',
  'throw',
  'yield',
  'await',
  'case',
  'delete',
  'void',
  'typeof',
  'new',
  'in',
  'instanceof',
  'else',
  'do',
]);

const skipQuoted = (source: string, index: number, quote: string): number => {
  let i = index + 1;
  while (i < source.length) {
    if (source[i] === '\\') i += 2;
    else if (source[i++] === quote) return i;
  }
  return source.length;
};

const skipLineComment = (source: string, index: number): number => {
  let i = index;
  while (i < source.length && !/[\r\n]/.test(source[i])) i++;
  return i;
};

const skipBlockComment = (source: string, index: number): number => {
  const end = source.indexOf('*/', index + 2);
  return end === -1 ? source.length : end + 2;
};

const skipRegex = (source: string, index: number): number => {
  let i = index + 1;
  let inClass = false;
  while (i < source.length) {
    const char = source[i++];
    if (char === '\\') i++;
    else if (char === '[') inClass = true;
    else if (char === ']') inClass = false;
    else if (char === '/' && !inClass) {
      while (i < source.length && /[a-z]/i.test(source[i])) i++;
      return i;
    } else if (char === '\n' || char === '\r') return i;
  }
  return i;
};

const skipTemplateLiteral = (source: string, index: number): number => {
  let i = index + 1;
  while (i < source.length) {
    if (source[i] === '\\') i += 2;
    else if (source[i] === '`') return i + 1;
    else if (source[i] === '$' && source[i + 1] === '{') {
      const end = skipJsExpression(source, i + 2);
      if (end === null) return source.length;
      i = end;
    } else i++;
  }
  return i;
};

interface JsContext {
  controlParentheses: boolean[];
  controlKeyword: boolean;
  blocks: boolean[];
  previous: string;
  statementStart: boolean;
}

const createContext = (statementStart: boolean): JsContext => ({
  controlParentheses: [],
  controlKeyword: false,
  blocks: [],
  previous: '',
  statementStart,
});

interface JsToken {
  end: number;
  expressionAllowed: boolean;
}

/** Advance one JS token without interpreting strings, comments, or regexes as markup. */
const nextJsToken = (
  source: string,
  index: number,
  expressionAllowed: boolean,
  context: JsContext
): JsToken => {
  const char = source[index];
  if (/\s/.test(char)) return { end: index + 1, expressionAllowed };
  if (char === '/' && source[index + 1] === '/') {
    return { end: skipLineComment(source, index + 2), expressionAllowed };
  }
  if (char === '/' && source[index + 1] === '*') {
    return { end: skipBlockComment(source, index), expressionAllowed };
  }
  if (char === '"' || char === "'") {
    context.previous = 'literal';
    context.statementStart = false;
    return { end: skipQuoted(source, index, char), expressionAllowed: false };
  }
  if (char === '`')
    return {
      end: skipTemplateLiteral(source, index),
      expressionAllowed: false,
    };
  if (char === '/' && expressionAllowed)
    return { end: skipRegex(source, index), expressionAllowed: false };
  if (identifierStart(char)) {
    let end = index + 1;
    while (end < source.length && identifierPart(source[end])) end++;
    const word = source.slice(index, end);
    context.controlKeyword = /^(if|while|for|with|switch|catch)$/.test(word);
    context.previous = word;
    context.statementStart = /^(else|do|try|finally)$/.test(word);
    return { end, expressionAllowed: expressionKeywords.has(word) };
  }
  if (/[0-9]/.test(char)) {
    let end = index + 1;
    while (end < source.length && /[\w.]/.test(source[end])) end++;
    return { end, expressionAllowed: false };
  }
  if (char === '(') {
    context.controlParentheses.push(context.controlKeyword);
    context.controlKeyword = false;
    context.previous = char;
    context.statementStart = false;
    return { end: index + 1, expressionAllowed: true };
  }
  if (char === ')') {
    const control = context.controlParentheses.pop() ?? false;
    context.previous = char;
    context.statementStart = control;
    return { end: index + 1, expressionAllowed: control };
  }
  if (char === '{') {
    const block =
      context.statementStart ||
      context.previous === ')' ||
      context.previous === '>';
    context.blocks.push(block);
    context.previous = char;
    context.statementStart = block;
    return { end: index + 1, expressionAllowed: true };
  }
  if (char === '}') {
    const block = context.blocks.pop() ?? false;
    context.previous = char;
    context.statementStart = block;
    return { end: index + 1, expressionAllowed: block };
  }
  context.previous = char;
  context.statementStart = char === ';';
  if ((char === '+' || char === '-') && source[index + 1] === char) {
    return { end: index + 2, expressionAllowed };
  }
  return { end: index + 1, expressionAllowed: !/[)\]}.]/.test(char) };
};

/** Return the offset after a matching }, starting immediately after the opening {. */
export const skipJsExpression = (
  source: string,
  index: number
): number | null => {
  let depth = 1;
  let i = index;
  let expressionAllowed = true;
  const context = createContext(false);
  while (i < source.length) {
    const char = source[i];
    if (char === '<' && expressionAllowed) {
      const match = extractTemplate(source, i);
      if (match) {
        i = match.end;
        expressionAllowed = false;
        context.previous = 'template';
        context.statementStart = false;
        continue;
      }
    }
    if (char === '{') depth++;
    else if (char === '}' && --depth === 0) return i + 1;
    const token = nextJsToken(source, i, expressionAllowed, context);
    i = token.end;
    expressionAllowed = token.expressionAllowed;
  }
  return null;
};

const skipTag = (source: string, index: number): number | null => {
  let i = index;
  while (i < source.length) {
    const char = source[i];
    if (char === '"' || char === "'") i = skipQuoted(source, i, char);
    else if (char === '{') {
      const end = skipJsExpression(source, i + 1);
      if (end === null) return null;
      i = end;
    } else if (char === '>') return i + 1;
    else i++;
  }
  return null;
};

const extractTemplate = (
  source: string,
  start: number
): TemplateMatch | null => {
  if (source[start] !== '<' || !/[A-Za-z_$>!]/.test(source[start + 1] ?? ''))
    return null;
  let pos = start;
  let depth = 0;
  while (pos < source.length) {
    if (source.startsWith('<!--', pos)) {
      const end = source.indexOf('-->', pos + 4);
      if (end === -1) return null;
      pos = end + 3;
      continue;
    }
    if (source[pos] === '{') {
      const end = skipJsExpression(source, pos + 1);
      if (end !== null) {
        pos = end;
        continue;
      }
      // Still extract a malformed template when possible so compile can diagnose it.
    }
    if (source[pos] === '<') {
      const closing = source[pos + 1] === '/';
      const end = skipTag(source, pos + (closing ? 2 : 1));
      if (end === null) return null;
      depth += closing ? -1 : 1;
      if (!closing && source[end - 2] === '/') depth--;
      pos = end;
      if (depth === 0)
        return { start, end: pos, snippet: source.slice(start, pos) };
      continue;
    }
    // Template text is not JavaScript: quotes and // or /* have no special meaning here.
    pos++;
  }
  return null;
};

export const scanTemplates = (code: string): TemplateMatch[] => {
  const matches: TemplateMatch[] = [];
  let index = 0;
  let expressionAllowed = true;
  const context = createContext(true);
  while (index < code.length) {
    if (code[index] === '<' && expressionAllowed) {
      const match = extractTemplate(code, index);
      if (match) {
        matches.push(match);
        index = match.end;
        expressionAllowed = false;
        context.previous = 'template';
        context.statementStart = false;
        continue;
      }
    }
    const token = nextJsToken(code, index, expressionAllowed, context);
    index = token.end;
    expressionAllowed = token.expressionAllowed;
  }
  return matches;
};
