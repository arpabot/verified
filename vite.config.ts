import { sveltekit } from "@sveltejs/kit/vite";
import type { Plugin } from "rollup";
import { existsSync } from "node:fs";

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  resolve: {
    alias: {
      "cl-wrapper": existsSync("cl-wrapper") ? "./cl-wrapper" : "./empty"
    }
  },
  esbuild: {
    minify: true,
  }
};

export default config;