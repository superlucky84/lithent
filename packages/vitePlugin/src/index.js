import { parse } from "@wwact/compiler";

const fileRegex = /\.(wwx)$/

export default function myPlugin() {
  return {
    name: 'vite:wwx',

    transform(src, id) {
      if (fileRegex.test(id)) {

        const code = src.replace(/<template>((.|[\/S\/s])*)<\/template>/ms, (_m, template) => {
          return parse(template);
        });

        return {
          code,
          map: null // provide source map if available
        }
      }
    }
  }
}

