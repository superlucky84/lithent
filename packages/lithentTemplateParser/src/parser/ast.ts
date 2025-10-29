import { Position } from './tokens';

/**
 * Base AST Node interface
 */
export interface BaseNode {
  type: string;
  start: Position;
  end: Position;
}

/**
 * Node types
 */
export enum NodeType {
  ROOT = 'Root',
  ELEMENT = 'Element',
  TEXT = 'Text',
  INTERPOLATION = 'Interpolation',
  COMMENT = 'Comment',
  ATTRIBUTE = 'Attribute',
  DIRECTIVE_IF = 'DirectiveIf',
  DIRECTIVE_ELSE_IF = 'DirectiveElseIf',
  DIRECTIVE_ELSE = 'DirectiveElse',
  DIRECTIVE_FOR = 'DirectiveFor',
}

/**
 * Root node - represents the entire template
 */
export interface RootNode extends BaseNode {
  type: NodeType.ROOT;
  children: TemplateNode[];
}

/**
 * Element node - represents HTML element or component
 */
export interface ElementNode extends BaseNode {
  type: NodeType.ELEMENT;
  tag: string;
  isComponent: boolean; // true if tag starts with uppercase
  isSelfClosing: boolean;
  attributes: AttributeNode[];
  directives: DirectiveNode[];
  children: TemplateNode[];
  ref?: string; // ref attribute value
}

/**
 * Text node - represents plain text content
 */
export interface TextNode extends BaseNode {
  type: NodeType.TEXT;
  content: string;
}

/**
 * Interpolation node - represents {expression}
 */
export interface InterpolationNode extends BaseNode {
  type: NodeType.INTERPOLATION;
  expression: string;
}

/**
 * Comment node - represents HTML comments
 */
export interface CommentNode extends BaseNode {
  type: NodeType.COMMENT;
  content: string;
}

/**
 * Attribute node - represents element attributes
 */
export interface AttributeNode extends BaseNode {
  type: NodeType.ATTRIBUTE;
  name: string;
  value: AttributeValue | null;
  isDynamic: boolean; // true if value is an expression
}

/**
 * Attribute value can be static string or expression
 */
export type AttributeValue = string | { expression: string };

/**
 * Base directive node
 */
export interface BaseDirectiveNode extends BaseNode {
  type:
    | NodeType.DIRECTIVE_IF
    | NodeType.DIRECTIVE_ELSE_IF
    | NodeType.DIRECTIVE_ELSE
    | NodeType.DIRECTIVE_FOR;
}

/**
 * l-if directive
 */
export interface DirectiveIfNode extends BaseDirectiveNode {
  type: NodeType.DIRECTIVE_IF;
  condition: string;
}

/**
 * l-else-if directive
 */
export interface DirectiveElseIfNode extends BaseDirectiveNode {
  type: NodeType.DIRECTIVE_ELSE_IF;
  condition: string;
}

/**
 * l-else directive
 */
export interface DirectiveElseNode extends BaseDirectiveNode {
  type: NodeType.DIRECTIVE_ELSE;
}

/**
 * l-for directive
 */
export interface DirectiveForNode extends BaseDirectiveNode {
  type: NodeType.DIRECTIVE_FOR;
  item: string; // loop variable name (e.g., "item")
  index?: string; // optional index variable name (e.g., "index")
  list: string; // expression for the list to iterate
}

/**
 * Union type for all directive nodes
 */
export type DirectiveNode =
  | DirectiveIfNode
  | DirectiveElseIfNode
  | DirectiveElseNode
  | DirectiveForNode;

/**
 * Union type for all template nodes (excluding Root)
 */
export type TemplateNode =
  | ElementNode
  | TextNode
  | InterpolationNode
  | CommentNode;

/**
 * Type guard for Element nodes
 */
export function isElementNode(node: TemplateNode): node is ElementNode {
  return node.type === NodeType.ELEMENT;
}

/**
 * Type guard for Text nodes
 */
export function isTextNode(node: TemplateNode): node is TextNode {
  return node.type === NodeType.TEXT;
}

/**
 * Type guard for Interpolation nodes
 */
export function isInterpolationNode(
  node: TemplateNode
): node is InterpolationNode {
  return node.type === NodeType.INTERPOLATION;
}

/**
 * Type guard for Comment nodes
 */
export function isCommentNode(node: TemplateNode): node is CommentNode {
  return node.type === NodeType.COMMENT;
}

/**
 * Type guard for directive nodes
 */
