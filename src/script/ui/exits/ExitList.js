// GameTrackerJS
import ExitList from "/GameTrackerJS/ui/exit/ExitList.js";
// Track-OOT
import "./ExitChoice.js";

export default class HTMLTrackerExitList extends ExitList {

    
    addEntrance(state) {
        if (state.exitData.type !== "not_seen") {
            super.addEntrance(state);
        }
    }

}

customElements.define("ootrt-exitlist", HTMLTrackerExitList);
