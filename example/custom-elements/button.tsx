import { c, html } from "atomico";
import { SubTag } from "./sub-tag";
export { SubTag } from "./sub-tag";
//@ts-ignore
import jsx from "../example.md";

function button() {
	return html`<host>
		<link
			rel="stylesheet"
			href="http://markdowncss.github.io/splendor/css/splendor.css"
		/>
		${jsx}
	</host>`;
}

export const Button = c(button);
