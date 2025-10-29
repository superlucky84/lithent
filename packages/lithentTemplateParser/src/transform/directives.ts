import {
  RootNode,
  TemplateNode,
  ElementNode,
  NodeType,
  DirectiveIfNode,
  DirectiveElseIfNode,
  DirectiveElseNode,
} from '../parser/ast';

/**
 * Group conditional elements (l-if/l-else-if/l-else chain)
 * This transform marks related conditional elements for easier codegen
 */
export interface ConditionalGroup {
  if: ElementNode;
  elseIfs: ElementNode[];
  else?: ElementNode;
}

/**
 * Transform directives in the AST
 * Currently handles:
 * - Grouping l-if/l-else-if/l-else chains
 */
export function transformDirectives(ast: RootNode): RootNode {
  return {
    ...ast,
    children: transformNodeList(ast.children),
  };
}

/**
 * Transform a list of nodes, handling conditional grouping
 */
function transformNodeList(nodes: TemplateNode[]): TemplateNode[] {
  const result: TemplateNode[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.type === NodeType.ELEMENT) {
      // Process element's children recursively
      const transformedElement: ElementNode = {
        ...node,
        children: transformNodeList(node.children),
      };

      // Check if this starts a conditional chain
      const ifDirective = node.directives.find(
        d => d.type === NodeType.DIRECTIVE_IF
      ) as DirectiveIfNode | undefined;

      if (ifDirective) {
        // This starts a conditional chain, look ahead for else-if/else
        const conditionalGroup: ConditionalGroup = {
          if: transformedElement,
          elseIfs: [],
        };

        // Look ahead for else-if and else
        let j = i + 1;
        while (j < nodes.length) {
          const nextNode = nodes[j];

          if (nextNode.type === NodeType.ELEMENT) {
            const elseIfDirective = nextNode.directives.find(
              d => d.type === NodeType.DIRECTIVE_ELSE_IF
            ) as DirectiveElseIfNode | undefined;

            const elseDirective = nextNode.directives.find(
              d => d.type === NodeType.DIRECTIVE_ELSE
            ) as DirectiveElseNode | undefined;

            if (elseIfDirective) {
              conditionalGroup.elseIfs.push({
                ...nextNode,
                children: transformNodeList(nextNode.children),
              });
              j++;
              continue;
            }

            if (elseDirective) {
              conditionalGroup.else = {
                ...nextNode,
                children: transformNodeList(nextNode.children),
              };
              j++;
              break;
            }
          }

          // Not part of the conditional chain
          break;
        }

        // Mark the conditional group metadata (for codegen)
        // We'll store this in a symbol property that codegen can check
        (transformedElement as any).__conditionalGroup = conditionalGroup;

        // Skip the else-if/else nodes we've processed
        i = j - 1;
      }

      result.push(transformedElement);
    } else if (node.type === NodeType.FRAGMENT) {
      result.push({
        ...node,
        children: transformNodeList(node.children),
      });
    } else {
      // Non-element nodes pass through
      result.push(node);
    }
  }

  return result;
}

/**
 * Get conditional group if element is part of one
 */
export function getConditionalGroup(
  element: ElementNode
): ConditionalGroup | undefined {
  return (element as any).__conditionalGroup;
}

/**
 * Check if element has a specific directive type
 */
export function hasDirective(
  element: ElementNode,
  directiveType: NodeType
): boolean {
  return element.directives.some(d => d.type === directiveType);
}

/**
 * Get directive of specific type from element
 */
export function getDirective(
  element: ElementNode,
  directiveType: NodeType
): DirectiveIfNode | DirectiveElseIfNode | DirectiveElseNode | undefined {
  return element.directives.find(d => d.type === directiveType) as any;
}
