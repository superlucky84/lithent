import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import eslintPlugin from '@nabla/vite-plugin-eslint';
// import wwxPlugin from '@wwact/vite-plugin-wwx';

function V(e, t = [], n = []) {
  return { ignoreStr: t, ignoreChk: n, start: 0, end: 0, code: e };
}
class w {
  constructor(t) {
    (this.sa = t), (this.tagStack = []);
  }
  run() {
    return this.makeTree();
  }
  search(t) {
    let n = '',
      l = !1;
    const { ignoreStr: r, ignoreChk: s } = this.sa;
    for (
      this.sa.end = this.sa.start;
      this.sa.end < this.sa.code.length;
      this.sa.end += 1
    ) {
      const a = this.sa.code[this.sa.end],
        c = a === t,
        i = s.length > 0;
      if (c && !i) {
        (l = !0), (this.sa.start = this.sa.end);
        break;
      }
      r.includes(a) &&
        ((s[s.length - 1] === '"' && a === '"') ||
        (s[s.length - 1] === '{' && a === '}')
          ? s.pop()
          : s.push(a)),
        (n += this.sa.code[this.sa.end]);
    }
    return [l, n.trim()];
  }
  find(t) {
    const [n, l] = this.search('<');
    if (n) {
      const r = l.replace(/>/, '');
      if (r) {
        const c = {
          text: r,
          parent: t,
        };
        t.children.push(c);
      }
      this.sa.start += 1;
      const [s, a] = this.search('>');
      if (s) {
        const c = [];
        let [i] = a.split(' ');
        if (((i = i.replace(/\n|\r/g, '')), /^\//.test(i))) return t.parent;
        {
          const h = !/\/$/.test(a),
            u = {
              tagName: i,
              s: a,
              hasChildren: h,
              children: c,
              parent: t,
            };
          return this.tagStack.push(i), t.children.push(u), h ? u : t;
        }
      }
    }
  }
  makeTree(t = { children: [] }) {
    const n = this.find(t);
    return n ? this.makeTree(n) : t;
  }
}
function x(e) {
  if (e.tagName) {
    const [t, n, l, r, s] = S(e.s);
    (e.props = t),
      (e.ifValue = n),
      (e.elseIfValue = r),
      (e.elseValue = s),
      (e.forValue = l);
  } else if (e.text) {
    const t = I(e.text);
    e.textArr = t;
  }
  return (e.children = (e.children || []).map(t => x(t))), e;
}
function $(e, t) {
  let n = '',
    l = !1;
  const { ignoreStr: r, ignoreChk: s } = e;
  for (e.end = e.start; e.end < e.code.length; e.end += 1) {
    const a = e.code[e.end],
      c = a === t,
      i = s.length > 0;
    if (c && !i) {
      (l = !0), (e.start = e.end);
      break;
    }
    r.includes(a) &&
      ((s[s.length - 1] === '"' && a === '"') ||
      (s[s.length - 1] === '{' && a === '}')
        ? s.pop()
        : s.push(a)),
      (n += e.code[e.end]);
  }
  return [l, n];
}
function I(e) {
  let t = e.replace(/\n|\r/g, ' ');
  const n = V(t);
  function l(r) {
    const s = $(n, '{');
    if (s[0]) {
      r.push(s[1]);
      const a = $(n, '}');
      return a[0] && ((a[1] += '}'), (n.start += 1)), r.push(a[1]), l(r);
    }
    return r.push(s[1]), r;
  }
  return `${l([])
    .filter(r => r)
    .reduce(
      (r, s) => (
        /^{.*}$/.test(s)
          ? (r += s.replace(/^{|}$/g, '') + ', ')
          : (r += `'${s}', `),
        r
      ),
      ''
    )
    .replace(/, $/, '')}`;
}
function S(e) {
  let t = '',
    n = '',
    l = '',
    r = '',
    s = e.replace(/\n|\r/g, '');
  (s = s.replace(/=\s*/g, '=')),
    (s = s.replace(/\s*=/g, '=')),
    (s = s.replace(/\s{2,}/g, ' '));
  const a = V(s, ['"', '{', '}']),
    c = (u = []) => {
      let [d, o] = $(a, ' ');
      return d ? (u.push(o), (a.start += 1), c(u)) : (u.push(o), u);
    },
    [, ...i] = c(),
    h = i.reduce((u, d) => {
      const [o, k] = d.split('=');
      if (o.replace('/', '')) {
        const f = (k || "''").replace(/^{|}$/g, '');
        if (o === 'w-if') t = `((${f}) && `;
        else if (o === 'w-else-if') l = `((${f}) && `;
        else if (o === 'w-else') r = `((${f}) && `;
        else if (o === 'w-for') {
          let [g, p] = f.split(' in ');
          p || ((p = g), (g = `${p}Item`)), (n = `(${p}).map(${g}, index) => `);
        } else u.push(`${o}: ${f}`);
      }
      return u;
    }, []);
  return [h.length ? `{ ${h.join(', ')} }` : null, t, n, l, r];
}
function m(e) {
  let t = '';
  return (
    e.tagName
      ? ((t = `h(${/^[A-Z]/.test(e.tagName) ? e.tagName : `'${e.tagName}'`}, ${
          e.props
        }`),
        e.forValue && (t = e.forValue + t),
        e.ifValue && (t = e.ifValue + t),
        e.elseIfValue && (t = e.elseIfValue + t),
        e.elseValue && (t = e.elseValue + t),
        (e.children || []).forEach(n => {
          t += `${n.elseValue || n.elseIfValue ? ' || ' : ', '}${m(n)}`;
        }),
        (e.ifValue || e.elseIfValue || e.elseValue) && (t += ')'),
        (t += ')'))
      : e.textArr
      ? (t += `${e.textArr}`)
      : (e.children || []).forEach(n => {
          t += `, ${m(n)}`;
        }),
    t
  );
}
function N(e) {
  const t = new w(V(e, ['"', '{', '}'])).run(),
    n = x(t);
  return m(n).replace(/,\s*/, 'return ') + ';';
}
const A = /\.(wwx)$/;

function wwxPlugin() {
  return {
    name: 'vite:wwx',
    transform(e, t) {
      if (A.test(t)) {
        const va = {
          code: e.replace(/<template>((.|[\/S\/s])*)<\/template>/ms, (l, r) =>
            N(r)
          ),
          map: null,
        };

        console.log(va.code);
        return va;
      }
    },
  };
}

export default defineConfig({
  plugins: [
    wwxPlugin(),
    checker({ typescript: true }),
    eslintPlugin({ eslintOptions: { cache: false } }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/examples/wwx/example.wwx'),
      name: 'wwact',
      fileName: 'wwact',
    },
  },
});
