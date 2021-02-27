// GameTrackerJS
import ExitList from "/GameTrackerJS/ui/exit/ExitList.js";
// Track-OOT
import "./ExitChoice.js";

export default class HTMLTrackerExitList extends ExitList {

    
    addEntrance(state) {
        if (state.exitData.type !== "not_seen") {
            const el = document.createElement("ootrt-exitchoice");
            el.ref = state.ref;
            el.setAttribute("searchRef", `exit[${state.props.access}]`);
            el.setAttribute("type", state.exitData.type);
            el.setAttribute("categories", JSON.stringify(state.props.categories));
            for (const cat of state.props.categories) {
                this.addCategory(cat);
            }
            el.addEventListener("change", event => {
                this.calculateItems();
            });
            this.append(el);
        }
    }

}

customElements.define("ootrt-exitlist", HTMLTrackerExitList);
