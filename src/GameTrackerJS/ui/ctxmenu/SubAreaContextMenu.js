/* asym-import: off */
import Template from "/emcJS/util/Template.js";
import "/emcJS/ui/overlay/ContextMenu.js";
/* asym-import: on */

const TPL = new Template(`
<emc-contextmenu id="menu">
    <div id="menu-check" class="item">Check All</div>
    <div id="menu-uncheck" class="item">Uncheck All</div>
    <div class="splitter"></div>
    <div id="menu-setwoth" class="item">Set WOTH</div>
    <div id="menu-setbarren" class="item">Set Barren</div>
    <div id="menu-clearhint" class="item">Clear Hint</div>
</emc-contextmenu>
`);

export default class SubAreaContextMenu extends HTMLElement {

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

customElements.define("gt-ctxmenu-subarea", SubAreaContextMenu);
