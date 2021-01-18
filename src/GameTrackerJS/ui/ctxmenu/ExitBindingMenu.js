import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import "/emcJS/ui/overlay/ContextMenu.js";
import StateStorage from "/script/storage/StateStorage.js";
import Language from "/script/util/Language.js";
import ExitRegistry from "../../registry/ExitRegistry.js";
import EntranceStateManager from "../../state/world/entrance/StateManager.js";

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
        this.attachShadow({mode: "open"});
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
        const selectEl = this.shadowRoot.getElementById("select");
        selectEl.innerHTML = "";
        // retrieve bound
        const exits = StateStorage.readAllExtra("exits");
        const bound = new Set();
        for (const key in exits) {
            if (exits[key] != current) {
                const boundExit = ExitRegistry.get(key);
                if (boundExit == null || !boundExit.exitData.ignoreBound) {
                    bound.add(exits[key]);
                }
            }
        }
        // add empty
        const empty = document.createElement("emc-option");
        empty.value = "";
        const emptyText = document.createElement("span");
        emptyText.innerHTML = "unbind";
        emptyText.style.fontStyle = "italic";
        empty.append(emptyText);
        selectEl.append(empty);
        // set choices and value
        const exit = ExitRegistry.get(access);
        if (exit != null) {
            selectEl.value = current;
            const entrances = EntranceStateManager.getAll();
            // add options
            for (const key in entrances) {
                const value = entrances[key];
                const isActive = value.active || exit.exitData.includeInactiveEntrances;
                const isActiveAndBinds = isActive && exit.exitData.bindsTo.indexOf(value.props.type) >= 0;
                if (isActiveAndBinds && (!bound.has(value.props.target) || exit.exitData.ignoreBound)) {
                    const opt = document.createElement("emc-option");
                    opt.value = value.props.target;
                    // XXX Takacomic: use commented code after translation update
                    // const entranceName = Language.translate(`entrance[${value.props.target}]`);
                    const entranceName = Language.translate(value.props.target);
                    if (exit.exitData.bindsTo.length > 1) {
                        const category = `
                            <span style="display: contents; color: lightgray; font-style: italic; font-size: 0.8em;">
                                ${Language.translate(value.props.type)}
                            </span>
                        `;
                        opt.innerHTML = `${entranceName}${category}`;
                    } else {
                        opt.innerHTML = entranceName;
                    }
                    selectEl.append(opt);
                }
            }
        } else {
            selectEl.value = "";
        }
    }

}

customElements.define("gt-ctxmenu-exitbinding", ExitBindingMenu);
