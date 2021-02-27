/* asym-import: off */
import Template from "/emcJS/util/Template.js";
import "/emcJS/ui/overlay/ContextMenu.js";
/* asym-import: on */

// GameTrackerJS
import iOSTouchHandler from "/GameTrackerJS/util/iOSTouchHandler.js";

const TPL = new Template(`
<emc-contextmenu id="menu">
    <div id="menu-check" class="item">Check</div>
    <div id="menu-uncheck" class="item">Uncheck</div>
    <div class="splitter"></div>
    <div id="menu-associate" class="item">Set Item</div>
    <div id="menu-disassociate" class="item">Clear Item</div>
    <div class="splitter"></div>
    <div id="menu-logic" class="item">Show Logic</div>
</emc-contextmenu>
`);

export default class LocationContextMenu extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        /* --- */
        this.shadowRoot.getElementById("menu-check").addEventListener("click", event => {
            const ev = new Event("check");
            this.dispatchEvent(ev);
            /* --- */
            event.preventDefault();
            return false;
        });
        this.shadowRoot.getElementById("menu-uncheck").addEventListener("click", event => {
            const ev = new Event("uncheck");
            this.dispatchEvent(ev);
            /* --- */
            event.preventDefault();
            return false;
        });
        this.shadowRoot.getElementById("menu-associate").addEventListener("click", event => {
            const ev = new Event("associate");
            this.dispatchEvent(ev);
            /* --- */
            event.preventDefault();
            return false;
        });
        this.shadowRoot.getElementById("menu-disassociate").addEventListener("click", event => {
            const ev = new Event("disassociate");
            this.dispatchEvent(ev);
            /* --- */
            event.preventDefault();
            return false;
        });
        this.shadowRoot.getElementById("menu-logic").addEventListener("click", event => {
            const ev = new Event("show_logic");
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

customElements.define("ootrt-ctxmenu-location", LocationContextMenu);
