import Language from "/GameTrackerJS/util/Language.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import WorldMapExit from "/GameTrackerJS/ui/panel/worldmap/components/entries/Exit.js";
import LogicViewer from "../../../../window/LogicViewer.js";

export default class TrackerWorldMapExit extends WorldMapExit {

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
                LogicViewer.show(state.props.logicAccess ?? "", title);
            }
        });
    }

}

customElements.define("ootrt-worldmap-exit", TrackerWorldMapExit);
UIRegistry.get("worldmap-exit").setDefault(TrackerWorldMapExit);
