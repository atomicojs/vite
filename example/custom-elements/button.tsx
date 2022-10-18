import { c, html } from "atomico";

function button() {
    return html`<host><h1>Magic!</h1></host>`;
}

export const Button = c(button);
