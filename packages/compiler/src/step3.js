export default function makeFuctions(node) {
  let result = '';
  if (node.tagName) {
    result += `h('${node.tagName}', ${node.props}`;

    (node.children || []).forEach(childItem => {
      result += `, ${makeFuctions(childItem)}`;
    });

    result += ')';
  } else if (node.textArr) {
    result += `${node.textArr}`;
  } else {
    (node.children || []).forEach(childItem => {
      result += `, ${makeFuctions(childItem)}`;
    });
  }

  return result;
}
