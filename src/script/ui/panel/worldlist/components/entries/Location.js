import Language from "/GameTrackerJS/util/Language.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import WorldListLocation from "/GameTrackerJS/ui/panel/worldlist/components/entries/Location.js";
import LogicViewer from "../../../../window/LogicViewer.js";
import APHintLocations from "../../../../../resource/APHintLocations.js";

const apHintLocations = APHintLocations.get();

export default class TrackerWorldListLocation extends WorldListLocation {

    constructor() {
        super();
        /* context menu */
        this.setAddedDefaultContextMenuItems([
            "splitter",
            {menuAction: "show_logic", content: "Show Logic"},
            {type: "splitter", group: "ap"},
            {group: "ap", menuAction: "hint_ap_location", content: "AP Hint Location"}
        ]);
        this.addDefaultContextMenuHandler("show_logic", () => {
            const state = this.getState();
            if (state != null) {
                const title = Language.generateLabel(`location[${this.ref}]`);
                LogicViewer.show(state.props.logicAccess ?? "", title);
            }
        });
        this.addDefaultContextMenuHandler("hint_ap_location", () => {
            const apHintLocation = apHintLocations[this.ref];
            if (apHintLocation != null) {
                const viewchoiceEl = document.getElementById("main-content");
                viewchoiceEl.active = "ap";
                const apTextClient = document.getElementById("ap-textclient");
                apTextClient.setChatMessageToSend(`!hint ${apHintLocation}`);
            }
        });
        /* AP */
        if (!Savestate.getMeta("archipelago")) {
            this.toggleDefaultContextMenuGroupActive("ap", false);
        }
        Savestate.addEventListener("meta", (event) => {
            const {key, value} = event.data;
            if (key === "archipelago") {
                this.toggleDefaultContextMenuGroupActive("ap", !!value);
            }
        });
    }

}

customElements.define("ootrt-worldlist-location", TrackerWorldListLocation);
UIRegistry.get("worldlist-location").setDefault(TrackerWorldListLocation);
