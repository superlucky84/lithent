import {
  RootNode,
  TemplateNode,
  ElementNode,
  TextNode,
  InterpolationNode,
  NodeType,
  DirectiveForNode,
} from '../parser/ast';
import { getConditionalGroup, getDirective } from '../transform/directives';

/**
 * Generate JavaScript code from AST
 */
export function generate(ast: RootNode, options?: GenerateOptions): string {
  const opts: Required<GenerateOptions> = {
    importH: true,
    importFragment: false,
    hFunctionName: 'h',
    fragmentName: 'Fragment',
    ...options,
  };

  const imports: string[] = [];

  if (opts.importH) {
    imports.push(opts.hFunctionName);
  }

  if (opts.importFragment) {
    imports.push(opts.fragmentName);
  }

  const code = generateChildren(ast.children, opts);

  // Return just the code if no imports needed
  if (imports.length === 0) {
    return code;
  }

  // Return with import statement
  return `import { ${imports.join(', ')} } from 'lithent';\n\nreturn ${code};`;
}

export interface GenerateOptions {
  importH?: boolean;
  importFragment?: boolean;
  hFunctionName?: string;
  fragmentName?: string;
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
    case NodeType.TEXT:
      return generateText(node);
    case NodeType.INTERPOLATION:
      return generateInterpolation(node);
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

  // Check if this element has w-for directive
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
  const { hFunctionName } = options;

  // Tag name (component or string)
  const tag = node.isComponent ? node.tag : `'${node.tag}'`;

  // Props
  const props = generateProps(node);

  // Children
  const children = node.children
    .map(child => generateNode(child, options))
    .filter(code => code !== '');

  // Build h() call
  if (children.length === 0) {
    return `${hFunctionName}(${tag}, ${props})`;
  }

  return `${hFunctionName}(${tag}, ${props}, ${children.join(', ')})`;
}

/**
 * Generate props object
 */
function generateProps(node: ElementNode): string {
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
      value = attr.value.expression;
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
  const escaped = node.content.replace(/'/g, "\\'");
  return `'${escaped}'`;
}

/**
 * Generate code for interpolation node
 */
function generateInterpolation(node: InterpolationNode): string {
  return node.expression;
}

/**
 * Generate code for w-for loop
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
 * Generate code for conditional group (w-if/w-else-if/w-else)
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

/**
 * Format generated code (basic formatting)
 */
export function formatCode(code: string): string {
  // Basic formatting - this is a simple implementation
  // For production, you might want to use prettier or similar
  return code;
}
