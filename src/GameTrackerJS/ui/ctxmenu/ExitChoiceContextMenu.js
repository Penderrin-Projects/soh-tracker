// frameworks
import Template from "/emcJS/util/Template.js";
import "/emcJS/ui/overlay/ContextMenu.js";

import iOSTouchHandler from "../../util/iOSTouchHandler.js";

const TPL = new Template(`
<emc-contextmenu id="menu">
    <div id="menu-associate" class="item">Bind Entrance</div>
    <div id="menu-deassociate" class="item">Unbind Entrance</div>
</emc-contextmenu>
`);

export default class ExitContextMenu extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        /* --- */
        this.shadowRoot.getElementById("menu-associate").addEventListener("click", event => {
            const ev = new Event("associate");
            this.dispatchEvent(ev);
            /* --- */
            event.preventDefault();
            return false;
        });
        this.shadowRoot.getElementById("menu-deassociate").addEventListener("click", event => {
            const ev = new Event("deassociate");
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

customElements.define("gt-ctxmenu-exitchoice", ExitContextMenu);
