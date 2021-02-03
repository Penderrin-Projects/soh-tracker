/* asym-import: off */
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import TabPanel from "/emcJS/ui/layout/panel/TabPanel.js";
/* asym-import: on */

// GameTrackerJS
import WorldResource from "/GameTrackerJS/resource/WorldResource.js";
import WorldStateManagers from "/GameTrackerJS/state/world/StateManagers.js";
import "/GameTrackerJS/state/world/exit/StateManager.js";
import "/GameTrackerJS/state/world/subexit/StateManager.js";
import Language from "/GameTrackerJS/util/Language.js";
import "/GameTrackerJS/ui/ExitChoice.js";

const STYLE = new GlobalStyle(`
:host {
    --category-color: white;
    --category-background-color: black;
    --category-hover-color: gray;
    --category-marked-color: black;
    --category-marked-background-color: white;
}
`);

export default class HTMLTrackerExitList extends TabPanel {
    
    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const exits = WorldResource.get("marker/exit");
        for (const name in exits) {
            const state = WorldStateManagers.get("exit", name);
            const category = state.exitData.type;
            this.addEntrance(category, state.ref);
        }
        const subexits = WorldResource.get("marker/subexit");
        for (const name in subexits) {
            const state = WorldStateManagers.get("subexit", name);
            const category = state.exitData.type;
            this.addEntrance(category, state.ref);
        }
    }

    addTab(category) {
        return super.addTab(category, Language.translate(category));
    }

    addEntrance(category, ref) {
        const el = document.createElement("gt-exitchoice");
        el.ref = ref;
        const panel = this.getTab(category);
        if (panel != null) {
            if (category !== "not_seen") {
                panel.append(el);
            }
        } else {
            if (category !== "not_seen") {
                this.addTab(category).append(el);
            }
        }
    }

}

customElements.define("ootrt-exitlist", HTMLTrackerExitList);
