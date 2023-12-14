import{j as t,a as e,_ as o,F as n}from"./index-011f4033.js";const c=t(n,{children:[e("h2",{children:"Title 1"}),e("p",{children:"The following block allows injecting imports"}),e("h1",{children:"content 1..."}),t("pre",{children:[e("code",{class:"language-ts"}),`import { createContext } from "atomico";
import { Brand } from "./brand/brand";

console.log({ Brand });
export const MyTheme = createContext({ color: "red" });

customElements.define("my-theme", MyTheme);`]}),t("h2",{children:["my code ",e("code",{children:10})]}),e("p",{children:"content 2..."}),t("pre",{children:[e("code",{class:"language-tsx"}),`import { c, useContext, css } from "atomico";
import { MyTheme } from "./my-theme";

function myButton() {
    const { color } = useContext(MyTheme);
    return <host>color: {color}</host>;
}

myButton.styles = css\`
    :host {
        display: block;
    }
\`;

export const MyButton = c(myButton);

customElements.define("my-button", MyButton);`]}),e("p",{children:"this content ... fail?"}),(await o(()=>import("./77f90508808a050e7521384db9f9fb2f-701cb810.js"),["assets/77f90508808a050e7521384db9f9fb2f-701cb810.js","assets/index-011f4033.js","assets/index-c33e34ae.css"])).default,t("pre",{children:[e("code",{class:"language-tsx"}),`import { MyTheme } from "./my-theme";
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
);`]}),e("h2",{children:"Title 2"}),e("p",{children:"content 4..."})]});export{c as default};
