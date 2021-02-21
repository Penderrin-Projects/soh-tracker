// GameTrackerJS
import ExitList from "/GameTrackerJS/ui/exit/ExitList.js";
// Track-OOT
import "./ExitChoice.js";

export default class HTMLTrackerExitList extends ExitList {

    addEntrance(category, ref) {
        const el = document.createElement("ootrt-exitchoice");
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
