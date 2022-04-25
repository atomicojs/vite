import { css } from "atomico";
export { Hello } from "./hello/hello.jsx";
export { Brand } from "./brand/brand.jsx";

console.log(
  css`
    @import "normalize.css";
    @import "./base.css";
  `
);
