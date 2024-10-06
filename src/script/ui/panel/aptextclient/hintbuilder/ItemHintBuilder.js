import CustomElement from "/emcJS/ui/element/CustomElement.js";
import TPL from "./ItemHintBuilder.js.html" assert {type: "html"};
import STYLE from "./ItemHintBuilder.js.css" assert {type: "css"};

/** TODO
 * - show available hint counter -> available: {available_hints} | next: {current_points - needed_points * available_hints} / {needed_points} [========== (progress bar)        ]
 * - add item grid for groups
 * - add item grid for single items
 *   - some items need extra icons: progressive strength upgrade, progressive hookshot, progressive scale
 */

export default class ItemHintBuilder extends CustomElement {

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        const hintGroupPickerEl = this.shadowRoot.getElementById("hint-group-picker");
        hintGroupPickerEl.addEventListener("iconclick", (event) => {
            const {value} = event;
            const ev = new Event("hint");
            ev.value = value;
            this.dispatchEvent(ev);
        });
        /* --- */
        const hintItemPickerEl = this.shadowRoot.getElementById("hint-item-picker");
        hintItemPickerEl.addEventListener("iconclick", (event) => {
            const {value} = event;
            const ev = new Event("hint");
            ev.value = value;
            this.dispatchEvent(ev);
        });
    }

}

customElements.define("ootrt-ap-item-hint-builder", ItemHintBuilder);
