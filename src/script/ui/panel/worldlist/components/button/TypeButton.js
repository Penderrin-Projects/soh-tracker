// frameworks
import Template from "/emcJS/util/html/Template.js";
import {
    mix
} from "/emcJS/util/Mixin.js";

// GameTrackerJS
import WorldListStateButton from "/GameTrackerJS/ui/panel/worldlist/components/button/StateButton.js";
import AccessTextMarkerMixin from "/GameTrackerJS/ui/panel/worldlist/components/mixin/AccessTextMarkerMixin.js";
import "/GameTrackerJS/ui/BadgeAccess.js";
// Track-OOT
import "/script/state/world/WorldStates.js";

const TPL = new Template(`
<gt-badge-access id="badge"></gt-badge-access>
`);

const ICONS = {
    n: "images/icons/dungeontype_undefined.svg",
    v: "images/icons/dungeontype_vanilla.svg",
    mq: "images/icons/dungeontype_masterquest.svg"
};

function applyElements(target) {
    const textEl = target.getElementById("text");
    const tpl = TPL.generate();
    const badgeEl = tpl.getElementById("badge");
    textEl.insertAdjacentElement("afterend", badgeEl);
}

const BaseClass = mix(
    WorldListStateButton
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
            state.type = this.type ?? "n";
        }
        super.clickHandler();
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl != null) {
            badgeEl.typeIcon = ICONS[this.type] ?? ICONS["n"];
        }
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl != null) {
            badgeEl.typeIcon = ICONS[this.type] ?? ICONS["n"];
        }
    }

    getStateAccess(state) {
        if (state.getAccess != null) {
            return state.getAccess(this.type);
        } else {
            return state.access;
        }
    }
    
    applyAccess(value = "unavailable", data = {}) {
        super.applyAccess(value, data);
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl != null) {
            badgeEl.access = value;
            badgeEl.available = data.reachable ?? 0;
            badgeEl.unopened = data.unopened ?? 0;
        }
    }

    get type() {
        return this.getAttribute("type");
    }

    set type(val) {
        this.setAttribute("type", val);
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "type"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "type": {
                    const state = this.getState();
                    if (state != null) {
                        const access = state.getAccess(newValue);
                        this.applyAccess(access);
                    }
                    /* badge */
                    const badgeEl = this.shadowRoot.getElementById("badge");
                    if (badgeEl != null) {
                        badgeEl.typeIcon = ICONS[newValue] ?? ICONS["n"];
                    }
                } break;
            }
        }
    }

    get category() {
        return "area";
    }

}

customElements.define("ootrt-worldlist-typebutton", ListButton);
