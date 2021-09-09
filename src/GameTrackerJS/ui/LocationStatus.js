// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import UIEventBusMixin from "/emcJS/event/ui/EventBusMixin.js";
import EventTargetManager from "/emcJS/event/EventTargetManager.js";

import WorldResource from "../resource/WorldResource.js";
import LocationStateManager from "../state/world/location/StateManager.js";

const TPL = new Template(`
<div class="state">
    <span id="locations-done">#</span> done / <span id="locations-available">#</span> avail / <span id="locations-missing">#</span> miss
</div>
`);
    
const STYLE = new GlobalStyle(`
.state {
    display: inline;
    padding: 0 5px;
    white-space: nowrap;
}
`);

const locationMarkerData = WorldResource.get("marker/location");

function checkList(entityList) {
    let reachable = 0;
    let unopened = 0;
    let done = 0;
    for (const loc of entityList) {
        if (loc.isVisible()) {
            const access = loc.access;
            reachable += access.reachable;
            unopened += access.unopened;
            done += access.done;
        }
    }
    return {reachable, unopened, done};
}

const LIST = new WeakMap();

export default class LocationState extends UIEventBusMixin(CustomElement) {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const entityList = this.generateList(locationMarkerData);
        LIST.set(this, entityList);
        this.updateStates();
    }
    
    updateStates() {
        const entityList = LIST.get(this);
        const doneEl = this.shadowRoot.getElementById("locations-done");
        const availEl = this.shadowRoot.getElementById("locations-available");
        const missEl = this.shadowRoot.getElementById("locations-missing");
        const {reachable, unopened, done} = checkList(entityList);
        missEl.innerHTML = unopened;
        availEl.innerHTML = reachable;
        doneEl.innerHTML = done;
    }

    generateList(list) {
        const entityList = new Set();
        for (const key in list) {
            const loc = LocationStateManager.get(key);
            if (loc != null) {
                const eventManager = new EventTargetManager(loc);
                entityList.add(loc);
                eventManager.set(["access", "visible", "filter"], () => {
                    this.updateStates();
                });
            }
        }
        return entityList;
    }

}

customElements.define("gt-locationstate", LocationState);
