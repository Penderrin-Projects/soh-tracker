// GameTrackerJS
import WorldListMarkedEntry from "/GameTrackerJS/ui/panel/worldlist/components/abstract/WorldListMarkedEntry.js";
// Track-OOT
import "/script/state/world/CustomWorldStates.js";

export default class ListButton extends WorldListMarkedEntry {

    clickHandler() {
        const state = this.getState();
        if (state != null) {
            state.type = this.type || "n";
        }
    }

    applyDefaultValues() {
        super.applyDefaultValues("images/icons/dungeontype_undefined.svg");
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/dungeontype_undefined.svg");
    }

    getStateAccess(state) {
        return state.getAccess(this.type);
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get type() {
        return this.getAttribute("type");
    }

    set type(val) {
        this.setAttribute("type", val);
    }

    static get observedAttributes() {
        return ["ref", "type"];
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
                        if (newValue == "v") {
                            badgeEl.typeIcon = "images/icons/dungeontype_vanilla.svg";
                        } else if (newValue == "mq") {
                            badgeEl.typeIcon = "images/icons/dungeontype_masterquest.svg";
                        } else {
                            badgeEl.typeIcon = "images/icons/dungeontype_undefined.svg";
                        }
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
