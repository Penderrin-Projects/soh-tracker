// frameworks
import GossipstoneContextMenu from "../../../../ctxmenu/GossipstoneContextMenu.js";
import Template from "/emcJS/util/html/Template.js";
import {
    mix
} from "/emcJS/util/Mixin.js";

// GameTrackerJS
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import WorldListElement from "/GameTrackerJS/ui/panel/worldlist/components/abstract/Element.js";
import AccessTextMarkerMixin from "/GameTrackerJS/ui/panel/worldlist/components/mixin/AccessTextMarkerMixin.js";

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

export default class ListGossipstone extends BaseClass {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        /* observer */
        this.registerStateHandler("item", (event) => {
            this.applyItem(event.value);
        });
        this.registerStateHandler("location", (event) => {
            this.applyLocation(event.value);
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
        this.addDefaultContextMenuHandler("sethint", () => {
            // TODO
        });
        this.addDefaultContextMenuHandler("junk", () => {
            const state = this.getState();
            if (state != null) {
                state.location = "junk_hint";
                state.item = "";
            }
        });
        this.addDefaultContextMenuHandler("clearhint", () => {
            const state = this.getState();
            if (state != null) {
                state.location = "";
                state.item = "";
            }
        });
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
            const state = this.getState();
            if (state?.value && item) {
                itemEl.i18nValue = item;
                itemContainerEl.classList.remove("hidden");
            } else {
                itemEl.i18nValue = "";
                itemContainerEl.classList.add("hidden");
            }
        }
    }

    applyLocation(location) {
        const itemContainerEl = this.shadowRoot.getElementById("hintlocation-container");
        const locationEl = this.shadowRoot.getElementById("hintlocation");
        if (locationEl != null) {
            const state = this.getState();
            if (state?.value && location) {
                locationEl.i18nValue = location;
                itemContainerEl.classList.remove("hidden");
            } else {
                locationEl.i18nValue = "";
                itemContainerEl.classList.add("hidden");
            }
        }
    }

    get category() {
        return "location";
    }

}

customElements.define("ootrt-worldlist-gossipstone", ListGossipstone);
UIRegistry.get("worldlist-location")
    .register("gossipstone", ListGossipstone);
