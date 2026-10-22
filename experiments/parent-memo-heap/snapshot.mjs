import assert from 'node:assert/strict';

// V8's schema describes flat node/edge arrays; no fixed field positions.
export class Snapshot {
  constructor(data) {
    this.data = data;
    this.nf = data.snapshot.meta.node_fields;
    this.ef = data.snapshot.meta.edge_fields;
    this.nt = data.snapshot.meta.node_types[0];
    this.et = data.snapshot.meta.edge_types[0];
    for (const key of ['type', 'name', 'id', 'self_size', 'edge_count'])
      assert.ok(this.nf.includes(key));
    for (const key of ['type', 'name_or_index', 'to_node'])
      assert.ok(this.ef.includes(key));
    this.count = data.nodes.length / this.nf.length;
    assert.equal(this.count, data.snapshot.node_count);
    assert.equal(data.edges.length / this.ef.length, data.snapshot.edge_count);
    this.starts = new Uint32Array(this.count + 1);
    let cursor = 0;
    for (let i = 0; i < this.count; i++) {
      this.starts[i] = cursor;
      cursor += this.field(i, 'edge_count') * this.ef.length;
    }
    this.starts[this.count] = cursor;
    assert.equal(cursor, data.edges.length);
  }
  field(i, key) {
    return this.data.nodes[i * this.nf.length + this.nf.indexOf(key)];
  }
  type(i) {
    return this.nt[this.field(i, 'type')];
  }
  name(i) {
    return this.data.strings[this.field(i, 'name')];
  }
  describe(i) {
    return {
      id: this.field(i, 'id'),
      type: this.type(i),
      name: this.name(i).slice(0, 180),
      selfBytes: this.field(i, 'self_size'),
    };
  }
  edge(at) {
    const type = this.et[this.data.edges[at + this.ef.indexOf('type')]];
    const raw = this.data.edges[at + this.ef.indexOf('name_or_index')];
    const to =
      this.data.edges[at + this.ef.indexOf('to_node')] / this.nf.length;
    assert.ok(Number.isInteger(to) && to >= 0 && to < this.count);
    return {
      type,
      name: ['element', 'hidden'].includes(type)
        ? String(raw)
        : this.data.strings[raw],
      to,
    };
  }
  edges(i) {
    const edges = [];
    for (let at = this.starts[i]; at < this.starts[i + 1]; at += this.ef.length)
      edges.push(this.edge(at));
    return edges;
  }
  properties(i) {
    return this.edges(i)
      .filter(edge => edge.type === 'property')
      .map(edge => edge.name);
  }
  // This is a conservative ordinary-strong path. Conditional ephemeron
  // references are excluded, rather than treated as unconditional roots.
  buildPaths() {
    this.parents = new Int32Array(this.count).fill(-1);
    this.parentEdges = new Int32Array(this.count).fill(-1);
    const queue = new Uint32Array(this.count);
    let head = 0,
      tail = 1;
    queue[0] = 0;
    this.parents[0] = 0;
    while (head < tail) {
      const from = queue[head++];
      for (
        let at = this.starts[from];
        at < this.starts[from + 1];
        at += this.ef.length
      ) {
        const edge = this.edge(at);
        if (
          edge.type === 'weak' ||
          /DevTools console/.test(edge.name) ||
          /part of key|part of value|ephemeron/i.test(edge.name) ||
          this.parents[edge.to] !== -1
        )
          continue;
        this.parents[edge.to] = from;
        this.parentEdges[edge.to] = at;
        queue[tail++] = edge.to;
      }
    }
  }
  path(i) {
    if (!this.parents) this.buildPaths();
    if (this.parents[i] === -1) return null;
    const result = [];
    while (i !== 0) {
      const edge = this.edge(this.parentEdges[i]);
      result.push({
        edge: { type: edge.type, name: edge.name.slice(0, 180) },
        node: this.describe(i),
      });
      i = this.parents[i];
    }
    return [{ node: this.describe(0) }, ...result.reverse()];
  }
}
