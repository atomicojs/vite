import { css } from "atomico";
export { Hello } from "./hello/hello.jsx";
export { Brand } from "./brand/brand.jsx";
import "./custom-elements/button";
console.log(
    css`
        @import "./demo.css";
        @import "normalize.css";
    `
);
