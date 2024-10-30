/// <reference types="vite/client" />

declare module "*.csv" {
  export default <{ [key: string]: unknown }>Array;
}

declare module "save-svg-as-png";