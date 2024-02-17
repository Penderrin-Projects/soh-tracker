// frameworks
import Template from "/emcJS/util/html/Template.js";
import {
    mix
} from "/emcJS/util/Mixin.js";

// GameTrackerJS
import WorldListAreaListButton from "/GameTrackerJS/ui/panel/worldlist/components/button/AreaListButton.js";
import AccessTextMarkerMixin from "/GameTrackerJS/ui/panel/worldlist/components/mixin/AccessTextMarkerMixin.js";
import "/GameTrackerJS/ui/BadgeAccess.js";
// Track-OOT
import "/script/state/world/WorldStates.js";

const TPL = new Template(`
<gt-badge-access id="badge"></gt-badge-access>
`);

const ICONS = {
    "": "images/icons/dungeontype_undefined.svg",
    "v": "images/icons/dungeontype_vanilla.svg",
    "mq": "images/icons/dungeontype_masterquest.svg"
};

function applyElements(target) {
    const textEl = target.getElementById("text");
    const tpl = TPL.generate();
    const badgeEl = tpl.getElementById("badge");
    textEl.insertAdjacentElement("afterend", badgeEl);
}

const BaseClass = mix(
    WorldListAreaListButton
).with(
    AccessTextMarkerMixin
);

export default class ListButton extends BaseClass {

    constructor() {
        super();
        applyElements(this.shadowRoot);
    }

    clickHandler() {
        const state = this.getState();
        if (state != null) {
            state.activeList = this.listName;
        }
        super.clickHandler();
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl != null) {
            badgeEl.typeIcon = ICONS[this.listName] ?? ICONS[""];
        }
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl != null) {
            badgeEl.typeIcon = ICONS[this.listName] ?? ICONS[""];
        }
    }

    applyAccess(access = {}) {
        super.applyAccess(access);
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl != null) {
            const accessValue = access.value?.toString();
            if (typeof accessValue === "string") {
                badgeEl.access = accessValue.toLowerCase();
            } else {
                badgeEl.access = "";
            }
            badgeEl.available = access.reachable ?? 0;
            badgeEl.unopened = access.unopened ?? 0;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "listname": {
                    /* badge */
                    const badgeEl = this.shadowRoot.getElementById("badge");
                    if (badgeEl != null) {
                        badgeEl.typeIcon = ICONS[newValue] ?? ICONS[""];
                    }
                } break;
            }
        }
    }

}

customElements.define("ootrt-worldlist-typebutton", ListButton);
