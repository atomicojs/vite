import { c, html } from "atomico";
import { SubTag } from "./sub-tag";
export { SubTag } from "./sub-tag";

function button() {
    console.log(SubTag);
    return html`<host><h1>Magic!</h1></host>`;
}

export const Button = c(button);
