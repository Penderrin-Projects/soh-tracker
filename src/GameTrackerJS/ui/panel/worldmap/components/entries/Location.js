// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import "/emcJS/ui/overlay/Tooltip.js";

import UIRegistry from "../../../../../registry/UIRegistry.js";
import WorldMapMarkedEntry from "../abstract/WorldMapMarkedEntry.js";
import LocationContextMenu from "../../../../ctxmenu/LocationContextMenu.js";
import ItemPickerContextMenu from "../../../../ctxmenu/ItemPickerContextMenu.js";

const TPL = new Template(`
<emc-labeledicon id="item" halign="center" valign="center"></emc-labeledicon>
`);

const STYLE = new GlobalStyle(`
:host {
    width: 32px;
    height: 32px;
    transform: translate(-8px, -8px);
}
#item {
    width: 32px;
    height: 32px;
    margin-left: 5px;
    font-size: 0.7em;
}
`);

function applyElements(target) {
    const textEl = target.getElementById("text");
    const tpl = TPL.generate();
    const itemEl = tpl.getElementById("item");
    textEl.insertAdjacentElement("afterend", itemEl);
}

export default class MapLocation extends WorldMapMarkedEntry {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        badgeEl.hideValues = true;
        /* state handler */
        this.registerStateHandler("item", event => {
            this.applyItem(event.data);
        });
        /* context menu */
        this.setDefaultContextMenu(LocationContextMenu);
        this.addDefaultContextMenuHandler("check", event => {
            const state = this.getState();
            if (state != null) {
                state.value = true;
            }
        });
        this.addDefaultContextMenuHandler("uncheck", event => {
            const state = this.getState();
            if (state != null) {
                state.value = false;
            }
        });
        this.addDefaultContextMenuHandler("associate", event => {
            const mnu_ctx = this.getDefaultContextMenu();
            const mnu_itm = this.getContextMenu("itempicker");
            mnu_itm.loadItems("pickable");
            mnu_itm.show(mnu_ctx.left, mnu_ctx.top);
        });
        this.addDefaultContextMenuHandler("disassociate", event => {
            const state = this.getState();
            if (state != null) {
                state.item = "";
            }
        });
        this.addDefaultContextMenuHandler("show_logic", event => {
            const state = this.getState();
            if (state != null) {
                const title = Language.generateLabel(this.ref);
                LogicViewer.show(state.props.access, title);
            }
        });
        /* context menu - item picker */
        this.setContextMenu("itempicker", ItemPickerContextMenu);
        this.addContextMenuHandler("itempicker", "pick", event => {
            const state = this.getState();
            if (state != null) {
                state.item = event.item;
            }
        });
    }

    get left() {
        return this.getAttribute("left");
    }

    set left(val) {
        this.setAttribute("left", val);
    }

    get top() {
        return this.getAttribute("top");
    }

    set top(val) {
        this.setAttribute("top", val);
    }

    get tooltip() {
        return this.getAttribute("tooltip");
    }

    set tooltip(val) {
        this.setAttribute("tooltip", val);
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "left", "top", "tooltip"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "top":
                case "left":
                    this.style.left = `${this.left}px`;
                    this.style.top = `${this.top}px`;
                    break;
                case "tooltip":
                    {
                        const tooltip = this.shadowRoot.getElementById("tooltip");
                        tooltip.position = newValue;
                    }
                    break;
            }
        }
    }

    applyItem(item = "") {
        const itemEl = this.shadowRoot.getElementById("item");
        if (itemEl != null) {
            const itemData = ItemStateManager.get(item);
            if (itemData != null) {
                itemEl.src = itemData?.image ?? "/images/items/unknown.png";
                itemEl.text = itemData?.label ?? "";
                itemEl.valign = itemData?.valign ?? "center";
                itemEl.halign = itemData?.halign ?? "center";
            } else {
                itemEl.src = "";
                itemEl.text = "";
                itemEl.valign = "center";
                itemEl.halign = "center";
            }
        }
    }

    get textRef() {
        return `location[${super.textRef}]`;
    }

    get category() {
        return "location";
    }

}

customElements.define("gt-worldmap-location", MapLocation);
UIRegistry.set("worldmap-location", new UIRegistry(MapLocation));
