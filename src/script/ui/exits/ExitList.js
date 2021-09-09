// GameTrackerJS
import GTExitList from "/GameTrackerJS/ui/exit/ExitList.js";

export default class ExitList extends GTExitList {

    addEntrance(state) {
        if (state.exitData.type !== "not_seen") {
            super.addEntrance(state);
        }
    }

}

customElements.define("ootrt-exitlist", ExitList);
