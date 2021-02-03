/* asym-import: off */
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import "/emcJS/ui/overlay/ContextMenu.js";
/* asym-import: on */
import WorldResource from "../../resource/WorldResource.js";
import WorldStateManagers from "../../state/world/StateManagers.js";
import SavestateHandler from "../../savestate/SavestateHandler.js";
import Language from "../../util/Language.js";

const TPL = new Template(`
<emc-contextmenu id="menu">
    <emc-listselect id="select"></emc-listselect>
</emc-contextmenu>
`);

const CTG_TPL = new Template(`
<span style="display: contents; color: lightgray; font-style: italic; font-size: 0.8em;"></span>
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
        this.attachShadow({ mode: "open" });
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
        menuEl.addEventListener("close", () => {
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
        const exits = SavestateHandler.getAll("exits");
        const bound = new Set();
        for (const key in exits) {
            if (exits[key] != current) {
                const boundExit = WorldStateManagers.getEntrance(key);
                if (boundExit == null || !boundExit.ignoreBound) {
                    bound.add(exits[key]);
                }
            }
        }
        // add empty
        const empty = document.createElement("emc-option");
        empty.value = "";
        const emptyText = document.createElement("span");
        Language.applyLabel(emptyText, "unbind");
        emptyText.style.fontStyle = "italic";
        empty.append(emptyText);
        selectEl.append(empty);
        // set choices and value
        const exit = WorldStateManagers.getEntrance(access);
        if (exit != null) {
            selectEl.value = current;
            // add options
            const entrances = WorldResource.get("exit");
            for (const name in entrances) {
                const value = WorldStateManagers.getEntrance(name);
                if (access != value.props.target) {
                    const isActive = value.active || exit.props.includeInactiveEntrances;
                    const isActiveAndBinds = isActive && exit.props.bindsTo.indexOf(value.props.type) >= 0;
                    if (isActiveAndBinds && (!bound.has(value.props.target) || exit.props.ignoreBound)) {
                        const opt = document.createElement("emc-option");
                        opt.value = value.props.target;
                        const entranceName = Language.generateLabel(`entrance[${value.props.target}]`);
                        if (exit.props.bindsTo.length > 1) {
                            const category = CTG_TPL.generate();
                            Language.applyLabel(category, value.props.type);
                            opt.append(entranceName);
                            opt.append(category);
                        } else {
                            opt.append(entranceName);
                        }
                        selectEl.append(opt);
                    }
                }
            }
        } else {
            selectEl.value = "";
        }
    }

}

customElements.define("gt-ctxmenu-exitbinding", ExitBindingMenu);
