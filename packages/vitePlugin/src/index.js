import { parse } from "@wwact/compiler";

const fileRegex = /\.(wwx)$/

export default function myPlugin() {
  return {
    name: 'vite:wwx',

    transform(src, id) {
      if (fileRegex.test(id)) {

        const code = src.replace(/<template>((.|[\/S\/s])*)<\/template>/ms, (_m, p1) => {
          return parse(p1);
        });

        return {
          code,
          map: null // provide source map if available
        }
      }
    }
  }
}

