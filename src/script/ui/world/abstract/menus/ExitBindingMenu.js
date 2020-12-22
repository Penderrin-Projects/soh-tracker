import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import "/emcJS/ui/overlay/ContextMenu.js";
import StateStorage from "/script/storage/StateStorage.js";
import Language from "/script/util/Language.js";
import ExitRegistry from "/script/registries/ExitRegistry.js";

const TPL = new Template(`
<emc-contextmenu id="menu">
    <emc-listselect id="select"></emc-listselect>
</emc-contextmenu>
`);

const STYLE = new GlobalStyle(`
#select {
    height: 300px;
    width: 300px;
}
`);

export default class ExitBindingMenu extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const menuEl = this.shadowRoot.getElementById("menu");
        const selectEl = this.shadowRoot.getElementById("select");
        selectEl.addEventListener("change", event => {
            const ev = new Event("change");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        selectEl.addEventListener("click", event => {
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        menuEl.addEventListener("close", function() {
            selectEl.resetSearch();
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

    setValue(value) {
        const selectEl = this.shadowRoot.getElementById("select");
        selectEl.value = value;
    }

    fillEntranceSelection(access, current = "") {
        // retrieve bound
        const exits = StateStorage.readAllExtra("exits");
        const bound = new Set();
        for (const key in exits) {
            if (exits[key] == current) continue;
            bound.add(exits[key]);
        }
        // add options
        const exit = ExitRegistry.get(access);
        const entrances = ExitRegistry.getAll();
        const selectEl = this.shadowRoot.getElementById("select");
        selectEl.value = current;
        selectEl.innerHTML = "";
        const empty = document.createElement('emc-option');
        empty.value = "";
        const emptyText = document.createElement('span');
        emptyText.innerHTML = "unbind";
        emptyText.style.fontStyle = "italic";
        empty.append(emptyText);
        selectEl.append(empty);
        for (const key in entrances) {
            const value = entrances[key];
            if (value.exitData.type == exit.exitData.type && !bound.has(value.exitData.target)) {
                const opt = document.createElement('emc-option');
                opt.value = value.exitData.target;
                opt.innerHTML = Language.translate(value.exitData.target);
                selectEl.append(opt);
            }
        }
    }

}

customElements.define('ootrt-ctxmenu-exitbinding', ExitBindingMenu);
