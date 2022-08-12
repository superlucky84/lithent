export default function makeFuctions(node) {
  let result = '';
  if (node.tagName) {
    const isCustom = /^[A-Z]/.test(node.tagName);
    const tagName = isCustom ? node.tagName : `'${node.tagName}'`;

    result += `${node.ifValue}${node.forValue}h(${tagName}, ${node.props}`;

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
