// frameworks
import Template from "/emcJS/util/Template.js";
import "/emcJS/ui/overlay/ContextMenu.js";


// Track-OOT
import "/script/ui/items/ItemPicker.js";
import iOSTouchHandler from "/GameTrackerJS/util/iOSTouchHandler.js";

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

        /* fck iOS */
        iOSTouchHandler.register(this.shadowRoot.getElementById("menu"), true);
        const all = this.shadowRoot.querySelectorAll(".item");
        for (const el of all) {
            iOSTouchHandler.register(el);
        }
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
