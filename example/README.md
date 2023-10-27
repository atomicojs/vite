---
title: welcome
---

## Title 1

content 1...

```ts my-theme.ts
import { createContext } from "atomico";
import { Brand } from "./brand/brand";

console.log({ Brand });
export const MyTheme = createContext({ color: "red" });

customElements.define("my-theme", MyTheme);
```

content 2...

```tsx my-button.tsx
import { c, useContext } from "atomico";
import { MyTheme } from "./my-theme";

function myButton() {
	const { color } = useContext(MyTheme);
	return <host>color: {color}</host>;
}

export const MyButton = c(myButton);

customElements.define("my-button", MyButton);
```

content 3...

```tsx preview
import { MyTheme } from "./my-theme";
import { MyButton } from "./my-button";

export default (
	<>
		<MyTheme value={{ color: "red" }}>
			<MyButton />
		</MyTheme>
		<MyTheme value={{ color: "black" }}>
			<MyButton />
		</MyTheme>
		<MyTheme value={{ color: "orange" }}>
			<MyButton />
		</MyTheme>
	</>
);
```

## Title 2

content 4...
