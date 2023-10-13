import { c } from "atomico";

function markdownComponent() {
    return <host shadowDom>Hoooooooooooooooo!</host>;
}

export const MarkdownComponent = c(markdownComponent);

customElements.define("markdown-component", MarkdownComponent);