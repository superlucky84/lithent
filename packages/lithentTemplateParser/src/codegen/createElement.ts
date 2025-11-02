import {
  RootNode,
  TemplateNode,
  ElementNode,
  FragmentNode,
  TextNode,
  InterpolationNode,
  NodeType,
  DirectiveForNode,
} from '../parser/ast';
import { tokenize } from '../parser/lexer';
import { parse } from '../parser/parser';
import { getConditionalGroup, getDirective, transform } from '../transform';

/**
 * Generate JavaScript code from AST
 */
export function generate(ast: RootNode, options?: GenerateOptions): string {
  const opts: Required<GenerateOptions> = {
    templateFactory: 'h',
    templateFragmentFactory: 'Fragment',
    ...options,
  };

  const code = generateChildren(ast.children, opts);

  return code;
}

export interface GenerateOptions {
  templateFactory?: string;
  templateFragmentFactory?: string;
}

/**
 * Generate code for children nodes
 */
function generateChildren(
  children: TemplateNode[],
  options: Required<GenerateOptions>
): string {
  const childrenCode = children
    .map(child => generateNode(child, options))
    .filter(code => code !== '');

  if (childrenCode.length === 0) {
    return 'null';
  }

  if (childrenCode.length === 1) {
    return childrenCode[0];
  }

  // Multiple children - wrap in array or Fragment
  return `[${childrenCode.join(', ')}]`;
}

/**
 * Generate code for a single node
 */
function generateNode(
  node: TemplateNode,
  options: Required<GenerateOptions>
): string {
  switch (node.type) {
    case NodeType.ELEMENT:
      return generateElement(node, options);
    case NodeType.FRAGMENT:
      return generateFragment(node, options);
    case NodeType.TEXT:
      return generateText(node);
    case NodeType.INTERPOLATION:
      return generateInterpolation(node, options);
    case NodeType.COMMENT:
      // Comments are not rendered
      return '';
    default:
      return '';
  }
}

/**
 * Generate code for an element node
 */
function generateElement(
  node: ElementNode,
  options: Required<GenerateOptions>
): string {
  // Check if this element is part of a conditional group
  const conditionalGroup = getConditionalGroup(node);
  if (conditionalGroup) {
    return generateConditionalGroup(conditionalGroup, options);
  }

  // Check if this element has l-for directive
  const forDirective = node.directives.find(
    d => d.type === NodeType.DIRECTIVE_FOR
  ) as DirectiveForNode | undefined;

  if (forDirective) {
    return generateForLoop(node, forDirective, options);
  }

  // Normal element
  return generateNormalElement(node, options);
}

/**
 * Generate code for a normal element (without directives)
 */
function generateNormalElement(
  node: ElementNode,
  options: Required<GenerateOptions>
): string {
  const factory = options.templateFactory;

  // Tag name (component or string)
  const tag = node.isComponent ? node.tag : `'${node.tag}'`;

  // Props
  const props = generateProps(node, options);

  // Children
  const children = node.children
    .map(child => generateNode(child, options))
    .filter(code => code !== '');

  // Build h() call
  if (children.length === 0) {
    return `${factory}(${tag}, ${props})`;
  }

  return `${factory}(${tag}, ${props}, ${children.join(', ')})`;
}

/**
 * Generate code for a fragment node
 */
function generateFragment(
  node: FragmentNode,
  options: Required<GenerateOptions>
): string {
  const factory = options.templateFactory;
  const fragment = options.templateFragmentFactory;

  const children = node.children
    .map(child => generateNode(child, options))
    .filter(code => code !== '');

  if (children.length === 0) {
    return `${factory}(${fragment}, null)`;
  }

  return `${factory}(${fragment}, null, ${children.join(', ')})`;
}

/**
 * Generate props object
 */
function generateProps(
  node: ElementNode,
  options: Required<GenerateOptions>
): string {
  if (node.attributes.length === 0) {
    return 'null';
  }

  const props = node.attributes.map(attr => {
    const key = attr.name;
    let value: string;

    if (attr.value === null) {
      // Boolean attribute (e.g., disabled, checked)
      value = 'true';
    } else if (typeof attr.value === 'string') {
      // Static string value
      value = `'${attr.value.replace(/'/g, "\\'")}'`;
    } else {
      // Dynamic expression
      value = transformExpression(attr.value.expression, options);
    }

    return `${key}: ${value}`;
  });

  return `{ ${props.join(', ')} }`;
}

/**
 * Generate code for text node
 */
function generateText(node: TextNode): string {
  // Escape single quotes in text
  const escaped = node.content
    .replace(/\\/g, '\\\\')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/'/g, "\\'");
  return `'${escaped}'`;
}

/**
 * Generate code for interpolation node
 */
function generateInterpolation(
  node: InterpolationNode,
  options: Required<GenerateOptions>
): string {
  return transformExpression(node.expression, options);
}

/**
 * Generate code for l-for loop
 */
