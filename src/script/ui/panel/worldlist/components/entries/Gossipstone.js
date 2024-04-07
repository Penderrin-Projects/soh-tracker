import Template from "/emcJS/util/html/Template.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import Language from "/GameTrackerJS/util/Language.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import WorldListElement from "/GameTrackerJS/ui/panel/worldlist/components/abstract/Element.js";
import AccessTextMarkerMixin from "/GameTrackerJS/ui/panel/worldlist/components/mixin/AccessTextMarkerMixin.js";
import "/GameTrackerJS/ui/panel/worldlist/components/entries/Location.js";
import GossipstoneContextMenu from "../../../../ctxmenu/GossipstoneContextMenu.js";
import LogicViewer from "../../../../window/LogicViewer.js";

const TPL = new Template(`
<div id="hintlocation-container" class="textarea">
    <emc-i18n-label id="hintlocation"></emc-i18n-label>
</div>
<div id="hintitem-container" class="textarea">
    <emc-i18n-label id="hintitem"></emc-i18n-label>
</div>
`);

function applyElements(target) {
    const headerEl = target.getElementById("header");
    const tpl = TPL.generate();
    headerEl.append(tpl);
}

const BaseClass = mix(
    WorldListElement
).with(
    AccessTextMarkerMixin
);

export default class WorldListGossipstone extends BaseClass {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        /* observer */
        this.registerStateHandler("item", () => {
            const state = this.getState();
            if (state != null) {
                this.applyItem(state.item);
            }
        });
        this.registerStateHandler("location", () => {
            const state = this.getState();
            if (state != null) {
                this.applyLocation(state.location);
            }
        });
        /* context menu */
        this.setDefaultContextMenu(GossipstoneContextMenu);
        this.addDefaultContextMenuHandler("check", () => {
            const state = this.getState();
            if (state != null) {
                state.value = true;
            }
        });
        this.addDefaultContextMenuHandler("uncheck", () => {
            const state = this.getState();
            if (state != null) {
                state.value = false;
            }
        });
        this.addDefaultContextMenuHandler("sethint", async () => {
            const state = this.getState();
            if (state != null) {
                // TODO show hint dialog
                // select Location/Area/Exit
                // if Exit select target
                // if Area/Location select item/WOTH
            }
        });
        this.addDefaultContextMenuHandler("junk", () => {
            const state = this.getState();
            if (state != null) {
                state.location = "junk_hint";
                state.item = "";
                state.value = true;
            }
        });
        this.addDefaultContextMenuHandler("clearhint", () => {
            const state = this.getState();
            if (state != null) {
                state.location = "";
                state.item = "";
                state.value = false;
            }
        });
        this.addDefaultContextMenuHandler("show_logic", () => {
            const state = this.getState();
            if (state != null) {
                const title = Language.generateLabel(`location[${this.ref}]`);
                LogicViewer.show(state.props.logicAccess ?? "", title);
            }
        });
    }

    clickHandler() {
        const state = this.getState();
        if (state != null) {
            state.value = !state.value;
        }
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        this.applyItem();
        this.applyLocation();
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        this.applyItem(state.item);
        this.applyLocation(state.location);
    }

    applyItem(item) {
        const itemContainerEl = this.shadowRoot.getElementById("hintitem-container");
        const itemEl = this.shadowRoot.getElementById("hintitem");
        if (itemEl != null) {
            if (item) {
                itemEl.i18nValue = item;
                itemContainerEl.classList.remove("hidden");
            } else {
                itemEl.i18nValue = "";
                itemContainerEl.classList.add("hidden");
            }
        }
    }

    applyLocation(location) {
        const locationContainerEl = this.shadowRoot.getElementById("hintlocation-container");
        const locationEl = this.shadowRoot.getElementById("hintlocation");
        if (locationEl != null) {
            if (location) {
                locationEl.i18nValue = location;
                locationContainerEl.classList.remove("hidden");
            } else {
                locationEl.i18nValue = "";
                locationContainerEl.classList.add("hidden");
            }
        }
    }

    get type() {
        return "Location";
    }

}

customElements.define("ootrt-worldlist-gossipstone", WorldListGossipstone);
UIRegistry.get("worldlist-location").register("gossipstone", WorldListGossipstone);
