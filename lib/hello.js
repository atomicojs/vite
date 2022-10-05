import { jsxs, jsx } from 'atomico/jsx-runtime';
import { css, c } from 'atomico';

function hello({ message }) {
  return /* @__PURE__ */ jsxs("host", {
    shadowDom: true,
    children: [
      /* @__PURE__ */ jsx("div", {
        class: "layer",
        children: message
      }),
      /* @__PURE__ */ jsx("div", {
        class: "box",
        children: /* @__PURE__ */ jsx("slot", {})
      })
    ]
  });
}
hello.props = {
  message: {
    type: String,
    value: "Hello."
  }
};
hello.styles = css`:host,.layer{width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative}.layer{position:absolute;top:0;left:0;font-size:20vw;font-weight:700;overflow:hidden;color:#fff;text-shadow:0px 2vw 4vw var(--hello-shadow-1, magenta),0px 2vw 1vw var(--hello-shadow-2, tomato);opacity:.15;align-items:flex-end}.box{position:relative}`;
const Hello = c(hello);
customElements.define("atomico-hello", Hello);
