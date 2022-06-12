import Language from "/GameTrackerJS/util/Language.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import WorldMapLocation from "/GameTrackerJS/ui/panel/worldmap/components/entries/Location.js";
import LogicViewer from "../../../../window/LogicViewer.js";

export default class TrackerWorldMapLocation extends WorldMapLocation {

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
                const title = Language.generateLabel(`location[${this.ref}]`);
                LogicViewer.show(state.props.logicAccess, title);
            }
        });
    }

}

customElements.define("ootrt-worldmap-location", TrackerWorldMapLocation);
UIRegistry.get("worldmap-location").setDefault(TrackerWorldMapLocation);
