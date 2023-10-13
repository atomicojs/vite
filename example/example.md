# example

```tsx example.tsx
import { c } from "atomico";

function markdownComponent() {
	return <host shadowDom>Hoooooooooooooooo!</host>;
}

export const MarkdownComponent = c(markdownComponent);

customElements.define("markdown-component", MarkdownComponent);
```

```tsx group.tsx
export * from "./example";
```

1. Tengo que tomar los bloques de codigo y ejecutarlos... fuck

```tsx preview
import { MarkdownComponent } from "./group";
import "../brand/a";

export default (
	<h1>
		<MarkdownComponent />
	</h1>
);
```
