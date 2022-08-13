import { parse } from "@wwact/compiler";

const wwxPlugin = {
  name: "wwx",
  setup(build) {
    build.initialOptions.define = build.initialOptions.define || {};
    let path = require("path");
    let fs = require("fs");

    build.onResolve({ filter: /\.wwx$/ }, (args) => {
      return {
        path: args.path,
        namespace: "wwx",
        pluginData: { resolveDir: args.resolveDir },
      };
    });

    build.onLoad({ filter: /\.wwx$/, namespace: "wwx" }, async (args) => {
      let convertMessage = ({ message, start, end }) => {
        let location;
        if (start && end) {
          let lineText = source.split(/\r\n|\r|\n/g)[start.line - 1];
          let lineEnd = start.line === end.line ? end.column : lineText.length;
          location = {
            file: filename,
            line: start.line,
            column: start.column,
            length: lineEnd - start.column,
            lineText,
          };
        }
        return { text: message, location };
      };

      let source = await fs.promises.readFile(args.path, "utf8");
      let filename = path.relative(process.cwd(), args.path);

      try {
        const contents = source.replace(
          /<template>((.|[\/S\/s])*)<\/template>/ms,
          (_m, p1) => {
            return parse(p1);
          }
        );

        return { contents, warnings: [].map(convertMessage) };
      } catch (e) {
        return { errors: [convertMessage(e)] };
      }
    });
  },
};

export default wwxPlugin;
