export default function makeFuctions(node) {
  let result = '';
  if (node.tagName) {
    const isCustom = /^[A-Z]/.test(node.tagName);
    const tagName = isCustom ? node.tagName : `'${node.tagName}'`;

    result = `h(${tagName}, ${node.props}`;

    if (node.forValue) {
      result = node.forValue + result;
    }

    if (node.ifValue) {
      result = node.ifValue + result;
    }

    if (node.elseIfValue) {
      result = node.elseIfValue + result;
    }

    if (node.elseValue) {
      result = node.elseValue + result;
    }

    (node.children || []).forEach(childItem => {
      let prefix = childItem.elseValue || childItem.elseIfValue ? ' || ' : ', ';
      result += `${prefix}${makeFuctions(childItem)}`;
    });

    if (node.ifValue || node.elseIfValue || node.elseValue) {
      result += ')';
    }
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