function generateForLoop(
  node: ElementNode,
  directive: DirectiveForNode,
  options: Required<GenerateOptions>
): string {
  const { item, index, list } = directive;

  // Generate the element code (without the for directive)
  const elementWithoutFor: ElementNode = {
    ...node,
    directives: node.directives.filter(d => d.type !== NodeType.DIRECTIVE_FOR),
  };

  const elementCode = generateNormalElement(elementWithoutFor, options);

  // Generate map function
  if (index) {
    return `(${list}).map((${item}, ${index}) => ${elementCode})`;
  } else {
    return `(${list}).map(${item} => ${elementCode})`;
  }
}

/**
 * Generate code for conditional group (l-if/l-else-if/l-else)
 */
function generateConditionalGroup(
  group: any,
  options: Required<GenerateOptions>
): string {
  // Start with if condition
  const ifDirective = getDirective(group.if, NodeType.DIRECTIVE_IF);
  if (!ifDirective) {
    return generateNormalElement(group.if, options);
  }

  const ifElementWithoutDirective: ElementNode = {
    ...group.if,
    directives: group.if.directives.filter(
      (d: any) => d.type !== NodeType.DIRECTIVE_IF
    ),
  };

  let code = `(${ifDirective.condition}) ? ${generateNormalElement(ifElementWithoutDirective, options)}`;

  // Add else-if conditions
  for (const elseIfNode of group.elseIfs || []) {
    const elseIfDirective = getDirective(
      elseIfNode,
      NodeType.DIRECTIVE_ELSE_IF
    );
    if (!elseIfDirective) continue;

    const elseIfElementWithoutDirective: ElementNode = {
      ...elseIfNode,
      directives: elseIfNode.directives.filter(
        (d: any) => d.type !== NodeType.DIRECTIVE_ELSE_IF
      ),
    };

    code += ` : (${elseIfDirective.condition}) ? ${generateNormalElement(elseIfElementWithoutDirective, options)}`;
  }

  // Add else condition
  if (group.else) {
    const elseElementWithoutDirective: ElementNode = {
      ...group.else,
      directives: group.else.directives.filter(
        (d: any) => d.type !== NodeType.DIRECTIVE_ELSE
      ),
    };

    code += ` : ${generateNormalElement(elseElementWithoutDirective, options)}`;
  } else {
    code += ' : null';
  }

  return code;
}

export function formatCode(code: string): string {
  // Basic formatting - this is a simple implementation
  // For production, you might want to use prettier or similar
  return code;
}

interface TemplateMatch {
  start: number;
  end: number;
  snippet: string;
}

const isAlphaNumeric = (code: number): boolean => {
  return (
    (code >= 48 && code <= 57) || // 0-9
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) || // a-z
    code === 95 || // _
    code === 36 // $
  );
};

const shouldAttemptTemplate = (source: string, index: number): boolean => {
  if (source[index] !== '<') {
    return false;
  }

  const next = source.charCodeAt(index + 1);
  if (Number.isNaN(next)) {
    return false;
  }

  const isValidNext =
    next === 47 || // /
    next === 62 || // >
    next === 33 || // !
    isAlphaNumeric(next);

  if (!isValidNext) {
    return false;
  }

  let i = index - 1;
  while (i >= 0) {
    const code = source.charCodeAt(i);
    if (code === 32 || code === 9 || code === 10 || code === 13) {
      i--;
      continue;
    }

    if (isAlphaNumeric(code)) {
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
      i = skipJsExpression(source, i + 2);
      continue;
    }
    i++;
  }
  return source.length;
};

const skipLineComment = (source: string, index: number): number => {
  let i = index;
  while (i < source.length && source[i] !== '\\n') {
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

const skipJsExpression = (source: string, index: number): number => {
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

  return source.length;
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
    if (ch === '`') {
      i = skipTemplateLiteral(source, i);
      continue;
    }
    if (ch === '{') {
      i = skipJsExpression(source, i + 1);
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

    if (ch === "'" || ch === '"') {
      pos = skipQuoted(source, pos, ch);
      continue;
    }
    if (ch === '`') {
      pos = skipTemplateLiteral(source, pos);
      continue;
    }
    if (ch === '/' && source[pos + 1] === '*') {
      pos = skipBlockComment(source, pos + 2);
      continue;
    }
    if (ch === '/' && source[pos + 1] === '/') {
      pos = skipLineComment(source, pos + 2);
      continue;
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

const scanTemplates = (code: string): TemplateMatch[] => {
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

function transformExpression(
  expression: string,
  options: Required<GenerateOptions>
): string {
  if (!expression.includes('<')) {
    return expression;
  }

  const matches = scanTemplates(expression);
  if (matches.length === 0) {
    return expression;
  }

  let result = '';
  let lastIndex = 0;
  let changed = false;

  for (const match of matches) {
    let replacement: string | null = null;
    try {
      replacement = compileEmbeddedTemplate(match.snippet, options);
    } catch {
      replacement = null;
    }

    if (!replacement) {
      result += expression.slice(lastIndex, match.end);
      lastIndex = match.end;
      continue;
    }

    result += expression.slice(lastIndex, match.start) + replacement;
    lastIndex = match.end;
    changed = true;
  }

  result += expression.slice(lastIndex);

  return changed ? result : expression;
}

function compileEmbeddedTemplate(
  templateSource: string,
  options: Required<GenerateOptions>
): string {
  const tokens = tokenize(templateSource);
  const ast = parse(tokens);
  const transformedAst = transform(ast);
  return generate(transformedAst, options);
}
