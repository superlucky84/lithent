import {
  RootNode,
  TemplateNode,
  ElementNode,
  FragmentNode,
  TextNode,
  NodeType,
  createTextNode,
} from '../parser/ast';

/**
 * Optimize the AST
 * - Merge consecutive text nodes
 * - Remove empty text nodes (whitespace-only)
 * - Trim text nodes at boundaries
 */
export function optimize(ast: RootNode, options?: OptimizeOptions): RootNode {
  const opts: Required<OptimizeOptions> = {
    mergeTextNodes: true,
    removeWhitespace: true,
    trimText: true,
    ...options,
  };

  return {
    ...ast,
    children: optimizeNodeList(ast.children, opts),
  };
}

export interface OptimizeOptions {
  mergeTextNodes?: boolean;
  removeWhitespace?: boolean;
  trimText?: boolean;
}

/**
 * Optimize a list of nodes
 */
function optimizeNodeList(
  nodes: TemplateNode[],
  options: Required<OptimizeOptions>
): TemplateNode[] {
  let result: TemplateNode[] = nodes.map(node => optimizeNode(node, options));

  // Merge consecutive text nodes
  if (options.mergeTextNodes) {
    result = mergeTextNodes(result);
  }

  // Remove whitespace-only text nodes
  if (options.removeWhitespace) {
    result = removeWhitespaceNodes(result);
  }

  return result;
}

/**
 * Optimize a single node
 */
function optimizeNode(
  node: TemplateNode,
  options: Required<OptimizeOptions>
): TemplateNode {
  if (node.type === NodeType.ELEMENT) {
    return optimizeElementNode(node, options);
  }

  if (node.type === NodeType.FRAGMENT) {
    return optimizeFragmentNode(node, options);
  }

  if (node.type === NodeType.TEXT) {
    return optimizeTextNode(node, options);
  }

  return node;
}

/**
 * Optimize an element node
 */
function optimizeElementNode(
  node: ElementNode,
  options: Required<OptimizeOptions>
): ElementNode {
  return {
    ...node,
    children: optimizeNodeList(node.children, options),
  };
}

/**
 * Optimize a fragment node
 */
function optimizeFragmentNode(
  node: FragmentNode,
  options: Required<OptimizeOptions>
): FragmentNode {
  return {
    ...node,
    children: optimizeNodeList(node.children, options),
  };
}

/**
 * Optimize a text node
 */
function optimizeTextNode(
  node: TextNode,
  options: Required<OptimizeOptions>
): TextNode {
  let content = node.content;

  // Trim text if enabled
  if (options.trimText) {
    content = content.trim();
  }

  return {
    ...node,
    content,
  };
}

/**
 * Merge consecutive text nodes
 */
function mergeTextNodes(nodes: TemplateNode[]): TemplateNode[] {
  const result: TemplateNode[] = [];
  let currentText: TextNode | null = null;

  for (const node of nodes) {
    if (node.type === NodeType.TEXT) {
      if (currentText) {
        // Merge with previous text node
        currentText = createTextNode(
          currentText.content + node.content,
          currentText.start,
          node.end
        );
      } else {
        currentText = node;
      }
    } else {
      // Push accumulated text node if any
      if (currentText) {
        result.push(currentText);
        currentText = null;
      }
      result.push(node);
    }
  }

  // Don't forget the last text node
  if (currentText) {
    result.push(currentText);
  }

  return result;
}

/**
 * Remove whitespace-only text nodes
 */
function removeWhitespaceNodes(nodes: TemplateNode[]): TemplateNode[] {
  return nodes.filter(node => {
    if (node.type === NodeType.TEXT) {
      return node.content.trim().length > 0;
    }
    return true;
  });
}

/**
 * Check if a text node is whitespace-only
 */
export function isWhitespaceOnly(node: TextNode): boolean {
  return node.content.trim().length === 0;
}

/**
 * Count nodes in the tree
 */
export function countNodes(node: RootNode | TemplateNode): number {
  let count = 1;

  if (node.type === NodeType.ROOT) {
    node.children.forEach(child => {
      count += countNodes(child);
    });
  } else if (
    node.type === NodeType.ELEMENT ||
    node.type === NodeType.FRAGMENT
  ) {
    node.children.forEach(child => {
      count += countNodes(child);
    });
  }

  return count;
}
