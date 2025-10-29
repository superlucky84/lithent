import {
  TemplateNode,
  ElementNode,
  TextNode,
  InterpolationNode,
  CommentNode,
  DirectiveNode,
  DirectiveForNode,
  DirectiveIfNode,
  DirectiveElseIfNode,
  DirectiveElseNode,
  isElementNode,
  isTextNode,
  isInterpolationNode,
  isCommentNode,
  NodeType,
} from '../parser/ast';

export function expectElement(node: TemplateNode): ElementNode {
  if (!isElementNode(node)) {
    throw new Error(`Expected ElementNode but received ${node.type}`);
  }
  return node;
}

export function expectText(node: TemplateNode): TextNode {
  if (!isTextNode(node)) {
    throw new Error(`Expected TextNode but received ${node.type}`);
  }
  return node;
}

export function expectInterpolation(node: TemplateNode): InterpolationNode {
  if (!isInterpolationNode(node)) {
    throw new Error(`Expected InterpolationNode but received ${node.type}`);
  }
  return node;
}

export function expectComment(node: TemplateNode): CommentNode {
  if (!isCommentNode(node)) {
    throw new Error(`Expected CommentNode but received ${node.type}`);
  }
  return node;
}

export function expectDirective<T extends DirectiveNode>(
  directive: DirectiveNode | undefined,
  predicate: (dir: DirectiveNode) => dir is T,
  expectedType: string
): T {
  if (!directive) {
    throw new Error(
      `Expected ${expectedType} directive but received undefined`
    );
  }
  if (!predicate(directive)) {
    throw new Error(
      `Expected ${expectedType} directive but received ${directive.type}`
    );
  }
  return directive;
}

export function isDirectiveFor(
  directive: DirectiveNode
): directive is DirectiveForNode {
  return directive.type === NodeType.DIRECTIVE_FOR;
}

export function isDirectiveIf(
  directive: DirectiveNode
): directive is DirectiveIfNode {
  return directive.type === NodeType.DIRECTIVE_IF;
}

export function isDirectiveElseIf(
  directive: DirectiveNode
): directive is DirectiveElseIfNode {
  return directive.type === NodeType.DIRECTIVE_ELSE_IF;
}

export function isDirectiveElse(
  directive: DirectiveNode
): directive is DirectiveElseNode {
  return directive.type === NodeType.DIRECTIVE_ELSE;
}
