/* asym-import: off */
import Template from "/emcJS/util/Template.js";
import "/emcJS/ui/overlay/ContextMenu.js";
/* asym-import: on */

// Track-OOT
import "/script/ui/items/ItemPicker.js";

const TPL = new Template(`
<emc-contextmenu id="menu">
    <ootrt-itempicker id="item-picker" grid="pickable"></ootrt-itempicker>
</emc-contextmenu>
`);


export default class ItemPickerMenu extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        /* --- */
        this.shadowRoot.getElementById("item-picker").addEventListener("pick", event => {
            const ev = new Event("pick");
            ev.item = event.detail;
            this.dispatchEvent(ev);
            /* --- */
            event.preventDefault();
            return false;
        });
    }

    show(posX, posY) {
        const mnu_ctx = this.shadowRoot.getElementById("menu");
        mnu_ctx.show(posX, posY);
    }

    get top() {
        const mnu_ctx = this.shadowRoot.getElementById("menu");
        return mnu_ctx.top;
    }

    get left() {
        const mnu_ctx = this.shadowRoot.getElementById("menu");
        return mnu_ctx.left;
    }

}

customElements.define('ootrt-ctxmenu-itempicker', ItemPickerMenu);
