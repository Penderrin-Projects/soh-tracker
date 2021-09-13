// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";

import Savestate from "../../savestate/Savestate.js";
import Language from "../../util/Language.js";
import WorldResource from "../../resource/WorldResource.js";
import ExitStateManager from "../../state/world/exit/StateManager.js";
import EntranceStateManager from "../../state/world/entrance/StateManager.js";

const STORAGES = {
    exitBindings: Savestate.getStorage("exitBindings"),
};

const CTG_TPL = new Template(`
<span style="color:#00000057;font-style:italic;font-size:0.8em;"></span>
`);

const STYLE = new GlobalStyle(`
::slotted(#select) {
    height: 300px;
    width: 300px;
}
`);

const SELECT_EL = new WeakMap();

export default class ExitBindingContextMenu extends ContextMenu {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
    }

    initItems() {
        const exitSelectEl = document.createElement("emc-listselect");
        exitSelectEl.id = "select";
        exitSelectEl.addEventListener("change", event => {
            const ev = new Event("change");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        exitSelectEl.addEventListener("click", event => {
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        SELECT_EL.set(this, exitSelectEl);
        super.loadItems([exitSelectEl]);
    }

    loadItems() {
        // nothing
    }

    show(posX, posY, access, current) {
        super.show(posX, posY);
        this.fillEntranceSelection(access, current);
    }

    close() {
        const exitSelectEl = SELECT_EL.get(this);
        exitSelectEl.resetSearch();
        super.close();
    }

    setValue(value) {
        const exitSelectEl = SELECT_EL.get(this);
        exitSelectEl.value = value;
    }

    fillEntranceSelection(access, current = "") {
        const exitSelectEl = SELECT_EL.get(this);
        exitSelectEl.innerHTML = "";
        // retrieve bound
        const bound = new Set();
        for (const [key, value] of STORAGES.exitBindings) {
            if (value != current) {
                const boundExit = EntranceStateManager.get(key);
                if (boundExit == null || !boundExit.props.ignoreBound) {
                    bound.add(value);
                }
            }
        }
        // add unbind
        const unbindOptionEl = document.createElement("emc-option");
        unbindOptionEl.value = "";
        const unbindOptionText = document.createElement("span");
        Language.applyLabel(unbindOptionText, "unbind");
        unbindOptionText.style.fontStyle = "italic";
        unbindOptionEl.append(unbindOptionText);
        exitSelectEl.append(unbindOptionEl);
        // add empty
        const emptyOptionEl = document.createElement("emc-option");
        emptyOptionEl.value = "\u0000";
        const emptyOptionText = document.createElement("span");
        Language.applyLabel(emptyOptionText, "entrance[]");
        emptyOptionText.style.fontStyle = "italic";
        emptyOptionEl.append(emptyOptionText);
        exitSelectEl.append(emptyOptionEl);
        // set choices and value
        const exit = ExitStateManager.get(access);
        if (exit != null) {
            exitSelectEl.value = current;
            // add options
            for (const [, entrance] of EntranceStateManager) {
                setTimeout(() => {
                    if (access != entrance.props.target && (entrance.props.ignoreBound || !bound.has(exit.props.target))) {
                        const isBindable = exit.checkBindable(entrance);
                        if (isBindable) {
                            const opt = document.createElement("emc-option");
                            opt.value = entrance.props.target;
                            opt.style.flexDirection = "column";
                            opt.style.alignItems = "flex-start";
                            opt.style.justifyContent = "center";
                            const entranceName = Language.generateLabel(`entrance[${entrance.props.target}]`);
                            opt.append(entranceName);
                            const category = CTG_TPL.generate(0);
                            const categoryName = Language.generateLabel(entrance.props.type);
                            category.append(categoryName);
                            opt.append(category);
                            exitSelectEl.append(opt);
                        }
                    }
                }, 0);
            }
        } else {
            exitSelectEl.value = "";
        }
    }

    initFocus() {
        const exitSelectEl = SELECT_EL.get(this);
        exitSelectEl.focus();
    }

}

customElements.define("gt-ctxmenu-exitbinding", ExitBindingContextMenu);
