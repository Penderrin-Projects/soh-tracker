import Language from "/GameTrackerJS/util/Language.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import WorldListLocation from "/GameTrackerJS/ui/panel/worldlist/components/entries/Location.js";
import LogicViewer from "../../../../window/LogicViewer.js";

export default class TrackerWorldListLocation extends WorldListLocation {

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

customElements.define("ootrt-worldlist-location", TrackerWorldListLocation);
UIRegistry.get("worldlist-location").setDefault(TrackerWorldListLocation);
