import { c, html } from "atomico";
export { SubTag } from "./sub-tag";
import md from "../README.md";

function button() {
	return html`<host>${md}</host>`;
}

export const Button = c(button);