export function isDirective(
  node: AttributeNode | DirectiveNode
): node is DirectiveNode {
  return (
    node.type === NodeType.DIRECTIVE_IF ||
    node.type === NodeType.DIRECTIVE_ELSE_IF ||
    node.type === NodeType.DIRECTIVE_ELSE ||
    node.type === NodeType.DIRECTIVE_FOR
  );
}

/**
 * Create a root node
 */
export function createRootNode(
  children: TemplateNode[],
  start: Position,
  end: Position
): RootNode {
  return {
    type: NodeType.ROOT,
    children,
    start,
    end,
  };
}

/**
 * Create an element node
 */
export function createElementNode(
  tag: string,
  attributes: AttributeNode[],
  directives: DirectiveNode[],
  children: TemplateNode[],
  isSelfClosing: boolean,
  start: Position,
  end: Position
): ElementNode {
  const isComponent = /^[A-Z]/.test(tag) || tag.includes('.');

  // Extract ref from attributes
  const refAttr = attributes.find(attr => attr.name === 'ref');
  const ref = refAttr?.value
    ? typeof refAttr.value === 'string'
      ? refAttr.value
      : refAttr.value.expression
    : undefined;

  return {
    type: NodeType.ELEMENT,
    tag,
    isComponent,
    isSelfClosing,
    attributes,
    directives,
    children,
    ref,
    start,
    end,
  };
}

/**
 * Create a text node
 */
export function createTextNode(
  content: string,
  start: Position,
  end: Position
): TextNode {
  return {
    type: NodeType.TEXT,
    content,
    start,
    end,
  };
}

/**
 * Create an interpolation node
 */
export function createInterpolationNode(
  expression: string,
  start: Position,
  end: Position
): InterpolationNode {
  return {
    type: NodeType.INTERPOLATION,
    expression,
    start,
    end,
  };
}

/**
 * Create a comment node
 */
export function createCommentNode(
  content: string,
  start: Position,
  end: Position
): CommentNode {
  return {
    type: NodeType.COMMENT,
    content,
    start,
    end,
  };
}

/**
 * Create an attribute node
 */
export function createAttributeNode(
  name: string,
  value: AttributeValue | null,
  isDynamic: boolean,
  start: Position,
  end: Position
): AttributeNode {
  return {
    type: NodeType.ATTRIBUTE,
    name,
    value,
    isDynamic,
    start,
    end,
  };
}

/**
 * Create a l-if directive node
 */
export function createDirectiveIfNode(
  condition: string,
  start: Position,
  end: Position
): DirectiveIfNode {
  return {
    type: NodeType.DIRECTIVE_IF,
    condition,
    start,
    end,
  };
}

/**
 * Create a l-else-if directive node
 */
export function createDirectiveElseIfNode(
  condition: string,
  start: Position,
  end: Position
): DirectiveElseIfNode {
  return {
    type: NodeType.DIRECTIVE_ELSE_IF,
    condition,
    start,
    end,
  };
}

/**
 * Create a l-else directive node
 */
export function createDirectiveElseNode(
  start: Position,
  end: Position
): DirectiveElseNode {
  return {
    type: NodeType.DIRECTIVE_ELSE,
    start,
    end,
  };
}

/**
 * Create a l-for directive node
 */
export function createDirectiveForNode(
  item: string,
  list: string,
  index: string | undefined,
  start: Position,
  end: Position
): DirectiveForNode {
  return {
    type: NodeType.DIRECTIVE_FOR,
    item,
    index,
    list,
    start,
    end,
  };
}

/**
 * Walk through AST and call visitor function for each node
 */
export function walk(
  node: RootNode | TemplateNode,
  visitor: (node: TemplateNode) => void
): void {
  if (node.type === NodeType.ROOT) {
    node.children.forEach(child => {
      visitor(child);
      walk(child, visitor);
    });
  } else if (node.type === NodeType.ELEMENT) {
    node.children.forEach(child => {
      visitor(child);
      walk(child, visitor);
    });
  }
}

/**
 * Transform AST by applying a transformer function to each node
 */
export function transformTree(
  node: RootNode | TemplateNode,
  transformer: (node: TemplateNode) => TemplateNode
): RootNode | TemplateNode {
  if (node.type === NodeType.ROOT) {
    return {
      ...node,
      children: node.children.map(child => {
        const transformed = transformer(child);
        return transformTree(transformed, transformer) as TemplateNode;
      }),
    };
  } else if (node.type === NodeType.ELEMENT) {
    const transformed = transformer(node);
    if (transformed.type === NodeType.ELEMENT) {
      return {
        ...transformed,
        children: transformed.children.map(child => {
          const childTransformed = transformer(child);
          return transformTree(childTransformed, transformer) as TemplateNode;
        }),
      };
    }
    return transformed;
  }
  return transformer(node);
}
