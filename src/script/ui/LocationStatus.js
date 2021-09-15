// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import UIEventBusMixin from "/emcJS/event/ui/EventBusMixin.js";

// Track-OOT
import OverworldListHandler from "../util/handler/OverworldListHandler.js";
import "../state/world/WorldStates.js";

const TPL = new Template(`
<div class="state">
    <span id="locations-done">#</span> done | <span id="locations-available">#</span> avail | <span id="locations-missing">#</span> miss
</div>
`);
    
const STYLE = new GlobalStyle(`
.state {
    display: inline;
    padding: 0 5px;
    white-space: nowrap;
}
`);

export default class LocationState extends UIEventBusMixin(CustomElement) {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        
        /* LIST HANDLER */
        const listHandler = this.generateList();
        listHandler.addEventListener("access", (event) => {
            const doneEl = this.shadowRoot.getElementById("locations-done");
            const availEl = this.shadowRoot.getElementById("locations-available");
            const missEl = this.shadowRoot.getElementById("locations-missing");
            const {reachable_min, reachable_max, unopened_min, unopened_max, done_min, done_max} = event.data;
            if (reachable_min == reachable_max) {
                availEl.innerHTML = reachable_min;
            } else {
                availEl.innerHTML = `[${reachable_min}..${reachable_max}]`;
            }
            if (unopened_min == unopened_max) {
                missEl.innerHTML = unopened_min;
            } else {
                missEl.innerHTML = `[${unopened_min}..${unopened_max}]`;
            }
            if (done_min == done_max) {
                doneEl.innerHTML = done_min;
            } else {
                doneEl.innerHTML = `[${done_min}..${done_max}]`;
            }
        });
    }

    generateList() {
        return new OverworldListHandler();
    }

}

customElements.define("ootrt-locationstate", LocationState);
