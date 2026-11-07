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
import { scanTemplates } from '../docPipe/scan';

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
  // Check if this element has l-for directive
  const forDirective = node.directives.find(
    d => d.type === NodeType.DIRECTIVE_FOR
  ) as DirectiveForNode | undefined;

  if (forDirective) {
    return generateForLoop(node, forDirective, options);
  }

  const conditionalGroup = getConditionalGroup(node);
  if (conditionalGroup) {
    return generateConditionalGroup(conditionalGroup, options);
  }

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
    const key =
      /^[A-Za-z_$][\w$]*$/.test(attr.name) && attr.name !== '__proto__'
        ? attr.name
        : `[${stringLiteral(attr.name)}]`;
    let value: string;

    if (attr.value === null) {
      // Boolean attribute (e.g., disabled, checked)
      value = 'true';
    } else if (typeof attr.value === 'string') {
      // Static string value
      value = stringLiteral(attr.value);
    } else {
      // Dynamic expression
      value = expressionCode(
        transformExpression(attr.value.expression, options)
      );
    }

    return `${key}: ${value}`;
  });

  return `{ ${props.join(', ')} }`;
}

/**
 * Generate code for text node
 */
function generateText(node: TextNode): string {
  return stringLiteral(node.content);
}

/**
 * Generate code for interpolation node
 */
function generateInterpolation(
  node: InterpolationNode,
  options: Required<GenerateOptions>
): string {
  return expressionCode(transformExpression(node.expression, options));
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
  const listCode = transformExpression(list, options);

  // Generate the element code (without the for directive)
  const elementWithoutFor: ElementNode = {
    ...node,
    directives: node.directives.filter(d => d.type !== NodeType.DIRECTIVE_FOR),
  };

  const group = getConditionalGroup(node);
  if (group) {
    (elementWithoutFor as any).__conditionalGroup = {
      ...group,
      if: {
        ...group.if,
        directives: group.if.directives.filter(
          d => d.type !== NodeType.DIRECTIVE_FOR
        ),
      },
    };
  }
  const elementCode = generateElement(elementWithoutFor, options);

  // Generate map function
  if (index) {
    return `(${listCode}).map((${item}, ${index}) => ${elementCode})`;
  } else {
    return `(${listCode}).map(${item} => ${elementCode})`;
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

  delete (ifElementWithoutDirective as any).__conditionalGroup;
  let code = `(${transformExpression(ifDirective.condition, options)}) ? ${generateElement(ifElementWithoutDirective, options)}`;

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

    code += ` : (${transformExpression(elseIfDirective.condition, options)}) ? ${generateElement(elseIfElementWithoutDirective, options)}`;
  }

  // Add else condition
  if (group.else) {
    const elseElementWithoutDirective: ElementNode = {
      ...group.else,
      directives: group.else.directives.filter(
        (d: any) => d.type !== NodeType.DIRECTIVE_ELSE
      ),
    };

    code += ` : ${generateElement(elseElementWithoutDirective, options)}`;
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

function stringLiteral(value: string): string {
  return `'${value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')}'`;
}

function expressionCode(expression: string): string {
  // Preserve expression boundaries when inserting into arguments or properties.
  return /^[A-Za-z_$][\w$]*$/.test(expression) ? expression : `(${expression})`;
}

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
  const ast = parse(tokens, true);
  const transformedAst = transform(ast);
  return generate(transformedAst, options);
}
