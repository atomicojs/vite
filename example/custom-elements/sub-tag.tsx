import { c, html } from "atomico";
function subTag() {
	return html`<host><h1>Magic!</h1></host>`;
}

export const SubTag = c(subTag);
