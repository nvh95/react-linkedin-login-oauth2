import peerDepsExternal from "rollup-plugin-peer-deps-external";
import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
// import typescript from "rollup-plugin-typescript2";
// import postcss from "rollup-plugin-postcss";
// import copy from "rollup-plugin-copy";

const packageJson = require("./package.json");

export default {
  input: "src/index.js",
  output: [
    {
      file: packageJson.main,
      format: "cjs",
      // sourcemap: true,
    },
    {
      file: packageJson.module,
      format: "esm",
      // sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    babel({
      babelHelpers: "runtime",
      exclude: "node_modules/**",
    }),
    resolve(),
    commonjs(),
    // typescript({ useTsconfigDeclarationDir: true }),
    // postcss(),
    // copy({
    //   targets: [
    //   ],
    // }),
    terser({
      output: { comments: false },
      compress: {
        drop_console: true,
      },
    }),
  ],
};
