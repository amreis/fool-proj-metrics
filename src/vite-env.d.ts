/// <reference types="vite/client" />

declare module "*.csv" {
  export default <{ [key: string]: any }>Array;
}

declare module "save-svg-as-png";