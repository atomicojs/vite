import { c, html, useAsync } from "atomico";
export { SubTag } from "./sub-tag";
import * as md from "../README.md?meta";

console.log(md);

function button() {
	const template = useAsync(md.default, []);
	console.log(template);
	return html`<host>${template}</host>`;
}

export const Button = c(button);
