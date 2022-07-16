import {
    getGatewayIn
} from "/GameTrackerJS/data/resource/WorldResource.js";
import Language from "/GameTrackerJS/util/Language.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import WorldListExit from "/GameTrackerJS/ui/panel/worldlist/components/entries/Exit.js";
import LogicViewer from "../../../../window/LogicViewer.js";

export default class TrackerWorldListExit extends WorldListExit {

    constructor() {
        super();
        /* context menu */
        this.setAddedDefaultContextMenuItems([
            "splitter",
            {menuAction: "show_logic", content: "Show Logic"}
        ]);
        this.addDefaultContextMenuHandler("show_logic", () => {
            const state = this.getState();
            if (state != null) {
                const title = Language.generateLabel(`exit[${this.ref}]`);
                LogicViewer.show(getGatewayIn(state.props.logicAccess), title);
            }
        });
    }

}

customElements.define("ootrt-worldlist-exit", TrackerWorldListExit);
UIRegistry.get("worldlist-exit").setDefault(TrackerWorldListExit);
