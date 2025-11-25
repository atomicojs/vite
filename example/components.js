import { css } from "atomico";
export { Hello } from "./hello/hello";

console.log(css`
	@import "./demo.css";
	@import "normalize.css";
`);
