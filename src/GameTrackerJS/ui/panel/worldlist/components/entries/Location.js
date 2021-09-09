// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import "/emcJS/ui/LabeledIcon.js";

import UIRegistry from "../../../../../registry/UIRegistry.js";
import WorldListMarkedEntry from "../abstract/WorldListMarkedEntry.js";
import LocationContextMenu from "../../../../ctxmenu/LocationContextMenu.js";
import ItemPickerContextMenu from "../../../../ctxmenu/ItemPickerContextMenu.js";

const TPL = new Template(`
<emc-labeledicon id="item" halign="center" valign="center"></emc-labeledicon>
`);

const STYLE = new GlobalStyle(`
#item {
    width: 32px;
    height: 32px;
    margin-left: 5px;
    font-size: 0.7em;
}
`);

function resolveImage(images) {
    if (Array.isArray(images)) {
        return images[0];
    } else {
        return images;
    }
}

function applyElements(target) {
    const textEl = target.getElementById("text");
    const tpl = TPL.generate();
    const itemEl = tpl.getElementById("item");
    textEl.insertAdjacentElement("afterend", itemEl);
}

export default class WorldListLocation extends WorldListMarkedEntry {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        badgeEl.hideValues = true;
        /* state handler */
        this.registerStateHandler("item", event => {
            const state = this.getState();
            this.applyItem(state?.itemData);
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

    clickHandler(event) {
        const state = this.getState();
        if (state != null) {
            state.value = !state.value;
        }
    }

    applyDefaultValues() {
        super.applyDefaultValues("images/icons/location.svg");
        this.applyItem();
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/location.svg");
        this.applyItem(state.itemData);
    }

    applyItem(itemData) {
        const itemEl = this.shadowRoot.getElementById("item");
        if (itemEl != null) {
            if (itemData != null) {
                itemEl.src = resolveImage(itemData?.images) ?? "/images/items/unknown.png";
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

}

UIRegistry.set("worldlist-location", new UIRegistry(WorldListLocation));
customElements.define("gt-worldlist-location", WorldListLocation);
