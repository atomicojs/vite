import { c, html } from "atomico";
export { SubTag } from "./sub-tag";

function button() {
	return html`<host>
		<link
			rel="stylesheet"
			href="http://markdowncss.github.io/splendor/css/splendor.css"
		/>
	</host>`;
}

export const Button = c(button);
