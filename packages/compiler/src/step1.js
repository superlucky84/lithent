function isExisty(value) {
  return value !== undefined && value !== null;
}

export default class step1 {
  constructor(sa) {
    this.sa = sa;
    this.tagStack = [];
  }

  run() {
    return this.makeTree();
  }

  search(targetString) {
    let acc = '';
    let finded = false;

    for (
      this.sa.end = this.sa.start;
      this.sa.end < this.sa.code.length;
      this.sa.end += 1
    ) {
      if (this.sa.code[this.sa.end] === targetString) {
        finded = true;
        this.sa.start = this.sa.end;
        break;
      }

      acc += this.sa.code[this.sa.end];
    }

    return [finded, acc.trim()];
  }

  find(parent) {
    const [finded, acc1] = this.search('<');
    if (finded) {
      const innerValue = acc1.replace(/>/, '');
      if (innerValue) {
        const item = {
          text: innerValue,
          parent,
        };
        parent.children.push(item);
      }
      this.sa.start += 1;

      const [finded, acc] = this.search('>');
      if (finded) {
        const children = [];
        const [tagName] = acc.split(' ');

        if (!/^\//.test(tagName)) {
          const hasChildren = !/\/$/.test(acc);
          const item = {
            tagName,
            s: acc,
            hasChildren,
            children,
            parent,
          };
          this.tagStack.push(tagName);

          parent.children.push(item);

          return hasChildren ? item : parent;
        } else {
          return parent.parent;
        }
      }
    }
  }

  makeTree(parentArr = { children: [] }) {
    const returnArr = this.find(parentArr);
    if (returnArr) {
      return this.makeTree(returnArr);
    }

    return parentArr;
  }
}
