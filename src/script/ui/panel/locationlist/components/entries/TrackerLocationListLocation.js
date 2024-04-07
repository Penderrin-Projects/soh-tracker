import Language from "/GameTrackerJS/util/Language.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import LocationListLocation from "/GameTrackerJS/ui/panel/locationlist/components/entries/LocationListLocation.js";
import LogicViewer from "../../../../window/LogicViewer.js";

export default class TrackerLocationListLocation extends LocationListLocation {

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
                LogicViewer.show(state.props.logicAccess ?? "", title);
            }
        });
    }

}

customElements.define("ootrt-locationlist-location", TrackerLocationListLocation);
UIRegistry.get("locationlist-location").setDefault(TrackerLocationListLocation);
