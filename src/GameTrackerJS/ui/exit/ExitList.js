/* asym-import: off */
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import TabPanel from "/emcJS/ui/layout/panel/TabPanel.js";
/* asym-import: on */
import WorldResource from "../../resource/WorldResource.js";
import WorldStateManager from "../../state/world/WorldStateManager.js";
import "../../state/world/exit/StateManager.js";
import "../../state/world/subexit/StateManager.js";
import Language from "../../util/Language.js";
import "./ExitChoice.js";

const STYLE = new GlobalStyle(`
:host {
    --category-color: white;
    --category-background-color: black;
    --category-hover-color: gray;
    --category-marked-color: black;
    --category-marked-background-color: white;
}
`);

export default class ExitList extends TabPanel {
    
    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const exits = WorldResource.get("marker/exit");
        for (const name in exits) {
            const state = WorldStateManager.get("exit", name);
            const category = state.exitData.type;
            this.addEntrance(category, state.ref);
        }
        const subexits = WorldResource.get("marker/subexit");
        for (const name in subexits) {
            const state = WorldStateManager.get("subexit", name);
            const category = state.exitData.type;
            this.addEntrance(category, state.ref);
        }
    }

    addTab(category) {
        return super.addTab(category, Language.generateLabel(category));
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

customElements.define("gt-exitlist", ExitList);
