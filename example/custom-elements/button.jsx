import { c, html } from "atomico";
export { SubTag } from "./sub-tag";
import md from "../README.md";

function button() {
	return html`<host>
		<link
			rel="stylesheet"
			href="http://markdowncss.github.io/splendor/css/splendor.css"
		/>
		${md}
	</host>`;
}

export const Button = c(button);